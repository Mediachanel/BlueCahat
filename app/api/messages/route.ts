import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertConversationMember } from "@/lib/permissions";
import { jsonResponse } from "@/lib/utils";
import { messageSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await requireUser(request);
  const payload = messageSchema.parse(await request.json());
  await assertConversationMember(payload.conversationId, user.id);

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId: payload.conversationId, leftAt: null }
  });

  const message = await prisma.message.create({
    data: {
      conversationId: payload.conversationId,
      senderId: user.id,
      content: payload.content,
      type: payload.type,
      replyToId: payload.replyToId,
      attachments: payload.attachments ? { create: payload.attachments } : undefined,
      statuses: {
        create: participants.map((participant) => ({
          userId: participant.userId,
          status: participant.userId === user.id ? "READ" : "SENT",
          readAt: participant.userId === user.id ? new Date() : undefined
        }))
      }
    },
    include: { sender: true, attachments: true, statuses: true, replyTo: true }
  });

  await prisma.conversation.update({ where: { id: payload.conversationId }, data: { updatedAt: new Date() } });
  await prisma.notification.createMany({
    data: participants
      .filter((participant) => participant.userId !== user.id)
      .map((participant) => ({
        userId: participant.userId,
        title: "Pesan baru",
        body: `${user.name}: ${payload.content ?? "Mengirim lampiran"}`,
        type: "MESSAGE"
      }))
  });

  return jsonResponse({ message }, { status: 201 });
}
