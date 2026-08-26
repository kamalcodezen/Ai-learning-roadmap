export type CareerTrackCategory =
  | "software"
  | "ai-data"
  | "cloud-infrastructure"
  | "other";

export type CareerTrack = {
  id: string;
  title: string;
  description: string;
  category: CareerTrackCategory;
  popular?: boolean;
};

export const careerTracks: CareerTrack[] = [
  // Software Engineering
  {
    id: "frontend",
    title: "Frontend Developer",
    description:
      "Build modern web interfaces with React, Next.js, and TypeScript.",
    category: "software",
    popular: true,
  },
  {
    id: "backend",
    title: "Backend Developer",
    description:
      "Build APIs, services, databases, and scalable backend systems.",
    category: "software",
    popular: true,
  },
  {
    id: "fullstack",
    title: "Full Stack Developer",
    description:
      "Build complete products across frontend, backend, and deployment.",
    category: "software",
    popular: true,
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    description:
      "Strengthen programming, problem solving, systems, and production engineering.",
    category: "software",
    popular: true,
  },
  {
    id: "mobile",
    title: "Mobile App Developer",
    description: "Build production mobile applications for Android and iOS.",
    category: "software",
  },

  // AI & Data
  {
    id: "ai-engineer",
    title: "AI Engineer",
    description:
      "Build AI-powered applications, LLM systems, agents, and intelligent products.",
    category: "ai-data",
    popular: true,
  },
  {
    id: "machine-learning",
    title: "Machine Learning Engineer",
    description: "Build, train, evaluate, and deploy machine learning systems.",
    category: "ai-data",
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    description:
      "Use statistics, Python, machine learning, and experimentation to solve problems.",
    category: "ai-data",
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    description:
      "Turn business data into insights using SQL, analytics, and visualization.",
    category: "ai-data",
  },
  {
    id: "data-engineer",
    title: "Data Engineer",
    description:
      "Build reliable data pipelines, warehouses, and processing systems.",
    category: "ai-data",
  },

  // Cloud & Infrastructure
  {
    id: "devops",
    title: "DevOps Engineer",
    description:
      "Automate delivery, infrastructure, CI/CD, monitoring, and operations.",
    category: "cloud-infrastructure",
  },
  {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    description:
      "Design and operate scalable infrastructure across modern cloud platforms.",
    category: "cloud-infrastructure",
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Engineer",
    description:
      "Build secure applications, systems, networks, and security workflows.",
    category: "cloud-infrastructure",
  },
  {
    id: "qa-automation",
    title: "QA / Automation Engineer",
    description:
      "Build reliable automated testing and quality engineering systems.",
    category: "cloud-infrastructure",
  },

  // Other Engineering
  {
    id: "embedded-iot",
    title: "Embedded / IoT Engineer",
    description:
      "Build connected devices, embedded systems, sensors, and IoT products.",
    category: "other",
  },
  {
    id: "game-developer",
    title: "Game Developer",
    description: "Create interactive games and real-time experiences.",
    category: "other",
  },
  {
    id: "blockchain",
    title: "Blockchain Developer",
    description:
      "Build decentralized applications and blockchain-based systems.",
    category: "other",
  },
];

export const popularCareerTracks = careerTracks.filter(
  (track) => track.popular,
);

export const careerCategories = [
  {
    id: "software" as const,
    title: "Software Engineering",
  },
  {
    id: "ai-data" as const,
    title: "AI & Data",
  },
  {
    id: "cloud-infrastructure" as const,
    title: "Cloud & Infrastructure",
  },
  {
    id: "other" as const,
    title: "Other Engineering",
  },
];
