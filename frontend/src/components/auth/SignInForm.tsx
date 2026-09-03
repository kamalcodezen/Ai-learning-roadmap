"use client";

import { authClient } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { showToast } from "@/src/components/ui/toast";
import AuthForm from "./AuthForm";
import { serverFetch } from "@/src/lib/core/server";

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
      const { data: sessionData } = await authClient.getSession();
      if ((sessionData?.user as { role?: string })?.role === "ADMIN") {
        router.push("/dashboard/admin/dashboard");
        return;
      }

      const data = await serverFetch("/api/career-profile/routing-state");
      
      if (data?.success) {
        if (!data.data.onboardingCompleted) {
          router.push("/onboarding");
          return;
        }
        
        if (!data.data.diagnosticCompleted) {
          router.push("/diagnostic");
          return;
        }
      }
    } catch (error) {
      console.warn("Routing state API error. Falling back to dashboard.", error);
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