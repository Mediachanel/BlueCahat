"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddContactDialog() {
  const [contactUserId, setContactUserId] = useState("");
  async function add() {
    if (!contactUserId) return;
    await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contactUserId }) });
    location.reload();
  }
  return (
    <div className="blue-card space-y-3 p-4">
      <h3 className="font-black">Tambah kontak</h3>
      <Input value={contactUserId} onChange={(event) => setContactUserId(event.target.value)} placeholder="Paste user ID dari hasil pencarian" />
      <Button onClick={add} className="w-full"><Plus size={16} />Tambah</Button>
    </div>
  );
}
