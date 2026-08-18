"use client";

import { authClient } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { showToast } from "@/src/components/ui/toast";
import AuthForm from "./AuthForm";

interface SignUpFormProps {
  onSwitch: () => void;
}

export default function SignUpForm({ onSwitch }: SignUpFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setIsPending(true);
    setMessage("Creating account...");

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    setIsPending(false);

    if (error) {
      setMessage("");
      showToast({
        variant: "error",
        message: error.message ?? "Signup failed",
        duration: 5,
      });
      return;
    }

    router.push("/dashboard");
  };

  return (
    <AuthForm
      mode="signup"
      name={name}
      email={email}
      password={password}
      setName={setName}
      setEmail={setEmail}
      setPassword={setPassword}
      message={message}
      isPending={isPending}
      onSubmit={handleSubmit}
      onSwitch={onSwitch}
    />
  );
}