"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Archive, MoreVertical, SquarePen } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ConversationSummary, SafeUser } from "@/types";
import { Button } from "@/components/ui/button";
import { SearchChat } from "@/components/chat/SearchChat";
import { ChatListItem } from "@/components/chat/ChatListItem";
import { isNavItemActive, mainNavItems } from "@/components/layout/navigation-items";
import { cn } from "@/lib/utils";

const mobileTabs = mainNavItems.filter((item) => item.href !== "/admin");

export function ChatSidebar({
  conversations,
  currentUserId,
  activeConversationId,
  onSelect,
  onRefresh,
  realtimeState
}: {
  conversations: ConversationSummary[];
  currentUserId?: string;
  activeConversationId?: string | null;
  onSelect: (id: string) => void;
  onRefresh?: () => void;
  realtimeState?: "connecting" | "live" | "fallback";
}) {
  const pathname = usePathname();
  const [filter, setFilter] = useState<"all" | "unread" | "group" | "archived">("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const groups = conversations.filter((conversation) => conversation.type === "GROUP").length;
  const totalUnread = conversations.reduce((total, conversation) => total + (conversation.unreadCount ?? 0), 0);
  const visibleConversations = useMemo(() => {
    const filtered = (() => {
      if (filter === "group") return conversations.filter((conversation) => conversation.type === "GROUP");
      if (filter === "unread") return conversations.filter((conversation) => (conversation.unreadCount ?? 0) > 0);
      if (filter === "archived") return [];
      return conversations;
    })();

    if (!chatSearch.trim()) return filtered;
    const term = chatSearch.toLowerCase();
    return filtered.filter((conversation) => {
      const other = conversation.participants?.find((participant) => participant.user.id !== currentUserId)?.user;
      const title = conversation.type === "GROUP" ? conversation.title ?? "" : other?.name ?? "";
      const last = conversation.messages?.[0]?.content ?? "";
      return `${title} ${other?.username ?? ""} ${last}`.toLowerCase().includes(term);
    });
  }, [chatSearch, conversations, currentUserId, filter]);

  async function searchUsers(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setUsers([]);
      return;
    }
    setLoadingUsers(true);
    const response = await fetch(`/api/users/search?q=${encodeURIComponent(value)}`);
    const data = await response.json();
    setUsers(data.users ?? []);
    setLoadingUsers(false);
  }

  async function createPrivateConversation(userId: string) {
    const response = await fetch("/api/conversations/private", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    if (data.conversation?.id) {
      setComposeOpen(false);
      onSelect(data.conversation.id);
      onRefresh?.();
      window.dispatchEvent(new Event("bluechat:refresh-conversations"));
    }
  }

  function FilterButton({ value, children }: { value: typeof filter; children: React.ReactNode }) {
    const active = filter === value;
    return (
      <button
        onClick={() => setFilter(value)}
        className={cn(
          "h-8 shrink-0 rounded-full border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-[#f0f2f5] dark:border-slate-800 dark:text-slate-300",
          active && "border-[#9de7a5] bg-[#d9fdd3] text-[#008069] hover:bg-[#d9fdd3]"
        )}
      >
        {children}
      </button>
    );
  }

  return (
    <aside className="relative flex h-[100dvh] flex-col overflow-hidden border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 max-md:border-r-0">
      <div className="px-4 pb-1.5 pt-3">
        <div className="mb-2 flex h-9 items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-[22px] font-semibold leading-none text-[#008069] dark:text-emerald-300">BlueChat</h2>
            <span
              title={realtimeState === "live" ? "Realtime aktif" : "Mode sinkron otomatis"}
              className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", realtimeState === "live" ? "bg-[#00a884]" : "bg-amber-500")}
            />
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" aria-label="Buat chat" className="h-8 w-8 rounded-full text-slate-950 hover:bg-[#f0f2f5] dark:text-slate-100" onClick={() => setComposeOpen(true)}><SquarePen size={18} /></Button>
            <div className="relative">
              <Button size="icon" variant="ghost" aria-label="Menu chat" className="h-8 w-8 rounded-full text-slate-950 hover:bg-[#f0f2f5] dark:text-slate-100" onClick={() => setMenuOpen((open) => !open)}><MoreVertical size={20} /></Button>
              {menuOpen ? (
                <div className="absolute right-0 top-10 z-30 w-52 rounded-lg border border-slate-200 bg-white p-2 text-sm shadow-lg dark:border-slate-800 dark:bg-slate-950">
                  <button onClick={() => setComposeOpen(true)} className="w-full rounded-md px-3 py-2 text-left hover:bg-[#f0f2f5] dark:hover:bg-slate-900">Chat baru</button>
                  <Link href="/profile" className="block rounded-md px-3 py-2 hover:bg-[#f0f2f5] dark:hover:bg-slate-900">Pengaturan</Link>
                  <Link href="/stories" className="block rounded-md px-3 py-2 hover:bg-[#f0f2f5] dark:hover:bg-slate-900">Status</Link>
                  <button onClick={() => onRefresh?.()} className="w-full rounded-md px-3 py-2 text-left hover:bg-[#f0f2f5] dark:hover:bg-slate-900">Refresh chat</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <SearchChat value={chatSearch} onChange={setChatSearch} />
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          <FilterButton value="all">Semua</FilterButton>
          <FilterButton value="unread">Belum dibaca{totalUnread ? ` ${totalUnread}` : ""}</FilterButton>
          <FilterButton value="group">Grup{groups ? ` ${groups}` : ""}</FilterButton>
        </div>
      </div>
      <button onClick={() => setFilter("archived")} className="mx-3 mb-1 flex items-center gap-5 rounded-lg px-4 py-2.5 text-left text-[15px] text-slate-600 hover:bg-[#f0f2f5] dark:text-slate-300 dark:hover:bg-slate-900">
        <Archive size={18} className="text-slate-500" />
        <span className="font-medium">Diarsipkan</span>
        <span className="ml-auto text-sm font-semibold text-[#008069]">{filter === "archived" ? visibleConversations.length : ""}</span>
      </button>
      <div className="overflow-y-auto pb-20">
        {visibleConversations.map((conversation) => (
          <ChatListItem key={conversation.id} conversation={conversation} currentUserId={currentUserId} active={conversation.id === activeConversationId} onClick={() => onSelect(conversation.id)} />
        ))}
        {!visibleConversations.length ? <p className="p-4 text-sm text-bluechat-muted">{filter === "archived" ? "Belum ada chat yang diarsipkan." : "Belum ada chat. Cari user untuk mulai ngobrol."}</p> : null}
      </div>
      <nav className="absolute bottom-0 left-0 right-0 hidden grid-cols-5 border-t border-slate-100 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950 max-md:grid">
        {mobileTabs.map(({ href, label, icon: Icon }) => {
          const active = isNavItemActive(pathname, href);
          const badge = href === "/chat" ? totalUnread : 0;
          return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className="grid place-items-center gap-0.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <span className={cn("relative grid h-8 w-12 place-items-center rounded-full", active && "bg-[#d9fdd3] text-[#008069]")}>
              <Icon size={19} />
              {badge > 0 ? <span className="absolute right-1.5 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#00a884] px-1 text-[9px] text-white">{badge > 99 ? "99+" : badge}</span> : null}
            </span>
            {label}
          </Link>
        );
        })}
      </nav>
      <button onClick={() => alert("Aplikasi desktop BlueChat belum tersedia. Untuk sekarang gunakan web app ini di browser.")} className="mt-auto hidden border-t border-slate-200 bg-white p-3 text-left text-sm font-semibold text-bluechat-navy dark:border-slate-800 dark:bg-slate-950 md:flex">
        Dapatkan BlueChat untuk Windows
      </button>
      {composeOpen ? (
        <div className="absolute inset-0 z-40 bg-white/95 p-5 backdrop-blur dark:bg-slate-950/95">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-black">Chat baru</h3>
            <button onClick={() => setComposeOpen(false)} className="rounded-full px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900">Tutup</button>
          </div>
          <SearchChat value={query} onChange={searchUsers} placeholder="Cari nama, username, email, atau nomor HP" />
          <div className="mt-4 space-y-2">
            {loadingUsers ? <p className="p-3 text-sm text-bluechat-muted">Mencari user...</p> : null}
            {users.map((user) => (
              <button key={user.id} onClick={() => createPrivateConversation(user.id)} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-blue-50 dark:hover:bg-slate-900">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-bluechat-light font-black text-bluechat-navy">{user.name.slice(0, 2).toUpperCase()}</div>
                <span className="min-w-0">
                  <span className="block truncate font-bold">{user.name}</span>
                  <span className="block truncate text-sm text-bluechat-muted">@{user.username}</span>
                </span>
              </button>
            ))}
            {query && !loadingUsers && !users.length ? <p className="p-3 text-sm text-bluechat-muted">User tidak ditemukan.</p> : null}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
