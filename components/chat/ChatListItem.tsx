"use client";

import type { ConversationSummary, SafeUser } from "@/types";
import { cn, formatTime } from "@/lib/utils";
import { UserAvatar } from "@/components/chat/UserAvatar";

export function ChatListItem({ conversation, currentUserId, active, onClick }: { conversation: ConversationSummary; currentUserId?: string; active?: boolean; onClick: () => void }) {
  const other = conversation.participants?.find((participant) => participant.user.id !== currentUserId)?.user as SafeUser | undefined;
  const title = conversation.type === "GROUP" ? conversation.title ?? "Grup" : other?.name ?? "Percakapan";
  const last = conversation.messages?.[0];
  const preview = other?.isOnline && !last ? "online" : last?.deletedForEveryone ? "Pesan dihapus" : last?.content ?? "Belum ada pesan";
  const unreadCount = conversation.unreadCount ?? 0;
  return (
    <button onClick={onClick} className={cn("flex w-full items-center gap-3 rounded-none px-4 py-3 text-left transition hover:bg-[#f5f6f6] dark:hover:bg-slate-900", active && "bg-[#f0f2f5] dark:bg-slate-900")}>
      <div className="h-12 w-12 shrink-0">
        <UserAvatar name={title} src={conversation.image ?? other?.avatar} online={conversation.type === "PRIVATE" ? other?.isOnline : undefined} />
      </div>
      <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[17px] font-semibold text-slate-950 dark:text-slate-100">{title}</p>
          {last ? <span className={cn("text-xs text-slate-500", unreadCount > 0 && "font-bold text-[#00a884]")}>{formatTime(last.createdAt)}</span> : null}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <p className={cn("min-w-0 flex-1 truncate text-[15px] text-slate-500", other?.isOnline && "text-[#00a884]")}>{preview}</p>
          {unreadCount > 0 ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#00a884] px-1.5 text-[11px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
        </div>
      </div>
    </button>
  );
}
