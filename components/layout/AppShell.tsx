"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";

export function AppShell({ children, title = "BlueChat" }: { children: ReactNode; title?: string }) {
  return (
    <div className="h-screen overflow-hidden bg-bluechat-bg text-bluechat-text dark:bg-slate-950 dark:text-slate-50">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden pb-20 md:pb-0">
          <Topbar title={title} />
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
