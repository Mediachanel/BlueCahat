import { createServer } from "node:http";
import { Server } from "socket.io";

const port = Number(process.env.SOCKET_PORT ?? 3001);
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    credentials: true
  }
});

const onlineUsers = new Map<string, Set<string>>();

function emitToUsers(userIds: string[] | undefined, event: string, payload: unknown) {
  let emittedCount = 0;
  [...new Set(userIds ?? [])].forEach((userId) => {
    const socketIds = onlineUsers.get(userId);
    socketIds?.forEach((socketId) => {
      io.to(socketId).emit(event, payload);
      emittedCount += 1;
    });
  });
  return emittedCount;
}

function addOnlineUser(userId: string, socketId: string) {
  const socketIds = onlineUsers.get(userId) ?? new Set<string>();
  socketIds.add(socketId);
  onlineUsers.set(userId, socketIds);
}

function removeOnlineSocket(socketId: string, explicitUserId?: string) {
  for (const [userId, socketIds] of onlineUsers.entries()) {
    if (explicitUserId && userId !== explicitUserId) continue;
    socketIds.delete(socketId);
    if (socketIds.size === 0) {
      onlineUsers.delete(userId);
      io.emit("user:offline", { userId });
    }
  }
}

io.on("connection", (socket) => {
  socket.on("user:online", ({ userId }: { userId: string }) => {
    addOnlineUser(userId, socket.id);
    socket.broadcast.emit("user:online", { userId });
  });

  socket.on("user:offline", ({ userId }: { userId: string }) => {
    removeOnlineSocket(socket.id, userId);
  });

  socket.on("conversation:join", ({ conversationId }: { conversationId: string }) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on("conversation:leave", ({ conversationId }: { conversationId: string }) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on("message:send", (message) => {
    io.to(`conversation:${message.conversationId}`).emit("message:new", message);
    io.to(`conversation:${message.conversationId}`).emit("conversation:update", { conversationId: message.conversationId });
  });

  socket.on("message:edit", (message) => {
    io.to(`conversation:${message.conversationId}`).emit("message:edit", message);
  });

  socket.on("message:delete", (message) => {
    io.to(`conversation:${message.conversationId}`).emit("message:delete", message);
  });

  socket.on("message:delivered", (payload) => {
    io.to(`conversation:${payload.conversationId}`).emit("message:delivered", payload);
  });

  socket.on("message:read", (payload) => {
    io.to(`conversation:${payload.conversationId}`).emit("message:read", payload);
  });

  socket.on("typing:start", (payload) => {
    socket.to(`conversation:${payload.conversationId}`).emit("typing:start", payload);
  });

  socket.on("typing:stop", (payload) => {
    socket.to(`conversation:${payload.conversationId}`).emit("typing:stop", payload);
  });

  socket.on("notification:new", (payload) => {
    if (payload.userId) emitToUsers([payload.userId], "notification:new", payload);
  });

  socket.on("call:invite", (payload) => {
    if (payload.targetUserIds?.length) {
      const emittedCount = emitToUsers(payload.targetUserIds, "call:incoming", payload);
      if (emittedCount === 0) socket.to(`conversation:${payload.conversationId}`).emit("call:incoming", payload);
      return;
    }
    socket.to(`conversation:${payload.conversationId}`).emit("call:incoming", payload);
  });

  socket.on("call:accept", (payload) => {
    if (payload.toUserId) {
      const emittedCount = emitToUsers([payload.toUserId], "call:accepted", payload);
      if (emittedCount === 0) socket.to(`conversation:${payload.conversationId}`).emit("call:accepted", payload);
      return;
    }
    socket.to(`conversation:${payload.conversationId}`).emit("call:accepted", payload);
  });

  socket.on("call:reject", (payload) => {
    if (payload.toUserId) {
      const emittedCount = emitToUsers([payload.toUserId], "call:rejected", payload);
      if (emittedCount === 0) socket.to(`conversation:${payload.conversationId}`).emit("call:rejected", payload);
      return;
    }
    socket.to(`conversation:${payload.conversationId}`).emit("call:rejected", payload);
  });

  socket.on("call:end", (payload) => {
    if (payload.targetUserIds?.length) {
      const emittedCount = emitToUsers(payload.targetUserIds, "call:ended", payload);
      if (emittedCount === 0) socket.to(`conversation:${payload.conversationId}`).emit("call:ended", payload);
      return;
    }
    if (payload.toUserId) {
      const emittedCount = emitToUsers([payload.toUserId], "call:ended", payload);
      if (emittedCount === 0) socket.to(`conversation:${payload.conversationId}`).emit("call:ended", payload);
      return;
    }
    socket.to(`conversation:${payload.conversationId}`).emit("call:ended", payload);
  });

  socket.on("call:signal", (payload) => {
    if (payload.toUserId) {
      const emittedCount = emitToUsers([payload.toUserId], "call:signal", payload);
      if (emittedCount === 0) socket.to(`conversation:${payload.conversationId}`).emit("call:signal", payload);
      return;
    }
    socket.to(`conversation:${payload.conversationId}`).emit("call:signal", payload);
  });

  socket.on("disconnect", () => {
    removeOnlineSocket(socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`BlueChat Socket.IO server running at http://localhost:${port}`);
});
