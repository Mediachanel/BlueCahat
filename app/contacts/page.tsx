import { AppShell } from "@/components/layout/AppShell";
import { AddContactDialog } from "@/components/contacts/AddContactDialog";
import { ContactList } from "@/components/contacts/ContactList";
import { SearchUserDialog } from "@/components/contacts/SearchUserDialog";

export default function ContactsPage() {
  return <AppShell title="Kontak"><div className="grid gap-4 lg:grid-cols-[1fr_360px]"><ContactList /><div className="space-y-4"><SearchUserDialog /><AddContactDialog /></div></div></AppShell>;
}
