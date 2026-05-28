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
    <button onClick={onClick} className={cn("flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900 max-md:rounded-none max-md:px-1 max-md:py-3", active && "bg-[#f3f6f9] dark:bg-slate-900 max-md:bg-transparent")}>
      <UserAvatar name={title} src={conversation.image ?? other?.avatar} online={conversation.type === "PRIVATE" ? other?.isOnline : undefined} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-bold max-md:text-lg">{title}</p>
          {last ? <span className="text-xs text-bluechat-muted max-md:text-sm">{formatTime(last.createdAt)}</span> : null}
        </div>
        <p className={cn("truncate text-sm text-bluechat-muted max-md:text-base", other?.isOnline && "text-bluechat-blue")}>{preview}</p>
      </div>
      {unreadCount > 0 ? <span className="grid h-6 min-w-6 place-items-center rounded-full bg-bluechat-blue px-2 text-xs font-bold text-white max-md:h-6 max-md:min-w-6 max-md:text-xs">{unreadCount}</span> : null}
    </button>
  );
}
