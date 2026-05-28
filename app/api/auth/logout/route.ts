import { clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (user) {
    await prisma.user.update({ where: { id: user.id }, data: { isOnline: false, lastSeen: new Date() } });
  }
  await clearSessionCookie();
  return jsonResponse({ ok: true });
}
