import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await requireUser(request);
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: user.id, leftAt: null } } },
    include: {
      participants: { include: { user: { select: { id: true, name: true, username: true, avatar: true, isOnline: true, lastSeen: true } } } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true } }, statuses: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conversation) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: user.id },
          deletedForEveryone: false,
          statuses: {
            some: {
              userId: user.id,
              status: { not: "READ" }
            }
          }
        }
      });

      return { ...conversation, unreadCount };
    })
  );

  return jsonResponse({ conversations: conversationsWithUnread });
}
