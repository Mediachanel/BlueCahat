import { Avatar } from "@/components/ui/avatar";

export function UserAvatar(props: { name: string; src?: string | null; online?: boolean; previewable?: boolean }) {
  return <Avatar {...props} />;
}
