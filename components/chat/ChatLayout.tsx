"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Archive, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { useChat } from "@/hooks/useChat";
import { useCall } from "@/hooks/useCall";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { playCallTone } from "@/lib/notification-settings";
import { isNavItemActive, mainNavItems } from "@/components/layout/navigation-items";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ConversationWindow } from "@/components/chat/ConversationWindow";
import { CallOverlay } from "@/components/chat/CallOverlay";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function ChatLayout() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { settings: appearanceSettings } = useAppearanceSettings();
  const { settings: notificationSettings } = useNotificationSettings();
  const chat = useChat(user?.id, notificationSettings);
  const activeConversation = chat.conversations.find((conversation) => conversation.id === chat.activeConversationId);
  const totalUnread = chat.conversations.reduce((total, conversation) => total + (conversation.unreadCount ?? 0), 0);
  const railItems = mainNavItems.filter((item) => item.href !== "/profile");
  const [callNotice, setCallNotice] = useState("");
  const call = useCall({
    socket: chat.socket,
    currentUser: user,
    activeConversation,
    onSelectConversation: chat.setActiveConversationId,
    notificationSettings,
    onNotice: (message) => {
      setCallNotice(message);
      window.setTimeout(() => setCallNotice(""), 2800);
    }
  });

  useEffect(() => {
    if (call.activeCall?.status !== "incoming") return;
    if (!notificationSettings.notificationsEnabled || !notificationSettings.callSoundEnabled) return;
    playCallTone(notificationSettings.callTone, notificationSettings.volume);
    const timer = window.setInterval(() => playCallTone(notificationSettings.callTone, notificationSettings.volume), 2100);
    return () => window.clearInterval(timer);
  }, [
    call.activeCall?.callId,
    call.activeCall?.status,
    notificationSettings.callSoundEnabled,
    notificationSettings.callTone,
    notificationSettings.notificationsEnabled,
    notificationSettings.volume
  ]);

  return (
    <div className="grid h-screen grid-cols-[64px_minmax(320px,480px)_1fr] overflow-hidden bg-white dark:bg-slate-950 max-md:block">
      <aside className="flex h-screen w-16 flex-col items-center justify-between border-r border-slate-200 bg-[#f4f7fb] px-2 py-4 dark:border-slate-800 dark:bg-slate-900 max-md:hidden">
        <div className="flex flex-col items-center gap-3">
          <div className="relative mx-auto mb-3 h-10 w-10 overflow-hidden rounded-2xl bg-white shadow-sm">
            <Image src="/logo/app-icon.png" alt="BlueChat" fill sizes="40px" className="object-cover" priority />
          </div>
          {railItems.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(pathname, item.href);
            const badge = item.href === "/chat" ? totalUnread : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative grid h-11 w-11 place-items-center rounded-2xl text-slate-600 transition hover:bg-white hover:text-bluechat-blue dark:text-slate-300 dark:hover:bg-slate-800",
                  active && "bg-white text-bluechat-navy shadow-sm ring-1 ring-blue-100 dark:bg-slate-800 dark:text-blue-200 dark:ring-slate-700"
                )}
              >
                <Icon size={20} />
                {badge > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-bluechat-blue px-1 text-[10px] font-black text-white">{badge > 99 ? "99+" : badge}</span> : null}
              </Link>
            );
          })}
          <div className="h-px w-10 bg-slate-200 dark:bg-slate-800" />
          <button aria-label="Arsip" title="Arsip" className="grid h-11 w-11 place-items-center rounded-2xl text-slate-600 hover:bg-white hover:text-bluechat-blue dark:text-slate-300 dark:hover:bg-slate-800">
            <Archive size={20} />
          </button>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Link href="/profile" aria-label="Pengaturan" title="Pengaturan" aria-current={isNavItemActive(pathname, "/profile") ? "page" : undefined} className={cn("grid h-11 w-11 place-items-center rounded-2xl text-slate-600 hover:bg-white hover:text-bluechat-blue dark:text-slate-300 dark:hover:bg-slate-800", isNavItemActive(pathname, "/profile") && "bg-white text-bluechat-navy shadow-sm ring-1 ring-blue-100 dark:bg-slate-800 dark:text-blue-200 dark:ring-slate-700")}>
            <Settings size={20} />
          </Link>
          <Avatar name={user?.name ?? "BlueChat"} src={user?.avatar} online />
        </div>
      </aside>
      <div className={cn("h-screen", chat.activeConversationId && "max-md:hidden")}>
        <ChatSidebar conversations={chat.conversations} currentUserId={user?.id} activeConversationId={chat.activeConversationId} onSelect={chat.setActiveConversationId} onRefresh={chat.fetchConversations} realtimeState={chat.realtimeState} />
      </div>
      <div className={cn("h-screen", !chat.activeConversationId && "max-md:hidden")}>
        <ConversationWindow conversation={activeConversation} messages={chat.messages} currentUserId={user?.id} onSend={chat.sendMessage} typing={chat.typingUsers.some((id) => id !== user?.id)} onBack={() => chat.setActiveConversationId(null)} onTypingStart={chat.startTyping} onTypingStop={chat.stopTyping} onStartCall={call.startCall} onDeleteMessage={chat.deleteMessage} onPinMessage={chat.pinMessage} onOpenPrivateChat={chat.openPrivateConversation} appearanceSettings={appearanceSettings} />
      </div>
      <CallOverlay call={call.activeCall} localStream={call.localStream} remoteStream={call.remoteStream} onAccept={call.acceptCall} onReject={call.rejectCall} onEnd={call.endCall} onToggleMute={call.toggleMute} onToggleCamera={call.toggleCamera} />
      {callNotice ? (
        <div className="fixed right-4 top-4 z-[80] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-blue-100 bg-white p-4 text-sm font-bold text-bluechat-navy shadow-soft dark:border-slate-800 dark:bg-slate-950 dark:text-blue-100 max-md:left-4 max-md:right-4 max-md:w-auto">
          {callNotice}
        </div>
      ) : null}
      {chat.incomingNotification ? (
        <button
          onClick={() => chat.setIncomingNotification(null)}
          className="fixed right-4 top-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-soft dark:border-slate-800 dark:bg-slate-950 max-md:left-4 max-md:right-4 max-md:w-auto"
        >
          <p className="text-sm font-black text-bluechat-navy dark:text-blue-200">{chat.incomingNotification.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{chat.incomingNotification.body}</p>
        </button>
      ) : null}
    </div>
  );
}
