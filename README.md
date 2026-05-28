# BlueChat

BlueChat adalah aplikasi messaging modern bernuansa biru dengan identitas visual original. Fitur intinya meliputi auth, chat realtime, kontak, grup, story/status 24 jam, upload media lokal, notifikasi, dan admin panel.

## Tech Stack

- Next.js 15, TypeScript, App Router
- PostgreSQL, Prisma ORM
- Socket.IO
- Tailwind CSS, shadcn/ui-style components, lucide-react
- Zod, bcryptjs, JWT cookie session
- Upload local di `public/uploads`, siap dikembangkan ke R2/S3

## Instalasi

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Untuk realtime Socket.IO terpisah:

```bash
npm run socket
```

Default socket server berjalan di `http://localhost:3001`. BlueChat juga memiliki fallback sinkron otomatis di client, tetapi pengalaman terbaik tetap memakai Socket.IO:

```env
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

## Setup PostgreSQL

Gunakan PostgreSQL lokal dan buat database bernama `bluechat`. Contoh koneksi development:

```env
DATABASE_URL="postgresql://postgres:Tianh%4027@localhost:5432/bluechat"
JWT_SECRET="change-this-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
UPLOAD_DIR="public/uploads"
MAX_UPLOAD_SIZE_MB="10"
```

Catatan: karakter `@` pada password harus ditulis sebagai `%40` di `DATABASE_URL`.

## Akun Dummy

Super Admin:

- Email: `admin@bluechat.local`
- Password: `Admin12345!`

User:

- Email: `user@bluechat.local`
- Password: `User12345!`

Login juga menerima username atau nomor HP.

## Struktur Folder

```txt
app/
  api/
  login/
  register/
  chat/
  contacts/
  groups/
  stories/
  profile/
  admin/
components/
  ui/
  layout/
  auth/
  chat/
  contacts/
  groups/
  stories/
  profile/
  admin/
hooks/
lib/
prisma/
server/
types/
public/
  uploads/
  avatars/
```

## Fitur Tersedia

- Register, login, logout, protected route, JWT cookie, hash password bcrypt.
- Role `USER`, `ADMIN`, `SUPER_ADMIN`.
- Chat pribadi dan grup dengan Prisma-backed API.
- Socket.IO events: `user:online`, `user:offline`, `conversation:join`, `conversation:leave`, `message:send`, `message:new`, `message:edit`, `message:delete`, `message:read`, `typing:start`, `typing:stop`, `notification:new`.
- Upload avatar, message attachment, dan story media ke local storage.
- Story/status expired 24 jam.
- Kontak, block/unblock user.
- Notification center API dan unread flag.
- Admin stats, user table, audit log, aktivasi/nonaktivasi user.
- UI responsive mobile/desktop dengan palette BlueChat: `#0F4C81`, `#1E88E5`, `#E3F2FD`, `#F8FBFF`.

## Endpoint Utama

Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.

Users: `GET /api/users`, `GET /api/users/search`, `GET /api/users/[id]`, `PATCH /api/users/profile`, `PATCH /api/users/avatar`, `PATCH /api/users/password`.

Contacts: `GET /api/contacts`, `POST /api/contacts`, `DELETE /api/contacts/[id]`, `POST /api/contacts/block`, `POST /api/contacts/unblock`.

Conversations and messages: `GET /api/conversations`, `POST /api/conversations/private`, `POST /api/conversations/group`, `GET/PATCH/DELETE /api/conversations/[id]`, `GET /api/conversations/[id]/messages`, `POST /api/messages`, `PATCH/DELETE /api/messages/[id]`, `POST /api/messages/[id]/read`.

Stories, upload, notifications, admin tersedia di folder `app/api`.

## Catatan Pengembangan Berikutnya

- Tambahkan adapter Redis untuk Socket.IO multi-instance.
- Tambahkan job cleanup story expired.
- Tambahkan signed upload untuk Cloudflare R2/S3.
- Tambahkan e2e test Playwright dan unit test permission.
- Tambahkan richer read receipts, delete-for-me, pinned message UI, dan voice note recorder.
