"use client";

import React from "react";

export default function FeatureHeader() {
  return (
    <div className="mb-12 flex flex-col items-center text-center">
      <h2 className="font-poppins text-3xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-4xl">
        Accelerate Growth with{" "}
        <span className="text-primary">Smart Execution</span>
      </h2>
      <p className="section-description mx-auto mt-4 max-w-[95%] px-4 font-poppins text-lg text-muted-foreground md:max-w-xl">
        Bridge skill gaps, prove your capability with live evidence, and adapt
        learning paths without guilt.
      </p>
    </div>
  );
}
