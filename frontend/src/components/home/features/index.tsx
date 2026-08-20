"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import FeatureHeader from "./FeatureHeader";
import FeatureCard from "./FeatureCard";
import FeatureTooltipModal from "./FeatureTooltipModal";
import { featureItems } from "./featureData";
import { GridPattern } from "@/src/registry/magicui/grid-pattern";

export default function FeaturesSection() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleCardClick = (id: string) => {
    // Toggle modal on mobile/tablet click
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="relative w-full overflow-hidden py-4 px-4 sm:px-8 md:px-12">
        <GridPattern
                width={45}
                height={45}
                x={-1}
                y={-1}
                className="[mask-image:linear-gradient(to_bottom,white,transparent,transparent)] opacity-40 dark:opacity-20"
              />
      <div className="container relative z-20 mx-auto max-w-7xl">
        <FeatureHeader />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch relative">
          {featureItems.map((item, index) => {
            const isActive = activeId === item.id;
            const tooltipPosition = index === featureItems.length - 1 ? "left" : "right";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative flex flex-col cursor-pointer"
                onMouseEnter={() => setActiveId(item.id)}
                onMouseLeave={() => setActiveId(null)}
                onClick={() => handleCardClick(item.id)}
              >
                <FeatureCard feature={item} />
                <FeatureTooltipModal
                  feature={isActive ? item : null}
                  position={tooltipPosition}
                  onClose={() => setActiveId(null)}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}