"use client";

import { useState } from "react";
import { UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateGroupDialog() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [memberIds, setMemberIds] = useState("");
  async function create() {
    await fetch("/api/conversations/group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, memberIds: memberIds.split(",").map((id) => id.trim()).filter(Boolean) })
    });
    location.reload();
  }
  return (
    <div className="blue-card space-y-3 p-4">
      <h3 className="font-black">Buat grup</h3>
      <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nama grup" />
      <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Deskripsi grup" />
      <Input value={memberIds} onChange={(event) => setMemberIds(event.target.value)} placeholder="User ID anggota, pisahkan koma" />
      <Button onClick={create} className="w-full"><UsersRound size={16} />Buat grup</Button>
    </div>
  );
}
