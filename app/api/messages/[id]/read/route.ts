import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  const { id } = await params;
  await prisma.messageStatus.upsert({
    where: { messageId_userId: { messageId: id, userId: user.id } },
    update: { status: "READ", readAt: new Date(), deliveredAt: new Date() },
    create: { messageId: id, userId: user.id, status: "READ", readAt: new Date(), deliveredAt: new Date() }
  });
  return jsonResponse({ ok: true });
}
