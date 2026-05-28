"use client";

import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUploader } from "@/components/profile/AvatarUploader";

export function ProfileForm() {
  const { user } = useAuth();
  async function submit(formData: FormData) {
    await fetch("/api/users/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    location.reload();
  }
  return (
    <form action={submit} className="blue-card space-y-4 p-5">
      <h3 className="text-xl font-black">Profil pengguna</h3>
      <div className="flex items-center gap-4 rounded-2xl bg-blue-50 p-4 dark:bg-slate-900">
        <div className="h-20 w-20">
          <Avatar name={user?.name ?? "BlueChat"} src={user?.avatar ?? "/avatars/default-user.png"} online previewable />
        </div>
        <div>
          <p className="font-black">{user?.name}</p>
          <p className="text-sm text-bluechat-muted">Foto ini tampil di chat teman dan daftar kontak.</p>
        </div>
      </div>
      <Input name="name" defaultValue={user?.name} placeholder="Nama" />
      <Input name="username" defaultValue={user?.username} placeholder="Username" />
      <Input name="phone" defaultValue={user?.phone} placeholder="Nomor HP" />
      <Textarea name="bio" defaultValue={user?.bio ?? ""} placeholder="Bio" />
      <AvatarUploader />
      <Button>Simpan profil</Button>
    </form>
  );
}
