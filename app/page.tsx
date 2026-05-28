import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ShieldCheck, Zap } from "lucide-react";

const highlights = [
  { icon: MessageCircle, label: "Chat pribadi dan grup" },
  { icon: Zap, label: "Sinkron otomatis saat realtime belum aktif" },
  { icon: ShieldCheck, label: "Akun, kontak, dan notifikasi dalam satu aplikasi" }
];

export default function SplashPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#edf8ff] px-5 text-bluechat-text">
      <Image src="/logo/logo-utama.png" alt="" width={560} height={220} priority className="pointer-events-none absolute -right-24 top-10 hidden opacity-10 md:block" />
      <section className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-between py-8 md:max-w-3xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative h-10 w-10 overflow-hidden rounded-2xl bg-white shadow-sm">
              <Image src="/logo/app-icon.png" alt="BlueChat" fill sizes="40px" className="object-cover" priority />
            </span>
            <span className="text-lg font-black">BlueChat</span>
          </div>
          <Link href="/login" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-bluechat-navy shadow-sm">
            Masuk
          </Link>
        </header>

        <div className="py-14 text-center md:py-20">
          <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-[2rem] bg-white shadow-soft">
            <Image src="/logo/app-icon.png" alt="BlueChat icon" fill sizes="112px" className="object-cover" priority />
          </div>
          <h1 className="mt-6 text-5xl font-black tracking-normal text-bluechat-navy md:text-6xl">BlueChat</h1>
          <p className="mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-slate-600 md:text-lg">
            Ngobrol lebih cepat, nyaman, dan tetap jalan walau koneksi realtime sedang fallback.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-2xl bg-bluechat-navy px-6 text-sm font-bold text-white shadow-soft transition hover:bg-bluechat-blue">
              Mulai chat
            </Link>
            <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-2xl border border-blue-200 bg-white px-6 text-sm font-bold text-bluechat-navy transition hover:bg-blue-50">
              Buat akun
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {highlights.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 text-left shadow-sm backdrop-blur">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-bluechat-light text-bluechat-blue">
                <Icon size={20} />
              </span>
              <p className="text-sm font-bold leading-5 text-slate-700">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
