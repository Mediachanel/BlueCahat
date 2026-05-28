"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultAppearanceSettings,
  loadAppearanceSettings,
  saveAppearanceSettings,
  type AppearanceSettings
} from "@/lib/appearance-settings";

export function useAppearanceSettings() {
  const [settings, setSettings] = useState<AppearanceSettings>(defaultAppearanceSettings);

  useEffect(() => {
    setSettings(loadAppearanceSettings());

    function syncSettings(event: Event) {
      const detail = (event as CustomEvent<AppearanceSettings>).detail;
      setSettings(detail ?? loadAppearanceSettings());
    }

    window.addEventListener("bluechat:appearance-settings", syncSettings);
    window.addEventListener("storage", syncSettings);
    return () => {
      window.removeEventListener("bluechat:appearance-settings", syncSettings);
      window.removeEventListener("storage", syncSettings);
    };
  }, []);

  const updateSettings = useCallback((patch: Partial<AppearanceSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      saveAppearanceSettings(next);
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
