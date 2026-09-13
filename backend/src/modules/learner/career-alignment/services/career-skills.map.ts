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
  ],
  "AI / ML Engineer": [
    { skill: "Python", critical: true },
    { skill: "Machine Learning", critical: true },
    { skill: "Deep Learning", critical: true },
    { skill: "PyTorch", critical: true },
    { skill: "LLM / Prompt Engineering", critical: false },
    { skill: "MLOps", critical: false },
  ],
  "DevOps Engineer": [
    { skill: "Linux", critical: true },
    { skill: "Docker", critical: true },
    { skill: "Kubernetes", critical: true },
    { skill: "CI/CD", critical: true },
    { skill: "AWS / Cloud", critical: true },
    { skill: "Terraform", critical: false },
  ],
  "Data Engineer": [
    { skill: "Python", critical: true },
    { skill: "SQL", critical: true },
    { skill: "Data Warehousing", critical: true },
    { skill: "ETL / Spark", critical: true },
    { skill: "PostgreSQL", critical: false },
  ],
  "Mobile Developer": [
    { skill: "React Native", critical: true },
    { skill: "TypeScript", critical: true },
    { skill: "Mobile State Management", critical: true },
    { skill: "REST API Integration", critical: true },
    { skill: "App Deployment", critical: false },
  ],
};

export const FALLBACK_SKILLS: RequiredSkill[] = [
  { skill: "Programming Fundamentals", critical: true },
  { skill: "Version Control", critical: true },
  { skill: "Problem Solving", critical: true },
  { skill: "Communication", critical: false },
];

export function getRequiredSkillsForRole(roleName?: string | null): RequiredSkill[] {
  if (!roleName) return FALLBACK_SKILLS;

  // 1. Direct match
  if (CAREER_SKILLS_MAP[roleName]) {
    return CAREER_SKILLS_MAP[roleName];
  }

  // 2. Normalized match
  const clean = roleName.toLowerCase().replace(/[_-]/g, " ").trim();

  for (const [key, skills] of Object.entries(CAREER_SKILLS_MAP)) {
    const keyClean = key.toLowerCase().replace(/[_-]/g, " ").trim();
    if (clean === keyClean || clean.includes(keyClean) || keyClean.includes(clean)) {
      return skills;
    }
  }

  // Alias matches
  if (clean.includes("frontend") || clean.includes("front end") || clean.includes("ui")) {
    return CAREER_SKILLS_MAP["Frontend Developer"] || FALLBACK_SKILLS;
  }
  if (clean.includes("backend") || clean.includes("back end") || clean.includes("server")) {
    return CAREER_SKILLS_MAP["Backend Developer"] || FALLBACK_SKILLS;
  }
  if (clean.includes("full stack") || clean.includes("fullstack") || clean.includes("web developer")) {
    return CAREER_SKILLS_MAP["Full Stack Developer"] || FALLBACK_SKILLS;
  }
  if (clean.includes("ai") || clean.includes("ml") || clean.includes("machine learning")) {
    return CAREER_SKILLS_MAP["AI / ML Engineer"] || FALLBACK_SKILLS;
  }
  if (clean.includes("devops") || clean.includes("cloud") || clean.includes("sre")) {
    return CAREER_SKILLS_MAP["DevOps Engineer"] || FALLBACK_SKILLS;
  }
  if (clean.includes("data sci") || clean.includes("data analy")) {
    return CAREER_SKILLS_MAP["Data Scientist"] || FALLBACK_SKILLS;
  }
  if (clean.includes("data eng")) {
    return CAREER_SKILLS_MAP["Data Engineer"] || FALLBACK_SKILLS;
  }
  if (clean.includes("mobile") || clean.includes("ios") || clean.includes("android") || clean.includes("react native") || clean.includes("flutter")) {
    return CAREER_SKILLS_MAP["Mobile Developer"] || FALLBACK_SKILLS;
  }
  if (clean.includes("software") || clean.includes("engineer") || clean.includes("developer")) {
    return CAREER_SKILLS_MAP["Software Engineer"] || FALLBACK_SKILLS;
  }

  return FALLBACK_SKILLS;
}
