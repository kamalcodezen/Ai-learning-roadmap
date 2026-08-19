export interface Capability {
  tag: string;
  label: string;
  tutorial: string;
  adaptiveOs: string;
}

export const capabilities: Capability[] = [
  {
    tag: "BUILD",
    label: "Production-Grade Architecture",
    tutorial: "Following copy-paste repos without architecture rationale.",
    adaptiveOs: "Self-driven modular system design with failure edge-cases.",
  },
  {
    tag: "SOLVE",
    label: "Real Bug Diagnosis & Debugging",
    tutorial: "Pre-recorded error-free code walkthroughs.",
    adaptiveOs: "Real-time AI injected breaking changes and bug fixes.",
  },
  {
    tag: "EXPLAIN",
    label: "System Design & Interview Articulation",
    tutorial: "Memorizing multiple choice quiz questions.",
    adaptiveOs: "Architectural defense & interactive system articulation.",
  },
  {
    tag: "PROVE",
    label: "Verifiable Proof-of-Work",
    tutorial: "Static PDF course completion certificates.",
    adaptiveOs: "Live cryptographic competency graph verified by skill tests.",
  },
];
