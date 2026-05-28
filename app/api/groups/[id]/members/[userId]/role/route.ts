import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertGroupAdmin } from "@/lib/permissions";
import { jsonResponse } from "@/lib/utils";
import { memberRoleSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const user = await requireUser(request);
  const { id, userId } = await params;
  await assertGroupAdmin(id, user.id);
  const payload = memberRoleSchema.parse(await request.json());
  const member = await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: id, userId } },
    data: { role: payload.role }
  });
  return jsonResponse({ member });
}
