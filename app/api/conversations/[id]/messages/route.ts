import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertConversationMember } from "@/lib/permissions";
import { jsonResponse } from "@/lib/utils";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  const { id } = await params;
  await assertConversationMember(id, user.id);
  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, username: true, avatar: true } },
      attachments: true,
      statuses: true,
      replyTo: { include: { sender: { select: { id: true, name: true } } } }
    }
  });
  return jsonResponse({ messages });
}
