"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean(navigator.standalone));
}

export function InstallAppSettings({ className }: { className?: string }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const ios = useMemo(() => isIos(), []);

  useEffect(() => {
    setInstalled(isStandalone());

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function onInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice.catch(() => undefined);
    setInstallPrompt(null);
  }

  return (
    <Card className={cn("space-y-4 p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black">Install aplikasi</h3>
          <p className="mt-1 text-sm text-bluechat-muted">Pasang BlueChat di layar utama smartphone.</p>
        </div>
        <Smartphone className="text-bluechat-blue" size={24} />
      </div>

      {installed ? (
        <div className="rounded-xl bg-blue-50 p-3 text-sm font-semibold text-bluechat-navy dark:bg-slate-900 dark:text-blue-100">
          BlueChat sudah berjalan sebagai aplikasi.
        </div>
      ) : ios ? (
        <div className="rounded-xl bg-blue-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          Di iPhone, buka menu Share di Safari, lalu pilih Add to Home Screen.
        </div>
      ) : (
        <Button type="button" variant="soft" onClick={installApp} disabled={!installPrompt}>
          <Download size={16} />
          {installPrompt ? "Install BlueChat" : "Install tersedia dari menu browser"}
        </Button>
      )}
    </Card>
  );
}
