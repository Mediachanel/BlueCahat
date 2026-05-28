import { Card } from "@/components/ui/card";
import { GroupMemberList } from "@/components/groups/GroupMemberList";
import type { ConversationSummary } from "@/types";

export function GroupInfoPanel({ group }: { group?: ConversationSummary }) {
  return (
    <Card className="space-y-4 p-4">
      <div>
        <p className="text-sm text-bluechat-muted">Group info</p>
        <h3 className="text-xl font-black">{group?.title ?? "BlueChat Group"}</h3>
        <p className="text-sm text-bluechat-muted">Mute, pin pesan, tambah/keluarkan anggota, dan role admin tersedia via API.</p>
      </div>
      <GroupMemberList group={group} />
    </Card>
  );
}
