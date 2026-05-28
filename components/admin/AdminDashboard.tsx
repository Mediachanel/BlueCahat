"use client";

import { MessageCircle, Radio, Users, Waypoints } from "lucide-react";
import { useEffect, useState } from "react";
import { StatsCard } from "@/components/admin/StatsCard";
import { UserTable } from "@/components/admin/UserTable";
import { AuditLogTable } from "@/components/admin/AuditLogTable";

const emptyStats = { totalUsers: 0, totalConversations: 0, totalMessages: 0, totalGroups: 0, totalStories: 0 };

export function AdminDashboard() {
  const [stats, setStats] = useState(emptyStats);
  useEffect(() => {
    fetch("/api/admin/stats").then((response) => response.json()).then((data) => setStats(data.stats ?? emptyStats));
  }, []);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard label="Total user" value={stats.totalUsers} icon={<Users />} />
        <StatsCard label="Conversation" value={stats.totalConversations} icon={<Waypoints />} />
        <StatsCard label="Message" value={stats.totalMessages} icon={<MessageCircle />} />
        <StatsCard label="Group" value={stats.totalGroups} icon={<Users />} />
        <StatsCard label="Story" value={stats.totalStories} icon={<Radio />} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]"><UserTable /><AuditLogTable /></div>
    </div>
  );
}
