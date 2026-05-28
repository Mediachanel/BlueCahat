import { AppShell } from "@/components/layout/AppShell";
import { ChatAppearanceSettings } from "@/components/profile/ChatAppearanceSettings";
import { InstallAppSettings } from "@/components/profile/InstallAppSettings";
import { MobileSettings } from "@/components/profile/MobileSettings";
import { NotificationSettings } from "@/components/profile/NotificationSettings";
import { PasswordForm } from "@/components/profile/PasswordForm";
import { PrivacySettings } from "@/components/profile/PrivacySettings";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  return (
    <>
      <div className="md:hidden">
        <MobileSettings />
      </div>
      <div className="hidden md:block">
        <AppShell title="Profil"><div className="grid gap-4 lg:grid-cols-[1fr_380px]"><ProfileForm /><div className="space-y-4"><InstallAppSettings /><ChatAppearanceSettings /><NotificationSettings /><PasswordForm /><PrivacySettings /></div></div></AppShell>
      </div>
    </>
  );
}
