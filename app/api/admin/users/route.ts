import { requireAdmin, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await requireUser(request);
  requireAdmin(user);
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const role = searchParams.get("role");
  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role: role as never } : {}),
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } }
      ]
    },
    select: { id: true, name: true, username: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });
  return jsonResponse({ users });
}
