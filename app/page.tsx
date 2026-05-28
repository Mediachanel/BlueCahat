import Image from "next/image";
import Link from "next/link";

export default function SplashPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#EAF7FF] px-5 py-8 text-bluechat-text">
      <section className="w-full max-w-sm">
        <div className="relative mx-auto min-h-[720px] rounded-[3rem] border-[10px] border-[#141414] bg-gradient-to-b from-[#EFFAFF] via-white to-[#EEF0FF] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.25)]">
          <div className="absolute left-1/2 top-3 h-7 w-28 -translate-x-1/2 rounded-b-2xl rounded-t-full bg-black" />
          <div className="flex h-full min-h-[660px] flex-col items-center justify-center text-center">
            <div className="relative h-32 w-32">
              <Image src="/logo/app-icon.png" alt="BlueChat icon" fill sizes="128px" className="object-contain" priority />
            </div>
            <h1 className="mt-4 text-5xl font-black tracking-normal text-bluechat-text">BlueChat</h1>
            <p className="mt-16 text-base font-semibold leading-6 text-bluechat-text">
              Secure Messaging
              <br />
              Reimagined
            </p>
            <Link
              href="/login"
              className="mt-12 rounded-2xl bg-gradient-to-r from-[#0066B3] to-[#28B7FF] px-8 py-3 text-sm font-bold text-white shadow-soft transition hover:scale-[1.02]"
            >
              Mulai
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
