import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";
import { blockSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await requireUser(request);
  const payload = blockSchema.parse(await request.json());
  await prisma.blockedUser.deleteMany({ where: { blockerId: user.id, blockedId: payload.userId } });
  return jsonResponse({ ok: true });
}
