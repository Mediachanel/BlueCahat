"use client";

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

export function useSocket(userId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const instance = getSocket();
    if (!instance) return;
    const activeSocket = instance;
    setSocket(activeSocket);
    if (!activeSocket.connected) activeSocket.connect();

    function markOnline() {
      if (userId) activeSocket.emit("user:online", { userId });
    }

    markOnline();
    activeSocket.on("connect", markOnline);

    return () => {
      activeSocket.off("connect", markOnline);
      if (userId) activeSocket.emit("user:offline", { userId });
    };
  }, [userId]);

  return socket;
}
