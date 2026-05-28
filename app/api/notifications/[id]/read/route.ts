import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  const { id } = await params;
  const notification = await prisma.notification.updateMany({ where: { id, userId: user.id }, data: { isRead: true } });
  return jsonResponse({ notification });
}
