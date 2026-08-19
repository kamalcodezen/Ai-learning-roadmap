/**
 * Fluid ocean-wave bottom decoration for the BentoCanvas card.
 * Contains animated SVG waves and a pulsing beam effect.
 */
export default function OceanBottom() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-36 overflow-hidden rounded-b-[30px]">
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-card via-card/80 to-transparent" />

      <div className="anim-beam absolute bottom-10 inset-x-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_rgb(var(--primary))]" />
      <div className="anim-beam absolute bottom-10 inset-x-10 h-5 rounded-full bg-primary/30 blur-md" />

      {/* Ocean Wave 1 */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none opacity-70 dark:opacity-85">
        <svg
          className="anim-wave-primary relative block h-[80px] w-[200%]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,20 C150,80 350,-20 500,50 C650,130 900,10 1200,30 L1200,120 L0,120 Z"
            fill="rgb(var(--secondary))"
            fillOpacity="0.45"
          />
        </svg>
      </div>

      {/* Cyber Wave 2 */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none opacity-85 dark:opacity-95">
        <svg
          className="anim-wave-secondary relative block h-[65px] w-[200%]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,35 C200,80 400,-10 600,45 C800,110 1000,15 1200,40 L1200,120 L0,120 Z"
            fill="rgb(var(--primary))"
            fillOpacity="0.5"
          />
        </svg>
      </div>

      {/* Foreground Foam */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none opacity-70 dark:opacity-85">
        <svg
          className="anim-wave-primary relative block h-[45px] w-[200%]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C100,65 300,10 500,45 C700,85 900,20 1200,35 L1200,120 L0,120 Z"
            fill="rgb(var(--primary))"
            fillOpacity="0.75"
          />
        </svg>
      </div>
    </div>
  );
}
