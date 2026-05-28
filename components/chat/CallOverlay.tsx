"use client";

import { useEffect, useMemo, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import type { ActiveCall } from "@/hooks/useCall";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function StreamVideo({ stream, muted, className }: { stream?: MediaStream | null; muted?: boolean; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.srcObject = stream ?? null;
  }, [stream]);

  return <video ref={ref} autoPlay playsInline muted={muted} className={className} />;
}

function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return <div className="grid h-24 w-24 place-items-center rounded-full bg-bluechat-light text-3xl font-black text-bluechat-navy">{initials || "BC"}</div>;
}

export function CallOverlay({
  call,
  localStream,
  remoteStream,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleCamera
}: {
  call: ActiveCall | null;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}) {
  const statusText = useMemo(() => {
    if (!call) return "";
    if (call.status === "incoming") return `${call.peer.name} memanggil`;
    if (call.status === "outgoing") return `Memanggil ${call.peer.name}`;
    if (call.status === "connecting") return "Menghubungkan panggilan";
    return `Terhubung dengan ${call.peer.name}`;
  }, [call]);

  if (!call) return null;

  const hasRemoteVideo = call.mode === "video" && remoteStream?.getVideoTracks().length;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl">
        <div className="relative min-h-[420px] bg-slate-900 max-md:min-h-[560px]">
          {hasRemoteVideo ? (
            <StreamVideo stream={remoteStream} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_top,#1e88e5_0,#0f172a_48%,#020617_100%)]">
              <div className="grid place-items-center gap-5 text-center">
                <Initials name={call.peer.name} />
                <div>
                  <p className="text-2xl font-black">{call.peer.name}</p>
                  <p className="mt-1 text-sm font-semibold text-blue-100">{call.mode === "video" ? "Video call" : "Panggilan suara"}</p>
                </div>
              </div>
            </div>
          )}

          {call.mode === "video" ? (
            <div className="absolute right-4 top-4 h-36 w-28 overflow-hidden rounded-xl border border-white/20 bg-slate-800 shadow-xl max-md:h-32 max-md:w-24">
              {localStream && !call.isCameraOff ? (
                <StreamVideo stream={localStream} muted className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center bg-slate-800 text-slate-300">
                  <VideoOff size={28} />
                </div>
              )}
            </div>
          ) : null}

          <div className="absolute left-0 right-0 top-0 bg-gradient-to-b from-slate-950/80 to-transparent p-5">
            <p className="text-lg font-black">{statusText}</p>
            <p className="mt-1 text-sm text-slate-300">{call.status === "connected" ? "Panggilan aktif" : "Menunggu respons"}</p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-5">
            {call.status === "incoming" ? (
              <>
                <Button variant="danger" size="icon" aria-label="Tolak panggilan" className="h-14 w-14 rounded-full" onClick={onReject}>
                  <PhoneOff size={24} />
                </Button>
                <Button variant="primary" size="icon" aria-label="Terima panggilan" className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-400" onClick={onAccept}>
                  <Phone size={24} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={call.isMuted ? "Nyalakan mikrofon" : "Matikan mikrofon"}
                  className={cn("h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20", call.isMuted && "bg-white text-slate-950 hover:bg-slate-100")}
                  onClick={onToggleMute}
                >
                  {call.isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </Button>
                {call.mode === "video" ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={call.isCameraOff ? "Nyalakan kamera" : "Matikan kamera"}
                    className={cn("h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20", call.isCameraOff && "bg-white text-slate-950 hover:bg-slate-100")}
                    onClick={onToggleCamera}
                  >
                    {call.isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
                  </Button>
                ) : null}
                <Button variant="danger" size="icon" aria-label="Akhiri panggilan" className="h-14 w-14 rounded-full bg-red-600 text-white hover:bg-red-500" onClick={onEnd}>
                  <PhoneOff size={24} />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
