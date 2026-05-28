"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import type { SafeUser } from "@/types";

export function SearchUserDialog() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  async function search(q: string) {
    const response = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    setUsers(data.users ?? []);
  }
  return (
    <div className="blue-card space-y-3 p-4">
      <h3 className="font-black">Cari user</h3>
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
        <Input className="pl-11" placeholder="Nama, username, email, nomor HP" onChange={(event) => search(event.target.value)} />
      </div>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-3 rounded-2xl bg-blue-50 p-3 text-sm dark:bg-slate-900">
            <Avatar name={user.name} src={user.avatar} online={user.isOnline} />
            <div className="min-w-0">
              <p className="font-bold">{user.name}</p>
              <p className="truncate text-bluechat-muted">@{user.username} · {user.id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
