"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultNotificationSettings,
  loadNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings
} from "@/lib/notification-settings";

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultNotificationSettings);

  useEffect(() => {
    setSettings(loadNotificationSettings());

    function syncSettings(event: Event) {
      const detail = (event as CustomEvent<NotificationSettings>).detail;
      setSettings(detail ?? loadNotificationSettings());
    }

    window.addEventListener("bluechat:notification-settings", syncSettings);
    window.addEventListener("storage", syncSettings);
    return () => {
      window.removeEventListener("bluechat:notification-settings", syncSettings);
      window.removeEventListener("storage", syncSettings);
    };
  }, []);

  const updateSettings = useCallback((patch: Partial<NotificationSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      saveNotificationSettings(next);
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
