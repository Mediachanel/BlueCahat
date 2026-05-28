"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { isNavItemActive, mainNavItems } from "@/components/layout/navigation-items";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const railItems = mainNavItems.filter((item) => item.href !== "/profile");
  const profileActive = isNavItemActive(pathname, "/profile");

  return (
    <aside className="hidden h-screen w-16 shrink-0 flex-col items-center justify-between border-r border-slate-200 bg-[#f4f7fb] px-2 py-4 dark:border-slate-800 dark:bg-slate-900 md:flex">
      <div className="flex flex-col items-center gap-3">
        <Link href="/chat" aria-label="BlueChat" title="BlueChat" className="relative mx-auto mb-3 h-10 w-10 overflow-hidden rounded-2xl bg-white shadow-sm">
          <Image src="/logo/app-icon.png" alt="BlueChat" fill sizes="40px" className="object-cover" priority />
        </Link>
        <nav className="flex flex-col items-center gap-3">
          {railItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-2xl text-slate-600 transition hover:bg-white hover:text-bluechat-blue dark:text-slate-300 dark:hover:bg-slate-800",
                  active && "bg-white text-bluechat-navy shadow-sm ring-1 ring-blue-100 dark:bg-slate-800 dark:text-blue-200 dark:ring-slate-700"
                )}
              >
                <Icon size={20} />
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/profile"
          aria-label="Pengaturan"
          title="Pengaturan"
          aria-current={profileActive ? "page" : undefined}
          className={cn(
            "grid h-11 w-11 place-items-center rounded-2xl text-slate-600 transition hover:bg-white hover:text-bluechat-blue dark:text-slate-300 dark:hover:bg-slate-800",
            profileActive && "bg-white text-bluechat-navy shadow-sm ring-1 ring-blue-100 dark:bg-slate-800 dark:text-blue-200 dark:ring-slate-700"
          )}
        >
          <Settings size={20} />
        </Link>
        <Link href="/profile" aria-label="Profil" title="Profil" className="grid h-11 w-11 place-items-center">
          <Avatar name={user?.name ?? "BlueChat"} src={user?.avatar} online />
        </Link>
      </div>
    </aside>
  );
}
