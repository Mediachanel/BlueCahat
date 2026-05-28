import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertGroupAdmin } from "@/lib/permissions";
import { jsonResponse } from "@/lib/utils";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const user = await requireUser(request);
  const { id, userId } = await params;
  await assertGroupAdmin(id, user.id);
  await prisma.conversationParticipant.updateMany({ where: { conversationId: id, userId }, data: { leftAt: new Date() } });
  return jsonResponse({ ok: true });
}
