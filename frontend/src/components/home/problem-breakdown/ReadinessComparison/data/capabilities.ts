export interface ProofPillar {
  id: "build" | "solve" | "explain" | "prove";
  title: string;
  // Main Card
  mainHeadline: string;
  mainDescription: string;
  progressText: string;
  // Old Way Card
  oldWayLabel: string;
  oldWayHeadline: string;
  oldWayDescription: string;
  oldWaySignal: string;
  // Evidence Card
  evidenceSignals: string[];
  // Takeaway Card
  takeaway: string;
}

export const proofPillars: ProofPillar[] = [
  {
    id: "build",
    title: "BUILD",
    mainHeadline: "Build without a script",
    mainDescription: "Turn knowledge into real work by making decisions, handling trade-offs, and creating something you can call your own",
    progressText: "01 / 04 — BUILD",
    oldWayLabel: "THE OLD WAY",
    oldWayHeadline: "Watching isn't building",
    oldWayDescription: "Following instructions and copying tutorials can show consistency, but not independent capability",
    oldWaySignal: "LOW EVIDENCE",
    evidenceSignals: ["Architecture choices", "Feature implementation", "Project complexity"],
    takeaway: "Real readiness starts when the instructions stop"
  },
  {
    id: "solve",
    title: "SOLVE",
    mainHeadline: "Solve the unknown",
    mainDescription: "Face broken states, edge cases, failed attempts, and real constraints — then find your own path forward",
    progressText: "02 / 04 — SOLVE",
    oldWayLabel: "WHEN THE TUTORIAL BREAKS",
    oldWayHeadline: "No answer key",
    oldWayDescription: "When the next step isn't provided, passive learning often stops being enough",
    oldWaySignal: "PROGRESS STOPS",
    evidenceSignals: ["Problem decomposition", "Debugging process", "Decision quality"],
    takeaway: "Real skill appears when the answer isn't already on the screen"
  },
  {
    id: "explain",
    title: "EXPLAIN",
    mainHeadline: "Make your reasoning visible",
    mainDescription: "Explain your decisions, trade-offs, and technical choices in your own words",
    progressText: "03 / 04 — EXPLAIN",
    oldWayLabel: "\"IT WORKS\"",
    oldWayHeadline: "But do you know why?",
    oldWayDescription: "Getting a result is different from understanding the decisions that created it",
    oldWaySignal: "WEAK UNDERSTANDING",
    evidenceSignals: ["Concept clarity", "Technical reasoning", "Decision rationale"],
    takeaway: "If you can't explain your choices, you probably don't fully own them"
  },
  {
    id: "prove",
    title: "PROVE",
    mainHeadline: "Show the evidence",
    mainDescription: "Connect real projects, assessments, decisions, and outcomes to the skills you claim",
    progressText: "04 / 04 — PROVE",
    oldWayLabel: "SELF-REPORTED SKILL",
    oldWayHeadline: "\"I know this\"",
    oldWayDescription: "A skill claim without evidence is difficult for anyone else to evaluate",
    oldWaySignal: "CLAIM WITHOUT PROOF",
    evidenceSignals: ["Verified projects", "Skill evidence", "Readiness signals"],
    takeaway: "Don't just say what you know. Show what you've done."
  }
];
