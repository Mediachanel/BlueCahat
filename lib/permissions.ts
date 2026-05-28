import { prisma } from "@/lib/prisma";

export async function assertConversationMember(conversationId: string, userId: string) {
  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId,
      leftAt: null
    }
  });

  if (!participant) {
    throw new Response(JSON.stringify({ message: "Conversation access denied" }), { status: 403 });
  }

  return participant;
}

export async function assertMessageOwner(messageId: string, userId: string) {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) {
    throw new Response(JSON.stringify({ message: "Message not found" }), { status: 404 });
  }

  if (message.senderId !== userId) {
    throw new Response(JSON.stringify({ message: "Only sender can modify this message" }), { status: 403 });
  }

  return message;
}

export async function assertGroupAdmin(conversationId: string, userId: string) {
  const participant = await assertConversationMember(conversationId, userId);
  if (participant.role !== "OWNER" && participant.role !== "ADMIN") {
    throw new Response(JSON.stringify({ message: "Group admin permission required" }), { status: 403 });
  }
  return participant;
}
