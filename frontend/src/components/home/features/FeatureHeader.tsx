"use client";

import React from "react";

export default function FeatureHeader() {
  return (
    <div className="w-full mb-12">
      <h2 className="font-poppins text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
        Accelerate{" "}
        <i className="font-serif italic font-normal text-muted-foreground">
          Growth
        </i>{" "}
        with{" "}
        <span className="font-medium underline decoration-primary/50 underline-offset-8 text-primary">
          Smart Execution
        </span>
      </h2>
      <p className="section-description text-base md:text-lg text-muted-foreground mt-1 max-w-xl">
        Bridge skill gaps, prove your capability with live evidence, and adapt
        learning paths without guilt.
      </p>
    </div>
  );
}
