"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchChat({ value, onChange, placeholder = "Cari atau mulai obrolan baru" }: { value?: string; onChange?: (value: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
      <Input value={value} onChange={(event) => onChange?.(event.target.value)} className="h-9 rounded-full border-transparent bg-[#f0f2f5] pl-10 text-sm shadow-none focus:bg-white dark:bg-slate-900" placeholder={placeholder} />
    </div>
  );
}
