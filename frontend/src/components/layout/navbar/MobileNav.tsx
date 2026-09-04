"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import Button from '../../ui/button';
import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";
import { authClient } from "@/src/lib/auth-client";
import { getDropdownLinks } from "./profileDropdown";
import { getNavLinks } from "./NavLinks";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
  };

  const userRole = (session?.user as { role?: string })?.role || "learner";
  const prefix = userRole === "admin" ? "/dashboard/admin" : "/dashboard/learner";
  const links = getDropdownLinks(userRole, prefix);
  const navLinks = getNavLinks();

  return (
    <div className="w-full flex justify-center relative mt-2">
      <motion.div 
        layout
        initial={false}
        animate={{ borderRadius: isOpen ? 32 : 50 }}
        transition={isOpen ? { duration: 0.3, ease: "easeOut" } : { type: "spring", stiffness: 260, damping: 20 }}
        className="bg-card/70 dark:bg-[#2b1e42] backdrop-blur-[5px] border border-border py-1 px-1 w-[95%] max-w-sm mx-auto overflow-hidden flex flex-col z-50"
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
                <div className="flex flex-col gap-1 w-full mt-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href === "#" ? "#" : link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-poppins text-black transition-colors hover:bg-card-soft dark:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
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
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full flex-col items-center gap-1">
                      {links.map((link) =>
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
                            className="w-full rounded-lg py-2 text-center text-sm text-black transition-colors hover:opacity-75 dark:text-white"
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
