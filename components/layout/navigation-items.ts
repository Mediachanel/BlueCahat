import { CircleUserRound, MessageSquareText, Radio, Settings, Sparkles, UsersRound, type LucideIcon } from "lucide-react";

export type MainNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const mainNavItems: MainNavItem[] = [
  { href: "/chat", label: "Chat", icon: MessageSquareText },
  { href: "/stories", label: "Status", icon: Radio },
  { href: "/contacts", label: "Kontak", icon: CircleUserRound },
  { href: "/groups", label: "Grup", icon: UsersRound },
  { href: "/profile", label: "Profil", icon: Settings },
  { href: "/admin", label: "Admin", icon: Sparkles }
];

export function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
