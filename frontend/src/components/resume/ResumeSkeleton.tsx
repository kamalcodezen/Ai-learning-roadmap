"use client";

export default function ResumeSkeleton() {
  return (
    <div className="min-h-screen w-full md:px-4 py-8 max-w-8xl mx-auto space-y-6 animate-pulse select-none">
      {/* ── Top Header Command Hub Skeleton ── */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-card border border-border/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-6 w-32 rounded-full bg-primary/15 border border-primary/25" />
              <div className="h-6 w-36 rounded-full bg-muted/80 border border-border" />
              <div className="h-6 w-28 rounded-full bg-primary/10 border border-primary/20" />
            </div>

            {/* Title */}
            <div className="h-8 w-64 sm:w-80 rounded-lg bg-muted/80" />

            {/* Subtitle */}
            <div className="h-4 w-full max-w-xl rounded bg-muted/60" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="h-10 w-36 rounded-xl bg-muted/70 border border-border" />
            <div className="h-10 w-36 rounded-xl bg-muted/70 border border-border" />
            <div className="h-10 w-32 rounded-xl bg-primary/30" />
          </div>
        </div>
      </div>

      {/* ── Studio Navigation Tabs Skeleton ── */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2 overflow-x-auto">
        <div className="h-9 w-28 rounded-xl bg-primary/25" />
        <div className="h-9 w-28 rounded-xl bg-muted/60" />
        <div className="h-9 w-28 rounded-xl bg-muted/60" />
        <div className="h-9 w-36 rounded-xl bg-muted/60" />
        <div className="h-9 w-28 rounded-xl bg-muted/60" />
      </div>

      {/* ── Workspace Grid (Left Sections Nav + Right Main Form) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section Navigation */}
        <div className="lg:col-span-3 space-y-2.5 p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
          <div className="h-4 w-28 rounded bg-muted/80 mb-3" />
          <div className="h-9 w-full rounded-xl bg-primary/15 border border-primary/20" />
          <div className="h-9 w-full rounded-xl bg-muted/50" />
          <div className="h-9 w-full rounded-xl bg-muted/50" />
          <div className="h-9 w-full rounded-xl bg-muted/50" />
          <div className="h-9 w-full rounded-xl bg-muted/50" />
          <div className="h-9 w-full rounded-xl bg-muted/50" />
          <div className="h-9 w-full rounded-xl bg-muted/50" />
        </div>

        {/* Right Main Form Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Card 1: Personal Info */}
          <div className="p-6 sm:p-7 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="h-5 w-48 rounded bg-muted/80" />
              <div className="h-4 w-20 rounded bg-muted/60" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="h-3.5 w-20 rounded bg-muted/60" />
                <div className="h-10 w-full rounded-xl bg-muted/40 border border-border/60" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3.5 w-20 rounded bg-muted/60" />
                <div className="h-10 w-full rounded-xl bg-muted/40 border border-border/60" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3.5 w-24 rounded bg-muted/60" />
                <div className="h-10 w-full rounded-xl bg-muted/40 border border-border/60" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3.5 w-20 rounded bg-muted/60" />
                <div className="h-10 w-full rounded-xl bg-muted/40 border border-border/60" />
              </div>
            </div>
          </div>

          {/* Card 2: Professional Summary */}
          <div className="p-6 sm:p-7 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="h-5 w-44 rounded bg-muted/80" />
              <div className="h-7 w-28 rounded-lg bg-primary/20" />
            </div>
            <div className="h-24 w-full rounded-xl bg-muted/40 border border-border/60" />
          </div>

          {/* Card 3: Skills Section */}
          <div className="p-6 sm:p-7 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="h-5 w-40 rounded bg-muted/80" />
              <div className="h-7 w-24 rounded-lg bg-muted/60" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-52 rounded bg-muted/70" />
              <div className="flex flex-wrap gap-2">
                <div className="h-7 w-20 rounded-lg bg-primary/15 border border-primary/25" />
                <div className="h-7 w-24 rounded-lg bg-primary/15 border border-primary/25" />
                <div className="h-7 w-16 rounded-lg bg-primary/15 border border-primary/25" />
                <div className="h-7 w-28 rounded-lg bg-primary/15 border border-primary/25" />
                <div className="h-7 w-20 rounded-lg bg-primary/15 border border-primary/25" />
                <div className="h-7 w-24 rounded-lg bg-primary/15 border border-primary/25" />
              </div>
            </div>
          </div>

          {/* Card 4: Work Experience */}
          <div className="p-6 sm:p-7 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="h-5 w-44 rounded bg-muted/80" />
              <div className="h-7 w-28 rounded-lg bg-muted/60" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-40 rounded bg-muted/70" />
                <div className="h-4 w-28 rounded bg-muted/60" />
              </div>
              <div className="h-3.5 w-full max-w-lg rounded bg-muted/50" />
              <div className="h-3.5 w-full max-w-md rounded bg-muted/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
