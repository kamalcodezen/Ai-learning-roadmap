"use client";
import React from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";
import { SparklesCore } from "../../ui/sparkles";

const mainLinks = [
  { title: "How It Works", href: "/#how-it-works" },
  { title: "Features", href: "#features" },
  { title: "About Us", href: "#about" },
  { title: "Login", href: "/signin" },
];

const socialLinks = [
  { title: "Facebook", href: "#", icon: FaFacebook },
  { title: "Instagram", href: "#", icon: FaInstagram },
  { title: "Youtube", href: "#", icon: FaYoutube },
  { title: "LinkedIn", href: "#", icon: FaLinkedin },
];

const bottomLinks = [
  { title: "Privacy Policy", href: "#" },
  { title: "Terms of Service", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative w-full flex flex-col items-center justify-center border-t border-white/10 bg-[#060911] bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)] px-6 py-12 lg:py-16 mt-auto overflow-hidden">
      <div className="absolute inset-x-0 -top-[1px] w-full h-40 pointer-events-none">
        {/* Gradients */}
        <div className="absolute inset-x-0 mx-auto top-0 bg-gradient-to-r from-transparent via-[#ceff1f] to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-0 mx-auto top-0 bg-gradient-to-r from-transparent via-[#ceff1f] to-transparent h-px w-3/4" />
        <div className="absolute inset-x-0 mx-auto top-0 bg-gradient-to-r from-transparent via-[#ceff1f] to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-0 mx-auto top-0 bg-gradient-to-r from-transparent via-[#ceff1f] to-transparent h-px w-1/4" />

        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#ceff1f"
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-[#060911] [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10 flex flex-col items-center">
        <AnimatedContainer className="flex flex-col items-center justify-center space-y-10 w-full pb-12">
          {/* Logo and Tagline */}
          <div className="flex flex-col items-center">
            <Link
              href="/"
              className="flex items-center mt-20 space-x-3 md:space-x-4"
            >
              <Image
                src="/logo-p.png"
                alt="AI Pather"
                width={70}
                height={70}
                className="w-10 h-10 md:w-[70px] md:h-[70px] object-contain"
              />

              <span className="font-bold text-5xl sm:text-6xl md:text-8xl tracking-tight text-white">
                AI <span className="text-[#ceff1f]">Pather</span>
              </span>
            </Link>
          </div>

          {/* Main Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {mainLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="text-sm font-medium text-slate-400 hover:text-[#ceff1f] transition-colors duration-300"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </AnimatedContainer>

        {/* Bottom section with border */}
        <AnimatedContainer
          delay={0.2}
          className="w-full pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          {/* Copyright */}
          <div className="text-slate-400 text-sm order-3 md:order-1 flex-1 text-center md:text-left">
            © {new Date().getFullYear()} AI Pather. All rights reserved.
          </div>

          {/* Social Links (Centered) */}
          <div className="flex items-center justify-center gap-4 order-1 md:order-2 flex-1">
            {socialLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-slate-400 hover:text-[#ceff1f] hover:bg-white/10 transition-all duration-300"
                aria-label={link.title}
              >
                {link.icon && <link.icon className="size-5" />}
              </Link>
            ))}
          </div>

          {/* Bottom Links (Privacy, Terms) */}
          <div className="flex items-center justify-center md:justify-end gap-6 text-sm order-2 md:order-3 flex-1">
            {bottomLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="text-slate-400 hover:text-[#ceff1f] transition-colors duration-300"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </AnimatedContainer>
      </div>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: string;
  children: ReactNode;
};

function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
