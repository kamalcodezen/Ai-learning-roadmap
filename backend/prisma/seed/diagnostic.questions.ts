import type { PrismaClient } from "../../src/generated/prisma/client";

export const diagnosticQuestions = [
  {
    question: "What is React?",
    description: "Choose the most accurate description of React.",

    category: "FRONTEND",
    skill: "REACT",

    options: [
      "A JavaScript library for building user interfaces",
      "A relational database",
      "A CSS preprocessor",
      "A backend runtime",
    ],

    correctAnswer: "A JavaScript library for building user interfaces",

    difficulty: "BEGINNER",
    order: 1,
    isActive: true,
  },

  {
    question: "Which hook is used to manage local state in a React component?",

    description: "Select the React hook commonly used for component state.",

    category: "FRONTEND",
    skill: "REACT",

    options: ["useEffect", "useState", "useMemo", "useRef"],

    correctAnswer: "useState",

    difficulty: "BEGINNER",
    order: 2,
    isActive: true,
  },

  {
    question: "Which language is primarily used with TypeScript?",

    description: "Identify the language TypeScript extends.",

    category: "FRONTEND",
    skill: "TYPESCRIPT",

    options: ["Python", "JavaScript", "Java", "C++"],

    correctAnswer: "JavaScript",

    difficulty: "BEGINNER",
    order: 3,
    isActive: true,
  },

  {
    question: "What does Node.js allow developers to do?",

    description: "Choose the best description of Node.js.",

    category: "BACKEND",
    skill: "NODEJS",

    options: [
      "Run JavaScript outside the browser",
      "Create database tables automatically",
      "Replace HTML",
      "Style React components",
    ],

    correctAnswer: "Run JavaScript outside the browser",

    difficulty: "BEGINNER",
    order: 4,
    isActive: true,
  },

  {
    question: "What is Prisma primarily used for?",

    description: "Identify Prisma's role in a backend application.",

    category: "DATABASE",
    skill: "PRISMA",

    options: [
      "ORM and database access",
      "CSS styling",
      "Image optimization",
      "Browser automation",
    ],

    correctAnswer: "ORM and database access",

    difficulty: "BEGINNER",
    order: 5,
    isActive: true,
  },

  {
    question: "Which HTTP method is commonly used to create a resource?",

    description: "Choose the appropriate HTTP method.",

    category: "BACKEND",
    skill: "REST_API",

    options: ["GET", "POST", "DELETE", "HEAD"],

    correctAnswer: "POST",

    difficulty: "BEGINNER",
    order: 6,
    isActive: true,
  },

  {
    question: "Which Git command is used to create a commit?",

    description: "Choose the correct Git command.",

    category: "DEVOPS",
    skill: "GIT",

    options: ["git push", "git pull", "git commit", "git clone"],

    correctAnswer: "git commit",

    difficulty: "BEGINNER",
    order: 7,
    isActive: true,
  },

  {
    question: "What does SQL primarily work with?",

    description: "Identify the main purpose of SQL.",

    category: "DATABASE",
    skill: "SQL",

    options: [
      "Relational databases",
      "CSS animations",
      "Image editing",
      "Browser rendering",
    ],

    correctAnswer: "Relational databases",

    difficulty: "BEGINNER",
    order: 8,
    isActive: true,
  },

  {
    question: "Which keyword is used to declare a constant in JavaScript?",

    description: "Choose the correct JavaScript declaration keyword.",

    category: "PROGRAMMING",
    skill: "JAVASCRIPT",

    options: ["var", "let", "const", "static"],

    correctAnswer: "const",

    difficulty: "BEGINNER",
    order: 9,
    isActive: true,
  },

  {
    question: "What is an API?",

    description: "Choose the best description of an API.",

    category: "BACKEND",
    skill: "API",

    options: [
      "A way for software systems to communicate",
      "A database engine",
      "A programming language",
      "A CSS framework",
    ],

    correctAnswer: "A way for software systems to communicate",

    difficulty: "BEGINNER",
    order: 10,
    isActive: true,
  },
] as const;

export async function seedDiagnosticQuestions(prisma: PrismaClient) {
  for (const question of diagnosticQuestions) {
    await prisma.diagnosticQuestion.upsert({
      where: {
        id: `diagnostic-${question.order}`,
      },

      update: {
        question: question.question,
        description: question.description,
        category: question.category,
        skill: question.skill,
        options: question.options,
        correctAnswer: question.correctAnswer,
        difficulty: question.difficulty,
        order: question.order,
        isActive: question.isActive,
      },

      create: {
        id: `diagnostic-${question.order}`,
        question: question.question,
        description: question.description,
        category: question.category,
        skill: question.skill,
        options: question.options,
        correctAnswer: question.correctAnswer,
        difficulty: question.difficulty,
        order: question.order,
        isActive: question.isActive,
      },
    });
  }

  console.log(`Seeded ${diagnosticQuestions.length} diagnostic questions.`);
}
