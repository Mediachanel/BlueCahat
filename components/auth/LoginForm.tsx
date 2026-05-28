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
    <section className="w-full max-w-sm">
      <div className="relative mx-auto min-h-[720px] rounded-[3rem] border-[10px] border-[#141414] bg-gradient-to-b from-[#EFFAFF] via-white to-[#EEF0FF] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.25)]">
        <div className="absolute left-1/2 top-3 h-7 w-28 -translate-x-1/2 rounded-b-2xl rounded-t-full bg-black" />
        <div className="flex items-center justify-between pt-4 text-[11px] font-bold text-slate-900">
          <span>9:41</span>
          <span>LTE</span>
        </div>

        <form action={submit} className="mt-20">
          <div className="mx-auto mb-20 flex w-fit items-center justify-center gap-2">
            <div className="relative h-9 w-9">
              <Image src="/logo/app-icon.png" alt="BlueChat icon" fill sizes="36px" className="object-contain" priority />
            </div>
            <span className="text-2xl font-black tracking-normal text-bluechat-text">BlueChat</span>
          </div>

          <div className="space-y-4 rounded-[2rem] bg-white/80 px-5 py-8 shadow-[0_16px_45px_rgba(15,76,129,0.08)] backdrop-blur">
            <label className="relative block">
              <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6AA9D8]" />
              <input
                name="emailOrPhone"
                placeholder="Username"
                required
                className="h-12 w-full rounded-2xl border border-transparent bg-[#E6F4FF] pl-11 pr-4 text-sm font-semibold text-bluechat-text outline-none transition placeholder:text-[#6C9FC7] focus:border-[#1E88E5] focus:bg-white"
              />
            </label>
            <label className="relative block">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6AA9D8]" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="h-12 w-full rounded-2xl border border-transparent bg-[#E6F4FF] pl-11 pr-4 text-sm font-semibold text-bluechat-text outline-none transition placeholder:text-[#6C9FC7] focus:border-[#1E88E5] focus:bg-white"
              />
            </label>

            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-xs font-semibold text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#0066B3] to-[#28B7FF] text-sm font-bold text-white shadow-[0_10px_24px_rgba(30,136,229,0.3)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : "Login"}
            </button>

            <Link
              href="/register"
              className="grid h-12 w-full place-items-center rounded-2xl border-2 border-[#1E88E5] bg-white text-sm font-bold text-bluechat-navy transition hover:bg-blue-50"
            >
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
