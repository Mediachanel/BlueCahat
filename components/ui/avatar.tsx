"use client";

import Image from "next/image";
import { useState } from "react";
import { Download, ExternalLink, X } from "lucide-react";
import { initials } from "@/lib/utils";

function AvatarPreview({ name, src, onClose }: { name: string; src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-slate-950/90 text-white backdrop-blur-sm">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <p className="min-w-0 flex-1 truncate text-sm font-black">{name}</p>
        <a href={src} download className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Download foto profil">
          <Download size={20} />
        </a>
        <a href={src} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Buka foto profil">
          <ExternalLink size={20} />
        </a>
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Tutup preview foto">
          <X size={22} />
        </button>
      </header>
      <div className="grid min-h-0 flex-1 place-items-center p-4">
        <div className="relative h-[min(78vw,78vh)] w-[min(78vw,78vh)] max-w-3xl overflow-hidden rounded-full bg-white/10">
          <Image src={src} alt={name} fill sizes="78vw" className="object-cover" />
        </div>
      </div>
    </div>
  );
}

function resolveAvatarSrc(src?: string | null) {
  const value = src?.trim();
  if (!value) return "/avatars/default-user.png";
  if (value.startsWith("/")) return value;

  try {
    const url = new URL(value);
    if (url.protocol === "https:") return value;
  } catch {
    return "/avatars/default-user.png";
  }

  return "/avatars/default-user.png";
}

export function Avatar({ name, src, online, previewable }: { name: string; src?: string | null; online?: boolean; previewable?: boolean }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = resolveAvatarSrc(src);
  const showImage = failedSrc !== imageSrc;
  const canPreview = Boolean(previewable && showImage);
  const content = (
    <>
      {showImage ? (
        <Image src={imageSrc} alt={name} fill sizes="44px" className="object-cover" onError={() => setFailedSrc(imageSrc)} />
      ) : (
        <div className="grid h-full place-items-center text-sm font-bold">{initials(name)}</div>
      )}
      {online !== undefined ? <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${online ? "bg-emerald-500" : "bg-slate-300"}`} /> : null}
    </>
  );

  return (
    <>
      {canPreview ? (
        <button type="button" onClick={() => setPreviewOpen(true)} className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-bluechat-light text-bluechat-navy" aria-label={`Preview foto ${name}`}>
          {content}
        </button>
      ) : (
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-bluechat-light text-bluechat-navy">
          {content}
        </div>
      )}
      {previewOpen && showImage ? <AvatarPreview name={name} src={imageSrc} onClose={() => setPreviewOpen(false)} /> : null}
    </>
  );
}
