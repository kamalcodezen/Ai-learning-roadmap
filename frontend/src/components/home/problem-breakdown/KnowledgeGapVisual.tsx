"use client";
import { motion, AnimatePresence } from "motion/react";

export default function KnowledgeGapVisual({ variant }: { variant: "progress" | "capability" }) {
  const capabilities = ["Build", "Debug", "Explain", "Solve", "Deploy", "Prove"];

  return (
    <div className="w-full max-w-sm flex flex-col font-sans">
      <motion.div layout className="flex flex-col mb-6 p-6 bg-card border border-border rounded-xl">
        <span className="text-caption font-mono uppercase tracking-[0.15em] text-muted-foreground mb-6">Learning Progress</span>
        
        {variant === "progress" && (
           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-3 mb-8 text-small font-medium text-muted-foreground">
             <div className="flex justify-between items-center"><span className="uppercase tracking-wide text-caption">Lessons</span><span className="font-mono text-foreground">32 / 40</span></div>
             <div className="flex justify-between items-center"><span className="uppercase tracking-wide text-caption">Quizzes</span><span className="font-mono text-foreground">18 / 20</span></div>
           </motion.div>
        )}

        <div className="flex justify-between items-end mb-2">
           <span className="text-caption font-medium text-foreground uppercase tracking-widest">Progress</span>
           <span className="text-2xl font-mono text-foreground">80%</span>
        </div>
        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden mb-1">
           <motion.div layout className="h-full bg-foreground" style={{ width: "80%" }} />
        </div>
        <div className="flex justify-end">
           <span className="text-caption font-mono text-muted-foreground uppercase tracking-widest">Complete</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {variant === "capability" && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ delay: 0.1 }}
            className="flex flex-col p-6 bg-card border border-border rounded-xl"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-semibold text-foreground">BUT...</span>
              <span className="text-caption font-mono uppercase tracking-widest text-muted-foreground">Can you actually:</span>
            </div>
            
            <div className="flex flex-col gap-0">
               {capabilities.map((cap) => (
                 <div key={cap} className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
                   <span className="text-small text-muted-foreground">{cap}</span>
                   <span className="w-3.5 h-3.5 rounded-full border border-border/80 flex items-center justify-center bg-background/50" />
                 </div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
