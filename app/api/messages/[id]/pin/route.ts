import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertConversationMember } from "@/lib/permissions";
import { jsonResponse } from "@/lib/utils";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  const { id } = await params;
  const existing = await prisma.message.findUnique({ where: { id } });

  if (!existing) return jsonResponse({ message: "Pesan tidak ditemukan" }, { status: 404 });
  await assertConversationMember(existing.conversationId, user.id);

  if (existing.pinnedAt) {
    const message = await prisma.message.update({
      where: { id },
      data: { pinnedAt: null },
      include: { sender: true, attachments: true, statuses: true, replyTo: true }
    });
    return jsonResponse({ message });
  }

  await prisma.message.updateMany({
    where: { conversationId: existing.conversationId, pinnedAt: { not: null } },
    data: { pinnedAt: null }
  });

  const message = await prisma.message.update({
    where: { id },
    data: { pinnedAt: new Date() },
    include: { sender: true, attachments: true, statuses: true, replyTo: true }
  });

  return jsonResponse({ message });
}
