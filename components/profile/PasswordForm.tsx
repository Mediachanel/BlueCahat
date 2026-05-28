"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordForm() {
  async function submit(formData: FormData) {
    await fetch("/api/users/password", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
  }
  return (
    <form action={submit} className="blue-card space-y-4 p-5">
      <h3 className="text-xl font-black">Ubah password</h3>
      <Input name="currentPassword" type="password" placeholder="Password saat ini" />
      <Input name="newPassword" type="password" placeholder="Password baru" />
      <Button variant="soft">Update password</Button>
    </form>
  );
}
