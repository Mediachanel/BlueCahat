"use client";

import { useEffect, useState } from "react";
import { ContactCard } from "@/components/contacts/ContactCard";

type ContactItem = { id: string; nickname?: string | null; contactUser: Parameters<typeof ContactCard>[0]["user"] };

export function ContactList() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  useEffect(() => {
    fetch("/api/contacts").then((response) => response.json()).then((data) => setContacts(data.contacts ?? []));
  }, []);
  return <div className="space-y-3">{contacts.map((contact) => <ContactCard key={contact.id} user={contact.contactUser} nickname={contact.nickname} />)}{!contacts.length ? <p className="text-sm text-bluechat-muted">Kontak belum ada.</p> : null}</div>;
}
