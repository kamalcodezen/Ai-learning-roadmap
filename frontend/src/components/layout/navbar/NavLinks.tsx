"use client";

import { useEffect, useState, useSyncExternalStore, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
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
  FiMoon,
  FiX,
  FiHome,
  FiMail,
} from "react-icons/fi";
import { Sparkles, Crown, Loader2 } from "lucide-react";
import { authClient } from "@/src/lib/auth-client";
import { getDropdownLinks, getPlanBadge } from "./profileDropdown";
import Button from "../../ui/button";
import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";

export interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string; icon: React.ReactNode }[];
}

export const getNavLinks = (): NavLink[] => [
  {
    label: "Home",
    href: "/",
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
    href: "/pricing",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

const subscribeToHash = (callback: () => void) => {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
};
const getHashSnapshot = () => (typeof window !== "undefined" ? window.location.hash : "");
const getHashServerSnapshot = () => "";

interface NavLinksProps {
  onlyHamburger?: boolean;
}

export default function NavLinks({ onlyHamburger = false }: NavLinksProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [expandedSolutions, setExpandedSolutions] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const hashFromStore = useSyncExternalStore(subscribeToHash, getHashSnapshot, getHashServerSnapshot);
  const [scrollSection, setScrollSection] = useState<string>("");

  // Track active section on home page when scrolling
  useEffect(() => {
    if (pathname !== "/") return;
    const comparisonSection = document.getElementById("comparison");
    if (!comparisonSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setScrollSection("#comparison");
          } else {
            setScrollSection((prev) => (prev === "#comparison" ? "" : prev));
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(comparisonSection);
    return () => observer.disconnect();
  }, [pathname]);

  const activeHash = scrollSection || hashFromStore;

  const checkIsActive = (link: NavLink) => {
    if (link.href === "/") {
      return pathname === "/" && (!activeHash || activeHash === "" || activeHash === "#");
    }
    if (link.href.startsWith("/#")) {
      const targetHash = link.href.replace("/", "");
      return pathname === "/" && activeHash === targetHash;
    }
    if (link.href.startsWith("/")) {
      return pathname === link.href || pathname.startsWith(`${link.href}/`);
    }
    return false;
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [mobileOpen]);

  const { data: session } = authClient.useSession();
  const [liveImage, setLiveImage] = useState<string | null>(null);

  useEffect(() => {
    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ image?: string }>;
      if (customEvent.detail?.image) {
        setLiveImage(customEvent.detail.image);
      }
    };
    window.addEventListener("user-avatar-updated", handleAvatarUpdate);
    return () => window.removeEventListener("user-avatar-updated", handleAvatarUpdate);
  }, []);

  const isAuthenticated = !!session?.user;
  const sessionUser = session?.user as { role?: string; plan?: string; image?: string | null } | undefined;
  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
    image: liveImage || sessionUser?.image || null,
  };
  const userRole = sessionUser?.role?.toUpperCase() || "LEARNER";
  const userPlan = sessionUser?.plan?.toUpperCase() || "FREE";
  const prefix = userRole === "ADMIN" ? "/dashboard/admin" : "/dashboard/learner";
  const profileLinks = getDropdownLinks(userRole, prefix);

  const planBadge = getPlanBadge(userPlan);
  const PlanIcon = planBadge.icon;

  const links = getNavLinks();

  const getNavLinkIcon = (label: string) => {
    switch (label) {
      case "Home":
        return <FiHome className="size-4 shrink-0" />;
      case "Solutions":
        return <FiLayers className="size-4 shrink-0" />;
      case "Why AI Pather":
        return <FiCompass className="size-4 shrink-0" />;
      case "About Us":
        return <FiInfo className="size-4 shrink-0" />;
      case "Pricing":
        return <FiCreditCard className="size-4 shrink-0" />;
      case "Contact Us":
        return <FiMail className="size-4 shrink-0" />;
      default:
        return null;
    }
  };

  const getProfileIcon = (label: string) => {
    switch (label) {
      case "Dashboard":
      case "Admin Dashboard":
        return <FiLayout className="size-4 shrink-0" />;
      case "Profile":
      case "My Profile":
        return <FiUser className="size-4 shrink-0" />;
      case "Settings":
      case "Settings & Billing":
        return <FiSettings className="size-4 shrink-0" />;
      default:
        return <FiUser className="size-4 shrink-0" />;
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
                  } else {
                    if (link.href.startsWith("/#")) {
                      setScrollSection(link.href.replace("/", ""));
                    } else {
                      setScrollSection("");
                    }
                  }
                }}
                className={`font-poppins relative z-10 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all duration-300 ${
                  checkIsActive(link)
                    ? "text-primary font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-primary"
                    : "text-foreground/80 font-medium hover:text-primary dark:text-foreground/80 dark:hover:text-primary"
                }`}
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

  // Tablet & iPad Pro Hamburger Menu & Dropdown Content
  return (
    <div ref={menuRef} className="relative">
      {/* Sleek Hamburger Toggle Button */}
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        className="flex size-10 md:size-11 shrink-0 items-center justify-center rounded-full bg-[#1e1e1e] dark:bg-white text-white dark:text-[#1e1e1e] shadow-md transition-all hover:opacity-90 active:scale-95 focus:outline-none relative"
        aria-label="Toggle navigation menu"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? (
          <FiX className="size-5 stroke-[2.5]" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="h-0.5 w-4 bg-current rounded-full" />
            <span className="h-0.5 w-4 bg-current rounded-full" />
            <span className="h-0.5 w-4 bg-current rounded-full" />
          </div>
        )}
      </button>

      {/* Dropdown Menu Content */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            className="absolute right-0 top-[calc(100%+14px)] z-50 w-[88vw] max-w-[360px] rounded-[28px] border border-border/70 dark:border-white/10 bg-white/95 dark:bg-[#1a1128]/95 p-5 shadow-2xl backdrop-blur-2xl"
          >
            <div
              ref={scrollContainerRef}
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              className="flex flex-col gap-4 max-h-[76vh] overflow-y-auto overscroll-contain pr-1"
            >
              {/* User Profile Card (when authenticated) */}
              {isAuthenticated && (
                <div className="flex items-center justify-between rounded-2xl bg-muted/60 dark:bg-white/5 border border-border/60 dark:border-white/10 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-primary to-secondary text-sm font-bold text-white shadow-xs">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || "User"}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <span>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                      )}
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-bold text-foreground">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider border ${planBadge.style}`}
                    >
                      <PlanIcon className="size-2.5" />
                      {planBadge.label}
                    </span>
                  </div>
                </div>
              )}

              {/* Dynamic Plan Upgrade Card */}
              {isAuthenticated && (
                <div className="px-0.5">
                  {userPlan === "FREE" && (
                    <Link
                      href="/pricing"
                      onClick={() => setMobileOpen(false)}
                      className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-primary to-secondary px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-95"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-yellow-300" />
                        <span>Upgrade to Plus</span>
                      </span>
                      <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">
                        Save 20%
                      </span>
                    </Link>
                  )}

                  {userPlan === "PLUS" && (
                    <Link
                      href="/pricing"
                      onClick={() => setMobileOpen(false)}
                      className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500 to-primary px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-95"
                    >
                      <span className="flex items-center gap-1.5">
                        <Crown className="size-3.5 text-yellow-200" />
                        <span>Upgrade to Pro</span>
                      </span>
                      <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">
                        Enterprise
                      </span>
                    </Link>
                  )}

                  {userPlan === "PRO" && (
                    <div className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-500 dark:text-amber-400">
                      <Crown className="size-3.5" />
                      <span>Verified Pro Member</span>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex flex-col gap-1">
                <span className="px-2 text-[11px] font-mono font-semibold tracking-[0.16em] text-muted-foreground uppercase">
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
                          className="flex items-center justify-between rounded-2xl px-2.5 py-2.5 text-sm font-poppins font-medium text-foreground transition-all hover:bg-muted/60 dark:hover:bg-white/5"
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="flex size-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 shrink-0">
                              {getNavLinkIcon(link.label)}
                            </span>
                            <span className="text-[14px] font-medium">{link.label}</span>
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
                                    className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground/85 transition-colors hover:bg-card-soft dark:hover:bg-white/5 hover:text-primary"
                                  >
                                    <span className="flex size-6 items-center justify-center rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
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

                  const isItemActive = checkIsActive(link);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => {
                        setMobileOpen(false);
                        if (link.href.startsWith("/#")) {
                          setScrollSection(link.href.replace("/", ""));
                        } else {
                          setScrollSection("");
                        }
                      }}
                      className={`group flex items-center gap-3.5 rounded-2xl px-2.5 py-2.5 text-sm font-poppins font-medium transition-all ${
                        isItemActive
                          ? "bg-primary/10 text-primary font-semibold border border-primary/20 dark:border-primary/30"
                          : "text-foreground hover:bg-muted/60 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className={`flex size-8 items-center justify-center rounded-xl shrink-0 transition-all ${
                        isItemActive
                          ? "bg-primary text-white shadow-sm shadow-primary/30"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 group-hover:bg-primary group-hover:text-white"
                      }`}>
                        {getNavLinkIcon(link.label)}
                      </span>

                      <span className="text-[14px] font-medium">{link.label}</span>
                    </Link>
                  );
                })}

                {/* Appearance / Theme Toggle Row under Navigation */}
                <div className="group flex items-center justify-between rounded-2xl px-2.5 py-2 text-sm font-poppins font-medium text-foreground transition-all hover:bg-muted/60 dark:hover:bg-white/5">
                  <div className="flex items-center gap-3.5">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                      <FiMoon className="size-4 shrink-0" />
                    </span>
                    <span className="text-[14px] font-medium">Appearance</span>
                  </div>
                  <div className="scale-90 pr-1">
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
                        className="group flex items-center gap-2.5 w-full rounded-xl px-2.5 py-2.5 mt-1 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSigningOut ? (
                          <>
                            <span className="flex size-7 items-center justify-center rounded-lg bg-red-500/20 text-red-500 shrink-0">
                              <Loader2 className="size-4 animate-spin shrink-0" />
                            </span>
                            <span>Signing out...</span>
                          </>
                        ) : (
                          <>
                            <span className="flex size-7 items-center justify-center rounded-lg bg-red-500/20 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shrink-0">
                              <FiLogOut className="size-4 shrink-0" />
                            </span>
                            <span>{link.label}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-foreground transition-all hover:bg-card-soft dark:hover:bg-white/5"
                      >
                        <span className="flex size-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                          {getProfileIcon(link.label)}
                        </span>
                        <span className="group-hover:text-primary transition-colors">{link.label}</span>
                      </Link>
                    )
                  )}
                </div>
              ) : (
                /* Guest User Actions (when not authenticated) */
                <div className="pt-2 border-t border-border/60 dark:border-white/10 mt-1">
                  <Button
                    text="Start for Free"
                    href="/dashboard/learner"
                    onClick={() => setMobileOpen(false)}
                    className="w-full justify-between"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

