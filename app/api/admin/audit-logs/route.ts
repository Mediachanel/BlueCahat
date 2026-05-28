import { requireAdmin, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await requireUser(request);
  requireAdmin(user);
  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { id: true, name: true, username: true } } },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return jsonResponse({ logs });
}
