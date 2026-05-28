"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isNavItemActive, mainNavItems } from "@/components/layout/navigation-items";

const mobileNavItems = mainNavItems.filter((item) => item.href !== "/admin");

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t border-blue-100 bg-white/95 p-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("grid place-items-center gap-1 rounded-2xl py-2 text-xs font-semibold text-slate-500", active && "bg-bluechat-light text-bluechat-navy")}>
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
