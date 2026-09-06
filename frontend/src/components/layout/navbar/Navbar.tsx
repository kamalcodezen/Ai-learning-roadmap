"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import AuthCheck from "./AuthCheck";
import MobileNav from "./MobileNav";
import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      className={`font-poppins fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "pt-2 sm:pt-3 px-3 sm:px-4 md:px-6"
          : "pt-0 px-4 md:px-0 md:bg-[#e0d1f1] md:dark:bg-[#2b1e42ec]"
      } `}
    >
      <div className="block md:hidden">
        <MobileNav />
      </div>
      <motion.div
        layout
        transition={{
          layout: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
        className={`
            hidden md:flex relative mx-auto items-center
            transition-all duration-700 ease-out
            ${
              scrolled
                ? "w-full max-w-3xl xl:max-w-5xl rounded-full bg-[#f4edff]/95 dark:bg-[#2b1e42ec] px-4 sm:px-6 py-2 md:py-2.5 xl:py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-2xl border border-border/40"
                : "w-full max-w-[1500px] rounded-none py-2.5 md:py-3.5 xl:py-4.5 px-6"
            }
          `}
      >
        <div
          className={`
              flex w-full items-center justify-between gap-5 sm:gap-7
            `}
        >
          {/* Logo */}
          <div className="flex shrink-0 justify-start">
            <Logo />
          </div>

          {/* Desktop Navigation (xl+) */}
          <div className="hidden xl:flex items-center justify-center">
            <NavLinks />
          </div>

          {/* Right Actions: Auth, Theme & Tablet Hamburger (< xl: iPad Mini, iPad Air, iPad Pro) */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3.5">
            <div className="hidden xl:block">
              <AuthCheck />
            </div>
            <div className="hidden xl:block">
              <AnimatedThemeToggler />
            </div>
            {/* Tablet / iPad Hamburger (< xl) */}
            <div className="block xl:hidden">
              <NavLinks onlyHamburger />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
