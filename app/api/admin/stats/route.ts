import { requireAdmin, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await requireUser(request);
  requireAdmin(user);
  const [totalUsers, totalConversations, totalMessages, totalGroups, totalStories] = await Promise.all([
    prisma.user.count(),
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.conversation.count({ where: { type: "GROUP" } }),
    prisma.story.count()
  ]);
  return jsonResponse({ stats: { totalUsers, totalConversations, totalMessages, totalGroups, totalStories } });
}
