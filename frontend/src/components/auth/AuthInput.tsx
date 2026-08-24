"use client";

import "./auth.css";
import { useState } from "react";

interface AuthInputProps {
  name: string;
  type?: "text" | "email" | "password";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {visible ? (
        <>
          <path
            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle
            cx="12"
            cy="12"
            r="2.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </>
      ) : (
        <>
          <path
            d="M3 3l18 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M10.6 6.2A10.6 10.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17.7 17.7 0 0 1-3.1 3.8M6.2 6.2C3.9 7.7 2.5 12 2.5 12s3.5 6 9.5 6c1.1 0 2.1-.2 3-.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export default function AuthInput({
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
  minLength,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const actualType = isPassword && showPassword ? "text" : type;

  return (
    <div className="relative w-full">
      <input
        id={name}
        name={name}
        type={actualType}
        placeholder=" "
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        minLength={minLength}
        className="
          autofill-fix
          peer
          w-full
          rounded-none
          border-0
          border-b
          bg-transparent
          px-0
          pb-1.5
          pt-4
          text-white
          shadow-none
          outline-none
          transition-colors
          placeholder:text-transparent
          border-primary
        "
      />

      <label
        htmlFor={name}
        className="
          pointer-events-none
          absolute
          left-0
          top-1/2
          -translate-y-1/2
          text-base
          text-white
          transition-all
          duration-300
          ease-linear
          peer-focus:top-0
          peer-focus:translate-y-0
          peer-focus:text-xs
          peer-focus:text-white
          peer-[:not(:placeholder-shown)]:top-0
          peer-[:not(:placeholder-shown)]:translate-y-0
          peer-[:not(:placeholder-shown)]:text-xs
          peer-[:not(:placeholder-shown)]:text-white
        "
      >
        {placeholder}
      </label>

      {isPassword && (
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((current) => !current)}
          className="
            absolute
            right-0
            top-1/2
            -translate-y-1/2
            p-1
            text-white
            transition-colors
            hover:text-brand
          "
        >
          <EyeIcon visible={showPassword} />
        </button>
      )}
    </div>
  );
}