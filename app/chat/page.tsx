import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ChatLayout } from "@/components/chat/ChatLayout";

export default function ChatPage() {
  return (
    <main className="h-[100dvh] overflow-hidden bg-[#eef8ff] text-bluechat-text dark:bg-slate-950 dark:text-slate-50">
      <ProtectedRoute>
        <ChatLayout />
      </ProtectedRoute>
    </main>
  );
}
