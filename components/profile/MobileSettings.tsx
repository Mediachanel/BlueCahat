"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Bell, KeyRound, Lock, MessageSquareText, QrCode, Search, UserPlus, UsersRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { ChatAppearanceSettings } from "@/components/profile/ChatAppearanceSettings";
import { InstallAppSettings } from "@/components/profile/InstallAppSettings";
import { NotificationSettings } from "@/components/profile/NotificationSettings";

const settings = [
  { title: "Akun", description: "Notifikasi keamanan, ganti nomor", icon: KeyRound },
  { title: "Privasi", description: "Akun diblokir, pesan sementara", icon: Lock },
  { title: "Daftar", description: "Kelola orang dan grup", icon: UsersRound },
  { title: "Chat", description: "Tema, wallpaper, riwayat obrolan", icon: MessageSquareText },
  { title: "Siaran", description: "Kelola daftar dan kirim siaran", icon: UserPlus },
  { title: "Notifikasi", description: "Pesan, grup dan nada dering panggilan", icon: Bell }
];

export function MobileSettings() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChatAppearance, setShowChatAppearance] = useState(false);

  return (
    <main className="min-h-[100dvh] bg-white text-bluechat-text dark:bg-slate-950 dark:text-slate-50">
      <div className="flex items-center justify-between px-5 pb-4 pt-6">
        <div className="flex items-center gap-4">
          <Link href="/chat" aria-label="Kembali" className="grid h-10 w-10 place-items-center rounded-full">
            <ArrowLeft size={30} />
          </Link>
          <h1 className="text-3xl font-black">Pengaturan</h1>
        </div>
        <Search size={26} />
      </div>

      <section className="flex items-center gap-4 border-b border-slate-100 px-6 py-6 dark:border-slate-800">
        <div className="h-20 w-20">
          <Avatar name={user?.name ?? "BlueChat"} src={user?.avatar} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-3xl font-black">{user?.username ?? user?.name ?? "tian"}</h2>
          <span className="mt-3 inline-grid min-w-32 place-items-center rounded-full border border-slate-200 px-5 py-2 text-lg font-bold text-slate-600 dark:border-slate-800 dark:text-slate-300">Busy</span>
        </div>
        <div className="flex items-center gap-4 text-bluechat-blue">
          <QrCode size={31} className="text-slate-800 dark:text-slate-100" />
          <UserPlus size={34} />
        </div>
      </section>

      <section className="space-y-1 px-6 py-6">
        <InstallAppSettings className="mb-4" />
        {settings.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={() => {
                if (item.title === "Notifikasi") setShowNotifications((open) => !open);
                if (item.title === "Chat") setShowChatAppearance((open) => !open);
              }}
              className="flex w-full gap-6 py-4 text-left"
            >
              <Icon size={26} className="mt-1 shrink-0 text-slate-500" />
              <span>
                <span className="block text-2xl font-black">{item.title}</span>
                <span className="mt-1 block max-w-xs text-lg leading-6 text-slate-500">{item.description}</span>
              </span>
            </button>
          );
        })}
        {showChatAppearance ? <ChatAppearanceSettings className="mt-3" /> : null}
        {showNotifications ? <NotificationSettings className="mt-3" /> : null}
      </section>
    </main>
  );
}
