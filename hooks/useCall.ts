"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { ConversationSummary, SafeUser } from "@/types";
import { defaultNotificationSettings, type NotificationSettings } from "@/lib/notification-settings";

export type CallMode = "audio" | "video";
export type CallStatus = "incoming" | "outgoing" | "connecting" | "connected";

export type ActiveCall = {
  callId: string;
  conversationId: string;
  mode: CallMode;
  status: CallStatus;
  direction: "incoming" | "outgoing";
  peer: Pick<SafeUser, "id" | "name" | "avatar">;
  startedAt?: Date;
  isMuted: boolean;
  isCameraOff: boolean;
};

type CallInvitePayload = {
  callId: string;
  conversationId: string;
  mode: CallMode;
  fromUserId: string;
  fromName: string;
  fromAvatar?: string | null;
  targetUserIds: string[];
  createdAt: string;
};

type CallAcceptPayload = {
  callId: string;
  conversationId: string;
  fromUserId: string;
  fromName: string;
  fromAvatar?: string | null;
  toUserId: string;
};

type CallSignalPayload = {
  callId: string;
  conversationId: string;
  fromUserId: string;
  toUserId?: string;
  kind: "offer" | "answer" | "ice";
  signal: RTCSessionDescriptionInit | RTCIceCandidateInit;
};

type CallEndPayload = {
  callId: string;
  conversationId: string;
  fromUserId: string;
  toUserId?: string;
  targetUserIds?: string[];
  reason?: "ended" | "rejected" | "busy" | "cancelled";
};

