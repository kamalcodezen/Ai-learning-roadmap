import ChatBox from "@/src/components/chat/ChatBox";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Career Copilot",
  description: "Chat with your AI Career Copilot for instant guidance and learning support.",
  alternates: {
    canonical: "/chat",
  }
};

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <ChatBox />
    </main>
  );
}
