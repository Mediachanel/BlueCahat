"use client";

import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading } = useAuth();
  if (loading) return <div className="space-y-3"><Skeleton className="h-12" /><Skeleton className="h-80" /></div>;
  return <>{children}</>;
}
