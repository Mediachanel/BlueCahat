import { AppShell } from "@/components/layout/AppShell";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { GroupList } from "@/components/groups/GroupList";
import { GroupInfoPanel } from "@/components/groups/GroupInfoPanel";

export default function GroupsPage() {
  return <AppShell title="Grup"><div className="grid gap-4 lg:grid-cols-[1fr_360px]"><GroupList /><div className="space-y-4"><CreateGroupDialog /><GroupInfoPanel /></div></div></AppShell>;
}
