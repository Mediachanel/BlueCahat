import { MessageCircle, ShieldBan } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { SafeUser } from "@/types";

export function ContactCard({ user, nickname }: { user: SafeUser; nickname?: string | null }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} src={user.avatar} online={user.isOnline} />
        <div>
          <p className="font-bold">{nickname ?? user.name}</p>
          <p className="text-sm text-bluechat-muted">@{user.username}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="icon" variant="soft" aria-label="Chat"><MessageCircle size={18} /></Button>
        <Button size="icon" variant="danger" aria-label="Blokir"><ShieldBan size={18} /></Button>
      </div>
    </div>
  );
}
