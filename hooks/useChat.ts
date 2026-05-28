"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, ConversationSummary } from "@/types";
import { useSocket } from "@/hooks/useSocket";
import { defaultNotificationSettings, playMessageTone, type NotificationSettings } from "@/lib/notification-settings";

function getMessageType(attachments?: ChatMessage["attachments"]): ChatMessage["type"] {
  const mimeType = attachments?.[0]?.mimeType;
  if (!mimeType) return "TEXT";
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  return "DOCUMENT";
}

export function useChat(userId?: string, notificationSettings: NotificationSettings = defaultNotificationSettings) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [incomingNotification, setIncomingNotification] = useState<{ title: string; body: string } | null>(null);
  const [realtimeState, setRealtimeState] = useState<"connecting" | "live" | "fallback">("connecting");
  const socket = useSocket(userId);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const fetchConversations = useCallback(async () => {
    const response = await fetch("/api/conversations");
    if (!response.ok) return;
    const data = await response.json();
    setConversations(data.conversations ?? []);
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!activeConversationId) return;
    const response = await fetch(`/api/conversations/${activeConversationId}/messages`);
    if (!response.ok) return;
    const data = await response.json();
    const freshMessages = (data.messages ?? []) as ChatMessage[];
    setMessages((current) => {
      const pendingMessages = current.filter((message) => message.localStatus === "PENDING");
      return [...freshMessages, ...pendingMessages.filter((pending) => !freshMessages.some((message) => message.id === pending.id))];
    });

    const unreadMessages = freshMessages
      .filter((message) => message.senderId !== userId)
      .filter((message) => message.statuses?.some((status) => status.userId === userId && status.status !== "READ"))
      .slice(-20);

    if (unreadMessages.length) {
      await Promise.all(unreadMessages.map((message) => fetch(`/api/messages/${message.id}/read`, { method: "POST" }).catch(() => undefined)));
      setMessages((current) =>
        current.map((message) =>
          unreadMessages.some((unread) => unread.id === message.id)
            ? {
                ...message,
                statuses: message.statuses?.map((status) =>
                  status.userId === userId ? { ...status, status: "READ" as const, readAt: new Date() } : status
                )
              }
            : message
        )
      );
      fetchConversations();
    }
  }, [activeConversationId, fetchConversations, userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeConversationId) return;
    fetchMessages();
    socket?.emit("conversation:join", { conversationId: activeConversationId, userId });
    return () => {
      socket?.emit("conversation:leave", { conversationId: activeConversationId, userId });
    };
  }, [activeConversationId, fetchMessages, socket, userId]);

  useEffect(() => {
    const conversationTimer = window.setInterval(fetchConversations, 3000);
    const messageTimer = window.setInterval(fetchMessages, 1800);
    return () => {
      window.clearInterval(conversationTimer);
      window.clearInterval(messageTimer);
    };
  }, [fetchConversations, fetchMessages]);

  useEffect(() => {
    channelRef.current = new BroadcastChannel("bluechat-realtime");
    channelRef.current.onmessage = (event: MessageEvent<{ type: string; conversationId?: string }>) => {
      if (event.data.type === "message:new") {
        fetchConversations();
        if (event.data.conversationId === activeConversationId) fetchMessages();
      }
    };
    return () => channelRef.current?.close();
  }, [activeConversationId, fetchConversations, fetchMessages]);

  useEffect(() => {
    function refresh() {
      fetchConversations();
    }

    window.addEventListener("bluechat:refresh-conversations", refresh);
    return () => window.removeEventListener("bluechat:refresh-conversations", refresh);
  }, [fetchConversations]);

  useEffect(() => {
    if (!socket) {
      setRealtimeState("fallback");
      return;
    }

    const onConnect = () => setRealtimeState("live");
    const onDisconnect = () => setRealtimeState("fallback");
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    setRealtimeState(socket.connected ? "live" : "fallback");

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const onMessage = (message: ChatMessage) => {
      if (message.senderId !== userId) {
        const title = message.sender?.name ?? "Pesan baru";
        const body = notificationSettings.showMessagePreview ? message.content ?? "Mengirim lampiran" : "Ada pesan baru";

        if (notificationSettings.notificationsEnabled) {
          setIncomingNotification({ title, body });
        }

        if (notificationSettings.notificationsEnabled && notificationSettings.messageSoundEnabled) {
          playMessageTone(notificationSettings.messageTone, notificationSettings.volume);
        }

        if (notificationSettings.notificationsEnabled && notificationSettings.vibrate && "vibrate" in navigator) {
          navigator.vibrate(80);
        }

        if (notificationSettings.notificationsEnabled && notificationSettings.desktopNotifications && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification(title, { body, icon: "/logo/app-icon.png" });
          } else if (Notification.permission === "default") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") new Notification(title, { body, icon: "/logo/app-icon.png" });
            });
          }
        }
      }

      if (message.conversationId === activeConversationId) {
        setMessages((current) => (current.some((item) => item.id === message.id) ? current : [...current, message]));
      }
      fetchConversations();
    };
    const onMessageUpdate = (message: ChatMessage) => {
      if (message.conversationId !== activeConversationId) return;
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? { ...item, ...message }
            : message.pinnedAt && item.conversationId === message.conversationId
              ? { ...item, pinnedAt: null }
              : item
        )
      );
      fetchConversations();
    };
    const onTypingStart = ({ userId: typingUser }: { userId: string }) => setTypingUsers((users) => [...new Set([...users, typingUser])]);
    const onTypingStop = ({ userId: typingUser }: { userId: string }) => setTypingUsers((users) => users.filter((id) => id !== typingUser));
    socket.on("message:new", onMessage);
    socket.on("message:edit", onMessageUpdate);
    socket.on("message:delete", onMessageUpdate);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    return () => {
      socket.off("message:new", onMessage);
      socket.off("message:edit", onMessageUpdate);
      socket.off("message:delete", onMessageUpdate);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [socket, activeConversationId, userId, fetchConversations, notificationSettings]);

  useEffect(() => {
    if (!incomingNotification) return;
    const timer = window.setTimeout(() => setIncomingNotification(null), 4200);
    return () => window.clearTimeout(timer);
  }, [incomingNotification]);

  const sendMessage = useCallback(
    async (content: string, attachments?: ChatMessage["attachments"], options?: { replyToId?: string }) => {
      if (!activeConversationId || (!content.trim() && !attachments?.length)) return;
      const temporaryId = `pending-${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: temporaryId,
        conversationId: activeConversationId,
        senderId: userId ?? "",
        content,
        type: getMessageType(attachments),
        createdAt: new Date(),
        attachments,
        replyTo: options?.replyToId ? messages.find((message) => message.id === options.replyToId) ?? null : null,
        localStatus: "PENDING"
      };
      setMessages((current) => [...current, optimisticMessage]);

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConversationId, content, attachments, replyToId: options?.replyToId, type: getMessageType(attachments) })
      });
      const data = await response.json();
      if (data.message) {
        const sentMessage = { ...data.message, localStatus: "SENT" as const };
        setMessages((current) => current.map((message) => (message.id === temporaryId ? sentMessage : message)));
        socket?.emit("message:send", data.message);
        channelRef.current?.postMessage({ type: "message:new", conversationId: activeConversationId });
        fetchConversations();
      } else {
        setMessages((current) => current.filter((message) => message.id !== temporaryId));
      }
    },
    [activeConversationId, fetchConversations, messages, socket, userId]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      const response = await fetch(`/api/messages/${messageId}`, { method: "DELETE" });
      if (!response.ok) return false;
      const data = await response.json();
      if (data.message) {
        setMessages((current) => current.map((message) => (message.id === messageId ? { ...message, ...data.message } : message)));
        socket?.emit("message:delete", data.message);
        fetchConversations();
        return true;
      }
      return false;
    },
    [fetchConversations, socket]
  );

  const pinMessage = useCallback(
    async (messageId: string) => {
      const response = await fetch(`/api/messages/${messageId}/pin`, { method: "POST" });
      if (!response.ok) return false;
      const data = await response.json();
      const updatedMessage = data.message as ChatMessage | undefined;
      if (updatedMessage) {
        setMessages((current) =>
          current.map((message) =>
            message.conversationId === updatedMessage.conversationId
              ? message.id === updatedMessage.id
                ? { ...message, ...updatedMessage }
                : { ...message, pinnedAt: null }
              : message
          )
        );
        socket?.emit("message:edit", updatedMessage);
        fetchConversations();
        return true;
      }
      return false;
    },
    [fetchConversations, socket]
  );

  const openPrivateConversation = useCallback(
    async (targetUserId: string) => {
      if (!targetUserId || targetUserId === userId) return false;
      const response = await fetch("/api/conversations/private", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId })
      });
      if (!response.ok) return false;
      const data = await response.json();
      if (data.conversation?.id) {
        await fetchConversations();
        setActiveConversationId(data.conversation.id);
        return true;
      }
      return false;
    },
    [fetchConversations, userId]
  );

  const startTyping = useCallback(() => {
    if (!socket || !activeConversationId || !userId) return;
    socket.emit("typing:start", { conversationId: activeConversationId, userId });
  }, [socket, activeConversationId, userId]);

  const stopTyping = useCallback(() => {
    if (!socket || !activeConversationId || !userId) return;
    socket.emit("typing:stop", { conversationId: activeConversationId, userId });
  }, [socket, activeConversationId, userId]);

  return { conversations, activeConversationId, setActiveConversationId, messages, sendMessage, deleteMessage, pinMessage, openPrivateConversation, typingUsers, socket, incomingNotification, setIncomingNotification, startTyping, stopTyping, realtimeState, fetchConversations };
}
