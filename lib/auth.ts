import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "bluechat_token";

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  email: string | null;
  phone: string;
  avatar: string | null;
  role: UserRole;
};

type TokenPayload = {
  sub: string;
  role: UserRole;
};

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(user: { id: string; role: UserRole }) {
  return jwt.sign({ sub: user.id, role: user.role }, jwtSecret(), { expiresIn: "7d" });
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function readTokenFromRequest(request: NextRequest | Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const tokenCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));

  return tokenCookie?.split("=")[1];
}

export async function getCurrentUser(request?: NextRequest | Request): Promise<AuthUser | null> {
  const cookieStore = request ? null : await cookies();
  const token = request ? readTokenFromRequest(request) : cookieStore?.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, jwtSecret()) as TokenPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true
      }
    });

    if (!user?.isActive) return null;

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role
    };
  } catch {
    return null;
  }
}

export async function requireUser(request?: NextRequest | Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }
  return user;
}

export function requireAdmin(user: AuthUser) {
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 });
  }
}

export function sanitizeUser<T extends { password?: string }>(user: T) {
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}
