import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";
import { storySchema } from "@/lib/validations";

export async function GET(request: Request) {
  const user = await requireUser(request);
  const contacts = await prisma.contact.findMany({ where: { ownerId: user.id }, select: { contactUserId: true } });
  const userIds = [user.id, ...contacts.map((contact) => contact.contactUserId)];
  const stories = await prisma.story.findMany({
    where: { userId: { in: userIds }, expiresAt: { gt: new Date() } },
    include: { user: { select: { id: true, name: true, username: true, avatar: true } }, views: true },
    orderBy: { createdAt: "desc" }
  });
  return jsonResponse({ stories });
}

export async function POST(request: Request) {
  const user = await requireUser(request);
  const payload = storySchema.parse(await request.json());
  const story = await prisma.story.create({
    data: {
      userId: user.id,
      content: payload.content,
      mediaUrl: payload.mediaUrl,
      type: payload.type,
      backgroundColor: payload.backgroundColor,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    include: { user: true, views: true }
  });
  return jsonResponse({ story }, { status: 201 });
}
