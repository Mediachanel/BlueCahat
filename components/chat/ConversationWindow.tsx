"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, MoreVertical, Phone, Pin, Search, Video } from "lucide-react";
import type { ChatMessage, ConversationSummary } from "@/types";
import type { CallMode } from "@/hooks/useCall";
import type { AppearanceSettings } from "@/lib/appearance-settings";
import { UserAvatar } from "@/components/chat/UserAvatar";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { EmptyConversation } from "@/components/chat/EmptyConversation";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Button } from "@/components/ui/button";

export function ConversationWindow({
  conversation,
  messages,
  currentUserId,
  onSend,
  typing,
  onBack,
  onTypingStart,
  onTypingStop,
  onStartCall,
  onDeleteMessage,
  onPinMessage,
  onOpenPrivateChat,
  appearanceSettings
}: {
  conversation?: ConversationSummary;
  messages: ChatMessage[];
  currentUserId?: string;
  onSend: (message: string, attachments?: ChatMessage["attachments"], options?: { replyToId?: string }) => Promise<void>;
  typing?: boolean;
  onBack?: () => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  onStartCall?: (mode: CallMode) => void;
  onDeleteMessage?: (messageId: string) => Promise<boolean>;
  onPinMessage?: (messageId: string) => Promise<boolean>;
  onOpenPrivateChat?: (userId: string) => Promise<boolean>;
  appearanceSettings?: AppearanceSettings;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [messageQuery, setMessageQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const visibleMessages = useMemo(() => {
    if (!messageQuery.trim()) return messages;
    return messages.filter((message) => message.content?.toLowerCase().includes(messageQuery.toLowerCase()));
  }, [messages, messageQuery]);

  if (!conversation) return <div className="h-screen overflow-hidden bg-[#fbf8f3]"><EmptyConversation /></div>;
  const other = conversation.participants?.find((participant) => participant.user.id !== currentUserId)?.user;
  const title = conversation.type === "GROUP" ? conversation.title ?? "Grup" : other?.name ?? "Percakapan";
  const pinned = messages.find((message) => message.pinnedAt && !message.deletedForEveryone);
  const memberNames = conversation.participants?.map((item) => item.user.name).slice(0, 4).join(", ");
  const memberCount = conversation.participants?.length ?? 0;

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function startCall(mode: CallMode) {
    if (!conversation) return;
    if (conversation.type !== "PRIVATE") {
      showNotice("Panggilan grup belum tersedia. Gunakan chat pribadi dulu.");
      return;
    }
    onStartCall?.(mode);
  }

  async function sendWithReply(message: string, attachments?: ChatMessage["attachments"]) {
    await onSend(message, attachments, replyTo ? { replyToId: replyTo.id } : undefined);
    setReplyTo(null);
  }

  return (
    <section className="flex h-screen flex-col overflow-hidden bg-[#fbf8f3] dark:bg-slate-950">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 max-md:h-20 max-md:px-3">
        <button onClick={onBack} aria-label="Kembali" className="hidden h-10 w-10 place-items-center rounded-full text-slate-700 max-md:grid">
          <ArrowLeft size={28} />
        </button>
        <UserAvatar name={title} src={conversation.image ?? other?.avatar} online={conversation.type === "PRIVATE" ? other?.isOnline : undefined} previewable />
        <div className="min-w-0">
          <h2 className="truncate font-bold max-md:text-2xl">{title}</h2>
          <p className="truncate text-xs text-bluechat-muted max-md:text-sm">{typing ? "sedang menulis pesan..." : conversation.type === "GROUP" ? `${memberNames || memberCount + " anggota"}` : other?.isOnline ? "online" : "last seen tersedia"}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Panggilan suara" onClick={() => startCall("audio")}><Phone size={20} /></Button>
          <Button variant="ghost" size="icon" aria-label="Video call" onClick={() => startCall("video")}><Video size={20} /></Button>
          <Button variant="ghost" size="icon" aria-label="Cari pesan" className="max-md:hidden" onClick={() => setSearchOpen((open) => !open)}><Search size={20} /></Button>
          <div className="relative">
            <Button variant="ghost" size="icon" aria-label="Menu percakapan" onClick={() => setMenuOpen((open) => !open)}><MoreVertical size={20} /></Button>
            {menuOpen ? (
              <div className="absolute right-0 top-11 z-30 w-56 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-soft dark:border-slate-800 dark:bg-slate-950">
                <button onClick={() => setSearchOpen(true)} className="w-full rounded-xl px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-slate-900">Cari pesan</button>
                <button onClick={() => showNotice("Info grup/kontak sudah tersedia di header.")} className="w-full rounded-xl px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-slate-900">Info percakapan</button>
                <button onClick={() => showNotice("Mute percakapan berhasil diaktifkan sementara.")} className="w-full rounded-xl px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-slate-900">Mute notifikasi</button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      {searchOpen ? (
        <div className="border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
          <input value={messageQuery} onChange={(event) => setMessageQuery(event.target.value)} autoFocus placeholder="Cari pesan dalam percakapan" className="h-10 w-full rounded-full bg-slate-100 px-4 text-sm outline-none focus:ring-2 focus:ring-bluechat-blue dark:bg-slate-900" />
        </div>
      ) : null}
      {notice ? <div className="absolute right-4 top-20 z-40 rounded-2xl bg-bluechat-navy px-4 py-3 text-sm font-semibold text-white shadow-soft">{notice}</div> : null}
      {pinned ? (
        <div className="flex min-h-12 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-6 text-sm dark:border-slate-800 dark:bg-slate-950">
          <Pin size={17} className="text-slate-500" />
          <span className="font-semibold text-slate-600 dark:text-slate-300">Disematkan:</span>
          <span className="truncate text-slate-600 dark:text-slate-300">{pinned.content ?? "Lampiran disematkan"}</span>
        </div>
      ) : null}
      <MessageList
        messages={visibleMessages}
        currentUserId={currentUserId}
        showSenderName={conversation.type === "GROUP"}
        showPrivateActions={conversation.type === "GROUP"}
        onReply={setReplyTo}
        onDelete={(message) => onDeleteMessage?.(message.id) ?? Promise.resolve(false)}
        onPin={(message) => onPinMessage?.(message.id) ?? Promise.resolve(false)}
        onOpenPrivateChat={onOpenPrivateChat}
        onNotice={showNotice}
        appearanceSettings={appearanceSettings}
      />
      <TypingIndicator show={Boolean(typing)} />
      <MessageInput onSend={sendWithReply} onTypingStart={onTypingStart} onTypingStop={onTypingStop} replyTo={replyTo} onClearReply={() => setReplyTo(null)} />
    </section>
  );
}
