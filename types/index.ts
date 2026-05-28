export type SafeUser = {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  phone?: string;
  avatar?: string | null;
  bio?: string | null;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  isOnline?: boolean;
  lastSeen?: string | Date | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content?: string | null;
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "SYSTEM";
  createdAt: string | Date;
  isEdited?: boolean;
  deletedForEveryone?: boolean;
  pinnedAt?: string | Date | null;
  localStatus?: "PENDING" | "SENT" | "DELIVERED" | "READ";
  sender?: SafeUser;
  replyTo?: ChatMessage | null;
  statuses?: Array<{
    userId: string;
    status: "SENT" | "DELIVERED" | "READ";
    deliveredAt?: string | Date | null;
    readAt?: string | Date | null;
  }>;
  attachments?: Array<{
    id?: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    mimeType: string;
  }>;
};

export type ConversationSummary = {
  id: string;
  type: "PRIVATE" | "GROUP";
  title?: string | null;
  image?: string | null;
  participants?: Array<{ user: SafeUser; role: string }>;
  messages?: ChatMessage[];
  unreadCount?: number;
  updatedAt?: string | Date;
};
