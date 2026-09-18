import type { Metadata } from "next";
import AuthPage from "@/src/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your AI Pather account and begin your personalized career path.",
};

export default function SignUpPage() {
  return <AuthPage mode="signup" />;
}