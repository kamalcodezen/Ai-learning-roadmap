"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
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
import { authClient } from "@/src/lib/auth-client";
import { getDropdownLinks } from "./profileDropdown";
import Button from "../../ui/button";
import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";

export interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string; icon: React.ReactNode }[];
}

export const getNavLinks = (): NavLink[] => [
  /* {
    label: "Solutions",
    href: "/features",
    children: [
      {
        label: "Career Diagnostic",
        href: "/#career-twin",
        icon: <FiTarget size={15} />,
      },
      {
        label: "Adaptive Learning",
        href: "/#how-it-works",
        icon: <FiCpu size={15} />,
      },
      {
        label: "Skill Verification",
        href: "/#readiness-comparison",
        icon: <FiGitBranch size={15} />,
      },
      {
        label: "Problem Breakdown",
        href: "/#problem-breakdown",
        icon: <FiShield size={15} />,
      },
    ],
  }, */
  {
    label: "Why AI Pather",
    href: "/#comparison",
  },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Pricing",
    href: "/#pricing",
  },
];

interface NavLinksProps {
  onlyHamburger?: boolean;
}

export default function NavLinks({ onlyHamburger = false }: NavLinksProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [expandedSolutions, setExpandedSolutions] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;
  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
  };
  const userRole = (session?.user as { role?: string })?.role?.toUpperCase() || "LEARNER";
  const prefix = userRole === "ADMIN" ? "/dashboard/admin" : "/dashboard/learner";
  const profileLinks = getDropdownLinks(userRole, prefix);

  const links = getNavLinks();

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
      case "Dashboard":
        return <FiLayout className="size-4 text-primary" />;
      case "Settings":
        return <FiSettings className="size-4 text-primary" />;
      default:
        return <FiUser className="size-4 text-primary" />;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setMobileOpen(false);
          setIsSigningOut(false);
          router.replace("/");
          router.refresh();
        },
        onError: () => {
          setMobileOpen(false);
          setIsSigningOut(false);
          router.replace("/");
          router.refresh();
        },
      },
    });
  };

  // If only rendering the desktop nav links
  if (!onlyHamburger) {
    return (
      <nav className="flex items-center gap-1 md:gap-2 lg:gap-4">
        {links.map((link, index) => {
          const hasChildren = link.children && link.children.length > 0;
          const isActive = activeDropdown === index;

          return (
            <div
              key={link.label}
              className="relative"
              onMouseEnter={() => {
                if (hasChildren) setActiveDropdown(index);
              }}
              onMouseLeave={() => {
                setActiveDropdown(null);
              }}
            >
              <Link
                href={hasChildren ? "#" : link.href}
                onClick={(e) => {
                  if (hasChildren) {
                    e.preventDefault();
                    setActiveDropdown(isActive ? null : index);
                  }
                }}
                className={`
                  font-poppins font-medium relative z-10 flex items-center gap-1.5 rounded-lg px-3 py-1.5
                  text-sm 
                  transition-all duration-300
                  ${isActive ? "bg-muted/50 text-black dark:bg-muted/50 dark:text-white" : "text-black hover:opacity-75 dark:text-white dark:hover:opacity-75"}
                `}
              >
                {link.label}
                {hasChildren && (
                  <motion.svg
                    animate={{ rotate: isActive ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </motion.svg>
                )}
              </Link>

              {/* Sub-items dropdown */}
              <AnimatePresence>
                {hasChildren && isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-1/2 top-full z-50 mt-2 w-52 -translate-x-1/2"
                  >
                    <div className="neural-dropdown rounded-xl border border-border/50 bg-card/95 p-1.5 shadow-xl backdrop-blur-xl">
                      {link.children!.map((child, childIndex) => (
                        <motion.div
                          key={child.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: childIndex * 0.05, duration: 0.2 }}
                        >
                          <Link
                            href={child.href}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-black transition-all duration-200 hover:bg-muted/70 dark:text-white group"
                          >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                              {child.icon}
                            </span>
                            <span className="font-medium">{child.label}</span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    );
  }

  // Tablet Hamburger Menu & Dropdown Content
  return (
    <div ref={menuRef} className="relative">
      {/* Sleek Hamburger Toggle Button */}
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-all hover:bg-foreground/80 focus:outline-none relative"
        aria-label="Toggle navigation menu"
        aria-expanded={mobileOpen}
      >
        <div className="relative flex size-4 flex-col items-center justify-center gap-1">
          <span
            className={`h-0.5 w-3.5 bg-background rounded-full transition-transform duration-300 ${
              mobileOpen ? "translate-y-1.5 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-3.5 bg-background rounded-full transition-opacity duration-300 ${
              mobileOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-0.5 w-3.5 bg-background rounded-full transition-transform duration-300 ${
              mobileOpen ? "-translate-y-1.5 -rotate-45" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu Content */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[calc(100%+14px)] z-50 w-[88vw] max-w-sm sm:max-w-md rounded-3xl border border-border/80 dark:border-primary/25 bg-card/95 dark:bg-[#191029]/95 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-4 max-h-[76vh] overflow-y-auto pr-1">
              {/* User Profile Card (when authenticated) */}
              {isAuthenticated && (
                <div className="flex items-center justify-between rounded-2xl bg-muted/60 dark:bg-white/5 border border-border/60 dark:border-white/10 p-3">
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

              {/* Navigation Links */}
              <div className="flex flex-col gap-1">
                <span className="px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Navigation
                </span>

                {links.map((link) => {
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
                                    onClick={() => setMobileOpen(false)}
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
                      onClick={() => setMobileOpen(false)}
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

              {/* Authenticated User Account Section */}
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
                        onClick={() => setMobileOpen(false)}
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
                    onClick={() => setMobileOpen(false)}
                    className="w-full justify-center"
                  />
                  <Link
                    href="/signin"
                    onClick={() => setMobileOpen(false)}
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
    </div>
  );
}

