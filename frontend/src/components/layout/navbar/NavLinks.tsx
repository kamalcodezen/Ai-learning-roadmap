"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { FiTarget, FiCpu, FiGitBranch, FiShield, FiChevronDown, FiUser, FiLogOut, FiLayout, FiSettings } from "react-icons/fi";
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
  {
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
  },
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
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setMobileOpen(false);
          router.push("/signin");
          router.refresh();
        },
      },
    });
  };

  // If only rendering the desktop nav links
  if (!onlyHamburger) {
    return (
      <nav className="hidden items-center gap-1 xl:flex">
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
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-all hover:bg-foreground/80 focus:outline-none"
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
            className="absolute right-0 top-[calc(100%+14px)] z-50 w-[88vw] max-w-sm sm:max-w-md rounded-3xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-4">
              {/* Navigation Links */}
              <nav className="flex flex-col gap-1">
                {links.map((link) => {
                  const hasChildren = link.children && link.children.length > 0;

                  if (hasChildren) {
                    return (
                      <div key={link.label} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => setExpandedSolutions((prev) => !prev)}
                          className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-poppins font-medium text-foreground transition-colors hover:bg-card-soft"
                        >
                          <span>{link.label}</span>
                          <FiChevronDown
                            className={`size-4 transition-transform duration-200 ${
                              expandedSolutions ? "rotate-180 text-primary" : "text-muted-foreground"
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
                              className="overflow-hidden pl-3"
                            >
                              <div className="flex flex-col gap-1 border-l-2 border-primary/20 my-1 pl-3">
                                {link.children!.map((child) => (
                                  <Link
                                    key={child.label}
                                    href={child.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground/85 transition-colors hover:bg-card-soft hover:text-primary"
                                  >
                                    <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                                      {child.icon}
                                    </span>
                                    <span>{child.label}</span>
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
                      className="font-poppins font-medium flex items-center justify-between rounded-xl px-4 py-3 text-sm text-foreground transition-colors hover:bg-card-soft"
                    >
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Authenticated User Profile Section */}
              {isAuthenticated ? (
                <div className="border-t border-border/60 pt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <FiUser className="size-5" />
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
                    <AnimatedThemeToggler />
                  </div>

                  <div className="flex flex-col gap-1 mt-1">
                    {profileLinks.map((link) =>
                      link.variant === "danger" ? (
                        <button
                          key={link.label}
                          type="button"
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
                        >
                          <FiLogOut className="size-4" />
                          <span>{link.label}</span>
                        </button>
                      ) : (
                        <Link
                          key={link.label}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card-soft"
                        >
                          {link.label === "Dashboard" ? (
                            <FiLayout className="size-4 text-primary" />
                          ) : link.label === "Settings" ? (
                            <FiSettings className="size-4 text-primary" />
                          ) : (
                            <FiUser className="size-4 text-primary" />
                          )}
                          <span>{link.label}</span>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-t border-border/60 pt-4 flex items-center justify-between gap-3 w-full">
                  <Button
                    text="Start for Free"
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 justify-center"
                  />
                  <AnimatedThemeToggler />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

