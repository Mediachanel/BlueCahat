"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Scissors, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AvatarUploader({ onUploaded }: { onUploaded?: (avatar: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  }

  async function createCroppedAvatar() {
    if (!file || !preview) return null;
    const image = new window.Image();
    image.src = preview;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Gambar tidak valid"));
    });

    const canvas = document.createElement("canvas");
    const size = 512;
    const context = canvas.getContext("2d");
    if (!context) return null;

    canvas.width = size;
    canvas.height = size;
    context.fillStyle = "#e3f2fd";
    context.fillRect(0, 0, size, size);

    const coverScale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
    const scale = coverScale * zoom;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const maxShiftX = Math.max(0, (width - size) / 2);
    const maxShiftY = Math.max(0, (height - size) / 2);
    const left = (size - width) / 2 + (offsetX / 100) * maxShiftX;
    const top = (size - height) / 2 + (offsetY / 100) * maxShiftY;

    context.drawImage(image, left, top, width, height);

    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        resolve(new File([blob], "avatar-cropped.jpg", { type: "image/jpeg" }));
      }, "image/jpeg", 0.9);
    });
  }

  async function upload() {
    if (!file) return;
    setLoading(true);
    setNotice("");
    try {
      const croppedFile = await createCroppedAvatar();
      const form = new FormData();
      form.append("file", croppedFile ?? file);
      const response = await fetch("/api/users/avatar", { method: "PATCH", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice(data.message ?? "Upload avatar gagal. Pastikan file gambar valid dan ukurannya tidak terlalu besar.");
        return;
      }
      const avatar = data.user?.avatar ?? data.upload?.fileUrl;
      if (avatar) onUploaded?.(avatar);
      window.dispatchEvent(new Event("bluechat:user-updated"));
      setFile(null);
      setNotice("Foto profil berhasil diperbarui.");
    } catch {
      setNotice("Upload avatar gagal. Pilih file gambar yang valid.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-blue-100 p-4 dark:border-slate-800">
      <p className="mb-3 text-sm font-bold text-bluechat-muted">Foto profil</p>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-bluechat-light">
          {preview ? (
            <Image
              src={preview}
              alt="Preview avatar"
              fill
              sizes="80px"
              className="object-cover"
              style={{
                transform: `translate(${offsetX / 4}%, ${offsetY / 4}%) scale(${zoom})`
              }}
            />
          ) : (
            <div className="grid h-full place-items-center text-xs font-bold text-bluechat-navy">Preview</div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <label className="inline-flex cursor-pointer rounded-2xl border border-blue-100 px-4 py-2 text-sm font-semibold text-bluechat-navy hover:bg-blue-50 dark:border-slate-800 dark:text-blue-200 dark:hover:bg-slate-900">
            Pilih foto
            <input type="file" accept="image/*" onChange={selectFile} className="hidden" />
          </label>
          <Button type="button" variant="soft" onClick={upload} disabled={!file || loading}><Upload size={16} />{loading ? "Mengunggah..." : "Upload avatar"}</Button>
        </div>
      </div>
      {preview ? (
        <div className="mt-4 grid gap-3 rounded-xl bg-blue-50 p-3 text-sm dark:bg-slate-900">
          <p className="flex items-center gap-2 font-black text-bluechat-navy dark:text-blue-100"><Scissors size={16} /> Crop foto profil</p>
          <label className="grid gap-1">
            <span className="text-xs font-bold text-bluechat-muted">Zoom</span>
            <input type="range" min="1" max="2.6" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="accent-bluechat-blue" />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-bold text-bluechat-muted">Geser horizontal</span>
            <input type="range" min="-100" max="100" step="1" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} className="accent-bluechat-blue" />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-bold text-bluechat-muted">Geser vertikal</span>
            <input type="range" min="-100" max="100" step="1" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} className="accent-bluechat-blue" />
          </label>
        </div>
      ) : null}
      {notice ? <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-bluechat-navy dark:bg-slate-900 dark:text-blue-100">{notice}</p> : null}
    </div>
  );
}
