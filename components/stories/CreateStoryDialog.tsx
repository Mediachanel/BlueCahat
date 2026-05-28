"use client";

import { useState } from "react";
import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CreateStoryDialog() {
  const [content, setContent] = useState("");
  async function create() {
    await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, type: "TEXT", backgroundColor: "#0F4C81" })
    });
    location.reload();
  }
  return (
    <div className="blue-card space-y-3 p-4">
      <h3 className="font-black">Buat status</h3>
      <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Apa yang ingin kamu bagikan hari ini?" />
      <Button onClick={create} className="w-full"><Radio size={16} />Publikasikan 24 jam</Button>
    </div>
  );
}
