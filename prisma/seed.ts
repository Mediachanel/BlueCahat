import { PrismaClient, MessageDeliveryStatus, MessageType, StoryType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.storyView.deleteMany();
  await prisma.story.deleteMany();
  await prisma.messageStatus.deleteMany();
  await prisma.messageAttachment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.blockedUser.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin12345!", 12);
  const userPassword = await bcrypt.hash("User12345!", 12);

  const admin = await prisma.user.create({
    data: {
      name: "BlueChat Admin",
      username: "admin",
      email: "admin@bluechat.local",
      phone: "+620000000001",
      password: adminPassword,
      avatar: "/avatars/default-user.png",
      role: UserRole.SUPER_ADMIN,
      bio: "Menjaga BlueChat tetap rapi."
    }
  });

  const names = [
    ["Alya Prameswari", "alya", "user@bluechat.local", "+620000000002"],
    ["Bima Satriya", "bima", "bima@bluechat.local", "+620000000003"],
    ["Citra Lestari", "citra", "citra@bluechat.local", "+620000000004"],
    ["Damar Wicaksono", "damar", "damar@bluechat.local", "+620000000005"],
    ["Eka Putri", "eka", "eka@bluechat.local", "+620000000006"]
  ];

  const users = await Promise.all(
    names.map(([name, username, email, phone], index) =>
      prisma.user.create({
        data: {
          name,
          username,
          email,
          phone,
          password: userPassword,
          avatar: "/avatars/default-user.png",
          bio: index === 0 ? "Ngobrol lebih cepat, aman, dan nyaman." : "Aktif di BlueChat.",
          isOnline: index < 2,
          lastSeen: new Date(Date.now() - index * 1000 * 60 * 12)
        }
      })
    )
  );

  const [alya, bima, citra, damar, eka] = users;

  await prisma.contact.createMany({
    data: [
      { ownerId: alya.id, contactUserId: bima.id, nickname: "Bima Project" },
      { ownerId: alya.id, contactUserId: citra.id },
      { ownerId: bima.id, contactUserId: alya.id },
      { ownerId: citra.id, contactUserId: alya.id },
      { ownerId: admin.id, contactUserId: alya.id }
    ]
  });

  const privateConversation = await prisma.conversation.create({
    data: {
      type: "PRIVATE",
      createdById: alya.id,
      participants: {
        create: [
          { userId: alya.id, role: "OWNER" },
          { userId: bima.id, role: "MEMBER" }
        ]
      }
    }
  });

  const groupConversation = await prisma.conversation.create({
    data: {
      type: "GROUP",
      title: "Blue Team",
      description: "Diskusi produk dan rilis mingguan.",
      image: "/avatars/group-blue-team.png",
      createdById: alya.id,
      participants: {
        create: [
          { userId: alya.id, role: "OWNER" },
          { userId: bima.id, role: "ADMIN" },
          { userId: citra.id, role: "MEMBER" },
          { userId: damar.id, role: "MEMBER" }
        ]
      }
    }
  });

  const msg1 = await prisma.message.create({
    data: {
      conversationId: privateConversation.id,
      senderId: alya.id,
      content: "Halo Bima, sudah cek draft BlueChat?",
      type: MessageType.TEXT
    }
  });

  const msg2 = await prisma.message.create({
    data: {
      conversationId: privateConversation.id,
      senderId: bima.id,
      content: "Sudah. UI birunya terasa clean dan profesional.",
      type: MessageType.TEXT,
      replyToId: msg1.id
    }
  });

  const msg3 = await prisma.message.create({
    data: {
      conversationId: groupConversation.id,
      senderId: citra.id,
      content: "Reminder: standup jam 10.00.",
      type: MessageType.TEXT
    }
  });

  await prisma.messageStatus.createMany({
    data: [
      { messageId: msg1.id, userId: bima.id, status: MessageDeliveryStatus.READ, deliveredAt: new Date(), readAt: new Date() },
      { messageId: msg2.id, userId: alya.id, status: MessageDeliveryStatus.READ, deliveredAt: new Date(), readAt: new Date() },
      { messageId: msg3.id, userId: alya.id, status: MessageDeliveryStatus.DELIVERED, deliveredAt: new Date() },
      { messageId: msg3.id, userId: bima.id, status: MessageDeliveryStatus.DELIVERED, deliveredAt: new Date() }
    ]
  });

  await prisma.story.createMany({
    data: [
      {
        userId: alya.id,
        content: "Shipping BlueChat today.",
        type: StoryType.TEXT,
        backgroundColor: "#0F4C81",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        userId: bima.id,
        content: "Sprint review berjalan lancar.",
        type: StoryType.TEXT,
        backgroundColor: "#1E88E5",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    ]
  });

  await prisma.notification.createMany({
    data: [
      { userId: alya.id, title: "Pesan baru", body: "Bima membalas pesanmu.", type: "MESSAGE" },
      { userId: bima.id, title: "Grup Blue Team", body: "Citra mengirim reminder.", type: "GROUP_MESSAGE" }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: "SEED_DATABASE", entity: "System", metadata: { source: "prisma seed" } },
      { userId: alya.id, action: "CREATE_GROUP", entity: "Conversation", entityId: groupConversation.id }
    ]
  });

  console.log("BlueChat seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
