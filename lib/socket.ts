import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

function isLocalNetworkHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host === "0.0.0.0" || host === "::1") return true;
  if (host.startsWith("127.")) return true;
  if (host.startsWith("10.")) return true;
  if (host.startsWith("192.168.")) return true;

  const parts = host.split(".").map(Number);
  if (parts.length === 4 && parts.every((part) => Number.isInteger(part))) {
    return parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31;
  }

  return false;
}

function resolveSocketUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  const currentOrigin = window.location.origin;
  const currentHostIsLocal = isLocalNetworkHost(window.location.hostname);

  if (!configuredUrl) return currentOrigin;

  try {
    const socketUrl = new URL(configuredUrl, currentOrigin);
    const socketHostIsLocal = isLocalNetworkHost(socketUrl.hostname);

    if (!currentHostIsLocal && socketHostIsLocal) {
      return currentOrigin;
    }

    if (window.location.protocol === "https:" && socketUrl.protocol === "http:" && socketUrl.hostname === window.location.hostname) {
      return currentOrigin;
    }

    return socketUrl.toString();
  } catch {
    return currentOrigin;
  }
}

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = io(resolveSocketUrl(), {
      autoConnect: false,
      transports: ["websocket", "polling"]
    });
  }
  return socket;
}
