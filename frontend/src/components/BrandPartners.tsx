"use client";

export default function BrandPartners() {
  return (
    <div className="w-full py-8 sm:py-10 bg-[#07080b]/90 border-none overflow-hidden">
      <div className="w-full px-4 sm:px-8 flex items-center justify-center">
        {/* Grayscale Static Brand Logos Row - No Hover, No Shadow, Smaller */}
        <div className="w-full flex flex-wrap items-center justify-between sm:justify-around gap-6 sm:gap-8 md:gap-12 grayscale opacity-55">
          {/* Logo 1: 3D Isometric Block 0G */}
          <div className="flex items-center gap-2.5">
            <svg
              className="w-7 h-7 text-gray-400"
              viewBox="0 0 40 40"
              fill="currentColor"
            >
              <polygon points="20,4 36,13 20,22 4,13" fill="currentColor" opacity="0.9" />
              <polygon points="20,22 36,13 36,29 20,38" fill="currentColor" opacity="0.6" />
              <polygon points="4,13 20,22 20,38 4,29" fill="currentColor" opacity="0.4" />
              <polygon points="20,10 28,14.5 20,19 12,14.5" fill="#07080b" />
            </svg>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-gray-400 font-mono">
              0G
            </span>
          </div>

          {/* Logo 2: LOGO Geometric */}
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-gray-400"
              viewBox="0 0 36 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            >
              <rect x="4" y="4" width="28" height="28" rx="4" />
              <circle cx="18" cy="18" r="6" />
            </svg>
            <span className="font-black text-lg sm:text-xl md:text-2xl tracking-widest text-gray-400">
              LOGO
            </span>
          </div>

          {/* Logo 3: Fast Italic Speed Logoipsum */}
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-gray-400"
              viewBox="0 0 32 32"
              fill="currentColor"
            >
              <path d="M4 18L16 6l12 12H18l-2-6-2 6H4z" />
              <path d="M12 24l4-4 4 4h8L16 12 4 24h8z" opacity="0.7" />
            </svg>
            <span className="font-bold italic text-lg sm:text-xl md:text-2xl tracking-tight text-gray-400">
              Logoipsum
            </span>
          </div>

          {/* Logo 4: Crescent Circle Logoipsum */}
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-gray-400"
              viewBox="0 0 32 32"
              fill="currentColor"
            >
              <path d="M16 2C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2zm0 24c-5.52 0-10-4.48-10-10 0-3.32 1.62-6.26 4.1-8.08.31-.23.75-.19.98.12.23.31.18.75-.12.98C8.82 10.61 7.5 13.16 7.5 16c0 4.69 3.81 8.5 8.5 8.5 2.84 0 5.39-1.32 7-3.46.23-.3.67-.35.98-.12.31.23.35.67.12.98C22.26 24.38 19.32 26 16 26z" />
            </svg>
            <span className="font-bold text-lg sm:text-xl text-gray-400 tracking-tight">
              Logoipsum
            </span>
          </div>

          {/* Logo 5: Infinity Loop */}
          <div className="flex items-center gap-2">
            <svg
              className="w-8 h-6 text-gray-400"
              viewBox="0 0 48 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 8C8 8 4 12 4 16s4 8 10 8c6 0 10-5 10-8s4-8 10-8 10 4 10 8-4 8-10 8c-6 0-10-5-10-8s-4-8-10-8z" />
            </svg>
            <span className="font-bold text-base sm:text-lg tracking-wide text-gray-400 font-mono">
              INFINITE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
