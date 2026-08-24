"use client";

import { FC } from "react";
import Image, { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface PlasmaTriggerButtonProps {
  size?: number;
  logo: string | StaticImageData;
  isOpen: boolean;
  onClick: () => void;
}

export const PlasmaTriggerButton: FC<PlasmaTriggerButtonProps> = ({
  size = 60,
  logo,
  isOpen,
  onClick,
}) => {
  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={onClick}
        aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
        className="group relative flex items-center justify-center rounded-full p-0 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] cursor-pointer touch-manipulation select-none"
      >
        <div
          className="relative flex items-center justify-center font-sans select-none rounded-full cursor-pointer bg-[var(--color-primary)]"
          style={{ width: size, height: size }}
        >
          {/* Radar Ping Animation */}
          {!isOpen && (
            <span
              className="absolute inset-0 rounded-full bg-[var(--color-primary)] animate-chatPing pointer-events-none -z-10"
              style={{ width: size, height: size }}
            />
          )}

          {/* Logo or Close Icon */}
          {!isOpen ? (
            <div className="relative z-10 flex items-center justify-center p-2 bg-transparent animate-loaderLogo">
              <Image
                src={logo}
                alt="AI Pathar Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
          ) : (
            <X className="size-6 text-white z-10" />
          )}

          {/* Rotating Pure Neon/Lime Glow */}
          <div className="absolute inset-0 rounded-full animate-plasmaGlow pointer-events-none" />
        </div>
      </motion.button>

      {/* Scoped Button Animation Styles */}
      <style jsx global>{`
        @keyframes chatPing {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.85);
            opacity: 0;
          }
        }
        .animate-chatPing {
          animation: chatPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes plasmaGlow {
          0%,
          100% {
            box-shadow:
              0 6px 12px 0 #ffffff inset,
              0 12px 18px 0 #d8b4fe inset,
              0 0 6px 1.5px rgba(159, 84, 247, 0.7),
              0 0 14px 3px rgba(159, 84, 247, 0.4);
          }
          50% {
            box-shadow:
              0 6px 12px 0 #e9d5ff inset,
              0 12px 18px 0 #a855f7 inset,
              0 0 6px 1.5px rgba(159, 84, 247, 0.7),
              0 0 14px 3px rgba(159, 84, 247, 0.4);
          }
        }
        .animate-plasmaGlow {
          animation: plasmaGlow 4s linear infinite;
        }

        @keyframes loaderLogo {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.95;
          }
          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }
        .animate-loaderLogo {
          animation: loaderLogo 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};
