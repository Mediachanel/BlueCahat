export type ChatFontFamilyId = "system" | "rounded" | "compact" | "serif" | "mono" | "georgia" | "verdana" | "tahoma" | "comic" | "courier" | "lucida";
export type ChatBackgroundId = "classic" | "clean" | "blue" | "green" | "peach" | "dark" | "custom";

export type AppearanceSettings = {
  chatFontFamily: ChatFontFamilyId;
  chatFontSize: number;
  chatBackground: ChatBackgroundId;
  customChatBackgroundUrl?: string;
};

export const appearanceSettingsStorageKey = "bluechat:appearance-settings";

export const defaultAppearanceSettings: AppearanceSettings = {
  chatFontFamily: "system",
  chatFontSize: 14,
  chatBackground: "classic"
};

export const chatFontFamilyOptions: Array<{ id: ChatFontFamilyId; label: string; value: string }> = [
  { id: "system", label: "Default", value: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: "rounded", label: "Rounded", value: '"Trebuchet MS", "Segoe UI", ui-sans-serif, system-ui, sans-serif' },
  { id: "compact", label: "Compact", value: 'Arial, Helvetica, ui-sans-serif, system-ui, sans-serif' },
  { id: "serif", label: "Serif", value: 'Georgia, Cambria, "Times New Roman", serif' },
  { id: "mono", label: "Mono", value: '"Cascadia Code", "Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace' },
  { id: "georgia", label: "Georgia", value: 'Georgia, "Times New Roman", serif' },
  { id: "verdana", label: "Verdana", value: 'Verdana, Geneva, ui-sans-serif, sans-serif' },
  { id: "tahoma", label: "Tahoma", value: 'Tahoma, Geneva, ui-sans-serif, sans-serif' },
  { id: "comic", label: "Comic", value: '"Comic Sans MS", "Comic Sans", cursive' },
  { id: "courier", label: "Courier", value: '"Courier New", Courier, ui-monospace, monospace' },
  { id: "lucida", label: "Lucida", value: '"Lucida Sans", "Lucida Grande", Verdana, sans-serif' }
];

export const chatBackgroundOptions: Array<{
  id: ChatBackgroundId;
  label: string;
  color: string;
  image?: string;
  size?: string;
}> = [
  {
    id: "classic",
    label: "Classic",
    color: "#f3f0e9",
    image: "radial-gradient(circle at 20px 20px, rgba(15, 76, 129, 0.12) 1.4px, transparent 1.4px), radial-gradient(circle at 70px 60px, rgba(30, 136, 229, 0.1) 1px, transparent 1px)",
    size: "90px 90px"
  },
  { id: "clean", label: "Clean", color: "#f8fafc" },
  {
    id: "blue",
    label: "Soft Blue",
    color: "#eaf5ff",
    image: "linear-gradient(135deg, rgba(30, 136, 229, 0.08) 25%, transparent 25%, transparent 50%, rgba(30, 136, 229, 0.08) 50%, rgba(30, 136, 229, 0.08) 75%, transparent 75%, transparent)",
    size: "48px 48px"
  },
  {
    id: "green",
    label: "Mint",
    color: "#edf8f0",
    image: "radial-gradient(circle at 24px 24px, rgba(22, 163, 74, 0.12) 1.5px, transparent 1.5px)",
    size: "58px 58px"
  },
  {
    id: "peach",
    label: "Peach",
    color: "#fff2e8",
    image: "radial-gradient(circle at 24px 24px, rgba(249, 115, 22, 0.1) 1.5px, transparent 1.5px)",
    size: "64px 64px"
  },
  {
    id: "dark",
    label: "Dark",
    color: "#0f172a",
    image: "radial-gradient(circle at 20px 20px, rgba(148, 163, 184, 0.12) 1.4px, transparent 1.4px)",
    size: "72px 72px"
  },
  {
    id: "custom",
    label: "Upload",
    color: "#f3f0e9",
    size: "cover"
  }
];

export function loadAppearanceSettings() {
  if (typeof window === "undefined") return defaultAppearanceSettings;

  try {
    const saved = window.localStorage.getItem(appearanceSettingsStorageKey);
    if (!saved) return defaultAppearanceSettings;
    return { ...defaultAppearanceSettings, ...JSON.parse(saved) } as AppearanceSettings;
  } catch {
    return defaultAppearanceSettings;
  }
}

export function saveAppearanceSettings(settings: AppearanceSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(appearanceSettingsStorageKey, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("bluechat:appearance-settings", { detail: settings }));
}

export function getChatFontFamily(id: ChatFontFamilyId) {
  return chatFontFamilyOptions.find((option) => option.id === id)?.value ?? chatFontFamilyOptions[0].value;
}

export function getChatBackground(id: ChatBackgroundId) {
  return chatBackgroundOptions.find((option) => option.id === id) ?? chatBackgroundOptions[0];
}

export function resolveChatBackground(settings: AppearanceSettings) {
  if (settings.chatBackground === "custom" && settings.customChatBackgroundUrl) {
    return {
      id: "custom" as const,
      label: "Upload",
      color: "#f3f0e9",
      image: `url("${settings.customChatBackgroundUrl}")`,
      size: "cover"
    };
  }

  return getChatBackground(settings.chatBackground);
}
