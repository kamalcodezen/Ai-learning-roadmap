"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import AuthCheck from "./AuthCheck";

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
      className={`font-poppins fixed inset-x-0 top-0 z-50 px-3 pt-10 sm:px-4 ${
        scrolled ? ""
        : "bg-white"
      } `}
    >
      <motion.div
        layout
        transition={{
          layout: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
className={`
            relative mx-auto flex items-center
            transition-all duration-500 ease-out
            ${
              scrolled
            //   Here max-w-140 temporary - it hard codedly changes the things for nav links
                ? "w-full max-w-[80%] rounded-full bg-white/70 px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:px-4"
                : "w-full max-w-[80%] rounded-none px-4"
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

            {/* Auth */}
            <div className="flex justify-end">
              <AuthCheck />
            </div>
          </div>
        </motion.div>
    </motion.nav>
  );
}