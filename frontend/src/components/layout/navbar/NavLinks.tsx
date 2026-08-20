"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { RxCross2 } from "react-icons/rx";
import { RxHamburgerMenu } from "react-icons/rx";

const navLinks = [
  {
    label: "About Us",
    href: "/#",
  },
  {
    label: "How it works",
    href: "#how-it-works"
  }
];

export default function NavLinks() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-7 lg:flex">
        {navLinks.map((link) => (
          <div key={link.label} className="relative">
            <Link
              href={link.href}
              className="flex items-center text-[18px] font-normal text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          </div>
        ))}
      </nav>

      {/* Mobile Toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen((previous) => !previous)}
        className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
        aria-label="Toggle navigation"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? (
          <RxCross2 />
        ) : (
          <RxHamburgerMenu />
        )}
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
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-card-soft hover:text-foreground"
                >
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}