"use client";

import { useSyncExternalStore } from "react";
import { motion } from "motion/react";
import TextHeader from "./TextHeader";
import DiagnoseCard from "./cards/DiagnoseCard";
import UnblockCard from "./cards/UnblockCard";
import ProveCard from "./cards/ProveCard";
import AdaptCard from "./cards/AdaptCard";

const cards = [
  { id: 1, Component: DiagnoseCard },
  { id: 2, Component: UnblockCard },
  { id: 3, Component: ProveCard },
  { id: 4, Component: AdaptCard },
];

// শুধুমাত্র মোবাইলের জন্য (sm এর নিচে অর্থাৎ < 640px)
const MOBILE_ONLY_MQ = "(max-width: 639px)";

function subscribeIsMobile(callback: () => void) {
  const mq = window.matchMedia(MOBILE_ONLY_MQ);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getIsMobileSnapshot() {
  return window.matchMedia(MOBILE_ONLY_MQ).matches;
}

function getIsMobileServerSnapshot() {
  return false;
}

export default function HowItWorksSection() {
  const isMobile = useSyncExternalStore(
    subscribeIsMobile,
    getIsMobileSnapshot,
    getIsMobileServerSnapshot,
  );

  // ১. শুধুমাত্র মোবাইলে (sm এর নিচে) একটার নিচে একটা (Stacked)
  if (isMobile) {
    return (
      <section
        id="how-it-works"
        className="relative w-full overflow-hidden pt-13 py-10 px-4 sm:px-8 md:px-12"
      >
        <div className="global-pos flex flex-col items-center gap-8">
          <TextHeader />
          <div className="flex w-full flex-col items-center gap-6">
            {cards.map(({ id, Component }, index) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.12,
                  ease: "easeOut",
                }}
                className="w-full max-w-[340px]"
              >
                <Component />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ২. sm, md, lg এবং তার ওপরে — static, কন্টেইনারের ভেতরে ৪টা কার্ড
  return (
    <section
      id="how-it-works"
      className="relative w-full px-4 pt-13 py-10 sm:px-8 md:px-12"
    >
      <div className="global-pos flex flex-col">
        {/* হেডার */}
        <TextHeader />

        {/* কার্ড — static row */}
        <div className="mt-8 flex w-full items-stretch gap-6 sm:mt-10 md:mt-12 md:gap-8">
          {cards.map(({ id, Component }, index) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.55,
                delay: index * 0.12,
                ease: "easeOut",
              }}
              className="h-85 min-w-0 flex-1 sm:w-auto md:h-95"
            >
              <Component />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
