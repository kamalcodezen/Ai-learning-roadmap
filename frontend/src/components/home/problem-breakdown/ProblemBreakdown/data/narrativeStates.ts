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
    tag: "KNOWLEDGE ≠ CAPABILITY",
    title: "Completing Lessons Isn't Mastery",
    description:
      "Finishing courses and quizzes doesn't prove you can build, solve, explain, or apply what you've learned.",
  },
  {
    id: "02",
    eyebrow: "PHASE 02",
    tag: "HIDDEN SKILL GAPS",
    title: "You Can Learn Without Knowing What You're Missing",
    description:
      "Static learning paths can't identify the foundational gaps that quietly hold you back from more advanced skills.",
  },
  {
    id: "03",
    eyebrow: "PHASE 03",
    tag: "NO SYSTEM ADAPTATION",
    title: "Your Learning Path Doesn't Adapt",
    description:
      "When you struggle, move faster, or fall behind, a static path keeps going instead of adjusting to what you actually need.",
  },
];
