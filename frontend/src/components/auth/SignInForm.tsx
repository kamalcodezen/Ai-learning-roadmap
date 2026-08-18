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

    router.push("/dashboard");
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