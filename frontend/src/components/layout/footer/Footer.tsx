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
    <footer className="relative w-full flex flex-col items-center justify-center border-t border-white/10 bg-[#050510] bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)] px-6 py-12 lg:py-16 mt-auto overflow-hidden">
      <div className="absolute inset-x-0 -top-[1px] w-full h-40 pointer-events-none">
        {/* Gradients */}
        <div className="absolute inset-x-0 mx-auto top-0 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-0 mx-auto top-0 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent h-px w-3/4" />
        <div className="absolute inset-x-0 mx-auto top-0 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-0 mx-auto top-0 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent h-px w-1/4" />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-[#050510] [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>

      {/* Noise Overlay for Grunge Effect */}
      <div 
        className="absolute inset-0 z-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Top Right Aurora/Grunge Gradient */}
      <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] pointer-events-none z-0 translate-x-1/4 -translate-y-1/4 opacity-60 mix-blend-screen">
        <div className="absolute inset-0 border-[40px] md:border-[80px] border-[var(--color-primary)] rounded-[40%_60%_70%_30%] blur-[40px] md:blur-[70px]" />
        <div className="absolute inset-8 md:inset-12 border-[20px] md:border-[40px] border-[var(--color-primary)] rounded-[60%_40%_30%_70%] blur-[30px] md:blur-[50px] opacity-70" />
      </div>
      
      {/* Bottom Left Aurora/Grunge Gradient */}
      <div className="absolute bottom-0 left-0 w-[450px] md:w-[700px] h-[450px] md:h-[700px] pointer-events-none z-0 -translate-x-1/4 translate-y-1/4 opacity-60 mix-blend-screen">
        <div className="absolute inset-0 border-[50px] md:border-[100px] border-[var(--color-primary)] rounded-[30%_70%_50%_50%] blur-[50px] md:blur-[80px]" />
        <div className="absolute inset-10 md:inset-16 border-[30px] md:border-[50px] border-[var(--color-primary)] rounded-[50%_50%_70%_30%] blur-[40px] md:blur-[60px] opacity-70" />
      </div>

      <div className="global-pos relative z-10 flex w-full flex-col items-center">
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

              <span className="font-bold text-display tracking-tight text-white">
                AI <span className="text-[var(--color-primary)]">Pather</span>
              </span>
            </Link>
          </div>

          {/* Main Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {mainLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="font-poppins text-small font-medium text-slate-400 hover:text-[var(--color-primary)] transition-colors duration-300"
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
          <div className="text-slate-400 text-small order-3 md:order-1 flex-1 text-center md:text-left">
            © {new Date().getFullYear()} AI Pather. All rights reserved.
          </div>

          {/* Social Links (Centered) */}
          <div className="flex items-center justify-center gap-4 order-1 md:order-2 flex-1">
            {socialLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-slate-400 hover:text-[var(--color-primary)] hover:bg-white/10 transition-all duration-300"
                aria-label={link.title}
              >
                {link.icon && <link.icon className="size-5" />}
              </Link>
            ))}
          </div>

          {/* Bottom Links (Privacy, Terms) */}
          <div className="flex items-center justify-center md:justify-end gap-6 text-small order-2 md:order-3 flex-1">
            {bottomLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="text-slate-400 hover:text-[var(--color-primary)] transition-colors duration-300"
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
