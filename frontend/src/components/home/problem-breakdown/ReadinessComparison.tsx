"use client";


export default function ReadinessComparison() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 border-t border-border">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
         <div className="flex flex-col items-center">
            <span className="text-6xl md:text-[80px] font-sans font-medium text-muted-foreground/50 tracking-tighter leading-none">80%</span>
            <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-muted-foreground mt-4">Complete</span>
         </div>
         
         <span className="text-4xl md:text-6xl font-light text-border my-4 md:my-0">\u2260</span>

         <div className="flex flex-col items-center relative">
            <span className="text-6xl md:text-[80px] font-sans font-medium text-foreground tracking-tighter leading-none relative z-10">80%</span>
            <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-primary mt-4 relative z-10">Job Ready</span>
         </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-16 max-w-[300px] md:max-w-none">
         {["BUILD", "SOLVE", "EXPLAIN", "PROVE"].map((cap) => (
            <span key={cap} className="px-5 py-2 border border-border bg-card rounded-full text-[12px] font-mono tracking-widest text-foreground shadow-sm">
               {cap}
            </span>
         ))}
      </div>

      <div className="mt-32 flex flex-col items-center">
         <p className="text-[20px] text-muted-foreground mb-2">
            Learning needs more than progress tracking.
         </p>
         <p className="text-[20px] text-foreground font-medium max-w-[500px] leading-relaxed">
            It needs an adaptive system that understands where you are, what you&apos;re missing, and what you should do next.
         </p>
         
         <div className="mt-20 flex flex-col items-center text-muted-foreground/50 gap-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em]">See how it works</span>
            <div className="w-px h-16 bg-gradient-to-b from-border to-transparent" />
         </div>
      </div>
    </div>
  )
}
