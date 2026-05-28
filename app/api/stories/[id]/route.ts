import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireUser(request);
  const { id } = await params;
  const story = await prisma.story.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, username: true, avatar: true } }, views: { include: { viewer: true } } }
  });
  if (!story) return jsonResponse({ message: "Story tidak ditemukan" }, { status: 404 });
  return jsonResponse({ story });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  const { id } = await params;
  await prisma.story.deleteMany({ where: { id, userId: user.id } });
  return jsonResponse({ ok: true });
}
