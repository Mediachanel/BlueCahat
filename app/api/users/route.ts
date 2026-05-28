import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";

export async function GET(request: Request) {
  await requireUser(request);
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, username: true, email: true, phone: true, avatar: true, bio: true, isOnline: true, lastSeen: true },
    take: 50,
    orderBy: { name: "asc" }
  });
  return jsonResponse({ users });
}
