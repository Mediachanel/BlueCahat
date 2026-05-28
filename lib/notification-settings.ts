export type MessageToneId = "blue-pop" | "soft-bell" | "chime" | "digital" | "pulse" | "none";
export type CallToneId = "classic" | "pulse" | "calm" | "bright" | "retro" | "none";

export type NotificationSettings = {
  notificationsEnabled: boolean;
  desktopNotifications: boolean;
  messageSoundEnabled: boolean;
  callSoundEnabled: boolean;
  showMessagePreview: boolean;
  vibrate: boolean;
  volume: number;
  messageTone: MessageToneId;
  callTone: CallToneId;
};

type ToneStep = {
  frequency: number;
  duration: number;
  gap?: number;
  type?: OscillatorType;
};

export const notificationSettingsStorageKey = "bluechat:notification-settings";

export const defaultNotificationSettings: NotificationSettings = {
  notificationsEnabled: true,
  desktopNotifications: true,
  messageSoundEnabled: true,
  callSoundEnabled: true,
  showMessagePreview: true,
  vibrate: true,
  volume: 0.55,
  messageTone: "blue-pop",
  callTone: "classic"
};

export const messageToneOptions: Array<{ id: MessageToneId; label: string }> = [
  { id: "blue-pop", label: "Blue Pop" },
  { id: "soft-bell", label: "Soft Bell" },
  { id: "chime", label: "Chime" },
  { id: "digital", label: "Digital" },
  { id: "pulse", label: "Pulse" },
  { id: "none", label: "Tanpa suara" }
];

export const callToneOptions: Array<{ id: CallToneId; label: string }> = [
  { id: "classic", label: "Classic Ring" },
  { id: "pulse", label: "Pulse Ring" },
  { id: "calm", label: "Calm Waves" },
  { id: "bright", label: "Bright Call" },
  { id: "retro", label: "Retro Phone" },
  { id: "none", label: "Tanpa suara" }
];

const messageToneSequences: Record<MessageToneId, ToneStep[]> = {
  "blue-pop": [
    { frequency: 660, duration: 0.08, type: "triangle" },
    { frequency: 880, duration: 0.11, type: "triangle" }
  ],
  "soft-bell": [
    { frequency: 1046.5, duration: 0.16, type: "sine" },
    { frequency: 784, duration: 0.2, type: "sine" }
  ],
  chime: [
    { frequency: 523.25, duration: 0.1, type: "sine" },
    { frequency: 659.25, duration: 0.1, type: "sine" },
    { frequency: 783.99, duration: 0.16, type: "sine" }
  ],
  digital: [
    { frequency: 1200, duration: 0.05, type: "square" },
    { frequency: 900, duration: 0.05, type: "square" },
    { frequency: 1200, duration: 0.07, type: "square" }
  ],
  pulse: [
    { frequency: 440, duration: 0.08, gap: 0.06, type: "sawtooth" },
    { frequency: 440, duration: 0.12, type: "sawtooth" }
  ],
  none: []
};

const callToneSequences: Record<CallToneId, ToneStep[]> = {
  classic: [
    { frequency: 440, duration: 0.18, type: "sine" },
    { frequency: 480, duration: 0.18, gap: 0.12, type: "sine" },
    { frequency: 440, duration: 0.18, type: "sine" },
    { frequency: 480, duration: 0.18, type: "sine" }
  ],
  pulse: [
    { frequency: 523.25, duration: 0.12, gap: 0.07, type: "triangle" },
    { frequency: 523.25, duration: 0.12, gap: 0.16, type: "triangle" },
    { frequency: 659.25, duration: 0.16, type: "triangle" }
  ],
  calm: [
    { frequency: 392, duration: 0.24, type: "sine" },
    { frequency: 523.25, duration: 0.24, type: "sine" },
    { frequency: 659.25, duration: 0.34, type: "sine" }
  ],
  bright: [
    { frequency: 783.99, duration: 0.14, type: "triangle" },
    { frequency: 987.77, duration: 0.14, type: "triangle" },
    { frequency: 1174.66, duration: 0.22, type: "triangle" }
  ],
  retro: [
    { frequency: 740, duration: 0.15, gap: 0.04, type: "square" },
    { frequency: 620, duration: 0.15, gap: 0.1, type: "square" },
    { frequency: 740, duration: 0.15, type: "square" }
  ],
  none: []
};

export function loadNotificationSettings() {
  if (typeof window === "undefined") return defaultNotificationSettings;

  try {
    const saved = window.localStorage.getItem(notificationSettingsStorageKey);
    if (!saved) return defaultNotificationSettings;
    return { ...defaultNotificationSettings, ...JSON.parse(saved) } as NotificationSettings;
  } catch {
    return defaultNotificationSettings;
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(notificationSettingsStorageKey, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("bluechat:notification-settings", { detail: settings }));
}

function playSequence(sequence: ToneStep[], volume: number) {
  if (!sequence.length || typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext ?? (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const startAt = context.currentTime + 0.02;
  let offset = 0;

  sequence.forEach((step) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = step.type ?? "sine";
    oscillator.frequency.value = step.frequency;
    gain.gain.setValueAtTime(0.0001, startAt + offset);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), startAt + offset + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + offset + step.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt + offset);
    oscillator.stop(startAt + offset + step.duration + 0.02);
    offset += step.duration + (step.gap ?? 0.04);
  });

  window.setTimeout(() => context.close().catch(() => undefined), (offset + 0.4) * 1000);
}

export function playMessageTone(tone: MessageToneId, volume: number) {
  playSequence(messageToneSequences[tone], volume);
}

export function playCallTone(tone: CallToneId, volume: number) {
  playSequence(callToneSequences[tone], volume);
}
