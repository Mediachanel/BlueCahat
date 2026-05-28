import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertGroupAdmin } from "@/lib/permissions";
import { jsonResponse } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({ userId: z.string().min(1) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  const { id } = await params;
  await assertGroupAdmin(id, user.id);
  const payload = schema.parse(await request.json());
  const member = await prisma.conversationParticipant.upsert({
    where: { conversationId_userId: { conversationId: id, userId: payload.userId } },
    update: { leftAt: null },
    create: { conversationId: id, userId: payload.userId, role: "MEMBER" }
  });
  return jsonResponse({ member }, { status: 201 });
}
