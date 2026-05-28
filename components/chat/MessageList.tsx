"use client";

import { CSSProperties, useEffect, useMemo, useRef } from "react";
import type { ChatMessage } from "@/types";
import { defaultAppearanceSettings, getChatFontFamily, resolveChatBackground, type AppearanceSettings } from "@/lib/appearance-settings";
import { MessageBubble } from "@/components/chat/MessageBubble";

export function MessageList({
  messages,
  currentUserId,
  showSenderName,
  showPrivateActions,
  onReply,
  onDelete,
  onPin,
  onOpenPrivateChat,
  onNotice,
  appearanceSettings = defaultAppearanceSettings
}: {
  messages: ChatMessage[];
  currentUserId?: string;
  showSenderName?: boolean;
  showPrivateActions?: boolean;
  onReply?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => Promise<boolean>;
  onPin?: (message: ChatMessage) => Promise<boolean>;
  onOpenPrivateChat?: (userId: string) => Promise<boolean>;
  onNotice?: (message: string) => void;
  appearanceSettings?: AppearanceSettings;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const background = resolveChatBackground(appearanceSettings);
  const chatStyle = useMemo(
    () =>
      ({
        "--bluechat-chat-font-size": `${appearanceSettings.chatFontSize}px`,
        "--bluechat-chat-line-height": "1.45",
        backgroundColor: background.color,
        backgroundImage: background.image,
        backgroundSize: background.size,
        fontFamily: getChatFontFamily(appearanceSettings.chatFontFamily)
      }) as CSSProperties,
    [appearanceSettings, background.color, background.image, background.size]
  );
  const unreadCount = messages.filter(
    (message) =>
      message.senderId !== currentUserId &&
      message.statuses?.some((status) => status.userId === currentUserId && status.status !== "READ")
  ).length;

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages.length]);
  return (
    <div className="relative flex-1 space-y-3 overflow-y-auto p-6 max-md:px-3 max-md:py-4" style={chatStyle}>
      <div className="relative mx-auto mb-4 w-fit rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">Hari Ini</div>
      <div className="relative space-y-3">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            mine={message.senderId === currentUserId}
            showSenderName={showSenderName}
            showPrivateActions={showPrivateActions}
            onReply={onReply}
            onDelete={onDelete}
            onPin={onPin}
            onOpenPrivateChat={onOpenPrivateChat}
            onNotice={onNotice}
          />
        ))}
        {unreadCount > 0 ? <div className="mx-auto w-fit rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">{unreadCount} pesan belum dibaca</div> : null}
      </div>
      <div ref={endRef} />
    </div>
  );
}
