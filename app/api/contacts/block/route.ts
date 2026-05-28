import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";
import { blockSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await requireUser(request);
  const payload = blockSchema.parse(await request.json());
  if (payload.userId === user.id) return jsonResponse({ message: "Tidak bisa memblokir diri sendiri" }, { status: 400 });
  const block = await prisma.blockedUser.upsert({
    where: { blockerId_blockedId: { blockerId: user.id, blockedId: payload.userId } },
    update: {},
    create: { blockerId: user.id, blockedId: payload.userId }
  });
  return jsonResponse({ block });
}
