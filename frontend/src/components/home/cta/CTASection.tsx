import React from 'react';
import Button from '../../ui/button';

/* Dot-pattern chevron decorations (top-left & top-right) */
function DotPattern({ className = '' }: { className?: string }) {
  /* Each ">" chevron shape: 4 dots per row stepping diagonally */
  const chevronDots: [number, number][] = [
    /* Row 0 */[0, 0], [7, 0], [14, 0], [21, 0],
    /* Row 1 */[7, 7], [14, 7], [21, 7], [28, 7],
    /* Row 2 */[14, 14], [21, 14], [28, 14], [35, 14],
    /* Row 3 (tip) */[21, 21], [28, 21], [35, 21], [42, 21],
    /* Row 4 */[14, 28], [21, 28], [28, 28], [35, 28],
    /* Row 5 */[7, 35], [14, 35], [21, 35], [28, 35],
    /* Row 6 */[0, 42], [7, 42], [14, 42], [21, 42],
  ];

  const chevrons = [
    { offsetX: 0, opacity: 0.15 },
    { offsetX: 38, opacity: 0.35 },
    { offsetX: 76, opacity: 0.6 },
  ];

  return (
    <svg className={className} width="200" height="50" viewBox="0 0 120 50" fill="none">
      {chevrons.map(({ offsetX, opacity }, ci) =>
        chevronDots.map(([cx, cy], di) => (
          <circle
            key={`c${ci}-${di}`}
            cx={cx + offsetX + 3}
            cy={cy + 3}
            r="1.8"
            className="fill-foreground"
            opacity={opacity}
          />
        ))
      )}
    </svg>
  );
}

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Top fade overlay for grid pattern */}
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none z-[1] bg-gradient-to-b from-background to-transparent"
      />
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-20 pb-20 sm:pt-20 sm:pb-52 md:pt-20 md:pb-56">
        {/* Dot patterns – top corners */}
        <DotPattern className="absolute top-16 left-8 md:left-16 hidden sm:block" />
        <DotPattern className="absolute top-16 right-8 md:right-16 scale-x-[-1] hidden sm:block" />

        {/* ====== Main content ====== */}
        <div className="max-w-5xl mx-auto text-center -mt-10 sm:mt-0 text-measure mx-auto">
          <h2 className="text-display text-balance uppercase tracking-tight text-foreground mb-4">
            Let's Build Your AI Career Path
          </h2>

          <p className="text-body-large text-muted-foreground font-medium mb-6">
            Tell us where you want to go, and we’ll help you understand what to learn next
          </p>

          <div className="w-full mt-2 mb-4 flex justify-center items-center gap-3">
            {/* Mobile Button (smaller overrides) */}
            <div className="sm:hidden">
              <Button text="Create My Roadmap" href="#" className="h-9 text-sm px-3 pl-4 pr-10" />
            </div>
            {/* Desktop Button (default style) */}
            <div className="hidden sm:block">
              <Button text="Create My Roadmap" href="#" />
            </div>
          </div>
        </div>

        {/* ====== Green geometric blocks ====== */}
        {/* Bottom-left block */}
        <div className="absolute bottom-0 left-0 hidden sm:flex items-end gap-0 pointer-events-none">
          <div className="w-16 sm:w-40 md:w-56 lg:w-64 h-48 sm:h-85 md:h-85 lg:h-85 bg-[#ceff1f]" />
          <div className="hidden sm:block w-12 sm:w-28 md:w-40 lg:w-60 h-36 sm:h-60 md:h-60 lg:h-60 bg-[#ceff1f]" />
          <div className="hidden sm:block sm:w-28 md:w-40 lg:w-40 h-60 sm:h-60 md:h-60 lg:h-30 bg-[#ceff1f]" />
        </div>

        {/* Bottom center connecting green bar */}
        <div className="absolute bottom-0 left-0 right-0 hidden sm:block pointer-events-none">
          <div className="w-full h-14 sm:h-15 bg-[#ceff1f]" />
        </div>

        {/* Bottom-right block */}
        <div className="absolute bottom-0 right-0 hidden sm:flex items-end gap-0 pointer-events-none">
          <div className="hidden sm:block sm:w-28 md:w-40 lg:w-40 h-60 sm:h-60 md:h-60 lg:h-30 bg-[#ceff1f]" />
          <div className="hidden sm:block w-12 sm:w-28 md:w-40 lg:w-60 h-36 sm:h-60 md:h-60 lg:h-60 bg-[#ceff1f]" />
          <div className="w-16 sm:w-40 md:w-56 lg:w-64 h-48 sm:h-85 md:h-85 lg:h-85 bg-[#ceff1f]" />
        </div>

        {/* Bottom corner labels */}
        <div className="absolute bottom-10 sm:bottom-6 left-8 sm:left-8 md:left-16 z-20 flex items-center gap-2">
          <span className="block h-2 w-2 sm:h-3 sm:w-3 bg-[#060911] dark:bg-white dark:sm:bg-[#060911]" />
          <span className="text-caption font-bold uppercase tracking-widest text-[#060911] dark:text-white dark:sm:text-[#060911]">
            Personalized Learning
          </span>
        </div>

        <div className="absolute bottom-10 sm:bottom-6 right-8 sm:right-8 md:right-16 z-20 flex items-center gap-2">
          <span className="block h-2 w-2 sm:h-3 sm:w-3 bg-[#060911] dark:bg-white dark:sm:bg-[#060911]" />
          <span className="text-caption font-bold uppercase tracking-widest text-[#060911] dark:text-white dark:sm:text-[#060911]">
            AI-Powered Paths
          </span>
        </div>
      </div>
    </section>
  );
}
