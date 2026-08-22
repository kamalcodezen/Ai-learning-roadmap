"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import Button from '../../ui/button';
import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full flex justify-center relative mt-2">
      <motion.div 
        layout
        initial={false}
        animate={{ borderRadius: isOpen ? 32 : 50 }}
        transition={isOpen ? { duration: 0.3, ease: "easeOut" } : { type: "spring", stiffness: 260, damping: 20 }}
        className="bg-card/80 backdrop-blur-[5px] border border-border py-1 px-1 w-[95%] max-w-sm mx-auto overflow-hidden flex flex-col z-50"
        style={{
          zIndex: isOpen ? 999 : 50
        }}
      >
        {/* Header Bar (Always visible) */}
        <div className="flex items-center justify-between w-full ">
          {/* Logo Section */}
          <div className={`pl-1 transition-[margin-top] duration-300 ${isOpen ? 'mt-3' : ''}`}>
            <div className={`[&_a>span]:transition-transform [&_a>span]:duration-300 [&_a>span:first-child]:origin-left ${isOpen ? '[&_a>span:first-child]:scale-[1.20] [&_a>span:last-child]:translate-x-2' : '[&_a>span:first-child]:scale-100 [&_a>span:last-child]:translate-x-0'}`}>
              <Logo />
            </div>
          </div>

          {/* Menu Toggle Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-col shrink-0 items-center justify-center w-10 h-10 bg-foreground rounded-full hover:bg-foreground/80 transition-all focus:outline-none gap-1 mr-1 relative ${isOpen ? 'mt-3' : ''}`}
            aria-label="Toggle menu"
          >
            <div className={`w-3 h-0.5 bg-background rounded-full transition-transform duration-300 ${isOpen ? 'translate-y-0 rotate-45 absolute' : ''}`} />
            <div className={`w-3 h-0.5 bg-background rounded-full transition-transform duration-300 ${isOpen ? 'translate-y-0 -rotate-45 absolute' : ''}`} />
          </button>
        </div>

        {/* Dropdown Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, scale: 0.95 }}
              animate={{ height: "auto", opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ height: 0, opacity: 0, scale: 1.05, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
              style={{ originY: 0 }}
            >
              <div className="flex flex-col items-center gap-6 pt-6 pb-2 px-4">
                <div className="flex flex-col gap-6 w-full items-center mt-2">
                  <a href="#" className="text-body text-muted-foreground hover:text-foreground transition-colors">About Us</a>
                  <a href="#" className="text-body text-muted-foreground hover:text-foreground transition-colors">How it works</a>
                </div>
                
                <div className="w-full mt-2 mb-4 flex justify-center items-center gap-3">
                  <Button text="Start for Free" href="#" />
                  <AnimatedThemeToggler />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
