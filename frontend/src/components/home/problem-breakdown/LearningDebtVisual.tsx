"use client";
import { motion } from "motion/react";

export default function LearningDebtVisual() {
  const nodes = [
    { label: "JavaScript Basics", status: "solid" },
    { label: "Functions", status: "solid" },
    { label: "Async / Promises", status: "weak" },
    { label: "React", status: "affected" },
    { label: "Hooks", status: "affected" },
    { label: "Advanced App", status: "affected" },
  ];

  return (
    <div className="w-full max-w-lg flex flex-col font-sans justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex flex-col p-6 bg-card border border-border rounded-md"
      >
        <span className="text-caption font-mono uppercase tracking-[0.15em] text-muted-foreground mb-6">Learning Debt</span>
        
        <div className="flex flex-row relative w-full overflow-x-auto pb-2 pt-2 hide-scrollbar">
          {/* Horizontal connecting line */}
          <div className="absolute top-[20px] left-[40px] right-[40px] h-px bg-border z-0" />
          
          {nodes.map((node, i) => {
            const isSolid = node.status === "solid";
            const isWeak = node.status === "weak";
            const isAffected = node.status === "affected";

            return (
              <motion.div 
                key={node.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="flex flex-col items-center gap-3 relative z-10 shrink-0 w-[85px]"
              >
                {/* Node Box */}
                <div className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center bg-card border ${isSolid ? 'border-foreground/40' : isWeak ? 'border-amber-500' : 'border-border'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isSolid ? 'bg-foreground' : isWeak ? 'bg-amber-500' : 'bg-transparent'}`} />
                </div>

                {/* Node Text */}
                <div className={`flex flex-col items-center w-full px-1 ${isAffected ? 'opacity-40' : 'opacity-100'}`}>
                  <span className={`text-[11px] leading-tight text-center tracking-tight ${isAffected ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                    {node.label}
                  </span>
                  {isWeak && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: "auto" }}
                       transition={{ delay: 0.6 }}
                       className="mt-1 flex flex-col items-center"
                     >
                       <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest mt-1">
                         \u26A0 GAP
                       </span>
                     </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
