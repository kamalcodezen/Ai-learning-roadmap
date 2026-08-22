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
    <div className="w-full max-w-xs flex flex-col font-sans p-2">
       <div className="flex flex-col relative w-full">
         <div className="absolute left-[11px] top-3 bottom-5 w-px bg-border z-0" />
         
         {nodes.map((node, i) => {
           const isSolid = node.status === "solid";
           const isWeak = node.status === "weak";
           const isAffected = node.status === "affected";

           return (
             <motion.div 
               key={node.label}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.08, duration: 0.3 }}
               className="flex items-start gap-5 mb-5 last:mb-0 relative z-10 w-full"
             >
               <div className={`w-6 h-6 mt-0.5 shrink-0 rounded-md flex items-center justify-center bg-card border ${isSolid ? 'border-foreground/40' : isWeak ? 'border-amber-500' : 'border-border'}`}>
                 <div className={`w-1.5 h-1.5 rounded-full ${isSolid ? 'bg-foreground' : isWeak ? 'bg-amber-500' : 'bg-transparent'}`} />
               </div>

               <div className={`flex flex-col w-full pb-3 border-b border-border/40 last:border-0 ${isAffected ? 'opacity-40' : 'opacity-100'}`}>
                 <span className={`text-body tracking-tight ${isAffected ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                   {node.label}
                 </span>
                 {isWeak && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ delay: 0.6 }}
                      className="mt-1 flex flex-col"
                    >
                      <span className="text-caption font-mono text-amber-500 uppercase tracking-widest mt-1">
                        \u26A0 GAP
                      </span>
                    </motion.div>
                 )}
               </div>
             </motion.div>
           )
         })}
       </div>
    </div>
  )
}
