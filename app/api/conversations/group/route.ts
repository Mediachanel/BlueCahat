import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";
import { groupConversationSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await requireUser(request);
  const payload = groupConversationSchema.parse(await request.json());
  const uniqueMembers = [...new Set(payload.memberIds.filter((id) => id !== user.id))];
  const conversation = await prisma.conversation.create({
    data: {
      type: "GROUP",
      title: payload.title,
      description: payload.description,
      image: payload.image,
      createdById: user.id,
      participants: {
        create: [
          { userId: user.id, role: "OWNER" },
          ...uniqueMembers.map((userId) => ({ userId, role: "MEMBER" as const }))
        ]
      },
      messages: {
        create: { senderId: user.id, type: "SYSTEM", content: `${user.name} membuat grup ${payload.title}` }
      }
    },
    include: { participants: { include: { user: true } }, messages: true }
  });
  return jsonResponse({ conversation }, { status: 201 });
}
