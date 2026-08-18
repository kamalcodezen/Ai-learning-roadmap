"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll } from "motion/react";
import ProblemHeader from "./ProblemHeader";
import EvolvingSystemVisual from "./EvolvingSystemVisual";
import ReadinessComparison from "./ReadinessComparison";

const narrativeStates = [
  {
    id: "01",
    eyebrow: "STATE 01",
    title: "Course Progress",
    description: "Static roadmaps measure what you completed. The system tracks completion, leaving you with a false sense of security.",
  },
  {
    id: "02",
    eyebrow: "STATE 02",
    title: "Knowledge \u2260 Job Readiness",
    description: "Finishing lessons doesn't guarantee you can build, solve, explain, and prove your skills. Completion is not capability.",
  },
  {
    id: "03",
    eyebrow: "STATE 03",
    title: "Invisible Learning Debt",
    description: "A missing foundation can quietly make every advanced topic harder. You are left guessing what went wrong.",
  },
  {
    id: "04",
    eyebrow: "STATE 04",
    title: "Abandonment & Guilt",
    description: "When life interrupts learning, a static roadmap can turn a short break into a full stop. It punishes absence instead of adapting.",
  }
];

export default function ProblemBreakdown() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [activeState, setActiveState] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (latest < 0.25) setActiveState(0);
      else if (latest < 0.5) setActiveState(1);
      else if (latest < 0.75) setActiveState(2);
      else setActiveState(3);
    });
  }, [scrollYProgress]);

  return (
    <section className="bg-background pt-24 md:pt-32 pb-16 border-t border-border">
      <div className="container-custom max-w-6xl mx-auto">
        <ProblemHeader />
        
        {/* MOBILE: Vertical Stack */}
        <div className="lg:hidden mt-16 flex flex-col gap-16">
           {narrativeStates.map((state, idx) => (
             <div key={state.id} className="flex flex-col gap-6">
                <div className="bg-card border border-border rounded-xl h-[380px] p-6 relative overflow-hidden flex items-center justify-center">
                   <EvolvingSystemVisual activeState={idx} />
                </div>
                <div>
                   <span className="text-[12px] font-mono tracking-widest text-muted-foreground uppercase mb-2 block">{state.eyebrow}</span>
                   <h3 className="text-2xl font-sans font-medium text-foreground mb-3">{state.title}</h3>
                   <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">{state.description}</p>
                </div>
             </div>
           ))}
        </div>

        {/* DESKTOP: Sticky Scroll Story */}
        <div ref={containerRef} className="hidden lg:flex relative mt-32 items-start h-[400vh]">
          {/* LEFT: Persistent Visual Area (55%) */}
          <div className="sticky top-32 w-[55%] h-[65vh] bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
             {/* Window UI Header */}
             <div className="px-6 py-4 border-b border-border bg-card-soft flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase">Learning System</span>
                <div className="flex gap-1.5">
                   <span className="w-2.5 h-2.5 rounded-full bg-border" />
                   <span className="w-2.5 h-2.5 rounded-full bg-border" />
                   <span className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
             </div>
             {/* Dynamic Stage */}
             <div className="relative flex-1 w-full h-full p-8 flex items-center justify-center bg-background/30">
               <EvolvingSystemVisual activeState={activeState} />
             </div>
          </div>

          {/* RIGHT: Scrolling Narrative Area (45%) */}
          <div className="w-[45%] flex flex-col items-center z-10">
            {narrativeStates.map((state, idx) => (
              <div key={state.id} className="h-[100vh] flex flex-col justify-center pl-16 pr-8 w-full">
                <motion.div
                  initial={{ opacity: 0.3 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ margin: "-45% 0px -45% 0px" }}
                  transition={{ duration: 0.4 }}
                  className={`border-l-2 pl-8 py-2 transition-colors duration-500 ${activeState === idx ? 'border-primary' : 'border-border/40'}`}
                >
                  <span className={`text-[12px] font-mono tracking-[0.15em] uppercase mb-4 block transition-colors duration-500 ${activeState === idx ? 'text-primary' : 'text-muted-foreground'}`}>
                    {state.eyebrow}
                  </span>
                  <h3 className={`text-[32px] leading-tight font-sans font-medium mb-4 transition-colors duration-500 ${activeState === idx ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {state.title}
                  </h3>
                  <p className={`text-[17px] leading-relaxed transition-colors duration-500 ${activeState === idx ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                    {state.description}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Climax */}
        <div className="mt-32 md:mt-40">
           <ReadinessComparison />
        </div>
      </div>
    </section>
  )
}
