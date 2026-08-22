"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import Button from '../../ui/button';
import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";
import { authClient } from "@/src/lib/auth-client";
import { dropdownLinks } from "./profileDropdown";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  const mockUser = {
    name: "Jubair",
    email: "jubair@example.com",
  };

  return (
    <div className="w-full flex justify-center relative mt-2">
      <motion.div 
        layout
        initial={false}
        animate={{ borderRadius: isOpen ? 32 : 50 }}
        transition={isOpen ? { duration: 0.3, ease: "easeOut" } : { type: "spring", stiffness: 260, damping: 20 }}
        className="bg-card/80 backdrop-blur-[5px] border border-border py-1 px-1 w-[95%] max-w-sm mx-auto overflow-hidden flex flex-col z-50"
        style={{
          zIndex: isOpen ? 999 : 50
        }}
      >
        {/* Header Bar (Always visible) */}
        <div className="flex items-center justify-between w-full ">
          {/* Logo Section */}
          <div className={`pl-1 transition-[margin-top] duration-300 ${isOpen ? 'mt-3' : ''}`}>
            <div className={`[&_a>span]:transition-transform [&_a>span]:duration-300 [&_a>span:first-child]:origin-left ${isOpen ? '[&_a>span:first-child]:scale-[1.20] [&_a>span:last-child]:translate-x-2' : '[&_a>span:first-child]:scale-100 [&_a>span:last-child]:translate-x-0'}`}>
              <Logo />
            </div>
          </div>

          {/* Menu Toggle Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-col shrink-0 items-center justify-center w-10 h-10 bg-foreground rounded-full hover:bg-foreground/80 transition-all focus:outline-none gap-1 mr-1 relative ${isOpen ? 'mt-3' : ''}`}
            aria-label="Toggle menu"
          >
            <div className={`w-3 h-0.5 bg-background rounded-full transition-transform duration-300 ${isOpen ? 'translate-y-0 rotate-45 absolute' : ''}`} />
            <div className={`w-3 h-0.5 bg-background rounded-full transition-transform duration-300 ${isOpen ? 'translate-y-0 -rotate-45 absolute' : ''}`} />
          </button>
        </div>

        {/* Dropdown Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, scale: 0.95 }}
              animate={{ height: "auto", opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ height: 0, opacity: 0, scale: 1.05, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
              style={{ originY: 0 }}
            >
              <div className="flex flex-col items-center gap-6 pt-6 pb-2 px-4">
                <div className="flex flex-col gap-6 w-full items-center mt-2">
                  <a href="#" className="text-body text-muted-foreground hover:text-foreground transition-colors">About Us</a>
                  <a href="#" className="text-body text-muted-foreground hover:text-foreground transition-colors">How it works</a>
                </div>
                
                {/* Profile Section (mobile - no background colors) */}
                {isAuthenticated && (
                  <div className="flex w-full flex-col items-center gap-4 mt-2">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <circle cx="12" cy="8" r="3.5" />
                          <path d="M5 20c.8-3.5 3.2-5.5 7-5.5s6.2 2 7 5.5" />
                        </svg>
                      </span>
                      <div className="min-w-0 text-left">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {mockUser.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {mockUser.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full flex-col items-center gap-1">
                      {dropdownLinks.map((link) =>
                        link.variant === "danger" ? (
                          <button
                            key={link.label}
                            type="button"
                            className="w-full rounded-md bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                          >
                            {link.label}
                          </button>
                        ) : (
                          <a
                            key={link.label}
                            href="#"
                            className="w-full rounded-lg py-2 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {link.label}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="w-full mt-2 mb-4 flex justify-center items-center gap-3">
                  {!isAuthenticated && <Button text="Start for Free" href="#" />}
                  <AnimatedThemeToggler />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
