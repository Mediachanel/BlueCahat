import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function StatsCard({ label, value, icon }: { label: string; value: number | string; icon?: ReactNode }) {
  return <Card className="flex items-center justify-between p-5"><div><p className="text-sm text-bluechat-muted">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div><div className="text-bluechat-blue">{icon}</div></Card>;
}
