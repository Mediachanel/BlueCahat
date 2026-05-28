"use client";

import { useEffect, useState } from "react";
import type { SafeUser } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchCurrentUser() {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      if (!active) return;
      setUser(data.user);
      setLoading(false);
    }

    function refreshCurrentUser() {
      fetchCurrentUser().catch(() => undefined);
    }

    fetchCurrentUser().catch(() => {
      if (active) setLoading(false);
    });

    window.addEventListener("bluechat:user-updated", refreshCurrentUser);
    return () => {
      active = false;
      window.removeEventListener("bluechat:user-updated", refreshCurrentUser);
    };
  }, []);

  return { user, loading, setUser };
}
