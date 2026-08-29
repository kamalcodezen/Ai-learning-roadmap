"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { RxCross2 } from "react-icons/rx";
import { RxHamburgerMenu } from "react-icons/rx";
import { FiTarget, FiCpu, FiRefreshCw, FiGitBranch, FiShield } from "react-icons/fi";

interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string; icon: React.ReactNode }[];
}

const navLinks: NavLink[] = [
  {
    label: "Core Engines",
    href: "/dashboard",
    children: [
      {
        label: "Career Twin Diagnostic",
        href: "/career-twin",
        icon: <FiTarget size={14} />,
      },
      {
        label: "Cognitive Independence",
        href: "/learning-path",
        icon: <FiCpu size={14} />,
      },
      {
        label: "Anti-Decay Memory",
        href: "/progress",
        icon: <FiRefreshCw size={14} />,
      },
      {
        label: "Zero-Clone Proof",
        href: "/proof-graph",
        icon: <FiGitBranch size={14} />,
      },
      {
        label: "JD Reality Gate",
        href: "/application-readiness",
        icon: <FiShield size={14} />,
      },
    ],
  },

  {
    label: "Live Proof Explorer",
    href: "/portfolio",
  },

  {
    label: "Roadmap vs AI Pather",
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

export default function NavLinks() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-1 lg:flex">
        {navLinks.map((link, index) => {
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
              {/* Link */}
              <Link
                href={hasChildren ? "#" : link.href}
                onClick={(e) => {
                  if (hasChildren) {
                    e.preventDefault();
                    setActiveDropdown(isActive ? null : index);
                  }
                }}
                className={`
                  font-poppins relative z-10 flex items-center gap-1.5 rounded-lg px-3 py-1.5
                  text-sm font-normal
                  transition-all duration-300
                  ${isActive ? "text-foreground bg-muted/50" : "text-muted-foreground hover:text-foreground"}
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

              {/* Sub-items */}
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
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-muted/70 hover:text-foreground group"
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

      {/* Mobile Toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen((previous) => !previous)}
        className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
        aria-label="Toggle navigation"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <RxCross2 /> : <RxHamburgerMenu />}
      </button>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-4 right-4 top-[calc(100%+8px)] rounded-2xl border border-border bg-card p-3 shadow-xl lg:hidden"
          >
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-poppins flex items-center justify-between rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-card-soft hover:text-foreground"
                  >
                    <span>{link.label}</span>
                  </Link>
                  {link.children && (
                    <div className="ml-4 flex flex-col gap-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <span className="text-primary">{child.icon}</span>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
