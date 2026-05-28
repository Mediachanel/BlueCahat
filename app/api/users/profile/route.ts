import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";
import { profileSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  const user = await requireUser(request);
  const payload = profileSchema.parse(await request.json());
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: payload,
    select: { id: true, name: true, username: true, email: true, phone: true, avatar: true, bio: true, role: true }
  });
  return jsonResponse({ user: updated });
}
