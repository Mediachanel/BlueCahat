"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Archive, Camera, MoreVertical, Plus, SquarePen } from "lucide-react";
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
  const [filter, setFilter] = useState<"all" | "unread" | "favorite" | "group" | "archived">("all");
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
      if (filter === "favorite" || filter === "archived") return [];
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
        className={cn("rounded-full border border-slate-200 px-4 py-2 text-slate-600 dark:border-slate-800 dark:text-slate-300", active && "border-transparent bg-bluechat-light text-bluechat-navy")}
      >
        {children}
      </button>
    );
  }

  return (
    <aside className="relative flex h-screen flex-col overflow-hidden border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 max-md:h-[100dvh] max-md:border-r-0">
      <div className="p-5 pb-3 max-md:px-5 max-md:pt-5">
        <div className="hidden items-center justify-between pb-5 text-xs font-bold text-slate-600 max-md:flex">
          <span>12.10</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">83</span>
        </div>
        <div className="mb-5 flex items-center justify-between max-md:mb-4">
          <h2 className="text-2xl font-black text-bluechat-navy dark:text-blue-100 max-md:text-3xl">BlueChat</h2>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" aria-label="Kamera" className="hidden max-md:inline-flex" onClick={() => alert("Kamera siap dikembangkan untuk capture langsung. Saat ini gunakan upload lampiran di ruang chat.")}><Camera size={25} /></Button>
            <Button size="icon" variant="ghost" aria-label="Buat chat" onClick={() => setComposeOpen(true)}><SquarePen size={19} /></Button>
            <div className="relative">
              <Button size="icon" variant="ghost" aria-label="Menu chat" onClick={() => setMenuOpen((open) => !open)}><MoreVertical size={19} /></Button>
              {menuOpen ? (
                <div className="absolute right-0 top-11 z-30 w-52 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-soft dark:border-slate-800 dark:bg-slate-950">
                  <button onClick={() => setComposeOpen(true)} className="w-full rounded-xl px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-slate-900">Chat baru</button>
                  <Link href="/profile" className="block rounded-xl px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-900">Pengaturan</Link>
                  <Link href="/stories" className="block rounded-xl px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-900">Status</Link>
                  <button onClick={() => onRefresh?.()} className="w-full rounded-xl px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-slate-900">Refresh chat</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <SearchChat value={chatSearch} onChange={setChatSearch} />
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <span className={cn("h-2 w-2 rounded-full", realtimeState === "live" ? "bg-emerald-500" : "bg-amber-500")} />
          {realtimeState === "live" ? "Realtime aktif" : "Mode sinkron otomatis"}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 text-sm font-semibold max-md:text-sm">
          <FilterButton value="all">Semua</FilterButton>
          <FilterButton value="unread">Belum dibaca {totalUnread}</FilterButton>
          <FilterButton value="favorite">Favorit</FilterButton>
          <FilterButton value="group">Grup {groups}</FilterButton>
          <button onClick={() => setComposeOpen(true)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300"><Plus size={16} /></button>
        </div>
      </div>
      <button onClick={() => setFilter("archived")} className="flex items-center gap-4 px-5 py-3 text-left text-sm text-slate-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-900">
        <Archive size={18} />
        <span>Diarsipkan</span>
        <span className="ml-auto font-bold text-bluechat-blue">@</span>
      </button>
      <div className="space-y-1 overflow-y-auto px-3 pb-28 max-md:px-4">
        {visibleConversations.map((conversation) => (
          <ChatListItem key={conversation.id} conversation={conversation} currentUserId={currentUserId} active={conversation.id === activeConversationId} onClick={() => onSelect(conversation.id)} />
        ))}
        {!visibleConversations.length ? <p className="p-4 text-sm text-bluechat-muted">{filter === "archived" ? "Belum ada chat yang diarsipkan." : "Belum ada chat. Cari user untuk mulai ngobrol."}</p> : null}
      </div>
      <button onClick={() => setComposeOpen(true)} aria-label="Buat chat baru" className="absolute bottom-24 right-6 hidden h-14 w-14 place-items-center rounded-2xl bg-bluechat-blue text-white shadow-[0_12px_30px_rgba(30,136,229,0.35)] max-md:grid">
        <Plus size={28} />
      </button>
      <nav className="absolute bottom-0 left-0 right-0 hidden grid-cols-5 border-t border-slate-100 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-950 max-md:grid">
        {mobileTabs.map(({ href, label, icon: Icon }) => {
          const active = isNavItemActive(pathname, href);
          const badge = href === "/chat" ? totalUnread : 0;
          return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className="grid place-items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className={cn("relative grid h-10 w-16 place-items-center rounded-full", active && "bg-bluechat-light text-bluechat-navy")}>
              <Icon size={21} />
              {badge > 0 ? <span className="absolute right-3 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-bluechat-blue px-1 text-[10px] text-white">{badge > 99 ? "99+" : badge}</span> : null}
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
