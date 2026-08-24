"use client";

import React from "react";

export default function FeatureHeader() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 ">
      <div className="max-w-xl">
        <h2 className="text-center md:text-start">
          Accelerate Growth with <span className="text-primary">Smart Execution</span>
        </h2>
      </div>
      <p className="section-description max-w-md text-body-large leading-relaxed md:text-right lg:text-right">
        Bridge skill gaps, prove your capability with live evidence, and adapt learning paths without guilt.
      </p>
    </div>
  );
}
