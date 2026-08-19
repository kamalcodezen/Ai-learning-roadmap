/**
 * Inline keyframe animations for the ProblemBreakdown section.
 * Kept as a component so they are only mounted once when ProblemBreakdown renders.
 */
export default function ProblemBreakdownStyles() {
  return (
    <style>{`
      @keyframes waveFloat {
        0% { transform: translateX(0) scaleY(1); }
        50% { transform: translateX(-25%) scaleY(1.12); }
        100% { transform: translateX(0) scaleY(1); }
      }
      @keyframes waveFloatReverse {
        0% { transform: translateX(-25%) scaleY(1.08); }
        50% { transform: translateX(0) scaleY(1); }
        100% { transform: translateX(-25%) scaleY(1.08); }
      }
      @keyframes pulseBeam {
        0%, 100% { opacity: 0.8; transform: scaleX(0.96); }
        50% { opacity: 1; transform: scaleX(1.04); filter: drop-shadow(0 0 12px rgb(var(--primary))); }
      }
      @keyframes wirePulse {
        0% { transform: translateY(-100%); opacity: 0; }
        30% { opacity: 1; }
        70% { opacity: 1; }
        100% { transform: translateY(220%); opacity: 0; }
      }
      .anim-wave-primary {
        animation: waveFloat 14s ease-in-out infinite;
      }
      .anim-wave-secondary {
        animation: waveFloatReverse 18s ease-in-out infinite;
      }
      .anim-beam {
        animation: pulseBeam 4s ease-in-out infinite;
      }
      .anim-wire-signal {
        animation: wirePulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `}</style>
  );
}
