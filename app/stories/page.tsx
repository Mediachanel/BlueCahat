import { AppShell } from "@/components/layout/AppShell";
import { CreateStoryDialog } from "@/components/stories/CreateStoryDialog";
import { StoryTray } from "@/components/stories/StoryTray";
import { StoryViewer } from "@/components/stories/StoryViewer";

export default function StoriesPage() {
  return <AppShell title="Status"><div className="space-y-4"><StoryTray /><div className="grid gap-4 lg:grid-cols-[1fr_360px]"><StoryViewer /><CreateStoryDialog /></div></div></AppShell>;
}
