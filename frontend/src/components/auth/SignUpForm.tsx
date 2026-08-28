"use client";

import { authClient } from "../../lib/auth-client";

import { useState } from "react";
import { showToast } from "@/src/components/ui/toast";
import AuthForm from "./AuthForm";

interface SignUpFormProps {
  onSwitch: () => void;
}

export default function SignUpForm({ onSwitch }: SignUpFormProps) {

  const [name, setName] = useState("");
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
      const { error } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (error) {
        setIsPending(false);
        setMessage("");
        showToast({
          variant: "error",
          message: error.message ?? "Invalid OTP",
          duration: 5,
        });
        return;
      }

      // We must sign in to create the session before enabling 2FA
      const signInRes = await authClient.signIn.email({
        email,
        password,
      });

      if (signInRes.error) {
        setIsPending(false);
        setMessage("");
        showToast({
          variant: "error",
          message: signInRes.error.message ?? "Failed to log in after verification",
          duration: 5,
        });
        return;
      }

      // Auto-enable 2FA for this user
      await authClient.twoFactor.enable({
        password,
      });

      setIsPending(false);
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/onboarding";
      return;
    } else {
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

      setOtpStep(true);
      setMessage("OTP sent to your email.");
    }

    // New users must start with onboarding
    // Now handled in the otpStep block
  };

  return (
    <AuthForm
      mode="signup"
      name={name}
      email={email}
      password={password}
      otp={otp}
      setName={setName}
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