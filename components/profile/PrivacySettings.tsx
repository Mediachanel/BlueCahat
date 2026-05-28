import { Card } from "@/components/ui/card";

export function PrivacySettings() {
  return (
    <Card className="space-y-3 p-5">
      <h3 className="text-xl font-black">Privasi</h3>
      {["Last seen setting placeholder", "Read receipt setting placeholder", "Multi-device ready placeholder"].map((item) => (
        <label key={item} className="flex items-center justify-between rounded-2xl bg-blue-50 p-3 text-sm dark:bg-slate-900">
          <span>{item}</span>
          <input type="checkbox" className="h-5 w-5 accent-bluechat-blue" defaultChecked />
        </label>
      ))}
    </Card>
  );
}
