"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  LuCompass,
  LuHouse,
  LuArrowLeft,
  LuSparkles,
  LuSearchX,
} from "react-icons/lu";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#060910] px-4 py-16 text-foreground">
      {/* ব্যাকগ্রাউন্ড রেডিয়াল লাইট ইফেক্ট ও গ্রিড */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(206,255,31,0.08),rgba(255,255,255,0))]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#CEFF1F]/5 blur-[140px]" />

      {/* গ্রিড লাইন ওভারলে */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="container relative z-10 mx-auto max-w-xl text-center">
        {/* টপ ব্যাজ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#131824]/80 px-3.5 py-1.5 backdrop-blur-md"
        >
          <LuSearchX className="size-3.5 text-[#CEFF1F]" />
          <span className="font-mono text-xs font-medium text-slate-300">
            Error 404: Roadmap Node Missing
          </span>
        </motion.div>

        {/* সেন্ট্রাল আইকনিক 404 টাইপোগ্রাফি */}
        <div className="relative my-4 flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="select-none font-mono text-8xl font-extrabold tracking-tighter text-white/5 sm:text-9xl"
          >
            404
          </motion.h1>

          <div className="absolute flex flex-col items-center">
            <motion.div
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex size-14 items-center justify-center rounded-2xl border border-[#CEFF1F]/30 bg-[#131824] shadow-[0_0_30px_rgba(206,255,31,0.2)] sm:size-16"
            >
              <LuCompass className="size-7 text-[#CEFF1F] animate-spin [animation-duration:12s]" />
            </motion.div>
          </div>
        </div>

        {/* হেডিং ও সাবটাইটেল */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-poppins text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          Lost in the{" "}
          <i className="font-serif italic font-normal text-slate-400">
            latent space
          </i>
          ?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base"
        >
          আপনি যে লার্নিং পাথওয়ে বা নোডটি খুঁজছেন তা এখনো তৈরি হয়নি অথবা নতুন
          রুটে স্থানান্তরিত হয়েছে।
        </motion.p>

        {/* অ্যাকশন বাটনসমূহ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <Link
            href="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#CEFF1F] px-6 py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-[#b8e61b] hover:shadow-[0_0_20px_rgba(206,255,31,0.25)] active:scale-95"
          >
            <LuHouse className="size-4" />
            <span>Back to Safety</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <LuArrowLeft className="size-4" />
            <span>Previous Step</span>
          </button>
        </motion.div>

        {/* বটম হেল্পার প্রম্পট */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 inline-flex items-center gap-2 font-mono text-xs text-slate-500"
        >
          <LuSparkles className="size-3 text-[#CEFF1F]" />
          <span>AI Pathfinder dynamically recalculating routes</span>
        </motion.div>
      </div>
    </div>
  );
}
