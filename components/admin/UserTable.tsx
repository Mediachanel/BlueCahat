"use client";

import { useEffect, useState } from "react";

type Row = { id: string; name: string; username: string; email?: string; role: string; isActive: boolean };

export function UserTable() {
  const [users, setUsers] = useState<Row[]>([]);
  useEffect(() => {
    fetch("/api/admin/users").then((response) => response.json()).then((data) => setUsers(data.users ?? []));
  }, []);
  return (
    <div className="blue-card overflow-hidden">
      <div className="border-b border-blue-100 p-4 font-black dark:border-slate-800">Daftar user</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-blue-50 text-bluechat-muted dark:bg-slate-900"><tr><th className="p-3">Nama</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id} className="border-t border-blue-50 dark:border-slate-900"><td className="p-3 font-semibold">{user.name}<br /><span className="text-xs text-bluechat-muted">@{user.username}</span></td><td className="p-3">{user.email}</td><td className="p-3">{user.role}</td><td className="p-3">{user.isActive ? "Aktif" : "Nonaktif"}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
