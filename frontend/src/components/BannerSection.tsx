"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Endless3DCarousel from "@/src/components/Endless3DCarousel";

export default function BannerSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  return (
    <section className="relative min-h-screen pt-28 pb-12 sm:pt-36 sm:pb-16 overflow-hidden bg-[#050608] flex flex-col items-center justify-between">
      {/* ── Background Video with Black/80 Overlay & 0.5x Slowdown ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.playbackRate = 0.5;
            }
          }}
          onPlay={() => {
            if (videoRef.current) {
              videoRef.current.playbackRate = 0.5;
            }
          }}
          className="w-full h-full object-contain"
        >
          <source src="/video/intro.mp4" type="video/mp4" />
        </video>
        {/* Solid Black/80 overlay on top of video */}
        <div className="absolute inset-0 bg-black/80 z-10" />
        {/* Subtle radial and linear gradient blending for seamless integration */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050608]/60 via-transparent to-[#050608] z-20" />
      </div>

      {/* ── Background: Orange nebula ambient glow ── */}
      <div
        className="absolute -top-16 -left-16 w-[800px] h-[800px] pointer-events-none z-1"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(235,87,34,0.35), rgba(200,60,15,0.10) 45%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* ── Background: Grid & stripes ── */}
      <div className="absolute inset-0 bg-grid-lines pointer-events-none opacity-20 z-1" />
      <div className="absolute inset-0 vertical-stripes pointer-events-none opacity-25 z-1" />

      {/* ── Main Banner Content ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 text-center flex flex-col items-center">
        {/* Top Social Proof: Overlapping Avatars + Text */}
        <div className="mb-6 inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] px-4 py-1.5 rounded-full backdrop-blur-md shadow-sm">
          <div className="flex -space-x-2 overflow-hidden">
            <img
              className="inline-block h-6 w-6 rounded-full ring-2 ring-[#050608] object-cover"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Avatar 1"
            />
            <img
              className="inline-block h-6 w-6 rounded-full ring-2 ring-[#050608] object-cover"
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
              alt="Avatar 2"
            />
            <img
              className="inline-block h-6 w-6 rounded-full ring-2 ring-[#050608] object-cover"
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
              alt="Avatar 3"
            />
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-300">
            Trusted by 10,000+ developers.
          </span>
        </div>

        {/* Main Headline with Embedded Inline Icon/Image Pills */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold text-white tracking-tight leading-[1.12] max-w-5xl mx-auto">
          <span>Effortless </span>
          <span className="inline-flex items-center justify-center align-middle mx-1 sm:mx-2 w-10 h-10 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#eb5722]/60 shadow-[0_0_15px_rgba(235,87,34,0.4)]">
            <Image
              src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"
              alt="Neural AI Orb"
              width={60}
              height={60}
              className="object-cover w-full h-full"
            />
          </span>
          <span className="text-[#eb5722]"> Roadmaps</span>
          <br />
          <span>for </span>
          <span className="inline-flex items-center justify-center align-middle mx-1 sm:mx-2 w-10 h-10 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.15)]">
            <Image
              src="https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"
              alt="AI Engineer"
              width={60}
              height={60}
              className="object-cover w-full h-full"
            />
          </span>
          <span>AI Developers</span>
          <br />
          <span className="text-gray-300">based on </span>
          <span className="inline-flex items-center justify-center align-middle mx-1 sm:mx-2 w-10 h-10 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#38d9d4]/60 shadow-[0_0_15px_rgba(56,217,212,0.4)]">
            <Image
              src="https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"
              alt="Quantum Computing Microchip"
              width={60}
              height={60}
              className="object-cover w-full h-full"
            />
          </span>
          <span className="text-white"> Modern Tech</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          We make it easy for engineers to master, grow, and scale with clean,
          milestone-focused AI learning roadmaps - no delays, no drama.
        </p>

        {/* Sleek Glassmorphic CTA Button with Subtle Glowing Effect */}
        <div className="mt-8 flex justify-center">
          <Link
            href="#generate"
            className="group relative rounded-full bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-2xl border border-white/20 hover:border-white/40 text-white font-medium text-sm sm:text-base px-8 py-3.5 flex items-center justify-center gap-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.4),0_0_24px_rgba(255,255,255,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_3px_rgba(255,255,255,0.6),0_0_32px_rgba(255,255,255,0.18)] transition-all duration-300 cursor-pointer"
          >
            <span className="leading-normal tracking-wide">View Roadmaps</span>
            <span className="inline-flex items-center justify-center w-5 h-5 text-gray-300 group-hover:text-white group-hover:translate-x-0.5 transition-all">
              <i className="fi fi-br-angle-small-right text-lg sm:text-xl leading-[0] block"></i>
            </span>
          </Link>
        </div>
      </div>

      {/* ── Endless 3D Concave Carousel ── */}
      <div className="relative z-10 w-full py-4 sm:py-6">
        <Endless3DCarousel />

        {/* Bottom cyan dash indicator */}
        <div className="mt-3 sm:mt-5 flex justify-center">
          <div className="w-8 h-1 rounded-full bg-[#38d9d4] shadow-[0_0_10px_#38d9d4]" />
        </div>
      </div>
    </section>
  );
}
