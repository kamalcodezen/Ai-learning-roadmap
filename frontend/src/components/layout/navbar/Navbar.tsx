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
      className={`font-poppins fixed inset-x-0 top-0 z-50 transition-all duration-900 ${
        scrolled
          ? "pt-0 sm:pt-2 px-2 sm:px-4 md:px-6"
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
            transition-all duration-900 ease-out
            ${
              scrolled
                ? "w-full max-w-3xl lg:max-w-4xl 2xl:max-w-5xl rounded-full bg-[#f4edff]/95 dark:bg-[#2b1e42ec] px-2.5 py-2.5 2xl:py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl border-none"
                : "w-full global-pos rounded-none py-3.5 2xl:py-4.5 px-6 border-none"
            }
          `}
      >
        <div
          className={`
              flex w-full items-center justify-between gap-6
            `}
        >
          {/* Logo */}
          <div className="flex shrink-0 justify-start">
            <Logo />
          </div>

          {/* Desktop Navigation (lg+) */}
          <div className="hidden lg:flex items-center justify-center">
            <NavLinks />
          </div>

          {/* Right Actions: Auth, Theme & Tablet Hamburger (< lg: iPad Mini, iPad Air, Android tablets) */}
          <div className="flex items-center justify-end gap-3">
            <div className="hidden lg:block">
              <AuthCheck />
            </div>
            <div className="hidden lg:block">
              <AnimatedThemeToggler />
            </div>
            {/* Tablet / iPad Hamburger (< lg) */}
            <div className="block lg:hidden">
              <NavLinks onlyHamburger />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
