import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";
import { privateConversationSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await requireUser(request);
  const payload = privateConversationSchema.parse(await request.json());
  if (payload.userId === user.id) return jsonResponse({ message: "Pilih user lain" }, { status: 400 });

  const existing = await prisma.conversation.findFirst({
    where: {
      type: "PRIVATE",
      AND: [
        { participants: { some: { userId: user.id } } },
        { participants: { some: { userId: payload.userId } } }
      ]
    },
    include: { participants: { include: { user: true } } }
  });
  if (existing) return jsonResponse({ conversation: existing });

  const conversation = await prisma.conversation.create({
    data: {
      type: "PRIVATE",
      createdById: user.id,
      participants: {
        create: [
          { userId: user.id, role: "OWNER" },
          { userId: payload.userId, role: "MEMBER" }
        ]
      }
    },
    include: { participants: { include: { user: true } } }
  });

  return jsonResponse({ conversation }, { status: 201 });
}
