"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Download, ExternalLink, FileAudio, FileImage, FileText, FileVideo, File, Maximize2, X } from "lucide-react";
import type { ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Attachment = NonNullable<ChatMessage["attachments"]>[number];

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getAttachmentKind(attachment: Attachment) {
  if (attachment.mimeType.startsWith("image/")) return "image";
  if (attachment.mimeType.startsWith("video/")) return "video";
  if (attachment.mimeType.startsWith("audio/")) return "audio";
  if (attachment.mimeType === "application/pdf") return "pdf";
  if (attachment.mimeType.startsWith("text/")) return "text";
  return "file";
}

function getAttachmentIcon(kind: ReturnType<typeof getAttachmentKind>) {
  if (kind === "image") return FileImage;
  if (kind === "video") return FileVideo;
  if (kind === "audio") return FileAudio;
  if (kind === "pdf" || kind === "text") return FileText;
  return File;
}

function canPreview(kind: ReturnType<typeof getAttachmentKind>) {
  return kind === "image" || kind === "video" || kind === "audio" || kind === "pdf" || kind === "text";
}

function AttachmentModal({ attachment, onClose }: { attachment: Attachment; onClose: () => void }) {
  const kind = getAttachmentKind(attachment);
  const title = attachment.fileName || "Lampiran";

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-slate-950/90 text-white backdrop-blur-sm">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black">{title}</p>
          <p className="text-xs text-slate-300">{formatFileSize(attachment.fileSize)}</p>
        </div>
        <a href={attachment.fileUrl} download={attachment.fileName} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Download lampiran">
          <Download size={20} />
        </a>
        <a href={attachment.fileUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Buka di tab baru">
          <ExternalLink size={20} />
        </a>
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Tutup preview">
          <X size={22} />
        </button>
      </header>

      <div className="grid min-h-0 flex-1 place-items-center p-4">
        {kind === "image" ? (
          <div className="relative h-full max-h-[calc(100dvh-8rem)] w-full max-w-5xl">
            <Image src={attachment.fileUrl} alt={title} fill sizes="90vw" className="object-contain" />
          </div>
        ) : null}
        {kind === "video" ? (
          <video src={attachment.fileUrl} controls autoPlay className="max-h-[calc(100dvh-8rem)] w-full max-w-5xl rounded-xl bg-black" />
        ) : null}
        {kind === "audio" ? (
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 text-slate-900">
            <p className="mb-4 truncate font-black">{title}</p>
            <audio src={attachment.fileUrl} controls autoPlay className="w-full" />
          </div>
        ) : null}
        {kind === "pdf" || kind === "text" ? (
          <iframe src={attachment.fileUrl} title={title} className="h-[calc(100dvh-8rem)] w-full max-w-5xl rounded-xl bg-white" />
        ) : null}
        {!canPreview(kind) ? (
          <div className="grid max-w-md place-items-center gap-4 rounded-2xl bg-white p-6 text-center text-slate-900">
            <File size={44} className="text-bluechat-blue" />
            <div>
              <p className="font-black">{title}</p>
              <p className="mt-1 text-sm text-slate-500">Preview tidak tersedia untuk tipe file ini.</p>
            </div>
            <Button asChild>
              <a href={attachment.fileUrl} download={attachment.fileName}><Download size={18} /> Download</a>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AttachmentCard({ attachment, onPreview }: { attachment: Attachment; onPreview: (attachment: Attachment) => void }) {
  const kind = getAttachmentKind(attachment);
  const Icon = getAttachmentIcon(kind);
  const previewable = canPreview(kind);
  const fileSize = useMemo(() => formatFileSize(attachment.fileSize), [attachment.fileSize]);

  if (kind === "image") {
    return (
      <div className="overflow-hidden rounded-2xl bg-white/70 shadow-sm dark:bg-slate-900/80">
        <button type="button" onClick={() => onPreview(attachment)} className="relative block h-64 w-72 max-w-full overflow-hidden bg-slate-100 text-left dark:bg-slate-800" aria-label={`Preview ${attachment.fileName}`}>
          <Image src={attachment.fileUrl} alt={attachment.fileName} fill sizes="288px" className="object-cover transition group-hover:scale-[1.02]" />
          <span className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-slate-950/60 text-white">
            <Maximize2 size={18} />
          </span>
        </button>
        <div className="flex items-center gap-2 px-3 py-2 text-xs">
          <span className="min-w-0 flex-1 truncate font-semibold text-slate-700 dark:text-slate-200">{attachment.fileName}</span>
          <a href={attachment.fileUrl} download={attachment.fileName} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-bluechat-blue hover:bg-blue-50 dark:hover:bg-slate-800" aria-label="Download gambar">
            <Download size={17} />
          </a>
        </div>
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div className="overflow-hidden rounded-2xl bg-white/70 shadow-sm dark:bg-slate-900/80">
        <video src={attachment.fileUrl} controls preload="metadata" className="max-h-72 w-80 max-w-full bg-black" />
        <AttachmentActions attachment={attachment} icon={Icon} fileSize={fileSize} previewable={previewable} onPreview={onPreview} />
      </div>
    );
  }

  if (kind === "audio") {
    return (
      <div className="rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-slate-900/80">
        <AttachmentActions attachment={attachment} icon={Icon} fileSize={fileSize} previewable={previewable} onPreview={onPreview} />
        <audio src={attachment.fileUrl} controls className="mt-3 w-full min-w-64" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-slate-900/80">
      <AttachmentActions attachment={attachment} icon={Icon} fileSize={fileSize} previewable={previewable} onPreview={onPreview} />
    </div>
  );
}

function AttachmentActions({
  attachment,
  icon: Icon,
  fileSize,
  previewable,
  onPreview
}: {
  attachment: Attachment;
  icon: typeof File;
  fileSize: string;
  previewable: boolean;
  onPreview: (attachment: Attachment) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-bluechat-blue dark:bg-slate-800">
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-bluechat-navy dark:text-blue-100">{attachment.fileName}</p>
        <p className="truncate text-xs text-bluechat-muted">{fileSize || attachment.mimeType}</p>
      </div>
      {previewable ? (
        <button type="button" onClick={() => onPreview(attachment)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Preview lampiran">
          <Maximize2 size={18} />
        </button>
      ) : (
        <a href={attachment.fileUrl} target="_blank" rel="noreferrer" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Buka lampiran">
          <ExternalLink size={18} />
        </a>
      )}
      <a href={attachment.fileUrl} download={attachment.fileName} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-bluechat-blue hover:bg-blue-50 dark:hover:bg-slate-800" aria-label="Download lampiran">
        <Download size={18} />
      </a>
    </div>
  );
}

export function AttachmentPreview({ attachments }: { attachments?: ChatMessage["attachments"] }) {
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  if (!attachments?.length) return null;
  return (
    <>
      <div className={cn("mt-2 space-y-2", attachments.some((attachment) => getAttachmentKind(attachment) === "image") && "group")}>
        {attachments.map((attachment) => <AttachmentCard key={attachment.fileUrl} attachment={attachment} onPreview={setPreviewAttachment} />)}
      </div>
      {previewAttachment ? <AttachmentModal attachment={previewAttachment} onClose={() => setPreviewAttachment(null)} /> : null}
    </>
  );
}
