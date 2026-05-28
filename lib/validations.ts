import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/, "Username hanya huruf, angka, dan underscore"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(8, "Nomor HP tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter")
});

export const loginSchema = z.object({
  emailOrPhone: z.string().min(3),
  password: z.string().min(8)
});

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/).optional(),
  phone: z.string().min(8).optional(),
  bio: z.string().max(160).optional().nullable()
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8)
});

export const contactSchema = z.object({
  contactUserId: z.string().min(1),
  nickname: z.string().max(60).optional()
});

export const blockSchema = z.object({
  userId: z.string().min(1)
});

export const privateConversationSchema = z.object({
  userId: z.string().min(1)
});

export const groupConversationSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().max(240).optional(),
  image: z.string().optional(),
  memberIds: z.array(z.string()).min(1)
});

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().max(5000).optional(),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "SYSTEM"]).default("TEXT"),
  replyToId: z.string().optional(),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        fileType: z.string(),
        fileSize: z.number().int().nonnegative(),
        mimeType: z.string()
      })
    )
    .optional()
});

export const messageUpdateSchema = z.object({
  content: z.string().min(1).max(5000)
});

export const storySchema = z.object({
  content: z.string().max(500).optional(),
  mediaUrl: z.string().optional(),
  type: z.enum(["TEXT", "IMAGE", "VIDEO"]),
  backgroundColor: z.string().optional()
});

export const notificationReadSchema = z.object({
  isRead: z.boolean().default(true)
});

export const memberRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"])
});
