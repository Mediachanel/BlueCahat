import { requireAdmin, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({ isActive: z.boolean() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireUser(request);
  requireAdmin(admin);
  const { id } = await params;
  const payload = schema.parse(await request.json());
  const user = await prisma.user.update({ where: { id }, data: { isActive: payload.isActive } });
  await prisma.auditLog.create({ data: { userId: admin.id, action: payload.isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER", entity: "User", entityId: id } });
  return jsonResponse({ user });
}
