"use client";

export default function TextHeader() {
  return (
    <div className="w-full max-w-6xl  text-left container-custom">
      <h2 className="font-poppins text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
        How to{" "}
        <i className="font-serif italic font-normal text-muted-foreground">
          Start
        </i>{" "}
        in{" "}
        <span className="font-medium underline decoration-primary/50 underline-offset-8 text-primary">
          4 Steps?
        </span>
      </h2>
      <p className="section-description text-base md:text-lg text-muted-foreground mt-1">
        Master your career path with a dynamic AI-driven learning and
        verification framework.
      </p>
    </div>
  );
}
