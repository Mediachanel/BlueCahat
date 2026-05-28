"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, MessageCircle, Phone, Volume2 } from "lucide-react";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import {
  callToneOptions,
  messageToneOptions,
  playCallTone,
  playMessageTone,
  type CallToneId,
  type MessageToneId
} from "@/lib/notification-settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function ToggleRow({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl bg-blue-50 p-3 text-sm dark:bg-slate-900">
      <span className="min-w-0">
        <span className="block font-bold">{label}</span>
        <span className="mt-0.5 block text-xs text-bluechat-muted">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 shrink-0 accent-bluechat-blue" />
    </label>
  );
}

export function NotificationSettings({ className }: { className?: string }) {
  const { settings, updateSettings } = useNotificationSettings();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    setPermission("Notification" in window ? Notification.permission : "unsupported");
  }, []);

  async function requestPermission() {
    if (!("Notification" in window)) return;
    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
    updateSettings({ desktopNotifications: nextPermission === "granted" });
  }

  return (
    <Card className={cn("space-y-4 p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black">Notifikasi</h3>
          <p className="mt-1 text-sm text-bluechat-muted">Pesan, panggilan, dan nada dering.</p>
        </div>
        <BellRing className="text-bluechat-blue" size={24} />
      </div>

      <div className="grid gap-3">
        <ToggleRow label="Aktifkan notifikasi" description="Tampilkan pemberitahuan di BlueChat." checked={settings.notificationsEnabled} onChange={(checked) => updateSettings({ notificationsEnabled: checked })} />
        <ToggleRow label="Preview pesan" description="Tampilkan isi pesan pada notifikasi." checked={settings.showMessagePreview} onChange={(checked) => updateSettings({ showMessagePreview: checked })} />
        <ToggleRow label="Suara pesan" description="Putar nada saat pesan baru masuk." checked={settings.messageSoundEnabled} onChange={(checked) => updateSettings({ messageSoundEnabled: checked })} />
        <ToggleRow label="Nada panggilan" description="Putar dering saat call masuk." checked={settings.callSoundEnabled} onChange={(checked) => updateSettings({ callSoundEnabled: checked })} />
        <ToggleRow label="Getar perangkat" description="Aktif untuk perangkat yang mendukung vibrasi." checked={settings.vibrate} onChange={(checked) => updateSettings({ vibrate: checked })} />
      </div>

      <div className="grid gap-3 rounded-xl border border-blue-100 p-3 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm font-black">
          <MessageCircle size={18} className="text-bluechat-blue" />
          Nada pesan
        </div>
        <div className="flex gap-2">
          <select value={settings.messageTone} onChange={(event) => updateSettings({ messageTone: event.target.value as MessageToneId })} className="blue-input min-w-0 flex-1">
            {messageToneOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
          <Button type="button" variant="soft" size="icon" aria-label="Tes nada pesan" onClick={() => playMessageTone(settings.messageTone, settings.volume)}>
            <Volume2 size={18} />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-blue-100 p-3 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm font-black">
          <Phone size={18} className="text-bluechat-blue" />
          Nada panggilan
        </div>
        <div className="flex gap-2">
          <select value={settings.callTone} onChange={(event) => updateSettings({ callTone: event.target.value as CallToneId })} className="blue-input min-w-0 flex-1">
            {callToneOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
          <Button type="button" variant="soft" size="icon" aria-label="Tes nada panggilan" onClick={() => playCallTone(settings.callTone, settings.volume)}>
            <Volume2 size={18} />
          </Button>
        </div>
      </div>

      <label className="block rounded-xl bg-blue-50 p-3 text-sm dark:bg-slate-900">
        <span className="mb-2 flex items-center gap-2 font-bold"><Volume2 size={17} /> Volume</span>
        <input type="range" min="0" max="1" step="0.05" value={settings.volume} onChange={(event) => updateSettings({ volume: Number(event.target.value) })} className="w-full accent-bluechat-blue" />
      </label>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 p-3 text-sm dark:border-slate-800">
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-bold"><Bell size={17} /> Notifikasi browser</span>
          <span className="mt-0.5 block text-xs uppercase tracking-wide text-bluechat-muted">{permission}</span>
        </span>
        <Button type="button" variant="soft" size="sm" onClick={requestPermission} disabled={permission === "granted" || permission === "unsupported"}>
          Izinkan
        </Button>
      </div>
    </Card>
  );
}
