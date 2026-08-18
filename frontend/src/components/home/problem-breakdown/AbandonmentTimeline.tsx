"use client";
import { motion } from "motion/react";

export default function AbandonmentTimeline() {
  const days = Array.from({length: 12}, (_, i) => i + 1);

  return (
    <div className="w-full max-w-[340px] flex flex-col font-sans p-2">
      <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-8 text-center block">Learning Rhythm</span>

      <div className="flex flex-col items-center w-full">
         <div className="flex justify-between w-full text-[10px] font-mono text-muted-foreground/60 mb-3 px-1">
            <span>01</span>
            <span>12</span>
         </div>
         
         <div className="flex justify-between w-full gap-1 mb-10">
            {days.map((day) => {
               const isCompleted = day <= 4;
               return (
                 <motion.div 
                   key={day}
                   initial={{ scale: 0, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ delay: day * 0.04 }}
                   className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center ${isCompleted ? 'bg-foreground/5 border-foreground/30 text-foreground' : 'bg-transparent border-border/60 text-transparent'}`}
                 >
                   {isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-foreground" />}
                 </motion.div>
               )
            })}
         </div>

         <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6 }}
           className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-xl w-full"
         >
           <span className="text-[13px] font-medium text-foreground tracking-widest mb-1 uppercase">12 Days Off Track</span>
           <div className="w-8 h-px bg-border my-4" />
           <span className="text-[15px] text-muted-foreground mb-1">You don&apos;t need to restart.</span>
           <span className="text-[15px] font-medium text-foreground">Your roadmap adapts.</span>
         </motion.div>
      </div>
    </div>
  )
}
