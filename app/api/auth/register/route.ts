import { prisma } from "@/lib/prisma";
import { getClientMeta, jsonResponse } from "@/lib/utils";
import { hashPassword, sanitizeUser, setSessionCookie, signSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const payload = registerSchema.parse(await request.json());
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: payload.username },
          { phone: payload.phone },
          ...(payload.email ? [{ email: payload.email }] : [])
        ]
      }
    });

    if (existing) {
      return jsonResponse({ message: "Username, email, atau nomor HP sudah digunakan" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        username: payload.username,
        email: payload.email || null,
        phone: payload.phone,
        password: await hashPassword(payload.password)
      }
    });

    const meta = getClientMeta(request);
    await prisma.auditLog.create({
      data: { userId: user.id, action: "REGISTER", entity: "User", entityId: user.id, ...meta }
    });

    await setSessionCookie(signSession(user));
    return jsonResponse({ user: sanitizeUser(user) }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse({ message: error.errors[0]?.message ?? "Input tidak valid" }, { status: 422 });
    }

    console.error("Register error", error);
    return jsonResponse({ message: "Register gagal. Pastikan PostgreSQL dan Prisma migration sudah berjalan." }, { status: 500 });
  }
}
