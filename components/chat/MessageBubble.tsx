import { useEffect, useRef, useState } from "react";
import { Bot, Check, CheckCheck, ChevronDown, Clock3, Copy, Flag, Forward, MessageSquare, Pin, Reply, SmilePlus, Star, Trash2, UserRound } from "lucide-react";
import type { ChatMessage } from "@/types";
import { cn, formatTime } from "@/lib/utils";
import { AttachmentPreview } from "@/components/chat/AttachmentPreview";

const readableQuickReactions = ["\u{1F44D}", "\u{2764}\u{FE0F}", "\u{1F602}", "\u{1F62E}", "\u{1F622}", "\u{1F64F}"];

const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

function getMessageStatus(message: ChatMessage) {
  if (message.localStatus) return message.localStatus;
  const recipientStatuses = message.statuses?.filter((status) => status.userId !== message.senderId) ?? [];
  if (recipientStatuses.some((status) => status.status === "READ")) return "READ";
  if (recipientStatuses.some((status) => status.status === "DELIVERED")) return "DELIVERED";
  return "SENT";
}

function MessageStatusIcon({ status }: { status: ReturnType<typeof getMessageStatus> }) {
  if (status === "PENDING") return <Clock3 size={14} className="text-slate-400" />;
  if (status === "SENT") return <Check size={15} className="text-slate-500" />;
  if (status === "DELIVERED") return <CheckCheck size={15} className="text-slate-500" />;
  return <CheckCheck size={15} className="text-bluechat-blue" />;
}

