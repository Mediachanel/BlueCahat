import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertConversationMember, assertGroupAdmin } from "@/lib/permissions";
import { jsonResponse } from "@/lib/utils";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  const { id } = await params;
  await assertConversationMember(id, user.id);
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: { include: { user: { select: { id: true, name: true, username: true, avatar: true, isOnline: true, lastSeen: true } } } },
      messages: { orderBy: { createdAt: "asc" }, include: { sender: true, attachments: true, statuses: true, replyTo: true } }
    }
  });
  return jsonResponse({ conversation });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  const { id } = await params;
  await assertGroupAdmin(id, user.id);
  const body = await request.json();
  const conversation = await prisma.conversation.update({
    where: { id },
    data: { title: body.title, description: body.description, image: body.image },
    include: { participants: true }
  });
  return jsonResponse({ conversation });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  const { id } = await params;
  await assertConversationMember(id, user.id);
  await prisma.conversationParticipant.updateMany({ where: { conversationId: id, userId: user.id }, data: { leftAt: new Date() } });
  return jsonResponse({ ok: true });
}
