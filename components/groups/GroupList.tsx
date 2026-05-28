"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import type { ConversationSummary } from "@/types";

export function GroupList() {
  const [groups, setGroups] = useState<ConversationSummary[]>([]);
  useEffect(() => {
    fetch("/api/conversations").then((response) => response.json()).then((data) => setGroups((data.conversations ?? []).filter((item: ConversationSummary) => item.type === "GROUP")));
  }, []);
  return (
    <div className="space-y-3">
      {groups.map((group) => <Card key={group.id} className="p-4"><p className="font-black">{group.title}</p><p className="text-sm text-bluechat-muted">{group.participants?.length ?? 0} anggota · pin pesan placeholder</p></Card>)}
      {!groups.length ? <p className="text-sm text-bluechat-muted">Belum ada grup.</p> : null}
    </div>
  );
}
