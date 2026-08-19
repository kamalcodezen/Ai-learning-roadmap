export interface NarrativeState {
  id: string;
  eyebrow: string;
  tag: string;
  title: string;
  description: string;
}

export const narrativeStates: NarrativeState[] = [
  {
    id: "01",
    eyebrow: "PHASE 01",
    tag: "CAPABILITY GAP",
    title: "Knowledge ≠ Job Readiness",
    description:
      "Finishing lessons doesn't guarantee you can build, solve, explain, and prove your skills. Course completion is not engineering capability.",
  },
  {
    id: "02",
    eyebrow: "PHASE 02",
    tag: "ARCHITECTURAL DEBT",
    title: "Invisible Learning Debt",
    description:
      "A missing foundational concept quietly makes every advanced topic harder. You are left guessing why complex patterns break.",
  },
  {
    id: "03",
    eyebrow: "PHASE 03",
    tag: "SYSTEM ADAPTATION",
    title: "Abandonment & Guilt",
    description:
      "When life interrupts learning, static roadmaps turn a short break into a full stop. The system must adapt dynamically to your pace.",
  },
];
