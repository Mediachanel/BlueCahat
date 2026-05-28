import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertMessageOwner } from "@/lib/permissions";
import { jsonResponse } from "@/lib/utils";
import { messageUpdateSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  const { id } = await params;
  await assertMessageOwner(id, user.id);
  const payload = messageUpdateSchema.parse(await request.json());
  const message = await prisma.message.update({
    where: { id },
    data: { content: payload.content, isEdited: true },
    include: { sender: true, attachments: true, statuses: true, replyTo: true }
  });
  return jsonResponse({ message });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  const { id } = await params;
  await assertMessageOwner(id, user.id);
  const message = await prisma.message.update({
    where: { id },
    data: { deletedForEveryone: true, content: null },
    include: { sender: true, attachments: true, statuses: true, replyTo: true }
  });
  return jsonResponse({ message });
}
