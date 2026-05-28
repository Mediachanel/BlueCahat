import { prisma } from "@/lib/prisma";
import { getClientMeta, jsonResponse } from "@/lib/utils";
import { loginSchema } from "@/lib/validations";
import { sanitizeUser, setSessionCookie, signSession, verifyPassword } from "@/lib/auth";
import { ZodError } from "zod";

const attempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());
    const meta = getClientMeta(request);
    const key = `${meta.ipAddress ?? "local"}:${payload.emailOrPhone}`;
    const now = Date.now();
    const current = attempts.get(key);

    if (current && current.count >= 5 && current.resetAt > now) {
      return jsonResponse({ message: "Terlalu banyak percobaan login. Coba lagi nanti." }, { status: 429 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: payload.emailOrPhone }, { phone: payload.emailOrPhone }, { username: payload.emailOrPhone }]
      }
    });

    if (!user || !user.isActive || !(await verifyPassword(payload.password, user.password))) {
      attempts.set(key, { count: (current?.count ?? 0) + 1, resetAt: now + 15 * 60 * 1000 });
      return jsonResponse({ message: "Kredensial tidak valid" }, { status: 401 });
    }

    attempts.delete(key);
    await prisma.user.update({ where: { id: user.id }, data: { isOnline: true, lastSeen: new Date() } });
    await prisma.auditLog.create({
      data: { userId: user.id, action: "LOGIN", entity: "User", entityId: user.id, ...meta }
    });

    await setSessionCookie(signSession(user));
    return jsonResponse({ user: sanitizeUser(user) });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse({ message: error.errors[0]?.message ?? "Input tidak valid" }, { status: 422 });
    }

    console.error("Login error", error);
    return jsonResponse({ message: "Login gagal. Pastikan PostgreSQL dan Prisma migration sudah berjalan." }, { status: 500 });
  }
}
