import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/utils";
import { contactSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const user = await requireUser(request);
  const contacts = await prisma.contact.findMany({
    where: { ownerId: user.id },
    include: { contactUser: { select: { id: true, name: true, username: true, phone: true, avatar: true, bio: true, isOnline: true, lastSeen: true } } },
    orderBy: { createdAt: "desc" }
  });
  return jsonResponse({ contacts });
}

export async function POST(request: Request) {
  const user = await requireUser(request);
  const payload = contactSchema.parse(await request.json());
  if (payload.contactUserId === user.id) return jsonResponse({ message: "Tidak bisa menambahkan diri sendiri" }, { status: 400 });
  const contact = await prisma.contact.upsert({
    where: { ownerId_contactUserId: { ownerId: user.id, contactUserId: payload.contactUserId } },
    update: { nickname: payload.nickname },
    create: { ownerId: user.id, contactUserId: payload.contactUserId, nickname: payload.nickname },
    include: { contactUser: true }
  });
  return jsonResponse({ contact }, { status: 201 });
}
