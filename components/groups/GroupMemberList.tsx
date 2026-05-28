import { Avatar } from "@/components/ui/avatar";
import type { ConversationSummary } from "@/types";

export function GroupMemberList({ group }: { group?: ConversationSummary }) {
  return (
    <div className="space-y-2">
      {group?.participants?.map((participant) => (
        <div key={participant.user.id} className="flex items-center gap-3 rounded-2xl bg-blue-50 p-3 dark:bg-slate-900">
          <Avatar name={participant.user.name} src={participant.user.avatar} online={participant.user.isOnline} />
          <div>
            <p className="font-bold">{participant.user.name}</p>
            <p className="text-xs text-bluechat-muted">{participant.role.toLowerCase()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
