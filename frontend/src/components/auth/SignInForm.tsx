"use client";

import { authClient } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { showToast } from "@/src/components/ui/toast";
import AuthForm from "./AuthForm";

interface SignInFormProps {
  onSwitch: () => void;
}

export default function SignInForm({ onSwitch }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setIsPending(true);
    setMessage("Signing in...");

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    setIsPending(false);

    if (error) {
      setMessage("");
      showToast({
        variant: "error",
        message: error.message ?? "Signin failed",
        duration: 5,
      });
      return;
    }

    try {
      // TODO: CONNECT TO BACKEND API
      // Future endpoint: GET /api/user/routing-state
      // Expected response: { onboardingCompleted: boolean, diagnosticCompleted: boolean }
      // 
      // For now, if the API isn't built, we will catch the error and fallback to dashboard.
      const res = await fetch("/api/user/routing-state");
      
      if (res.ok) {
        const data = await res.json();
        
        if (!data.onboardingCompleted) {
          router.push("/onboarding");
          return;
        }
        
        if (!data.diagnosticCompleted) {
          router.push("/onboarding/diagnostic");
          return;
        }
      }
    } catch (err) {
      // API not ready, fallback below
      console.warn("Routing state API not available yet. Falling back to dashboard.");
    }

    // Default fallback for existing users
    router.push("/");
  };

  return (
    <AuthForm
      mode="signin"
      name=""
      email={email}
      password={password}
      setName={() => {}}
      setEmail={setEmail}
      setPassword={setPassword}
      message={message}
      isPending={isPending}
      onSubmit={handleSubmit}
      onSwitch={onSwitch}
    />
  );
}