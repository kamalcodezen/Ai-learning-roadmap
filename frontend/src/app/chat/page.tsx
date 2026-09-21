import ChatBox from "@/src/components/chat/ChatBox";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Career Copilot",
  description:
    "Chat with your AI Career Copilot for instant guidance, concept explanations, and personalized learning path support.",
  alternates: {
    canonical: "/chat",
  },
  openGraph: {
    title: "AI Career Copilot | AI Pather",
    description:
      "Chat with your AI Career Copilot for instant guidance, concept explanations, and personalized learning path support.",
    url: "/chat",
    siteName: "AI Pather",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Career Copilot | AI Pather",
    description:
      "Chat with your AI Career Copilot for instant guidance, concept explanations, and personalized learning path support.",
  },
};

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <ChatBox />
    </main>
  );
}
