import { Rocket } from "lucide-react";
import Button from "@/src/components/ui/button";
import type { Track } from "@/src/data/tracks";

export default function TrackCta({ track }: { track: Track }) {
  return (
    <section className="section-pad relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
      <div className="global-pos">
        {/* Decorative background */}
        <div className="absolute inset-x-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[320px] w-[1100px] rounded-[100%] bg-secondary/20 blur-[140px] pointer-events-none -z-10" />

        <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/12 via-card to-card px-6 py-14 sm:px-12 sm:py-20 text-center">
          {/* Glow orbs inside card */}
          <div className="absolute -top-20 -left-20 size-64 rounded-full bg-primary/25 blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-16 size-64 rounded-full bg-secondary/25 blur-[90px] pointer-events-none" />

          <span className="relative inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Rocket className="size-3.5" />
            Your Move Starts Here
          </span>

          <h2 className="relative mt-6 font-poppins text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance max-w-3xl mx-auto">
            {track.ctaHeadline}
          </h2>

          <p className="relative mt-4 font-poppins text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Take a free AI diagnostic, get your personalized {track.title}{" "}
            roadmap, and start turning learning into verified career proof —
            interviews, projects, and everything in between.
          </p>

          <div className="relative mt-9 mx-auto w-fit">
            <Button text={track.ctaButton} href="/dashboard/learner" className="w-fit"/>
          </div>

          <p className="relative mt-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Free to start · No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}