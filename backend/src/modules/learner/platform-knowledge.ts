/**
 * Platform Knowledge Base for AI Pather
 * 
 * Contains verified platform capabilities, modules, subscription plans,
 * and core career learning philosophies used by the AI Copilot.
 */

export const PLATFORM_KNOWLEDGE = {
  platformName: "AI Pather",
  tagline: "AI-Powered Career Learning Platform & Adaptive Career Operating System",
  mission: "Bridge the gap between passive video watching (tutorial hell) and landing real tech jobs through verified skills, active project execution, and adaptive roadmaps.",
  
  features: {
    "My Roadmap": "Personalized, living, step-by-step learning paths tailored to target role, current level, and weekly study hours with milestones, curated guides, and coding tasks.",
    "Skill Gaps": "Diagnostic matrix identifying prerequisite gaps, weak topics, and active learning debt.",
    "Assessments": "Adaptive skill diagnostic tests, technical quizzes, problem-solving evaluations, and coding challenges benchmarking real proficiency.",
    "Projects & Portfolio": "Full-stack production project blueprints, AI build specifications, implementation verification, and portfolio showcases.",
    "Mock Interviews": "Interactive AI-driven voice & text mock interviews covering coding, system design, and behavioral STAR questions with instant rubrics and model answers.",
    "Skill Proof Graph": "Cryptographically verifiable skill graph verifying quiz mastery and project completions with tamper-proof proof badges.",
    "Career Twin": "Digital benchmark twin measuring live Career Readiness Score (0-100%) against real hiring market standards.",
    "Learning Progress": "Visual tracking of learning velocity, completion rates, streaks, and gamified XP milestones.",
    "AI Resume Studio": "AI resume scanner, 0-100% ATS score, JD Matcher, Google X-Y-Z formula rewriter, and ATS-standard PDF export.",
    "Job Reality Check": "Real-time hiring market intelligence, in-demand tech stacks, salary benchmarks, and hiring trends.",
    "Career Alignment": "Strategic goal alignment and career roadmap calibration.",
    "Career Intelligence": "Deep market analytics, salary benchmarks, and tech stack demand forecasting for senior career positioning.",
    "Application Readiness": "Holistic evaluation combining resume, portfolio, proof graph, and interview readiness.",
    "Diagnostic Onboarding": "Baseline skill evaluation uncovering Learning Debt before roadmap generation.",
    "AI Copilot & Voice Mentor": "24/7 intelligent career mentor for chat & voice guidance, code debugging, and technical research.",
  },

  plans: [
    {
      name: "Go Plan",
      tier: "FREE",
      price: "$0 Free Forever",
      label: "Go (Free)",
      features: [
        "My Roadmap (Living learning paths)",
        "Skill Gaps Matrix",
        "Career Twin Benchmark",
        "Projects & Portfolio Studio",
        "Application Readiness Score",
        "Community & Standard Settings",
      ],
    },
    {
      name: "Plus Plan",
      tier: "PLUS",
      price: "$29/month or $199/year",
      label: "Plus ($29/mo)",
      features: [
        "Everything in Free / Go Plan",
        "AI Skill Diagnostics & Adaptive Assessments",
        "AI Resume Studio & ATS Optimizer",
        "AI Mock Technical & Behavioral Interviews",
        "Job Reality Check & Live Salary Benchmarks",
      ],
    },
    {
      name: "Pro Plan",
      tier: "PRO",
      price: "$99/month or $699/year",
      label: "Pro ($99/mo)",
      features: [
        "Everything in Plus Plan",
        "Cryptographic Skill Proof Graph with Verifiable Badges",
        "Career Intelligence & Market Trend Forecasting",
        "Bootcamp Cohort & Mentorship Analytics",
        "VIP AI Copilot Priority & Extended Context",
      ],
    },
  ],

  learningEngine: {
    philosophy: "Active execution over passive tutorial watching. Real proof over self-claimed skills.",
    fourStepCareerEngine: [
      "1. Diagnose: Uncover foundational Learning Debt with baseline evaluations",
      "2. Guide: Adaptive living roadmaps calibrated to target role & available hours",
      "3. Verify: Assessments, quizzes, and cryptographic Skill Proof Graph",
      "4. Transform & Deploy: Mock Interviews, Portfolio Projects, and ATS Resume Studio",
    ],
  },

  supportedRoles: [
    "Frontend Developer (React, Next.js, TypeScript, Tailwind)",
    "Backend Developer (Node.js, Express, PostgreSQL, Prisma, Redis)",
    "Full-Stack Engineer (MERN / Next.js + SQL/PostgreSQL)",
    "AI / Machine Learning Engineer (Python, PyTorch, LangChain, RAG)",
    "DevOps & Cloud Engineer (Docker, Kubernetes, AWS, CI/CD, Terraform)",
    "Mobile Developer (React Native, Flutter, Swift)",
    "Data Scientist & Analyst (Python, Pandas, SQL, Tableau)",
    "Cyber Security Specialist (Ethical Hacking, Network Security, SIEM)",
  ],
};
