"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUploader } from "@/components/profile/AvatarUploader";

export function ProfileForm() {
  const { user, loading, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function submit(formData: FormData) {
    setSaving(true);
    setNotice("");
    const response = await fetch("/api/users/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setNotice(data.message ?? "Profil gagal disimpan.");
      return;
    }
    setUser(data.user);
    window.dispatchEvent(new Event("bluechat:user-updated"));
    setNotice("Profil tersimpan.");
  }

  if (loading || !user) {
    return <div className="blue-card p-5 text-sm font-semibold text-bluechat-muted">Memuat profil...</div>;
  }

  return (
    <form action={submit} className="blue-card space-y-4 p-5">
      <h3 className="text-xl font-black">Profil pengguna</h3>
      <div className="flex items-center gap-4 rounded-2xl bg-blue-50 p-4 dark:bg-slate-900">
        <div className="h-20 w-20">
          <Avatar name={user.name} src={user.avatar ?? "/avatars/default-user.png"} online previewable />
        </div>
        <div>
          <p className="font-black">{user.name}</p>
          <p className="text-sm text-bluechat-muted">Foto ini tampil di chat teman dan daftar kontak.</p>
        </div>
      </div>
      <Input name="name" defaultValue={user.name} placeholder="Nama" />
      <Input name="username" defaultValue={user.username} placeholder="Username" />
      <Input name="phone" defaultValue={user.phone} placeholder="Nomor HP" />
      <Textarea name="bio" defaultValue={user.bio ?? ""} placeholder="Bio" />
      <AvatarUploader onUploaded={(avatar) => setUser({ ...user, avatar })} />
      {notice ? <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-bluechat-navy dark:bg-slate-900 dark:text-blue-100">{notice}</p> : null}
      <Button disabled={saving}>{saving ? "Menyimpan..." : "Simpan profil"}</Button>
    </form>
  );
}
