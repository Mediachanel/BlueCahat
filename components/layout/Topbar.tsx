"use client";

import { LogOut, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Topbar({ title }: { title: string }) {
  const [dark, setDark] = useState(false);
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function toggleDark() {
    setDark((value) => {
      document.documentElement.classList.toggle("dark", !value);
      return !value;
    });
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-blue-100 bg-bluechat-bg/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:px-6">
      <div>
        <h1 className="text-xl font-black">{title}</h1>
        <p className="hidden text-xs text-bluechat-muted sm:block">Ngobrol lebih cepat, aman, dan nyaman.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Cari"><Search size={18} /></Button>
        <Button variant="ghost" size="icon" aria-label="Mode gelap" onClick={toggleDark}>{dark ? <Sun size={18} /> : <Moon size={18} />}</Button>
        <Button variant="ghost" size="icon" aria-label="Logout" onClick={logout}><LogOut size={18} /></Button>
      </div>
    </header>
  );
}
