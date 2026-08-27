import { Sparkles } from "lucide-react";

export function OnboardingHeader() {
  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-primary/20
              bg-primary/10
              shadow-[0_0_30px_rgba(206,255,31,0.08)]
            "
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div>
            <div className="text-sm font-bold tracking-tight">CareerOS</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              AI Career Learning OS
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            STEP 01
          </span>
          <span className="text-xs text-muted-foreground">
            Career Profile
          </span>
        </div>
      </header>

      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Initialization
          </span>
          <span className="text-xs text-muted-foreground">1 of 3</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 rounded-full bg-primary shadow-[0_0_12px_rgba(206,255,31,0.5)]" />
        </div>
      </div>

      <div className="mb-10 max-w-4xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.05] px-3 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            Career Twin Initialization
          </span>
        </div>
        <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
          Build the career path
          <br />
          <span className="text-muted-foreground">
            that actually fits you.
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          Tell CareerOS where you want to go and where you are starting from.
          We&apos;ll use this information to shape your diagnostic, adaptive
          roadmap, and Career Twin.
        </p>
      </div>
    </>
  );
}
