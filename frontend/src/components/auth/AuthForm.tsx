"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import AuthInput from "./AuthInput";
import AuthSocialButton from "./AuthSocialButton";
import type { AuthMode } from "./auth.types";

interface AuthFormProps {
  mode: AuthMode;

  name: string;
  email: string;
  password: string;

  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;

  message: string;
  isPending: boolean;

  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onSwitch: () => void;
}

export default function AuthForm({
  mode,
  name,
  email,
  password,
  setName,
  setEmail,
  setPassword,
  message,
  isPending,
  onSubmit,
  onSwitch,
}: AuthFormProps) {
  const isSignUp = mode === "signup";

  return (
    <form
      onSubmit={onSubmit}
      className="
        relative
        flex
        h-full
        w-full
        flex-col
        justify-center
        overflow-hidden
        px-6
        py-8
        sm:px-8
        md:px-10
        lg:px-14
        xl:px-16
      "
    >
      <div className="mx-auto w-full">

        {/* Heading */}
        <h2 className="text-xl tracking-tight text-white sm:text-2xl text-center">
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>

        {/* Social sign-in */}
        <div className="mt-4">
          <AuthSocialButton mode={mode} isPending={isPending} />
        </div>

        {/* Divider */}
        <div className="my-4 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />

            <span className="text-sm text-white">- OR -</span>

          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {isSignUp && (
            <AuthInput
              name="name"
              placeholder="Full Name"
              value={name}
              onChange={setName}
            />
          )}

          <AuthInput
            name="email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={setEmail}
          />

          <AuthInput
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={setPassword}
            minLength={8}
          />
        </div>

        {/* Forgot password */}
        {!isSignUp && (
          <div className="mt-4 text-right">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-white transition-colors hover:text-brand"
              >
              Forgot Password?
            </Link>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isPending={isPending}
          className="
            mt-4
            py-2
            rounded-full
            bg-linear-to-r from-[#d5f051] to-[#64a331]
            text-base
            font-medium
            text-secondary
            shadow-none
            hover:brightness-105
          "
        >
          {isSignUp ? "Create Account" : "Sign In"}
        </Button>

        {/* Status */}
        {message && (
            <p
              role="status"
              className="mt-4 text-center text-xs text-white"
            >
            {message}
          </p>
        )}

        {/* Switch */}
        <p className="mt-4 text-xs text-white text-center">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitch}
                className="font-semibold text-brand underline-offset-2 hover:underline"
              >
                Log In
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={onSwitch}
                className="font-semibold text-brand underline-offset-2 hover:underline"
              >
                Create Account
              </button>
            </>
          )}
        </p>
      </div>
    </form>
  );
}