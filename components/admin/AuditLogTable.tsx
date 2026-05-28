"use client";

import { useEffect, useState } from "react";

type Log = { id: string; action: string; entity: string; createdAt: string; user?: { name: string } };

export function AuditLogTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  useEffect(() => {
    fetch("/api/admin/audit-logs").then((response) => response.json()).then((data) => setLogs(data.logs ?? []));
  }, []);
  return (
    <div className="blue-card overflow-hidden">
      <div className="border-b border-blue-100 p-4 font-black dark:border-slate-800">Audit log</div>
      <div className="divide-y divide-blue-50 dark:divide-slate-900">
        {logs.slice(0, 8).map((log) => <div key={log.id} className="flex justify-between gap-4 p-3 text-sm"><span><b>{log.action}</b> pada {log.entity}</span><span className="text-bluechat-muted">{log.user?.name ?? "System"}</span></div>)}
      </div>
    </div>
  );
}
