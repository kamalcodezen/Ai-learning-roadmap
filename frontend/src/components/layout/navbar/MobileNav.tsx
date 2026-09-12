"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiLayout,
  FiSettings,
  FiLayers,
  FiCompass,
  FiInfo,
  FiCreditCard,
  FiLogIn,
  FiMoon,
} from "react-icons/fi";
import Logo from "./Logo";
import Button from "../../ui/button";
import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";
import { authClient } from "@/src/lib/auth-client";
import { getDropdownLinks } from "./profileDropdown";
import { getNavLinks } from "./NavLinks";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSolutions, setExpandedSolutions] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
  };

  const userRole = (session?.user as { role?: string })?.role?.toUpperCase() || "LEARNER";
  const prefix = userRole === "ADMIN" ? "/dashboard/admin" : "/dashboard/learner";
  const profileLinks = getDropdownLinks(userRole, prefix).filter(
    (link) => link.label !== "Profile" && link.label !== "Settings"
  );
  const navLinks = getNavLinks();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setIsOpen(false);
          setIsSigningOut(false);
          router.replace("/");
          router.refresh();
        },
        onError: () => {
          setIsOpen(false);
          setIsSigningOut(false);
          router.replace("/");
          router.refresh();
        },
      },
    });
  };

  const getNavLinkIcon = (label: string) => {
    switch (label) {
      case "Solutions":
        return <FiLayers className="size-4 text-primary" />;
      case "Why AI Pather":
        return <FiCompass className="size-4 text-primary" />;
      case "About Us":
        return <FiInfo className="size-4 text-primary" />;
      case "Pricing":
        return <FiCreditCard className="size-4 text-primary" />;
      default:
        return null;
    }
  };

  const getProfileIcon = (label: string) => {
    switch (label) {
      case "Profile":
        return <FiUser className="size-4 text-primary" />;
      case "Dashboard":
        return <FiLayout className="size-4 text-primary" />;
      case "Settings":
        return <FiSettings className="size-4 text-primary" />;
      default:
        return <FiUser className="size-4 text-primary" />;
    }
  };

  return (
    <div className="w-full flex justify-center relative mt-2 px-3">
      <motion.div
        layout
        initial={false}
        animate={{ borderRadius: isOpen ? 28 : 50 }}
        transition={
          isOpen
            ? { duration: 0.3, ease: "easeOut" }
            : { type: "spring", stiffness: 260, damping: 20 }
        }
        className="bg-card/90 dark:bg-[#191029]/95 backdrop-blur-xl border border-border/80 dark:border-primary/25 w-full max-w-sm mx-auto shadow-xl overflow-hidden flex flex-col z-50"
        style={{
          zIndex: isOpen ? 999 : 50,
        }}
      >
        {/* Header Bar (Always visible) */}
        <div className="flex items-center justify-between w-full px-2 py-1.5">
          {/* Logo Section */}
          <div className="pl-0">
            <Logo />
          </div>

          {/* Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center size-9 bg-foreground text-background rounded-full hover:bg-foreground/80 transition-all focus:outline-none relative"
            aria-label="Toggle menu"
          >
            <div
              className={`w-3.5 h-0.5 bg-background rounded-full transition-transform duration-300 absolute ${
                isOpen ? "rotate-45" : "-translate-y-1"
              }`}
            />
            <div
              className={`w-3.5 h-0.5 bg-background rounded-full transition-opacity duration-300 absolute ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <div
              className={`w-3.5 h-0.5 bg-background rounded-full transition-transform duration-300 absolute ${
                isOpen ? "-rotate-45" : "translate-y-1"
              }`}
            />
          </button>
        </div>

        {/* Dropdown Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
                transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
              }}
              style={{ originY: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-4 px-3.5 pt-2 pb-4 max-h-[76vh] overflow-y-auto">
                {/* User Profile Card (when authenticated) */}
                {isAuthenticated && (
                  <div className="flex items-center justify-between rounded-2xl bg-muted/60 dark:bg-white/5 border border-border/60 dark:border-white/10 p-3 mt-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-secondary text-white font-semibold text-sm shadow-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      {userRole}
                    </span>
                  </div>
                )}

                {/* Main Navigation Links */}
                <div className="flex flex-col gap-1">
                  <span className="px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Navigation
                  </span>

                  {navLinks.map((link) => {
                    const hasChildren = link.children && link.children.length > 0;

                    if (hasChildren) {
                      return (
                        <div key={link.label} className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => setExpandedSolutions((prev) => !prev)}
                            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-poppins font-medium text-foreground transition-all hover:bg-card-soft dark:hover:bg-white/5"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                {getNavLinkIcon(link.label)}
                              </span>
                              <span>{link.label}</span>
                            </div>
                            <FiChevronDown
                              className={`size-4 text-muted-foreground transition-transform duration-200 ${
                                expandedSolutions ? "rotate-180 text-primary" : ""
                              }`}
                            />
                          </button>

                          <AnimatePresence>
                            {expandedSolutions && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden pl-2"
                              >
                                <div className="flex flex-col gap-1 border-l-2 border-primary/25 my-1 pl-2.5">
                                  {link.children!.map((child) => (
                                    <Link
                                      key={child.label}
                                      href={child.href}
                                      onClick={() => setIsOpen(false)}
                                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground/85 transition-colors hover:bg-card-soft dark:hover:bg-white/5 hover:text-primary"
                                    >
                                      <span className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                                        {child.icon}
                                      </span>
                                      <span className="truncate">{child.label}</span>
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-poppins font-medium text-foreground transition-all hover:bg-card-soft dark:hover:bg-white/5"
                      >
                        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {getNavLinkIcon(link.label)}
                        </span>
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}

                  {/* Appearance / Theme Toggle Row under Navigation */}
                  <div className="flex items-center justify-between rounded-xl px-3 py-1.5 text-sm font-poppins font-medium text-foreground transition-all hover:bg-card-soft dark:hover:bg-white/5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FiMoon className="size-4" />
                      </span>
                      <span>Appearance</span>
                    </div>
                    <div className="scale-90">
                      <AnimatedThemeToggler />
                    </div>
                  </div>
                </div>

                {/* Account Section (when authenticated) */}
                {isAuthenticated ? (
                  <div className="flex flex-col gap-1 border-t border-border/60 dark:border-white/10 pt-3">
                    <span className="px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Account
                    </span>

                    {profileLinks.map((link) =>
                      link.variant === "danger" ? (
                        <button
                          key={link.label}
                          type="button"
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 mt-1 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50"
                        >
                          <FiLogOut className="size-4 shrink-0" />
                          <span>{isSigningOut ? "Signing out..." : link.label}</span>
                        </button>
                      ) : (
                        <Link
                          key={link.label}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-all hover:bg-card-soft dark:hover:bg-white/5"
                        >
                          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {getProfileIcon(link.label)}
                          </span>
                          <span>{link.label}</span>
                        </Link>
                      )
                    )}
                  </div>
                ) : (
                  /* Guest User Actions (when not authenticated) */
                  <div className="flex flex-col gap-2 border-t border-border/60 dark:border-white/10 pt-3 mt-1">
                    <Button
                      text="Start for Free"
                      href="/signup"
                      onClick={() => setIsOpen(false)}
                      className="w-full justify-center"
                    />
                    <Link
                      href="/signin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors hover:bg-card-soft dark:hover:bg-white/5"
                    >
                      <FiLogIn className="size-4" />
                      <span>Sign In</span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

