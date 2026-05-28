"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const cleanupDevelopmentWorker = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith("bluechat-")).map((key) => caches.delete(key)));
      }
    };

    const register = async () => {
      try {
        if (process.env.NODE_ENV !== "production") {
          await cleanupDevelopmentWorker();
          return;
        }

        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        registration.update().catch(() => undefined);
      } catch {
        // Installation support is optional; the app still works as a normal web app.
      }
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
