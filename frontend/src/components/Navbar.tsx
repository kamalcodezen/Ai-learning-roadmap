"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [activeTab, setActiveTab] = useState("Roadmaps");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = ["Roadmaps", "AI Generator", "Tech Stack", "Pricing"];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4">
      <nav className="w-[65%] mx-auto flex items-center justify-between px-6 py-2.5 rounded-full bg-[#0d0e13]/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-300 flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-200">
            <svg
              className="w-4 h-4 text-[#0d0e13]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            AiPather
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item;
            return (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className="relative py-1 text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <span>{item}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#38d9d4] rounded-full shadow-[0_0_8px_#38d9d4]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: CTA Button */}
        <div className="hidden md:flex items-center">
          <Link
            href="#generate"
            className="rounded-full bg-white hover:bg-gray-100 text-[#090a0f] font-semibold text-xs sm:text-sm px-5 py-2.5 flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-200"
          >
            <span className="leading-normal">Get Started</span>
            <span className="inline-flex items-center justify-center w-3.5 h-3.5">
              <i className="fi fi-br-angle-small-right text-xs leading-none"></i>
            </span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-full text-gray-300 hover:text-white bg-white/5 border border-white/10"
          aria-label="Toggle Menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-4 right-4 bg-[#0d0e13]/95 backdrop-blur-2xl border border-white/10 rounded-md p-5 flex flex-col gap-4 shadow-2xl md:hidden">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveTab(item);
                setMobileMenuOpen(false);
              }}
              className="text-left text-gray-300 hover:text-white py-2 text-base font-medium flex items-center justify-between border-b border-white/5"
            >
              <span>{item}</span>
              {activeTab === item && (
                <span className="w-2 h-2 rounded-full bg-[#38d9d4] shadow-[0_0_8px_#38d9d4]" />
              )}
            </button>
          ))}
          <Link
            href="#generate"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-full bg-white text-[#090a0f] font-semibold text-center py-3 mt-2 flex items-center justify-center gap-1.5"
          >
            <span>Get Started</span>
            <i className="fi fi-br-angle-small-right text-base"></i>
          </Link>
        </div>
      )}
    </header>
  );
}
