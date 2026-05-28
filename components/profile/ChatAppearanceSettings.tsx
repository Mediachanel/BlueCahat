"use client";

import { ChangeEvent, useState } from "react";
import { CaseSensitive, Image as ImageIcon, Trash2, Type, Upload } from "lucide-react";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import {
  chatBackgroundOptions,
  chatFontFamilyOptions,
  getChatFontFamily,
  resolveChatBackground,
  type ChatBackgroundId,
  type ChatFontFamilyId
} from "@/lib/appearance-settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function readImageAsCompressedDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      const maxWidth = 1600;
      const scale = Math.min(1, maxWidth / image.naturalWidth);
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas tidak tersedia"));
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak valid"));
    };

    image.src = url;
  });
}

export function ChatAppearanceSettings({ className }: { className?: string }) {
  const { settings, updateSettings } = useAppearanceSettings();
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const background = resolveChatBackground(settings);

  async function uploadBackground(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadingBackground(true);
    try {
      const dataUrl = await readImageAsCompressedDataUrl(file);
      updateSettings({ customChatBackgroundUrl: dataUrl, chatBackground: "custom" });
    } catch {
      alert("Upload background gagal. Pilih file gambar yang valid.");
    } finally {
      setUploadingBackground(false);
    }
  }

  return (
    <Card className={cn("space-y-4 p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black">Tampilan chat</h3>
          <p className="mt-1 text-sm text-bluechat-muted">Jenis tulisan, ukuran teks, dan background percakapan.</p>
        </div>
        <Type className="text-bluechat-blue" size={24} />
      </div>

      <div className="grid gap-3 rounded-xl border border-blue-100 p-3 dark:border-slate-800">
        <label className="flex items-center gap-2 text-sm font-black" htmlFor="chat-font-family">
          <CaseSensitive size={18} className="text-bluechat-blue" />
          Jenis tulisan
        </label>
        <select
          id="chat-font-family"
          value={settings.chatFontFamily}
          onChange={(event) => updateSettings({ chatFontFamily: event.target.value as ChatFontFamilyId })}
          className="blue-input"
        >
          {chatFontFamilyOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </div>

      <label className="block rounded-xl bg-blue-50 p-3 text-sm dark:bg-slate-900">
        <span className="mb-2 flex items-center justify-between gap-2 font-bold">
          <span>Ukuran tulisan</span>
          <span className="rounded-full bg-white px-2 py-1 text-xs text-bluechat-navy dark:bg-slate-950 dark:text-blue-100">{settings.chatFontSize}px</span>
        </span>
        <input
          type="range"
          min="12"
          max="20"
          step="1"
          value={settings.chatFontSize}
          onChange={(event) => updateSettings({ chatFontSize: Number(event.target.value) })}
          className="w-full accent-bluechat-blue"
        />
      </label>

      <div className="grid gap-3 rounded-xl border border-blue-100 p-3 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm font-black">
          <ImageIcon size={18} className="text-bluechat-blue" />
          Background chat
        </div>
        <div className="grid grid-cols-3 gap-2">
          {chatBackgroundOptions.map((option) => {
            const active = option.id === settings.chatBackground;
            const previewImage = option.id === "custom" && settings.customChatBackgroundUrl ? `url("${settings.customChatBackgroundUrl}")` : option.image;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => updateSettings({ chatBackground: option.id })}
                className={cn("overflow-hidden rounded-xl border p-1 text-left transition", active ? "border-bluechat-blue ring-2 ring-blue-100" : "border-blue-100 hover:border-bluechat-blue dark:border-slate-800")}
              >
                <span
                  className="block h-14 rounded-lg"
                  style={{ backgroundColor: option.color, backgroundImage: previewImage, backgroundSize: option.id === "custom" && settings.customChatBackgroundUrl ? "cover" : option.size }}
                />
                <span className="mt-1 block truncate px-1 text-xs font-bold">{option.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-blue-100 px-4 py-2 text-sm font-semibold text-bluechat-navy hover:bg-blue-50 dark:border-slate-800 dark:text-blue-200 dark:hover:bg-slate-900">
            <Upload size={16} />
            {uploadingBackground ? "Mengunggah..." : "Upload background"}
            <input type="file" accept="image/*" onChange={uploadBackground} className="hidden" />
          </label>
          {settings.customChatBackgroundUrl ? (
            <Button type="button" variant="soft" size="sm" onClick={() => updateSettings({ customChatBackgroundUrl: undefined, chatBackground: "classic" })}>
              <Trash2 size={16} />
              Hapus upload
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className="rounded-xl p-3"
        style={{
          backgroundColor: background.color,
          backgroundImage: background.image,
          backgroundSize: background.size,
          fontFamily: getChatFontFamily(settings.chatFontFamily)
        }}
      >
        <div className="ml-auto w-fit max-w-[78%] rounded-xl rounded-br-sm bg-[#DFF0FF] px-3 py-2 text-slate-900 shadow-sm">
          <p style={{ fontSize: `${settings.chatFontSize}px`, lineHeight: 1.45 }}>Contoh tampilan pesan BlueChat.</p>
          <p className="mt-1 text-right text-[11px] text-bluechat-blue">12.45</p>
        </div>
      </div>
    </Card>
  );
}
