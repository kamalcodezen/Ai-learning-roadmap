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
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setIsPending(true);
    if (otpStep) {
      setMessage("Verifying OTP...");
      const { error } = await authClient.twoFactor.verifyOtp({
        code: otp,
      });

      setIsPending(false);

      if (error) {
        setMessage("");
        showToast({
          variant: "error",
          message: error.message ?? "Invalid OTP",
          duration: 5,
        });
        return;
      }
    } else {
      setMessage("Signing in...");

      const { data, error } = await authClient.signIn.email({
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

      if ((data as { twoFactorRedirect?: boolean })?.twoFactorRedirect) {
        setOtpStep(true);
        setMessage("Sending OTP...");
        await authClient.twoFactor.sendOtp();
        setMessage("OTP sent to your email.");
        return;
      }
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
          router.push("/diagnostic");
          return;
        }
      }
    } catch {
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
      otp={otp}
      setName={() => {}}
      setEmail={setEmail}
      setPassword={setPassword}
      setOtp={setOtp}
      otpStep={otpStep}
      message={message}
      isPending={isPending}
      onSubmit={handleSubmit}
      onSwitch={onSwitch}
    />
  );
}