export function MessageBubble({
  message,
  mine,
  showSenderName,
  showPrivateActions,
  onReply,
  onDelete,
  onPin,
  onOpenPrivateChat,
  onNotice
}: {
  message: ChatMessage;
  mine: boolean;
  showSenderName?: boolean;
  showPrivateActions?: boolean;
  onReply?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => Promise<boolean>;
  onPin?: (message: ChatMessage) => Promise<boolean>;
  onOpenPrivateChat?: (userId: string) => Promise<boolean>;
  onNotice?: (message: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reaction, setReaction] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(`bluechat:reaction:${message.id}`);
    if (saved) setReaction(saved);
  }, [message.id]);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  if (message.type === "SYSTEM") {
    return <div className="mx-auto rounded-full bg-blue-50 px-3 py-1 text-xs text-bluechat-muted dark:bg-slate-900">{message.content}</div>;
  }

  const status = getMessageStatus(message);
  const canUseMessage = !message.deletedForEveryone;

  function setQuickReaction(nextReaction: string) {
    setReaction(nextReaction);
    window.localStorage.setItem(`bluechat:reaction:${message.id}`, nextReaction);
    setMenuOpen(false);
  }

  async function copyMessage() {
    if (!message.content) return;
    await navigator.clipboard.writeText(message.content);
    onNotice?.("Pesan disalin.");
    setMenuOpen(false);
  }

  async function deleteMessage() {
    const ok = await onDelete?.(message);
    onNotice?.(ok ? "Pesan dihapus." : "Pesan hanya bisa dihapus oleh pengirim.");
    setMenuOpen(false);
  }

  async function pinMessage() {
    const ok = await onPin?.(message);
    onNotice?.(ok ? (message.pinnedAt ? "Pesan dilepas dari sematan." : "Pesan disematkan.") : "Gagal menyematkan pesan.");
    setMenuOpen(false);
  }

  async function openPrivateChat(action: "reply" | "chat") {
    const ok = await onOpenPrivateChat?.(message.senderId);
    onNotice?.(ok ? (action === "reply" ? "Chat pribadi dibuka." : `Chat dengan ${message.sender?.name ?? "kontak"} dibuka.`) : "Gagal membuka chat pribadi.");
    setMenuOpen(false);
  }

  function startLongPress() {
    if (longPressRef.current) clearTimeout(longPressRef.current);
    longPressRef.current = setTimeout(() => setMenuOpen(true), 420);
  }

  function cancelLongPress() {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  }

  return (
    <div className={cn("group flex", mine ? "justify-end" : "justify-start")}>
      <div
        onContextMenu={(event) => {
          event.preventDefault();
          setMenuOpen(true);
        }}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        className={cn("relative max-w-[78%] rounded-xl px-3 py-2 shadow-sm max-md:max-w-[86%]", mine ? "rounded-br-sm bg-[#DFF0FF] text-slate-900 dark:bg-blue-950 dark:text-blue-50" : "rounded-bl-sm bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-50")}
      >
        <button
          type="button"
          aria-label="Aksi pesan"
          onClick={() => setMenuOpen((open) => !open)}
          className={cn("absolute top-1 hidden h-7 w-7 place-items-center rounded-full bg-white/80 text-slate-500 shadow-sm hover:bg-white group-hover:grid dark:bg-slate-800/90 dark:text-slate-200", mine ? "left-1" : "right-1")}
        >
          <ChevronDown size={16} />
        </button>
        {!mine && showSenderName ? <p className="mb-1 text-xs font-bold text-bluechat-blue max-md:text-sm">{message.sender?.name}</p> : null}
        {message.replyTo ? (
          <div className={cn("mb-2 rounded-lg border-l-4 px-3 py-2 text-xs", mine ? "border-bluechat-blue bg-white/55" : "border-bluechat-blue bg-blue-50 dark:bg-slate-800")}>
            <p className="font-black text-bluechat-blue">{message.replyTo.sender?.name ?? "Pesan"}</p>
            <p className="line-clamp-2 text-slate-500 dark:text-slate-300">{message.replyTo.deletedForEveryone ? "Pesan ini dihapus" : message.replyTo.content ?? "Lampiran"}</p>
          </div>
        ) : null}
        <p className="whitespace-pre-wrap text-[length:var(--bluechat-chat-font-size,14px)] leading-[var(--bluechat-chat-line-height,1.45)]">{message.deletedForEveryone ? "Pesan ini dihapus" : message.content}</p>
        <AttachmentPreview attachments={message.attachments} />
        <div className={cn("mt-1 flex items-center justify-end gap-1 text-[11px] max-md:text-xs", mine ? "text-bluechat-blue dark:text-blue-200" : "text-slate-400")}>
          {message.isEdited ? <span>diedit</span> : null}
          {message.pinnedAt ? <Pin size={12} /> : null}
          <span>{formatTime(message.createdAt)}</span>
          {mine ? <MessageStatusIcon status={status} /> : null}
        </div>
        {reaction ? <div className={cn("absolute -bottom-4 rounded-full bg-white px-2 py-0.5 text-sm shadow-sm dark:bg-slate-800", mine ? "left-2" : "right-2")}>{reaction}</div> : null}
        {menuOpen ? (
          <div ref={menuRef} className={cn("absolute top-full z-40 mt-2 w-64 text-sm", mine ? "right-0" : "left-0")}>
            {canUseMessage ? (
              <div className="mb-2 flex w-fit items-center gap-1 rounded-full bg-white p-1 shadow-soft dark:bg-slate-900">
                {(readableQuickReactions.length === quickReactions.length ? readableQuickReactions : quickReactions).map((item) => (
                  <button key={item} type="button" onClick={() => setQuickReaction(item)} className="grid h-9 w-9 place-items-center rounded-full text-lg hover:bg-blue-50 dark:hover:bg-slate-800">
                    {item}
                  </button>
                ))}
                <button type="button" onClick={() => onNotice?.("Pilihan emoji lengkap akan ditambahkan berikutnya.")} aria-label="Reaksi lainnya" className="grid h-9 w-9 place-items-center rounded-full hover:bg-blue-50 dark:hover:bg-slate-800">
                  <SmilePlus size={18} />
                </button>
              </div>
            ) : null}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-soft dark:border-slate-800 dark:bg-slate-950">
              <button type="button" onClick={() => { onReply?.(message); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-900"><Reply size={18} />Balas</button>
              {showPrivateActions && !mine ? <button type="button" onClick={() => openPrivateChat("reply")} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-900"><UserRound size={18} />Balas secara pribadi</button> : null}
              {showPrivateActions && !mine ? <button type="button" onClick={() => openPrivateChat("chat")} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-900"><MessageSquare size={18} />Chat dengan {message.sender?.name ?? "kontak"}</button> : null}
              <button type="button" onClick={copyMessage} disabled={!message.content} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-slate-900"><Copy size={18} />Salin</button>
              <button type="button" onClick={() => { onNotice?.("Reaksi cepat tersedia di atas menu."); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-900"><SmilePlus size={18} />Reaksi</button>
              <button type="button" onClick={() => { onNotice?.("Teruskan pesan akan ditambahkan setelah pemilih chat siap."); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-900"><Forward size={18} />Teruskan</button>
              <button type="button" onClick={pinMessage} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-900"><Pin size={18} />{message.pinnedAt ? "Lepas sematan" : "Sematkan"}</button>
              <button type="button" onClick={() => { onNotice?.("Tanya BlueChat AI akan disambungkan setelah fitur AI aktif."); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-900"><Bot size={18} />Tanya BlueChat AI</button>
              <button type="button" onClick={() => { onNotice?.("Pesan diberi bintang."); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-900"><Star size={18} />Beri bintang</button>
              <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />
              <button type="button" onClick={() => { onNotice?.("Laporan pesan akan masuk ke moderasi setelah panel admin siap."); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-900"><Flag size={18} />Laporkan</button>
              <button type="button" onClick={deleteMessage} className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 size={18} />Hapus</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