function createCallId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `call-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getPeer(conversation: ConversationSummary, currentUserId: string) {
  return conversation.participants?.find((participant) => participant.user.id !== currentUserId)?.user;
}

export function useCall({
  socket,
  currentUser,
  activeConversation,
  onSelectConversation,
  onNotice,
  notificationSettings = defaultNotificationSettings
}: {
  socket: Socket | null;
  currentUser?: SafeUser | null;
  activeConversation?: ConversationSummary;
  onSelectConversation?: (conversationId: string) => void;
  onNotice?: (message: string) => void;
  notificationSettings?: NotificationSettings;
}) {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const activeCallRef = useRef<ActiveCall | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const peerUserIdRef = useRef<string | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  const stopLocalStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
  }, []);

  const closePeerConnection = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    peerUserIdRef.current = null;
    pendingIceCandidatesRef.current = [];
    remoteStreamRef.current = null;
    setRemoteStream(null);
  }, []);

  const resetCall = useCallback(() => {
    closePeerConnection();
    stopLocalStream();
    setActiveCall(null);
  }, [closePeerConnection, stopLocalStream]);

  const openLocalStream = useCallback(async (mode: CallMode) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: mode === "video" ? { facingMode: "user" } : false
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const flushPendingIceCandidates = useCallback(async () => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection?.remoteDescription) return;
    const candidates = pendingIceCandidatesRef.current.splice(0);
    await Promise.all(candidates.map((candidate) => peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => undefined)));
  }, []);

  const createPeerConnection = useCallback(
    (callId: string, conversationId: string, remoteUserId: string, stream: MediaStream) => {
      peerConnectionRef.current?.close();
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      const nextRemoteStream = new MediaStream();
      remoteStreamRef.current = nextRemoteStream;
      setRemoteStream(nextRemoteStream);
      peerUserIdRef.current = remoteUserId;

      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate || !socket || !currentUser?.id) return;
        socket.emit("call:signal", {
          callId,
          conversationId,
          fromUserId: currentUser.id,
          toUserId: remoteUserId,
          kind: "ice",
          signal: event.candidate.toJSON()
        } satisfies CallSignalPayload);
      };

      peerConnection.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => {
          if (!nextRemoteStream.getTracks().some((item) => item.id === track.id)) nextRemoteStream.addTrack(track);
        });
        setRemoteStream(new MediaStream(nextRemoteStream.getTracks()));
      };

      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === "connected") {
          setActiveCall((call) => (call?.callId === callId ? { ...call, status: "connected", startedAt: call.startedAt ?? new Date() } : call));
        }
        if (["closed", "failed", "disconnected"].includes(peerConnection.connectionState)) {
          setActiveCall((call) => (call?.callId === callId && call.status === "connected" ? { ...call, status: "connecting" } : call));
        }
      };

      peerConnectionRef.current = peerConnection;
      return peerConnection;
    },
    [currentUser?.id, socket]
  );

  const startCall = useCallback(
    async (mode: CallMode) => {
      if (!socket || !socket.connected || !currentUser?.id) {
        onNotice?.("Realtime belum tersambung. Coba lagi sebentar.");
        socket?.connect();
        return;
      }
      if (!activeConversation) return;
      if (activeConversation.type !== "PRIVATE") {
        onNotice?.("Panggilan grup belum tersedia. Gunakan chat pribadi dulu.");
        return;
      }
      if (activeCallRef.current) {
        onNotice?.("Masih ada panggilan aktif.");
        return;
      }

      const peer = getPeer(activeConversation, currentUser.id);
      if (!peer) {
        onNotice?.("Kontak tujuan tidak ditemukan.");
        return;
      }

      try {
        const stream = await openLocalStream(mode);
        const callId = createCallId();
        localStreamRef.current = stream;
        setActiveCall({
          callId,
          conversationId: activeConversation.id,
          mode,
          status: "outgoing",
          direction: "outgoing",
          peer,
          isMuted: false,
          isCameraOff: mode === "audio"
        });
        socket.emit("call:invite", {
          callId,
          conversationId: activeConversation.id,
          mode,
          fromUserId: currentUser.id,
          fromName: currentUser.name,
          fromAvatar: currentUser.avatar,
          targetUserIds: [peer.id],
          createdAt: new Date().toISOString()
        } satisfies CallInvitePayload);
      } catch {
        onNotice?.("Kamera atau mikrofon belum diizinkan browser.");
        resetCall();
      }
    },
    [activeConversation, currentUser, onNotice, openLocalStream, resetCall, socket]
  );

  const acceptCall = useCallback(async () => {
    const call = activeCallRef.current;
    if (!call || call.status !== "incoming" || !socket || !currentUser?.id) return;

    try {
      const stream = await openLocalStream(call.mode);
      onSelectConversation?.(call.conversationId);
      setActiveCall({ ...call, status: "connecting", startedAt: new Date() });
      createPeerConnection(call.callId, call.conversationId, call.peer.id, stream);
      socket.emit("call:accept", {
        callId: call.callId,
        conversationId: call.conversationId,
        fromUserId: currentUser.id,
        fromName: currentUser.name,
        fromAvatar: currentUser.avatar,
        toUserId: call.peer.id
      } satisfies CallAcceptPayload);
    } catch {
      onNotice?.("Kamera atau mikrofon belum diizinkan browser.");
      socket.emit("call:reject", {
        callId: call.callId,
        conversationId: call.conversationId,
        fromUserId: currentUser.id,
        toUserId: call.peer.id,
        reason: "rejected"
      } satisfies CallEndPayload);
      resetCall();
    }
  }, [createPeerConnection, currentUser, onNotice, onSelectConversation, openLocalStream, resetCall, socket]);

  const rejectCall = useCallback(() => {
    const call = activeCallRef.current;
    if (!call || !socket || !currentUser?.id) {
      resetCall();
      return;
    }
    socket.emit("call:reject", {
      callId: call.callId,
      conversationId: call.conversationId,
      fromUserId: currentUser.id,
      toUserId: call.peer.id,
      reason: "rejected"
    } satisfies CallEndPayload);
    resetCall();
  }, [currentUser?.id, resetCall, socket]);

  const endCall = useCallback(() => {
    const call = activeCallRef.current;
    if (call && socket && currentUser?.id) {
      socket.emit("call:end", {
        callId: call.callId,
        conversationId: call.conversationId,
        fromUserId: currentUser.id,
        toUserId: call.peer.id,
        targetUserIds: [call.peer.id],
        reason: call.status === "outgoing" ? "cancelled" : "ended"
      } satisfies CallEndPayload);
    }
    resetCall();
  }, [currentUser?.id, resetCall, socket]);

  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = activeCallRef.current?.isMuted ?? false;
    });
    setActiveCall((call) => (call ? { ...call, isMuted: !call.isMuted } : call));
  }, []);

  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = activeCallRef.current?.isCameraOff ?? false;
    });
    setActiveCall((call) => (call ? { ...call, isCameraOff: !call.isCameraOff } : call));
  }, []);

  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    const handleIncoming = (payload: CallInvitePayload) => {
      if (payload.fromUserId === currentUser.id) return;
      if (payload.targetUserIds?.length && !payload.targetUserIds.includes(currentUser.id)) return;
      if (activeCallRef.current?.callId === payload.callId) return;
      if (activeCallRef.current) {
        socket.emit("call:reject", {
          callId: payload.callId,
          conversationId: payload.conversationId,
          fromUserId: currentUser.id,
          toUserId: payload.fromUserId,
          reason: "busy"
        } satisfies CallEndPayload);
        return;
      }

      setActiveCall({
        callId: payload.callId,
        conversationId: payload.conversationId,
        mode: payload.mode,
        status: "incoming",
        direction: "incoming",
        peer: { id: payload.fromUserId, name: payload.fromName, avatar: payload.fromAvatar },
        isMuted: false,
        isCameraOff: payload.mode === "audio"
      });

      if (notificationSettings.notificationsEnabled && notificationSettings.vibrate && "vibrate" in navigator) {
        navigator.vibrate([180, 80, 180]);
      }

      if (notificationSettings.notificationsEnabled && notificationSettings.desktopNotifications && "Notification" in window && Notification.permission === "granted") {
        new Notification("Panggilan masuk", {
          body: notificationSettings.showMessagePreview ? `${payload.fromName} memanggil` : "Panggilan masuk",
          icon: "/logo/app-icon.png"
        });
      }
    };

    const handleAccepted = async (payload: CallAcceptPayload) => {
      const call = activeCallRef.current;
      if (!call || call.callId !== payload.callId || payload.toUserId !== currentUser.id) return;
      try {
        const stream = localStreamRef.current ?? (await openLocalStream(call.mode));
        const peerConnection = createPeerConnection(call.callId, call.conversationId, payload.fromUserId, stream);
        setActiveCall({
          ...call,
          status: "connecting",
          peer: { id: payload.fromUserId, name: payload.fromName, avatar: payload.fromAvatar },
          startedAt: new Date()
        });
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit("call:signal", {
          callId: call.callId,
          conversationId: call.conversationId,
          fromUserId: currentUser.id,
          toUserId: payload.fromUserId,
          kind: "offer",
          signal: offer
        } satisfies CallSignalPayload);
      } catch {
        onNotice?.("Panggilan gagal dimulai.");
        resetCall();
      }
    };

    const handleSignal = async (payload: CallSignalPayload) => {
      const call = activeCallRef.current;
      if (!call || call.callId !== payload.callId || payload.fromUserId === currentUser.id) return;
      if (payload.toUserId && payload.toUserId !== currentUser.id) return;

      try {
        const peerConnection = peerConnectionRef.current;
        if (!peerConnection) return;

        if (payload.kind === "offer") {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.signal as RTCSessionDescriptionInit));
          await flushPendingIceCandidates();
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit("call:signal", {
            callId: call.callId,
            conversationId: call.conversationId,
            fromUserId: currentUser.id,
            toUserId: payload.fromUserId,
            kind: "answer",
            signal: answer
          } satisfies CallSignalPayload);
          setActiveCall((current) => (current?.callId === call.callId ? { ...current, status: "connected", startedAt: current.startedAt ?? new Date() } : current));
          return;
        }

        if (payload.kind === "answer") {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.signal as RTCSessionDescriptionInit));
          await flushPendingIceCandidates();
          setActiveCall((current) => (current?.callId === call.callId ? { ...current, status: "connected", startedAt: current.startedAt ?? new Date() } : current));
          return;
        }

        if (!peerConnection.remoteDescription) {
          pendingIceCandidatesRef.current.push(payload.signal as RTCIceCandidateInit);
          return;
        }
        await peerConnection.addIceCandidate(new RTCIceCandidate(payload.signal as RTCIceCandidateInit));
      } catch {
        onNotice?.("Koneksi panggilan terputus.");
      }
    };

    const handleRejected = (payload: CallEndPayload) => {
      const call = activeCallRef.current;
      if (!call || call.callId !== payload.callId || payload.fromUserId === currentUser.id) return;
      onNotice?.(payload.reason === "busy" ? "Kontak sedang dalam panggilan." : "Panggilan ditolak.");
      resetCall();
    };

    const handleEnded = (payload: CallEndPayload) => {
      const call = activeCallRef.current;
      if (!call || call.callId !== payload.callId || payload.fromUserId === currentUser.id) return;
      onNotice?.("Panggilan berakhir.");
      resetCall();
    };

    socket.on("call:incoming", handleIncoming);
    socket.on("call:accepted", handleAccepted);
    socket.on("call:signal", handleSignal);
    socket.on("call:rejected", handleRejected);
    socket.on("call:ended", handleEnded);

    return () => {
      socket.off("call:incoming", handleIncoming);
      socket.off("call:accepted", handleAccepted);
      socket.off("call:signal", handleSignal);
      socket.off("call:rejected", handleRejected);
      socket.off("call:ended", handleEnded);
    };
  }, [createPeerConnection, currentUser, flushPendingIceCandidates, notificationSettings, onNotice, openLocalStream, resetCall, socket]);

  useEffect(() => resetCall, [resetCall]);

  return {
    activeCall,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera
  };
}
