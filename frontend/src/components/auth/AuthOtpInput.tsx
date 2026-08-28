"use client";

import React, { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";

interface AuthOtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

export default function AuthOtpInput({
  length = 6,
  value,
  onChange,
  onSubmit,
}: AuthOtpInputProps) {
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Helper to split the string value into an array
  const getOtpArray = (): string[] => {
    const array = value.split("");
    while (array.length < length) {
      array.push("");
    }
    return array.slice(0, length);
  };

  const otpArray = getOtpArray();

  const focusInput = (index: number) => {
    const validIndex = Math.max(0, Math.min(index, length - 1));
    setActiveInput(validIndex);
    inputRefs.current[validIndex]?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^[0-9]*$/.test(val)) return; // Only allow numbers

    const newOtp = [...otpArray];
    newOtp[index] = val.substring(val.length - 1); // Take only the last character

    const combinedValue = newOtp.join("");
    onChange(combinedValue);

    if (val && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otpArray];
      if (otpArray[index]) {
        // If current input has a value, clear it
        newOtp[index] = "";
        onChange(newOtp.join(""));
      } else if (index > 0) {
        // If empty, move to previous and clear it
        newOtp[index - 1] = "";
        onChange(newOtp.join(""));
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) focusInput(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (index < length - 1) focusInput(index + 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (value.length === length && onSubmit) {
        onSubmit();
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (!/^[0-9]+$/.test(pastedData)) return; // Only allow numbers

    const pastedArray = pastedData.slice(0, length).split("");
    const newOtp = [...otpArray];

    pastedArray.forEach((char, i) => {
      if (i < length) newOtp[i] = char;
    });

    onChange(newOtp.join(""));

    // Focus on the next empty input or the last input
    const nextIndex = Math.min(pastedArray.length, length - 1);
    focusInput(nextIndex);
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full py-4">
      <div className="flex flex-col items-center space-y-2 text-center">
        <h3 className="text-xl font-semibold text-white">Enter Verification Code</h3>
        <p className="text-sm text-white/60">
          We sent a {length}-digit code to your email
        </p>
      </div>
      
      <div className="flex justify-center gap-2 sm:gap-4 w-full">
        {otpArray.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{1}"
            maxLength={length} // Need this for pasting on mobile
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={() => setActiveInput(index)}
            className={`
              relative flex h-12 w-10 sm:h-16 sm:w-12 items-center justify-center 
              rounded-xl border bg-zinc-900/50 
              text-center text-2xl sm:text-3xl font-bold text-white shadow-sm 
              backdrop-blur-md transition-all duration-300 outline-none
              caret-brand
              ${
                activeInput === index
                  ? "border-brand ring-4 ring-brand/20 scale-[1.15] z-10 shadow-[0_0_25px_rgba(var(--brand-rgb),0.3)] bg-zinc-950"
                  : digit
                  ? "border-brand/40 text-white bg-zinc-900/80 shadow-[0_0_10px_rgba(var(--brand-rgb),0.1)]"
                  : "border-white/10 hover:border-white/30 hover:bg-zinc-800/50 text-white/30"
              }
            `}
          />
        ))}
      </div>
    </div>
  );
}
