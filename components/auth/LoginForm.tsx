"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, UserRound } from "lucide-react";

async function readApiResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as { message?: string };
  } catch {
    return { message: text };
  }
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone: formData.get("emailOrPhone"),
        password: formData.get("password")
      })
    });
    const data = await readApiResponse(response);
    setLoading(false);
    if (!response.ok) return setError(data.message ?? "Login gagal");
    router.push("/chat");
  }

  return (
    <section className="w-full max-w-md">
      <form action={submit} className="blue-card space-y-5 p-6 shadow-[0_24px_70px_rgba(15,76,129,0.14)]">
        <div className="text-center">
          <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
            <Image src="/logo/app-icon.png" alt="BlueChat icon" fill sizes="80px" className="object-cover" priority />
          </div>
          <h1 className="mt-4 text-3xl font-black text-bluechat-navy">Masuk BlueChat</h1>
          <p className="mt-2 text-sm font-semibold text-bluechat-muted">Lanjutkan chat, kontak, grup, dan notifikasi.</p>
        </div>

        <label className="relative block">
          <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6AA9D8]" />
          <input
            name="emailOrPhone"
            placeholder="Username, email, atau nomor HP"
            required
            className="h-12 w-full rounded-2xl border border-blue-100 bg-[#E6F4FF] pl-11 pr-4 text-sm font-semibold text-bluechat-text outline-none transition placeholder:text-[#6C9FC7] focus:border-[#1E88E5] focus:bg-white"
          />
        </label>
        <label className="relative block">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6AA9D8]" />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="h-12 w-full rounded-2xl border border-blue-100 bg-[#E6F4FF] pl-11 pr-4 text-sm font-semibold text-bluechat-text outline-none transition placeholder:text-[#6C9FC7] focus:border-[#1E88E5] focus:bg-white"
          />
        </label>

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-xs font-semibold text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-bluechat-navy text-sm font-bold text-white shadow-soft transition hover:bg-bluechat-blue disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <Link
          href="/register"
          className="grid h-12 w-full place-items-center rounded-2xl border border-blue-200 bg-white text-sm font-bold text-bluechat-navy transition hover:bg-blue-50"
        >
          Buat akun baru
        </Link>
      </form>
    </section>
  );
}
