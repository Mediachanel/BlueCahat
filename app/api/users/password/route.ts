import { requireUser, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";
import { passwordSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  const authUser = await requireUser(request);
  const payload = passwordSchema.parse(await request.json());
  const user = await prisma.user.findUniqueOrThrow({ where: { id: authUser.id } });
  if (!(await verifyPassword(payload.currentPassword, user.password))) {
    return jsonResponse({ message: "Password saat ini salah" }, { status: 400 });
  }
  await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(payload.newPassword) } });
  return jsonResponse({ ok: true });
}
