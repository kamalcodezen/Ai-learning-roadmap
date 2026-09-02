export interface RequiredSkill {
  skill: string;
  critical: boolean;
}

export const CAREER_SKILLS_MAP: Record<string, RequiredSkill[]> = {
  "Software Engineer": [
    { skill: "Data Structures", critical: true },
    { skill: "Algorithms", critical: true },
    { skill: "Git", critical: true },
    { skill: "System Design", critical: false },
    { skill: "Testing", critical: false },
  ],
  "Frontend Developer": [
    { skill: "JavaScript", critical: true },
    { skill: "TypeScript", critical: true },
    { skill: "React", critical: true },
    { skill: "HTML/CSS", critical: true },
    { skill: "Testing", critical: false },
    { skill: "Performance Optimization", critical: false },
  ],
  "Backend Developer": [
    { skill: "Node.js", critical: true },
    { skill: "TypeScript", critical: true },
    { skill: "PostgreSQL", critical: true },
    { skill: "API Design", critical: true },
    { skill: "Docker", critical: false },
    { skill: "Automated Testing", critical: false },
  ],
  "Full Stack Developer": [
    { skill: "JavaScript", critical: true },
    { skill: "TypeScript", critical: true },
    { skill: "React", critical: true },
    { skill: "Node.js", critical: true },
    { skill: "SQL", critical: true },
    { skill: "Git", critical: true },
    { skill: "Docker", critical: false },
  ],
  "Data Scientist": [
    { skill: "Python", critical: true },
    { skill: "SQL", critical: true },
    { skill: "Machine Learning", critical: true },
    { skill: "Statistics", critical: true },
    { skill: "Data Visualization", critical: false },
  ]
};

export const FALLBACK_SKILLS: RequiredSkill[] = [
  { skill: "Programming Fundamentals", critical: true },
  { skill: "Version Control", critical: true },
  { skill: "Problem Solving", critical: true },
  { skill: "Communication", critical: false },
];
