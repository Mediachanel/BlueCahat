import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  const { id } = await params;
  const view = await prisma.storyView.upsert({
    where: { storyId_viewerId: { storyId: id, viewerId: user.id } },
    update: { viewedAt: new Date() },
    create: { storyId: id, viewerId: user.id }
  });
  return jsonResponse({ view });
}
