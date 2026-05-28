"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Camera, ImagePlus, Mic, Plus, Send, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/types";

export function MessageInput({
  onSend,
  disabled,
  onTypingStart,
  onTypingStop,
  replyTo,
  onClearReply
}: {
  onSend: (message: string, attachments?: ChatMessage["attachments"]) => Promise<void>;
  disabled?: boolean;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  replyTo?: ChatMessage | null;
  onClearReply?: () => void;
}) {
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setMessage(event.target.value);
    onTypingStart?.();
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => onTypingStop?.(), 1200);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = message.trim();
    if (!value) return;
    setMessage("");
    onTypingStop?.();
    await onSend(value);
  }

  async function uploadFile(file?: File) {
    if (!file || disabled) return;
    setNotice("Mengunggah lampiran...");
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/upload/message", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) {
      setNotice(data.message ?? "Upload gagal");
      window.setTimeout(() => setNotice(""), 2500);
      return;
    }
    await onSend(file.name, [data.upload]);
    setNotice("");
  }

  function showVoicePlaceholder() {
    setNotice("Voice note placeholder aktif. Recorder audio bisa ditambahkan di tahap berikutnya.");
    window.setTimeout(() => setNotice(""), 2800);
  }

  return (
    <form onSubmit={submit} className="relative flex items-center gap-2 border-t border-slate-200 bg-[#f7f8fa] p-3 dark:border-slate-800 dark:bg-slate-900 max-md:border-t-0 max-md:bg-[#f3f0e9]">
      {notice ? <div className="absolute bottom-full left-4 mb-2 rounded-2xl bg-bluechat-navy px-4 py-2 text-xs font-semibold text-white shadow-soft">{notice}</div> : null}
      {replyTo ? (
        <div className="absolute bottom-full left-4 right-4 mb-2 flex items-center gap-3 rounded-xl border-l-4 border-bluechat-blue bg-white px-4 py-3 text-sm shadow-soft dark:bg-slate-950">
          <div className="min-w-0 flex-1">
            <p className="font-black text-bluechat-blue">Balas {replyTo.sender?.name ?? "pesan"}</p>
            <p className="truncate text-slate-500">{replyTo.deletedForEveryone ? "Pesan ini dihapus" : replyTo.content ?? "Lampiran"}</p>
          </div>
          <button type="button" onClick={onClearReply} aria-label="Batal balas" className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900">
            <X size={18} />
          </button>
        </div>
      ) : null}
      <input ref={fileInputRef} type="file" className="hidden" onChange={(event) => uploadFile(event.target.files?.[0])} />
      <input ref={imageInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(event) => uploadFile(event.target.files?.[0])} />
      <Button type="button" variant="ghost" size="icon" aria-label="Tambah lampiran" className="max-md:hidden" onClick={() => fileInputRef.current?.click()}><Plus size={22} /></Button>
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-3 shadow-sm dark:bg-slate-950">
        <button type="button" onClick={() => setMessage((value) => `${value} 😊`)} aria-label="Tambah emoji"><Smile size={24} className="text-slate-500" /></button>
        <input value={message} onChange={handleChange} disabled={disabled} placeholder={disabled ? "Pilih percakapan" : "Ketik pesan"} className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none max-md:text-base" />
        <button type="button" onClick={() => imageInputRef.current?.click()} aria-label="Upload gambar"><ImagePlus size={22} className="text-slate-500 max-md:hidden" /></button>
        <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Tambah lampiran mobile"><Plus size={23} className="hidden text-slate-500 max-md:block" /></button>
        <button type="button" onClick={() => imageInputRef.current?.click()} aria-label="Upload kamera"><Camera size={23} className="hidden text-slate-500 max-md:block" /></button>
      </div>
      <Button type="button" variant="primary" size="icon" aria-label="Voice note" className="rounded-full bg-bluechat-blue max-md:h-14 max-md:w-14" onClick={showVoicePlaceholder}><Mic size={24} /></Button>
      <Button type="submit" size="icon" aria-label="Kirim" disabled={disabled} className="hidden md:inline-flex"><Send size={18} /></Button>
    </form>
  );
}
