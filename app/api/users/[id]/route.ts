import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireUser(request);
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, username: true, email: true, phone: true, avatar: true, bio: true, isOnline: true, lastSeen: true }
  });
  if (!user) return jsonResponse({ message: "User tidak ditemukan" }, { status: 404 });
  return jsonResponse({ user });
}
