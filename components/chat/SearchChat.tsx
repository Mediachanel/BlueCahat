"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchChat({ value, onChange, placeholder = "Tanya BlueChat AI atau cari" }: { value?: string; onChange?: (value: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
      <Input value={value} onChange={(event) => onChange?.(event.target.value)} className="h-11 rounded-full border-transparent bg-[#f6f7f8] pl-11 shadow-none focus:bg-white dark:bg-slate-900 max-md:h-12 max-md:text-base" placeholder={placeholder} />
    </div>
  );
}
