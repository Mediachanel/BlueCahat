"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

async function readApiResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as { message?: string };
  } catch {
    return { message: text };
  }
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData))
    });
    const data = await readApiResponse(response);
    setLoading(false);
    if (!response.ok) return setError(data.message ?? "Register gagal");
    router.push("/chat");
  }

  return (
    <form action={submit} className="blue-card w-full max-w-lg space-y-4 p-6">
      <div>
        <div className="relative mb-4 h-16 w-56">
          <Image src="/logo/logo-utama.png" alt="BlueChat" fill sizes="224px" className="object-contain object-left" priority />
        </div>
        <p className="text-sm font-semibold text-bluechat-blue">Daftar BlueChat</p>
        <h1 className="mt-2 text-3xl font-black">Mulai percakapan biru</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="name" placeholder="Nama lengkap" required />
        <Input name="username" placeholder="Username" required />
      </div>
      <Input name="email" type="email" placeholder="Email opsional" />
      <Input name="phone" placeholder="+628..." required />
      <Input name="password" type="password" placeholder="Password" required />
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
      <Button className="w-full" disabled={loading}>{loading ? "Membuat akun..." : "Register"}</Button>
      <p className="text-center text-sm text-bluechat-muted">Sudah punya akun? <Link href="/login" className="font-semibold text-bluechat-blue">Login</Link></p>
    </form>
  );
}
