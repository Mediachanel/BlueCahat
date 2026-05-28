"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";

type Story = { id: string; content?: string; backgroundColor?: string; user: { name: string; avatar?: string | null; username: string } };

export function StoryTray() {
  const [stories, setStories] = useState<Story[]>([]);
  useEffect(() => {
    fetch("/api/stories").then((response) => response.json()).then((data) => setStories(data.stories ?? []));
  }, []);
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {stories.map((story) => (
        <button key={story.id} className="grid w-20 shrink-0 place-items-center gap-2 text-center">
          <div className="rounded-full bg-gradient-to-tr from-bluechat-navy to-bluechat-blue p-1"><Avatar name={story.user.name} src={story.user.avatar} /></div>
          <span className="w-full truncate text-xs font-semibold">{story.user.username}</span>
        </button>
      ))}
    </div>
  );
}
