"use client";

export default function ProblemHeader() {
  return (
    <div className="text-left w-full">
      {/* <span className="text-[12px] font-mono tracking-widest text-muted-foreground uppercase mb-2 block">
        The Problem
      </span> */}
      <h2 className="font-poppins text-h2 tracking-tight text-foreground text-balance">
        Why{" "}
        <i className="font-serif italic font-normal text-muted-foreground">
          Static
        </i>{" "}
        Roadmaps{" "}
        <span className="font-medium underline decoration-primary/50 underline-offset-8">
          Break Down
        </span>
      </h2>
      <p className="section-description text-body-large mt-4">
        Completing lessons is not the same as becoming job-ready.
      </p>
    </div>
  );
}
