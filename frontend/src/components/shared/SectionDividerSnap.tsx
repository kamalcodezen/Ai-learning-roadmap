"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SectionDividerSnap({ isLoaderActive }: { isLoaderActive: boolean }) {
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    if (isLoaderActive) return;

    // Small delay to ensure all 3D canvas and dynamic cards are mounted and measured
    const timer = setTimeout(() => {
      const bannerSection = document.getElementById("banner");
      const roadmapsSection = document.getElementById("roadmaps");
      const divider1 = document.getElementById("section-divider-1");

      if (!bannerSection || !roadmapsSection || !divider1) return;

      // Create ScrollTrigger on the invisible divider line between Banner and Roadmaps
      const st = ScrollTrigger.create({
        trigger: divider1,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: () => {
          // Scrolling down across the invisible line -> Smoothly glide to Roadmaps section
          if (!isTransitioningRef.current && window.scrollY < roadmapsSection.offsetTop - 50) {
            isTransitioningRef.current = true;
            const targetY = roadmapsSection.offsetTop - 70; // offset for fixed navbar
            window.scrollTo({
              top: targetY,
              behavior: "smooth",
            });
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 800);
          }
        },
        onLeaveBack: () => {
          // Scrolling up across the invisible line -> Smoothly glide back to Banner top
          if (!isTransitioningRef.current && window.scrollY > 100) {
            isTransitioningRef.current = true;
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 800);
          }
        },
      });

      return () => {
        st.kill();
      };
    }, 300);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isLoaderActive]);

  return null;
}
