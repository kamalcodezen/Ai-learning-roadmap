import Link from "next/link";
import Image from "next/image";

interface BrandLoaderProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
  theme?: "light" | "dark" | "auto";
}

export default function BrandLoader({
  message,
  fullScreen = true,
  className = "",
  theme = "auto",
}: BrandLoaderProps) {
  const themeClass =
    theme === "dark"
      ? "brand-loader-dark"
      : theme === "light"
      ? "brand-loader-light"
      : "";

  return (
    <div
      className={`brand-loader-container ${
        fullScreen ? "brand-loader-fullscreen" : "brand-loader-inline"
      } ${themeClass} ${className}`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap');

        /* =========================================================
           BASE / LIGHT MODE
           ========================================================= */
        .brand-loader-container {
          --color-primary: #9F54F7;
          --color-primary-light: #C084FC;
          --color-primary-dark: #7E22CE;
          --text-foreground: #0f172a;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #F8FAFC;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .brand-loader-fullscreen {
          position: fixed;
          inset: 0;
          min-height: 100vh;
          width: 100vw;
          z-index: 9999;
        }

        .brand-loader-inline {
          position: relative;
          min-height: 300px;
          width: 100%;
        }

        .brand-loader-container * {
          box-sizing: border-box;
        }

        .brand-loader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 360px;
          max-width: 90vw;
        }

        /* Logo & Text Layout */
        .brand-loader-link {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          text-decoration: none;
        }

        .brand-loader-img {
          width: 160px;
          height: auto;
          display: block;
        }

        /* Light Track Base */
        .brand-loader-bar {
          position: relative;
          width: 100%;
          height: 2px;
          background-color: #E2E8F0;
          overflow: visible;
          transition: background-color 0.3s ease;
        }

        /* Container carrying active growth */
        .brand-loader-clipper {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          transform-origin: left;
          animation: brandLoad 2.5s infinite ease-in-out;
        }

        /* Main Progress Line (Light) */
        .brand-loader-main-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #A855F7, var(--color-primary), #7E22CE);
          z-index: 3;
        }

        /* SVG Overlay Group */
        .brand-loader-shapes-group {
          position: absolute;
          top: -222px;
          left: 0;
          width: 100%;
          height: 446px;
          pointer-events: none;
        }

        .brand-loader-shapes-group svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .brand-loader-shapes-light {
          display: block;
        }

        .brand-loader-shapes-dark {
          display: none;
        }

        /* Light Mode Specific Filters */
        .brand-loader-shadow-light {
          z-index: 1;
          filter: blur(14px);
          opacity: 0.18;
        }

        .brand-loader-cast-blur-light {
          z-index: 1;
          filter: blur(8px);
          opacity: 0.28;
        }

        .brand-loader-bar-glow-light {
          z-index: 1;
          filter: blur(4px);
          opacity: 0.45;
        }

        .brand-loader-mid-glow-light {
          z-index: 2;
          filter: blur(2.5px);
          opacity: 0.65;
        }

        .brand-loader-top-glow-1-light,
        .brand-loader-top-glow-2-light,
        .brand-loader-top-glow-3-light {
          z-index: 2;
        }

        .brand-loader-top-glow-1-light { filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.7)); }
        .brand-loader-top-glow-2-light { filter: drop-shadow(0 0 1.2px var(--color-primary-light)); }
        .brand-loader-top-glow-3-light { filter: drop-shadow(0 0 0.8px #ffffff); }

        .brand-loader-message {
          margin-top: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          text-align: center;
          animation: brandPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* =========================================================
           DARK MODE STYLING
           ========================================================= */
        :root.dark .brand-loader-container:not(.brand-loader-light),
        html.dark .brand-loader-container:not(.brand-loader-light),
        .dark .brand-loader-container:not(.brand-loader-light),
        .brand-loader-container.brand-loader-dark {
          --color-primary: #9F54F7;
          --color-primary-light: #C084FC;
          --color-primary-dark: #6B21A8;
          --text-foreground: #ffffff;
          background: linear-gradient(
            165deg,
            #240349 0%,
            #0d0715 55%,
            #1a0e2e 100%
          );
        }

        :root.dark .brand-loader-container:not(.brand-loader-light) .brand-loader-bar,
        html.dark .brand-loader-container:not(.brand-loader-light) .brand-loader-bar,
        .dark .brand-loader-container:not(.brand-loader-light) .brand-loader-bar,
        .brand-loader-container.brand-loader-dark .brand-loader-bar {
          background-color: #1a1a1a;
        }

        :root.dark .brand-loader-container:not(.brand-loader-light) .brand-loader-main-line,
        html.dark .brand-loader-container:not(.brand-loader-light) .brand-loader-main-line,
        .dark .brand-loader-container:not(.brand-loader-light) .brand-loader-main-line,
        .brand-loader-container.brand-loader-dark .brand-loader-main-line {
          background: linear-gradient(90deg, #3b0764, var(--color-primary-dark), var(--color-primary));
        }

        :root.dark .brand-loader-container:not(.brand-loader-light) .brand-loader-shapes-light,
        html.dark .brand-loader-container:not(.brand-loader-light) .brand-loader-shapes-light,
        .dark .brand-loader-container:not(.brand-loader-light) .brand-loader-shapes-light,
        .brand-loader-container.brand-loader-dark .brand-loader-shapes-light {
          display: none;
        }

        :root.dark .brand-loader-container:not(.brand-loader-light) .brand-loader-shapes-dark,
        html.dark .brand-loader-container:not(.brand-loader-light) .brand-loader-shapes-dark,
        .dark .brand-loader-container:not(.brand-loader-light) .brand-loader-shapes-dark,
        .brand-loader-container.brand-loader-dark .brand-loader-shapes-dark {
          display: block;
        }

        :root.dark .brand-loader-container:not(.brand-loader-light) .brand-loader-message,
        html.dark .brand-loader-container:not(.brand-loader-light) .brand-loader-message,
        .dark .brand-loader-container:not(.brand-loader-light) .brand-loader-message,
        .brand-loader-container.brand-loader-dark .brand-loader-message {
          color: #94a3b8;
        }

        /* Dark Mode Specific Filters */
        .brand-loader-shadow-dark {
          z-index: 1;
          filter: blur(12px);
          opacity: 0.3;
        }

        .brand-loader-cast-blur-dark {
          z-index: 1;
          filter: blur(8px);
          opacity: 0.5;
        }

        .brand-loader-bar-glow-dark {
          z-index: 1;
          filter: blur(4px);
          opacity: 0.75;
        }

        .brand-loader-mid-glow-dark {
          z-index: 2;
          filter: blur(2px);
          opacity: 0.85;
        }

        .brand-loader-top-glow-1-dark,
        .brand-loader-top-glow-2-dark,
        .brand-loader-top-glow-3-dark {
          z-index: 2;
        }

        .brand-loader-top-glow-1-dark { filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.3)); }
        .brand-loader-top-glow-2-dark { filter: drop-shadow(0 0 1.5px var(--color-primary-light)); }
        @media (prefers-color-scheme: dark) {
          :root:not(.light) .brand-loader-container:not(.brand-loader-light) {
            --color-primary: #9F54F7;
            --color-primary-light: #C084FC;
            --color-primary-dark: #6B21A8;
            --text-foreground: #ffffff;
            background: linear-gradient(
              165deg,
              #240349 0%,
              #0d0715 55%,
              #1a0e2e 100%
            );
          }
          :root:not(.light) .brand-loader-container:not(.brand-loader-light) .brand-loader-bar {
            background-color: #1a1a1a;
          }
          :root:not(.light) .brand-loader-container:not(.brand-loader-light) .brand-loader-main-line {
            background: linear-gradient(90deg, #3b0764, var(--color-primary-dark), var(--color-primary));
          }
          :root:not(.light) .brand-loader-container:not(.brand-loader-light) .brand-loader-shapes-light {
            display: none;
          }
          :root:not(.light) .brand-loader-container:not(.brand-loader-light) .brand-loader-shapes-dark {
            display: block;
          }
          :root:not(.light) .brand-loader-container:not(.brand-loader-light) .brand-loader-message {
            color: #94a3b8;
          }
        }

        @keyframes brandLoad {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.5); }
          100% { transform: scaleX(1); }
        }

        @keyframes brandPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>

      <div className="brand-loader-wrapper">
        {/* Brand Logo */}
        <Link href="/" className="brand-loader-link" aria-label="AI Pather home">
          <Image
            src="/brand/AI-Pather-blue.png"
            alt="AI Pather"
            width={160}
            height={30}
            className="brand-loader-img block dark:hidden"
            priority
          />
          <Image
            src="/brand/AI-Pather-white.png"
            alt="AI Pather"
            width={160}
            height={30}
            className="brand-loader-img hidden dark:block"
            priority
          />
        </Link>

        <div className="brand-loader-bar">
          <div className="brand-loader-clipper">
            <div className="brand-loader-main-line"></div>

            {/* LIGHT MODE SHAPES GROUP */}
            <div className="brand-loader-shapes-group brand-loader-shapes-light">
              <svg viewBox="0 0 640 446" className="brand-loader-shadow-light">
                <path
                  d="M0,223 L640,204 L640,242 Z"
                  fill="var(--color-primary-dark)"
                ></path>
              </svg>
              <svg viewBox="0 0 640 446" className="brand-loader-cast-blur-light">
                <path
                  fill="var(--color-primary)"
                  d="M100,223 L640,210 C610,216 580,219 580,223 C580,227 610,230 640,236 Z"
                ></path>
              </svg>
              <svg viewBox="0 0 640 446" className="brand-loader-bar-glow-light">
                <path
                  fill="var(--color-primary)"
                  d="M0,222 C200,220.5 400,219.5 640,219.5 L640,226.5 C400,226.5 200,225.5 0,224 Z"
                ></path>
              </svg>
              <svg viewBox="0 0 640 446" className="brand-loader-mid-glow-light">
                <path
                  fill="url(#midGlowGradientLight)"
                  d="M300,223 L640,215 L640,231 Z"
                ></path>
                <defs>
                  <linearGradient
                    id="midGlowGradientLight"
                    x1="300"
                    y1="223"
                    x2="640"
                    y2="223"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop
                      offset="0"
                      stopColor="var(--color-primary)"
                      stopOpacity="0"
                    ></stop>
                    <stop
                      offset="1"
                      stopColor="var(--color-primary-light)"
                      stopOpacity="0.65"
                    ></stop>
                  </linearGradient>
                </defs>
              </svg>
              <svg viewBox="0 0 640 446" className="brand-loader-top-glow-1-light">
                <defs>
                  <linearGradient
                    id="topGlow1GradientLight"
                    x1="0"
                    y1="223"
                    x2="640"
                    y2="223"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop
                      offset="0"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    ></stop>
                    <stop
                      offset="0.7"
                      stopColor="var(--color-primary-light)"
                      stopOpacity="0.4"
                    ></stop>
                    <stop
                      offset="1"
                      stopColor="#ffffff"
                      stopOpacity="0.8"
                    ></stop>
                  </linearGradient>
                </defs>
                <path
                  fill="url(#topGlow1GradientLight)"
                  d="M0,222.5 C200,222 400,221.5 640,221.5 L640,224.5 C400,224.5 200,224 0,223.5 Z"
                ></path>
              </svg>
              <svg viewBox="0 0 640 446" className="brand-loader-top-glow-2-light">
                <defs>
                  <linearGradient
                    id="topGlow2GradientLight"
                    x1="200"
                    y1="223"
                    x2="640"
                    y2="223"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop
                      offset="0"
                      stopColor="var(--color-primary)"
                      stopOpacity="0"
                    ></stop>
                    <stop
                      offset="1"
                      stopColor="#ffffff"
                      stopOpacity="0.9"
                    ></stop>
                  </linearGradient>
                </defs>
                <path
                  fill="url(#topGlow2GradientLight)"
                  d="M200,222.5 C340,222.2 480,221.8 640,221.8 L640,224.2 C480,224.2 340,223.8 200,223.5 Z"
                ></path>
              </svg>
              <svg viewBox="0 0 640 446" className="brand-loader-top-glow-3-light">
                <defs>
                  <linearGradient
                    id="topGlow3GradientLight"
                    x1="400"
                    y1="223"
                    x2="640"
                    y2="223"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop
                      offset="0"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    ></stop>
                    <stop
                      offset="1"
                      stopColor="#ffffff"
                      stopOpacity="1"
                    ></stop>
                  </linearGradient>
                </defs>
                <path
                  fill="url(#topGlow3GradientLight)"
                  d="M400,222.5 C480,222.3 560,222 640,222 L640,224 C560,224 480,223.7 400,223.5 Z"
                ></path>
              </svg>
            </div>

            {/* DARK MODE SHAPES GROUP */}
            <div className="brand-loader-shapes-group brand-loader-shapes-dark">
              <svg viewBox="0 0 640 446" className="brand-loader-shadow-dark">
                <path
                  d="M0,223 L640,205 L640,241 Z"
                  fill="var(--color-primary-dark)"
                ></path>
              </svg>
              <svg viewBox="0 0 640 446" className="brand-loader-cast-blur-dark">
                <path
                  fill="var(--color-primary)"
                  d="M100,223 L640,212 C610,218 580,221 580,223 C580,225 610,228 640,234 Z"
                ></path>
              </svg>
              <svg viewBox="0 0 640 446" className="brand-loader-bar-glow-dark">
                <path
                  fill="var(--color-primary)"
                  d="M0,222 C200,221 400,220.5 640,220.5 L640,225.5 C400,225.5 200,225 0,224 Z"
                ></path>
              </svg>
              <svg viewBox="0 0 640 446" className="brand-loader-mid-glow-dark">
                <path
                  fill="url(#midGlowGradientDark)"
                  d="M300,223 L640,217 L640,229 Z"
                ></path>
                <defs>
                  <linearGradient
                    id="midGlowGradientDark"
                    x1="300"
                    y1="223"
                    x2="640"
                    y2="223"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop
                      offset="0"
                      stopColor="var(--color-primary)"
                      stopOpacity="0"
                    ></stop>
                    <stop
                      offset="1"
                      stopColor="var(--color-primary-light)"
                      stopOpacity="0.8"
                    ></stop>
                  </linearGradient>
                </defs>
              </svg>
              <svg viewBox="0 0 640 446" className="brand-loader-top-glow-1-dark">
                <defs>
                  <linearGradient
                    id="topGlow1GradientDark"
                    x1="0"
                    y1="223"
                    x2="640"
                    y2="223"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop
                      offset="0"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    ></stop>
                    <stop
                      offset="0.7"
                      stopColor="var(--color-primary-light)"
                      stopOpacity="0.5"
                    ></stop>
                    <stop
                      offset="1"
                      stopColor="#ffffff"
                      stopOpacity="0.9"
                    ></stop>
                  </linearGradient>
                </defs>
                <path
                  fill="url(#topGlow1GradientDark)"
                  d="M0,222.5 C200,222 400,221.5 640,221.5 L640,224.5 C400,224.5 200,224 0,223.5 Z"
                ></path>
              </svg>
              <svg viewBox="0 0 640 446" className="brand-loader-top-glow-2-dark">
                <defs>
                  <linearGradient
                    id="topGlow2GradientDark"
                    x1="200"
                    y1="223"
                    x2="640"
                    y2="223"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop
                      offset="0"
                      stopColor="var(--color-primary)"
                      stopOpacity="0"
                    ></stop>
                    <stop
                      offset="1"
                      stopColor="#ffffff"
                      stopOpacity="1"
                    ></stop>
                  </linearGradient>
                </defs>
                <path
                  fill="url(#topGlow2GradientDark)"
                  d="M200,222.5 C340,222.2 480,221.8 640,221.8 L640,224.2 C480,224.2 340,223.8 200,223.5 Z"
                ></path>
              </svg>
              <svg viewBox="0 0 640 446" className="brand-loader-top-glow-3-dark">
                <defs>
                  <linearGradient
                    id="topGlow3GradientDark"
                    x1="400"
                    y1="223"
                    x2="640"
                    y2="223"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop
                      offset="0"
                      stopColor="#ffffff"
                      stopOpacity="0"
                    ></stop>
                    <stop
                      offset="1"
                      stopColor="#ffffff"
                      stopOpacity="1"
                    ></stop>
                  </linearGradient>
                </defs>
                <path
                  fill="url(#topGlow3GradientDark)"
                  d="M400,222.5 C480,222.3 560,222 640,222 L640,224 C560,224 480,223.7 400,223.5 Z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {message && <p className="brand-loader-message">{message}</p>}
      </div>
    </div>
  );
}
