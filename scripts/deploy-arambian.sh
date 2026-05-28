#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="${APP_NAME:-bluechat}"
APP_DIR="${APP_DIR:-$(pwd)}"
RUN_USER="${RUN_USER:-${SUDO_USER:-$(id -un)}}"
PORT="${PORT:-3000}"
SOCKET_PORT="${SOCKET_PORT:-3001}"
UPLOAD_DIR="${UPLOAD_DIR:-/DATA/AppData/bluechat/uploads}"
UPLOAD_PUBLIC_PATH="${UPLOAD_PUBLIC_PATH:-/uploads}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env}"
PULL_LATEST="${PULL_LATEST:-0}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Re-running with sudo so systemd services and upload folders can be configured..."
  exec sudo -E bash "$0" "$@"
fi

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing command: $1"
    echo "Install it first, then rerun this script."
    exit 1
  fi
}

quote_env_value() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

upsert_env() {
  local key="$1"
  local value
  value="$(quote_env_value "$2")"

  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=\"${value}\"|" "$ENV_FILE"
  else
    printf '%s="%s"\n' "$key" "$value" >> "$ENV_FILE"
  fi
}

read_env() {
  local key="$1"
  grep "^${key}=" "$ENV_FILE" 2>/dev/null | tail -n 1 | cut -d= -f2- | sed 's/^"//; s/"$//'
}

run_as_app_user() {
  if [ "$RUN_USER" = "root" ]; then
    bash -lc "cd $(printf '%q' "$APP_DIR") && $*"
  else
    sudo -u "$RUN_USER" -H bash -lc "cd $(printf '%q' "$APP_DIR") && $*"
  fi
}

require_command node
require_command npm
require_command npx
require_command systemctl

cd "$APP_DIR"

if [ ! -f package.json ]; then
  echo "package.json not found in $APP_DIR"
  echo "Run this script from the BlueChat repository, or set APP_DIR=/path/to/BlueChat."
  exit 1
fi

if [ "$PULL_LATEST" = "1" ] && [ -d .git ]; then
  run_as_app_user "git pull --ff-only"
fi

if [ ! -f "$ENV_FILE" ]; then
  cp .env.example "$ENV_FILE"
fi

if [ -n "${APP_URL:-}" ]; then
  upsert_env NEXT_PUBLIC_APP_URL "$APP_URL"
fi

if [ -n "${SOCKET_URL:-}" ]; then
  upsert_env NEXT_PUBLIC_SOCKET_URL "$SOCKET_URL"
elif [ -n "${APP_URL:-}" ]; then
  upsert_env NEXT_PUBLIC_SOCKET_URL "$APP_URL"
fi

upsert_env UPLOAD_DIR "$UPLOAD_DIR"
upsert_env UPLOAD_PUBLIC_PATH "$UPLOAD_PUBLIC_PATH"

JWT_SECRET_VALUE="$(read_env JWT_SECRET || true)"
if [ -z "$JWT_SECRET_VALUE" ] || [ "$JWT_SECRET_VALUE" = "change-this-secret" ]; then
  require_command openssl
  upsert_env JWT_SECRET "$(openssl rand -hex 32)"
fi

DATABASE_URL_VALUE="$(read_env DATABASE_URL || true)"
if [ -z "$DATABASE_URL_VALUE" ] || [ "$DATABASE_URL_VALUE" = "postgresql://postgres:password@localhost:5432/bluechat" ]; then
  echo "DATABASE_URL is not configured in $ENV_FILE"
  echo "Set your production PostgreSQL URL first, then rerun this script."
  exit 1
fi

RUN_GROUP="$(id -gn "$RUN_USER")"
mkdir -p "$UPLOAD_DIR/avatars" "$UPLOAD_DIR/messages" "$UPLOAD_DIR/stories"
chown -R "$RUN_USER:$RUN_GROUP" "$APP_DIR"
chown -R "$RUN_USER:$RUN_GROUP" "$UPLOAD_DIR"
chown "$RUN_USER:$RUN_GROUP" "$ENV_FILE"

if [ -f package-lock.json ]; then
  run_as_app_user "npm ci"
else
  run_as_app_user "npm install"
fi

run_as_app_user "npx prisma generate"
run_as_app_user "npx prisma migrate deploy"
run_as_app_user "npm run build"

NPM_BIN="$(command -v npm)"

cat >"/etc/systemd/system/${APP_NAME}-web.service" <<EOF
[Unit]
Description=BlueChat Next.js web app
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${ENV_FILE}
Environment=NODE_ENV=production
Environment=PORT=${PORT}
ExecStart=${NPM_BIN} run start -- --hostname 0.0.0.0
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

cat >"/etc/systemd/system/${APP_NAME}-socket.service" <<EOF
[Unit]
Description=BlueChat Socket.IO server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${ENV_FILE}
Environment=NODE_ENV=production
Environment=SOCKET_PORT=${SOCKET_PORT}
ExecStart=${NPM_BIN} run socket
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "${APP_NAME}-web.service" "${APP_NAME}-socket.service" >/dev/null
systemctl restart "${APP_NAME}-web.service" "${APP_NAME}-socket.service"

echo
echo "BlueChat deployed."
echo "Web service:    ${APP_NAME}-web.service on port ${PORT}"
echo "Socket service: ${APP_NAME}-socket.service on port ${SOCKET_PORT}"
echo "Uploads:        ${UPLOAD_DIR}"
echo
echo "Check status:"
echo "  systemctl status ${APP_NAME}-web ${APP_NAME}-socket"
