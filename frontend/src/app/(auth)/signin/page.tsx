import type { Metadata } from "next";
import AuthPage from "@/src/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your AI Pather account.",
};

export default function SignInPage() {
  return <AuthPage mode="signin" />;
}