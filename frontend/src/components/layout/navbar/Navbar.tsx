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
      className={`font-poppins fixed inset-x-0 top-0 z-50  px-4 md:px-0 ${
        scrolled ? "pt-0" : "md:bg-[#e0d1f1] md:dark:bg-[#2b1e42ec]"
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
            transition-all duration-1000 ease-out
            ${
              scrolled
                ? "w-full max-w-210 rounded-full bg-[#f4edff] dark:bg-[#2b1e42ec]  px-0 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:px-2"
                : "w-full max-w-[1500px]  rounded-none py-2.5 px-6"
            }
          `}
      >
        <div
          className={`
              flex w-full items-center justify-between gap-5 sm:gap-7
            `}
        >
          {/* Logo */}
          <div className="flex  justify-start">
            <Logo />
          </div>

          {/* Navigation */}
          <div className="ml-auto flex justify-center lg:ml-0">
            <NavLinks />
          </div>

          {/* Auth and Theme */}
          <div className="flex items-center justify-end">
            <AuthCheck />
            <AnimatedThemeToggler />
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
