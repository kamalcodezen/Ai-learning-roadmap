"use client";
import { AnimatePresence, motion } from "motion/react";
import KnowledgeGapVisual from "./KnowledgeGapVisual";
import LearningDebtVisual from "./LearningDebtVisual";
import AbandonmentTimeline from "./AbandonmentTimeline";

export default function EvolvingSystemVisual({ activeState }: { activeState: number }) {
  return (
    <div className="w-full h-full relative">
      <AnimatePresence mode="wait">
        {activeState === 0 && (
          <motion.div key="state0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 flex items-center justify-center">
            <KnowledgeGapVisual variant="progress" />
          </motion.div>
        )}
        {activeState === 1 && (
          <motion.div key="state1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 flex items-center justify-center">
            <KnowledgeGapVisual variant="capability" />
          </motion.div>
        )}
        {activeState === 2 && (
          <motion.div key="state2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 flex items-center justify-center">
            <LearningDebtVisual />
          </motion.div>
        )}
        {activeState === 3 && (
          <motion.div key="state3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 flex items-center justify-center">
            <AbandonmentTimeline />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
