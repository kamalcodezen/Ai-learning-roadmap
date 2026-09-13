export interface RequiredSkill {
  skill: string;
  critical: boolean;
  category?: string;
  priority?: number;
  phase?: string;
}

export interface CanonicalMilestoneTemplate {
  title: string;
  phase:
    | "FOUNDATIONS"
    | "CORE_CONCEPTS"
    | "INTERMEDIATE_SYSTEMS"
    | "ADVANCED_ARCHITECTURE"
    | "PRACTICAL_PROJECTS"
    | "SPECIALIZATION"
    | "PRODUCTION_PORTFOLIO"
    | "JOB_READINESS";
  description: string;
  whyItMatters: string;
  skillsCovered: string[];
  technologies: string[];
  estimatedTime: string;
  prerequisites: string[];
  practicalTasks: string[];
  projectDeliverable?: string;
  expectedOutcome?: string;
}

export interface CanonicalRoleDefinition {
  roleName: string;
  aliases: string[];
  domain: string;
  description: string;
  requiredSkills: RequiredSkill[];
  milestones: CanonicalMilestoneTemplate[];
  projectExpectations: string[];
  jobReadyOutcomes: string[];
}

export const CANONICAL_ROLE_CURRICULA: Record<string, CanonicalRoleDefinition> = {
  "Full Stack Developer": {
    roleName: "Full Stack Developer",
    aliases: [
      "full stack",
      "fullstack",
      "full stack developer",
      "fullstack developer",
      "full stack engineer",
      "fullstack engineer",
      "web developer",
      "full-stack developer",
      "full-stack engineer",
    ],
    domain: "Web & Software Engineering",
    description:
      "Builds complete production web applications spanning responsive frontends, scalable backend services, databases, and automated deployments.",
    requiredSkills: [
      { skill: "HTML/CSS", critical: true, phase: "FOUNDATIONS" },
      { skill: "JavaScript", critical: true, phase: "FOUNDATIONS" },
      { skill: "TypeScript", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "React", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "Node.js", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "SQL", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "PostgreSQL", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "REST API Design", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "Git", critical: true, phase: "FOUNDATIONS" },
      { skill: "Docker", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "CI/CD", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Automated Testing", critical: false, phase: "PRACTICAL_PROJECTS" },
      { skill: "Full Stack Architecture", critical: false, phase: "PRODUCTION_PORTFOLIO" },
    ],
    milestones: [
      {
        title: "Web & Modern JavaScript Foundations",
        phase: "FOUNDATIONS",
        description:
          "Master modern semantic HTML5, responsive CSS3 layouts (Flexbox/Grid), and core ESNext JavaScript primitives.",
        whyItMatters:
          "A solid command of browser fundamentals and asynchronous JavaScript is required for building scalable web interfaces.",
        skillsCovered: ["HTML/CSS", "JavaScript", "Git", "DOM Manipulation"],
        technologies: ["HTML5", "CSS3", "JavaScript", "Git", "VS Code"],
        estimatedTime: "2-3 weeks",
        prerequisites: [],
        practicalTasks: [
          "Build responsive multi-page layout",
          "Implement async API data fetching with vanilla JS",
        ],
        projectDeliverable:
          "Interactive responsive dashboard with live public API data integration",
        expectedOutcome:
          "Proficiency in modern JavaScript, DOM event handling, and clean responsive CSS.",
      },
      {
        title: "Frontend Engineering with React & TypeScript",
        phase: "CORE_CONCEPTS",
        description:
          "Develop robust client-side applications using React component lifecycles, hooks, and static typing with TypeScript.",
        whyItMatters:
          "TypeScript and React are the industry standard for type-safe, maintainable enterprise user interfaces.",
        skillsCovered: ["React", "TypeScript", "State Management", "Tailwind CSS"],
        technologies: ["React", "TypeScript", "Tailwind CSS", "Vite"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["HTML/CSS", "JavaScript"],
        practicalTasks: [
          "Create reusable typed UI component library",
          "Manage complex client state with custom hooks",
        ],
        projectDeliverable:
          "Type-safe dynamic single page application with client-side routing and filterable state",
        expectedOutcome:
          "Ability to construct modular, performant React applications with strict TypeScript typing.",
      },
      {
        title: "Advanced Next.js, Server Components & State",
        phase: "CORE_CONCEPTS",
        description:
          "Architect fullstack React applications using Next.js App Router, Server Components, and client state orchestration (Zustand / TanStack Query).",
        whyItMatters:
          "Next.js unifies frontend rendering with backend server actions for high-performance production web apps.",
        skillsCovered: ["Next.js", "Server Components", "State Management", "TanStack Query"],
        technologies: ["Next.js", "React 19", "Zustand", "TanStack Query"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["React", "TypeScript"],
        practicalTasks: [
          "Implement Server-Side Rendering (SSR) and Incremental Static Regeneration (ISR)",
          "Set up optimistic UI mutations with TanStack Query",
        ],
        projectDeliverable:
          "Next.js fullstack application with server actions, optimistic updates, and SEO metadata",
        expectedOutcome:
          "Mastery of modern hybrid rendering, server components, and production data-fetching patterns.",
      },
      {
        title: "Backend API Engineering with Node.js, Express & REST",
        phase: "INTERMEDIATE_SYSTEMS",
        description:
          "Build robust RESTful API microservices using Node.js, Express, input validation (Zod), and structured error handling.",
        whyItMatters:
          "Secure and scalable backend services are the backbone of any production fullstack system.",
        skillsCovered: ["Node.js", "Express", "REST API Design", "Input Validation (Zod)"],
        technologies: ["Node.js", "Express", "TypeScript", "Zod"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["TypeScript"],
        practicalTasks: [
          "Design versioned REST API with route handlers and middleware pipeline",
          "Implement rate limiting, CORS security headers, and structured logging",
        ],
        projectDeliverable:
          "Production-grade RESTful API service with complete Swagger / OpenAPI documentation",
        expectedOutcome:
          "Confidence in building resilient, secure backend APIs with structured request lifecycles.",
      },
      {
        title: "Relational Databases, PostgreSQL & Prisma ORM",
        phase: "INTERMEDIATE_SYSTEMS",
        description:
          "Design normalized relational database schemas, write efficient SQL queries, manage database migrations, and interact using Prisma ORM.",
        whyItMatters:
          "Data persistence, indexing, and transactional integrity are vital for data-intensive fullstack applications.",
        skillsCovered: ["PostgreSQL", "SQL", "Database Indexing", "Prisma ORM"],
        technologies: ["PostgreSQL", "Prisma", "SQL", "Docker"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Node.js"],
        practicalTasks: [
          "Design normalized database schema with foreign keys and indexes",
          "Execute complex relational queries and analyze EXPLAIN ANALYZE query plans",
        ],
        projectDeliverable:
          "Fully migrated PostgreSQL database layer with complex relations, seed scripts, and indexing",
        expectedOutcome:
          "Deep understanding of relational database modeling, indexing, and Prisma ORM integration.",
      },
      {
        title: "Authentication, Authorization & Security Architecture",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Implement secure authentication workflows: JWTs, HTTP-only cookies, OAuth 2.0 social logins, and Role-Based Access Control (RBAC).",
        whyItMatters:
          "User security, session protection, and permission management are mandatory for production applications.",
        skillsCovered: ["Authentication (JWT/OAuth)", "RBAC", "Web Security", "CSRF / XSS Protection"],
        technologies: ["NextAuth / Auth.js", "JWT", "Bcrypt", "Redis"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Backend API Engineering", "Relational Databases"],
        practicalTasks: [
          "Build multi-tenant JWT auth system with refresh token rotation",
          "Implement Role-Based Access Control (RBAC) middleware for admin/user roles",
        ],
        projectDeliverable:
          "Production authentication and authorization module with OAuth, MFA, and session revocation",
        expectedOutcome:
          "Ability to architect enterprise-grade authentication and security layers.",
      },
      {
        title: "Automated Testing, Containerization & CI/CD Pipelines",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Implement automated testing suites (unit, integration, end-to-end with Vitest / Playwright), containerize apps with Docker, and configure GitHub Actions CI/CD.",
        whyItMatters:
          "Automated pipelines ensure software reliability, prevent regressions, and enable continuous delivery.",
        skillsCovered: ["Automated Testing", "Docker", "CI/CD", "Playwright"],
        technologies: ["Vitest", "Playwright", "Docker", "GitHub Actions"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Authentication", "Next.js"],
        practicalTasks: [
          "Write unit and integration tests achieving >80% code coverage",
          "Create multi-stage Dockerfile and automated GitHub Actions CI workflow",
        ],
        projectDeliverable:
          "Automated CI/CD test and build pipeline running in GitHub Actions with Dockerized container images",
        expectedOutcome:
          "Ability to write automated tests and deploy containerized apps via CI/CD pipelines.",
      },
      {
        title: "Production Cloud Deployment & Performance Optimization",
        phase: "PRODUCTION_PORTFOLIO",
        description:
          "Deploy production web applications to cloud platforms (Vercel, AWS, Render), implement caching (Redis), and monitor web vitals.",
        whyItMatters:
          "Production engineering separates hobby projects from real-world, commercial fullstack products.",
        skillsCovered: ["Cloud Deployment", "Redis", "Web Performance", "Monitoring"],
        technologies: ["Vercel", "AWS / Render", "Redis", "Sentry", "Lighthouse"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Docker", "PostgreSQL"],
        practicalTasks: [
          "Implement Redis caching layer for heavy database queries",
          "Deploy live production app and optimize Core Web Vitals to >90",
        ],
        projectDeliverable:
          "Live deployed production fullstack SaaS application with caching and monitoring configured",
        expectedOutcome:
          "Expertise in deploying, caching, and monitoring scalable fullstack web applications.",
      },
      {
        title: "Full Stack Capstone Delivery & Technical Interview Readiness",
        phase: "JOB_READINESS",
        description:
          "Deliver a comprehensive fullstack capstone application with verified GitHub repository, live demo, and practice fullstack system design interviews.",
        whyItMatters:
          "Proving end-to-end engineering depth with a verifiable capstone is the gold standard for landing developer roles.",
        skillsCovered: [
          "Full Stack Architecture",
          "System Design",
          "Portfolio Presentation",
          "Technical Interviews",
        ],
        technologies: ["React", "Node.js", "PostgreSQL", "Docker", "GitHub"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Cloud Deployment", "Automated Testing"],
        practicalTasks: [
          "Conduct mock system design interview for a scalable web platform",
          "Complete capstone documentation with architecture diagrams and API specs",
        ],
        projectDeliverable:
          "Full-scale production capstone project with verified GitHub repository, live deployment, and architecture docs",
        expectedOutcome:
          "Job-ready Full Stack Developer equipped with a verified portfolio and interview readiness.",
      },
    ],
    projectExpectations: [
      "Production-ready CRUD application with relational database and secure auth",
      "Fullstack SaaS application with server-side rendering, caching, and payment/dashboard workflows",
      "Comprehensive capstone application with CI/CD, unit tests, and live production deployment",
    ],
    jobReadyOutcomes: [
      "Ability to build, test, and deploy scalable fullstack web applications independently",
      "Deep understanding of frontend state, backend APIs, relational databases, and cloud hosting",
      "Confidence in technical coding interviews and fullstack system design discussions",
    ],
  },

  "Frontend Developer": {
    roleName: "Frontend Developer",
    aliases: [
      "frontend developer",
      "frontend engineer",
      "frontend",
      "front-end developer",
      "front-end engineer",
      "front end developer",
      "front end engineer",
      "react developer",
    ],
    domain: "Frontend Web Engineering & User Interfaces",
    description:
      "Crafts responsive, accessible, high-performance client-side web applications using modern JavaScript/TypeScript, React, Next.js, CSS architecture, and automated testing.",
    requiredSkills: [
      { skill: "HTML/CSS", critical: true, phase: "FOUNDATIONS" },
      { skill: "JavaScript", critical: true, phase: "FOUNDATIONS" },
      { skill: "TypeScript", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "React", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "State Management", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "Next.js / SSR", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "CSS Frameworks & Tailwind", critical: true, phase: "FOUNDATIONS" },
      { skill: "Automated Testing (Jest/Playwright)", critical: false, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "Web Performance & Core Web Vitals", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Design Systems & Component Libraries", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Production Frontend Capstone", critical: true, phase: "PRACTICAL_PROJECTS" },
      { skill: "Frontend Technical Interviews", critical: true, phase: "JOB_READINESS" },
    ],
    milestones: [
      {
        title: "Semantic HTML5, CSS3 Modern Layouts & Web Standards",
        phase: "FOUNDATIONS",
        description:
          "Master semantic HTML markup, modern CSS layouts (Flexbox, CSS Grid), responsive design patterns, and CSS variables.",
        whyItMatters:
          "Clean semantic markup and responsive layouts form the essential bedrock of all modern web frontends.",
        skillsCovered: ["HTML/CSS", "CSS Frameworks & Tailwind", "Responsive Design"],
        technologies: ["HTML5", "CSS3", "Tailwind CSS", "VS Code"],
        estimatedTime: "2-3 weeks",
        prerequisites: [],
        practicalTasks: [
          "Build responsive multi-device landing page using CSS Grid and Flexbox",
          "Implement modern dark/light theme switching with CSS custom properties",
        ],
        projectDeliverable:
          "Pixel-perfect responsive landing page adhering to modern CSS standards and accessibility semantics",
        expectedOutcome:
          "Solid foundation in modern layout models, responsive breakpoints, and CSS architecture.",
      },
      {
        title: "JavaScript ESNext, DOM Interaction & Asynchronous Workflows",
        phase: "FOUNDATIONS",
        description:
          "Master modern JavaScript (ES6+), DOM events, closures, prototypes, Fetch API, async/await, and browser runtime mechanics.",
        whyItMatters:
          "Deep fluency in vanilla JavaScript is essential before mastering frontend frameworks.",
        skillsCovered: ["JavaScript", "DOM Manipulation", "Async/Await", "Browser APIs"],
        technologies: ["JavaScript (ESNext)", "Git", "Browser DevTools"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Semantic HTML5, CSS3"],
        practicalTasks: [
          "Build interactive data-filtering application with vanilla JavaScript DOM manipulation",
          "Implement debounced search input fetching live data from public REST APIs",
        ],
        projectDeliverable:
          "Interactive client-side web application built with vanilla JavaScript and asynchronous API integration",
        expectedOutcome:
          "Proficiency in asynchronous JavaScript, event loop, and DOM manipulation.",
      },
      {
        title: "React Component Architecture, Hooks & TypeScript",
        phase: "CORE_CONCEPTS",
        description:
          "Develop maintainable UI components using React 19, custom hooks, component lifecycles, and strict TypeScript typing.",
        whyItMatters:
          "React with TypeScript is the global standard for building robust enterprise web applications.",
        skillsCovered: ["React", "TypeScript", "React Hooks", "Custom Hooks"],
        technologies: ["React", "TypeScript", "Vite", "ESLint"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["JavaScript ESNext"],
        practicalTasks: [
          "Build typed reusable component library (Button, Modal, Dropdown, Table)",
          "Author custom hooks for window resize, local storage sync, and data fetching",
        ],
        projectDeliverable:
          "Type-safe interactive React application featuring custom hooks and modular component hierarchy",
        expectedOutcome:
          "Ability to build type-safe, reusable React components and cleanly separate business logic.",
      },
      {
        title: "State Management, Routing & Client Data Fetching",
        phase: "CORE_CONCEPTS",
        description:
          "Manage complex application state using Zustand / Redux Toolkit, client-side routing, and caching with TanStack Query.",
        whyItMatters:
          "Large frontend applications require predictable global state and efficient server-cache management.",
        skillsCovered: ["State Management", "TanStack Query", "Client Routing"],
        technologies: ["Zustand", "TanStack Query", "React Router"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["React Component Architecture"],
        practicalTasks: [
          "Implement global shopping cart state with persistence and optimistic updates",
          "Configure TanStack Query for server state caching, pagination, and background refetching",
        ],
        projectDeliverable:
          "Full-featured e-commerce frontend with global state, client routing, and query caching",
        expectedOutcome:
          "Expertise in client-side state orchestration and server-state caching strategies.",
      },
      {
        title: "Modern Next.js, Server Components & Hybrid Rendering",
        phase: "INTERMEDIATE_SYSTEMS",
        description:
          "Architect Next.js applications with App Router, React Server Components (RSC), Server Actions, and SEO optimization.",
        whyItMatters:
          "Hybrid rendering delivers ultra-fast initial page loads and optimal search engine indexability.",
        skillsCovered: ["Next.js / SSR", "Server Components", "SEO Optimization"],
        technologies: ["Next.js", "React Server Components", "Vercel"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["State Management"],
        practicalTasks: [
          "Build server-rendered dashboard with Next.js App Router and Server Actions",
          "Implement dynamic OpenGraph metadata generation and structured JSON-LD data",
        ],
        projectDeliverable:
          "Production Next.js hybrid web application with server actions, dynamic routing, and high SEO score",
        expectedOutcome:
          "Command over Next.js App Router, server-rendered components, and performance-first architectures.",
      },
      {
        title: "Frontend Testing: Vitest, React Testing Library & Playwright",
        phase: "INTERMEDIATE_SYSTEMS",
        description:
          "Implement unit testing with Vitest, component integration testing with React Testing Library, and end-to-end testing with Playwright.",
        whyItMatters:
          "Automated frontend testing prevents regressions and guarantees UI reliability across browser engines.",
        skillsCovered: ["Automated Testing (Jest/Playwright)", "Component Testing", "E2E Testing"],
        technologies: ["Vitest", "React Testing Library", "Playwright", "GitHub Actions"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Modern Next.js"],
        practicalTasks: [
          "Write comprehensive test suite for interactive UI forms with user event simulations",
          "Automate cross-browser end-to-end test suite in Playwright verifying critical checkout flows",
        ],
        projectDeliverable:
          "Fully tested frontend codebase with >85% test coverage and automated CI test pipeline",
        expectedOutcome:
          "Mastery of unit, integration, and E2E testing strategies for modern web frontends.",
      },
      {
        title: "Web Performance, Core Web Vitals & Accessibility (WCAG)",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Optimize Lighthouse scores, minimize bundle sizes (code splitting, tree shaking), improve Core Web Vitals (LCP, INP, CLS), and ensure WCAG 2.2 accessibility.",
        whyItMatters:
          "Speed and accessibility are paramount for user retention, SEO rankings, and legal compliance.",
        skillsCovered: ["Web Performance & Core Web Vitals", "Accessibility (a11y)", "Bundle Optimization"],
        technologies: ["Lighthouse", "Web Vitals", "Axe DevTools", "Webpack/Vite Bundle Analyzer"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Frontend Testing"],
        practicalTasks: [
          "Audit and optimize heavy web app to achieve 95+ Lighthouse score across all metrics",
          "Remediate accessibility violations ensuring keyboard navigation and screen-reader compatibility",
        ],
        projectDeliverable:
          "High-performance, fully accessible web application with benchmarked Core Web Vitals metrics",
        expectedOutcome:
          "Expertise in frontend performance optimization, bundle analysis, and WCAG accessibility standards.",
      },
      {
        title: "Design Systems, Micro-Frontends & Component Libraries",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Author reusable design systems with Storybook, publish custom NPM packages, and explore micro-frontend architectures.",
        whyItMatters:
          "Enterprise organizations rely on standardized design systems to maintain visual and functional consistency across large teams.",
        skillsCovered: ["Design Systems & Component Libraries", "Storybook", "Micro-Frontends"],
        technologies: ["Storybook", "NPM Publishing", "Tailwind CSS", "Figma Tokens"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Web Performance"],
        practicalTasks: [
          "Document and publish multi-theme component library to Storybook",
          "Set up automated visual regression testing with Chromatic",
        ],
        projectDeliverable:
          "Published Storybook design system documentation with interactive component playground and token architecture",
        expectedOutcome:
          "Ability to architect, document, and maintain enterprise design system libraries.",
      },
      {
        title: "Production Frontend Capstone Application",
        phase: "PRACTICAL_PROJECTS",
        description:
          "Deliver an end-to-end, production-grade frontend capstone application with live deployment, rich state, micro-animations, and verified code repository.",
        whyItMatters:
          "Demonstrating end-to-end frontend craftsmanship with a live production product is the most compelling proof of hiring competence.",
        skillsCovered: ["Production Frontend Capstone", "UI Polish & Micro-Animations", "Live Deployment"],
        technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Vercel"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Design Systems", "Frontend Testing"],
        practicalTasks: [
          "Build full-scale frontend SaaS interface with interactive analytics, theme customization, and smooth animations",
          "Deploy live application with custom domain, automated CI/CD, and monitoring",
        ],
        projectDeliverable:
          "Production frontend capstone web application with verified GitHub repository and live deployment link",
        expectedOutcome:
          "Accomplishment of shipping a polished, enterprise-ready frontend application.",
      },
      {
        title: "Frontend Portfolio & Technical Interview Readiness",
        phase: "JOB_READINESS",
        description:
          "Build a standout personal portfolio showcasing frontend case studies, and practice live frontend technical coding and system design interviews.",
        whyItMatters:
          "A verified portfolio paired with sharp JavaScript/React interview readiness guarantees success in hiring loops.",
        skillsCovered: ["Frontend Technical Interviews", "Frontend System Design", "Portfolio Presentation"],
        technologies: ["Portfolio Website", "GitHub", "Technical Coding Challenges"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Production Frontend Capstone"],
        practicalTasks: [
          "Author technical case study breakdown detailing performance optimizations and architectural trade-offs",
          "Practice 20+ frontend interview scenarios (JS polyfills, custom React hooks, frontend system design)",
        ],
        projectDeliverable:
          "Polished personal portfolio website featuring live project demos, case studies, and interview preparation repository",
        expectedOutcome:
          "Job-ready Frontend Developer prepared to excel in technical assessments, live coding, and UI system design interviews.",
      },
    ],
    projectExpectations: [
      "Responsive, accessible web application with custom component hierarchy and TypeScript typing",
      "Next.js fullstack hybrid application with server components and TanStack Query state caching",
      "Published Storybook design system and production capstone with live deployment and high Lighthouse scores",
    ],
    jobReadyOutcomes: [
      "Ability to architect and build high-performance, accessible client-side applications independently",
      "Deep expertise in React, TypeScript, Next.js, state management, and modern CSS",
      "Confidence in frontend coding interviews, JavaScript deep-dives, and UI system design discussions",
    ],
  },

  "Backend Developer": {
    roleName: "Backend Developer",
    aliases: [
      "backend developer",
      "backend engineer",
      "backend",
      "back-end developer",
      "back-end engineer",
      "back end developer",
      "back end engineer",
      "node developer",
      "node.js developer",
      "api engineer",
    ],
    domain: "Backend Systems, APIs & Distributed Architecture",
    description:
      "Designs, builds, and scales backend APIs, relational & NoSQL databases, microservices architectures, caching layers, and asynchronous messaging pipelines.",
    requiredSkills: [
      { skill: "Node.js", critical: true, phase: "FOUNDATIONS" },
      { skill: "TypeScript", critical: true, phase: "FOUNDATIONS" },
      { skill: "REST & GraphQL API Design", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "Relational Databases (PostgreSQL/SQL)", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "NoSQL Databases (MongoDB/Redis)", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "Authentication & Security (OAuth/JWT)", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "Microservices & System Architecture", critical: true, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Docker & Containerization", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Message Queues (Kafka/RabbitMQ)", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "CI/CD & Cloud Deployment", critical: false, phase: "PRODUCTION_PORTFOLIO" },
      { skill: "Production Backend Capstone", critical: true, phase: "PRACTICAL_PROJECTS" },
      { skill: "Backend System Design & Coding Interviews", critical: true, phase: "JOB_READINESS" },
    ],
    milestones: [
      {
        title: "Backend Fundamentals, Asynchronous Runtime & Node.js / Go",
        phase: "FOUNDATIONS",
        description:
          "Master backend runtimes (Node.js / Go), asynchronous I/O, event loops, streams, buffer manipulation, and process management.",
        whyItMatters:
          "Understanding how backend runtimes handle concurrency and memory is essential for writing high-throughput services.",
        skillsCovered: ["Node.js", "TypeScript", "Asynchronous I/O", "Process Management"],
        technologies: ["Node.js", "TypeScript", "Git", "VS Code"],
        estimatedTime: "2-3 weeks",
        prerequisites: [],
        practicalTasks: [
          "Build CLI tool processing multi-gigabyte log files using Node.js readable/writable streams",
          "Implement asynchronous event-driven worker handling concurrent task queues",
        ],
        projectDeliverable:
          "High-performance stream-based file processing backend utility with unit tests",
        expectedOutcome:
          "Deep understanding of event loops, asynchronous I/O, streams, and backend runtime mechanics.",
      },
      {
        title: "RESTful API Architecture, Middleware & Validation",
        phase: "CORE_CONCEPTS",
        description:
          "Design scalable RESTful APIs with Express / Fastify: Layered architecture (Controllers, Services, Repositories), schema validation (Zod), and structured logging.",
        whyItMatters:
          "Clean architectural separation prevents spaghetti code and allows backend services to scale seamlessly.",
        skillsCovered: ["REST & GraphQL API Design", "Layered Architecture", "Input Validation"],
        technologies: ["Express", "Fastify", "Zod", "Winston / Pino"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Backend Fundamentals"],
        practicalTasks: [
          "Architect complete REST API following Controller-Service-Repository pattern",
          "Implement global error-handling middleware with structured JSON error responses",
        ],
        projectDeliverable:
          "Production REST API service with schema validation, OpenAPI / Swagger documentation, and logging",
        expectedOutcome:
          "Proficiency in layered backend API architecture, input validation, and middleware pipelines.",
      },
      {
        title: "Relational Databases, PostgreSQL, SQL Optimization & Transactions",
        phase: "CORE_CONCEPTS",
        description:
          "Master PostgreSQL: Complex SQL joins, indexing strategies (B-Tree, GIN), ACID transactions, connection pooling, and ORM / query builders (Prisma / Kysely).",
        whyItMatters:
          "Databases are the core persistence layer of backend systems; slow or unindexed queries can cripple entire applications.",
        skillsCovered: ["Relational Databases (PostgreSQL/SQL)", "SQL Optimization", "ACID Transactions"],
        technologies: ["PostgreSQL", "Prisma", "Kysely", "Docker"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["RESTful API Architecture"],
        practicalTasks: [
          "Design normalized relational schema with constraints and evaluate query plans with EXPLAIN ANALYZE",
          "Write concurrent database transaction handling financial transfers with optimistic locking",
        ],
        projectDeliverable:
          "High-performance PostgreSQL persistence layer with migrations, seeders, and optimized queries",
        expectedOutcome:
          "Mastery over SQL database schema design, indexing, transaction isolation, and query tuning.",
      },
      {
        title: "Authentication, Authorization & Security Best Practices",
        phase: "INTERMEDIATE_SYSTEMS",
        description:
          "Implement bulletproof auth: JWT token rotation, refresh tokens in HTTP-only cookies, OAuth 2.0 / OIDC, RBAC / ABAC, and OWASP Top 10 mitigation.",
        whyItMatters:
          "Security vulnerabilities can compromise sensitive enterprise data; robust authentication is non-negotiable.",
        skillsCovered: ["Authentication & Security (OAuth/JWT)", "RBAC", "OWASP Security"],
        technologies: ["JWT", "Bcrypt", "OAuth 2.0", "Redis"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Relational Databases"],
        practicalTasks: [
          "Implement JWT authentication with refresh token rotation and Redis token blacklisting",
          "Enforce Role-Based Access Control (RBAC) middleware protecting sensitive API endpoints",
        ],
        projectDeliverable:
          "Production-ready authentication microservice supporting OAuth, token refresh, and RBAC permissions",
        expectedOutcome:
          "Ability to engineer secure authentication, token revocation, and enterprise authorization systems.",
      },
      {
        title: "Caching, NoSQL Databases & Redis High-Throughput Patterns",
        phase: "INTERMEDIATE_SYSTEMS",
        description:
          "Implement caching strategies (Cache-Aside, Write-Through), rate limiters, session stores, and pub/sub message brokers with Redis.",
        whyItMatters:
          "In-memory caching reduces database loads by up to 90% and enables sub-millisecond API response times.",
        skillsCovered: ["NoSQL Databases (MongoDB/Redis)", "Caching Strategies", "Rate Limiting"],
        technologies: ["Redis", "MongoDB", "IORedis"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Authentication"],
        practicalTasks: [
          "Implement distributed rate limiter using Redis sliding window log algorithm",
          "Configure Cache-Aside layer with TTL invalidation for high-traffic database queries",
        ],
        projectDeliverable:
          "High-throughput caching and rate-limiting service layer backed by Redis and MongoDB",
        expectedOutcome:
          "Proficiency in in-memory caching, distributed rate limiting, and NoSQL data structures.",
      },
      {
        title: "Message Queues, Event-Driven Architecture & Kafka / RabbitMQ",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Decouple backend systems using asynchronous message queues (RabbitMQ, Apache Kafka, BullMQ), event consumers, and dead-letter queues.",
        whyItMatters:
          "Event-driven architectures enable backend services to handle massive spikes without dropping tasks.",
        skillsCovered: ["Message Queues (Kafka/RabbitMQ)", "Event-Driven Architecture", "Background Workers"],
        technologies: ["RabbitMQ", "Apache Kafka", "BullMQ", "Redis"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Caching & Redis"],
        practicalTasks: [
          "Build asynchronous email and notification dispatch worker pool with BullMQ",
          "Implement event-driven microservices communicating via Kafka event topics with dead-letter queue retry policies",
        ],
        projectDeliverable:
          "Resilient event-driven processing pipeline with background workers, retries, and dead-letter queues",
        expectedOutcome:
          "Mastery of asynchronous event processing, message queues, and worker orchestration.",
      },
      {
        title: "Containerization, Docker & Automated CI/CD Pipelines",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Containerize backend services with multi-stage Dockerfiles, orchestrate multi-container stacks with Docker Compose, and build automated GitHub Actions CI/CD workflows.",
        whyItMatters:
          "Consistent container environments ensure software runs identically in local development, staging, and cloud production.",
        skillsCovered: ["Docker & Containerization", "CI/CD & Cloud Deployment", "Automated Testing"],
        technologies: ["Docker", "Docker Compose", "GitHub Actions", "Vitest"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Message Queues"],
        practicalTasks: [
          "Author optimized multi-stage Dockerfile reducing production image size by 70%",
          "Configure GitHub Actions workflow running automated unit/integration tests and pushing Docker images",
        ],
        projectDeliverable:
          "Multi-container Docker Compose development environment and automated CI/CD pipeline",
        expectedOutcome:
          "Expertise in containerization, Docker multi-stage builds, and continuous integration pipelines.",
      },
      {
        title: "Backend Scalability, System Observability & Load Balancing",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Implement structured telemetry: Metrics (Prometheus), distributed tracing (OpenTelemetry), centralized logging, and Nginx reverse proxy load balancing.",
        whyItMatters:
          "You cannot manage what you cannot measure; observability is vital for identifying bottlenecks in distributed systems.",
        skillsCovered: ["Microservices & System Architecture", "System Observability", "Load Balancing"],
        technologies: ["Prometheus", "Grafana", "OpenTelemetry", "Nginx"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Containerization"],
        practicalTasks: [
          "Set up Prometheus metrics collection and Grafana dashboard monitoring API latencies and error rates",
          "Configure Nginx reverse proxy with round-robin load balancing across multiple backend server instances",
        ],
        projectDeliverable:
          "Fully observable backend deployment with Grafana dashboards, Prometheus metrics, and Nginx load balancer",
        expectedOutcome:
          "Ability to monitor, profile, and horizontally scale backend microservices in production.",
      },
      {
        title: "Production Backend Microservices Capstone",
        phase: "PRACTICAL_PROJECTS",
        description:
          "Deliver an end-to-end, production-ready backend microservices capstone project with verified GitHub repository, database migrations, CI/CD, and live cloud deployment.",
        whyItMatters:
          "Shipping a complete, robust backend system proves architectural competence and production engineering readiness.",
        skillsCovered: ["Production Backend Capstone", "Microservices Architecture", "Cloud Hosting"],
        technologies: ["Node.js / Go", "PostgreSQL", "Redis", "Docker", "AWS / Render"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Backend Scalability", "Containerization"],
        practicalTasks: [
          "Build scalable backend microservices platform with authentication, queuing, and database caching",
          "Deploy containerized microservices to cloud with automated health checks and database backups",
        ],
        projectDeliverable:
          "Live deployed production backend platform with verified GitHub repository, architecture documentation, and live API endpoints",
        expectedOutcome:
          "Accomplishment of engineering and shipping a production-grade backend distributed system.",
      },
      {
        title: "System Design Architecture & Backend Technical Interview Readiness",
        phase: "JOB_READINESS",
        description:
          "Master distributed system design concepts (CAP theorem, sharding, replication, CDN, rate limiting) and practice live backend coding and architectural interviews.",
        whyItMatters:
          "Clearing backend engineering interviews requires sharp algorithmic problem-solving and deep system design articulation.",
        skillsCovered: [
          "Backend System Design & Coding Interviews",
          "Distributed Systems Design",
          "Technical Communication",
        ],
        technologies: ["System Design Diagrams", "GitHub", "Live Coding Platforms"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Production Backend Capstone"],
        practicalTasks: [
          "Author detailed System Design Document for high-throughput distributed URL shortener / notification engine",
          "Conduct 15+ live mock system design and backend algorithmic interviews",
        ],
        projectDeliverable:
          "Comprehensive System Design portfolio containing 3+ detailed architectural case studies and interview preparation notes",
        expectedOutcome:
          "Job-ready Backend Engineer equipped to ace system design interviews, database design challenges, and live coding assessments.",
      },
    ],
    projectExpectations: [
      "Layered RESTful API with PostgreSQL database, Prisma ORM, and comprehensive Zod validation",
      "Event-driven background worker pipeline with Redis caching, BullMQ queues, and Docker containerization",
      "Production-ready backend microservices capstone deployed to cloud with Prometheus monitoring and CI/CD",
    ],
    jobReadyOutcomes: [
      "Ability to design, build, and scale resilient backend services and distributed databases independently",
      "Deep expertise in Node.js/Go, PostgreSQL, Redis, message queues, Docker, and API security",
      "Confidence in backend coding interviews, database schema design, and system architecture discussions",
    ],
  },

  "Software Engineer": {
    roleName: "Software Engineer",
    aliases: ["software engineer", "software developer", "swe", "general software engineer"],
    domain: "Core Computer Science & Software Systems",
    description:
      "Applies computer science fundamentals, data structures, algorithms, object-oriented design, system design, testing, and production engineering to solve complex software problems.",
    requiredSkills: [
      { skill: "Data Structures & Algorithms", critical: true, phase: "FOUNDATIONS" },
      { skill: "Git & Version Control", critical: true, phase: "FOUNDATIONS" },
      { skill: "Object-Oriented & Clean Code Design", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "Relational & NoSQL Databases", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "System Design & Architecture", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "Automated Testing & TDD", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "Concurrency & Asynchronous Systems", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Containerization & Cloud Basics", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Production Software Capstone", critical: true, phase: "PRACTICAL_PROJECTS" },
      { skill: "Algorithmic & System Design Interviews", critical: true, phase: "JOB_READINESS" },
    ],
    milestones: [
      {
        title: "Computer Science Fundamentals & Core Data Structures",
        phase: "FOUNDATIONS",
        description:
          "Master foundational data structures (Arrays, Linked Lists, Stacks, Queues, Hash Tables, Trees) and algorithmic complexity (Big-O).",
        whyItMatters:
          "Understanding memory layout and data structure trade-offs is required for writing efficient, high-performance software.",
        skillsCovered: ["Data Structures & Algorithms", "Git & Version Control", "Problem Solving"],
        technologies: ["TypeScript / Python / Java", "Git", "VS Code"],
        estimatedTime: "3-4 weeks",
        prerequisites: [],
        practicalTasks: [
          "Implement custom Hash Map with collision handling from scratch",
          "Solve 25+ algorithmic data structure problems analyzing time/space complexity",
        ],
        projectDeliverable:
          "Comprehensive Data Structures & Algorithms library with unit tests validating Big-O complexity",
        expectedOutcome:
          "Solid command of core data structures, memory trade-offs, and algorithmic efficiency.",
      },
      {
        title: "Advanced Algorithms: Graphs, Dynamic Programming & Sorting",
        phase: "CORE_CONCEPTS",
        description:
          "Master graph traversals (BFS, DFS, Dijkstra), divide-and-conquer, greedy algorithms, and dynamic programming.",
        whyItMatters:
          "Complex real-world problems (routing, resource allocation, optimization) map directly to advanced graph and DP algorithms.",
        skillsCovered: ["Data Structures & Algorithms", "Graph Theory", "Dynamic Programming"],
        technologies: ["TypeScript / Python", "Jest / Pytest"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Data Structures & Algorithms"],
        practicalTasks: [
          "Implement shortest-path navigation algorithm (Dijkstra/A*) on weighted graph",
          "Solve complex optimization problems using memoization and tabular DP",
        ],
        projectDeliverable:
          "Algorithmic problem-solving repository with automated test suites verifying edge cases",
        expectedOutcome:
          "Proficiency in graph algorithms, dynamic programming, and algorithmic problem-solving.",
      },
      {
        title: "Object-Oriented Design, SOLID Principles & Design Patterns",
        phase: "CORE_CONCEPTS",
        description:
          "Apply SOLID principles, design patterns (Factory, Singleton, Strategy, Observer, Adapter), and clean architectural layering.",
        whyItMatters:
          "Maintainable enterprise software demands modular, decoupled code that can evolve without breaking existing features.",
        skillsCovered: ["Object-Oriented & Clean Code Design", "Design Patterns", "Clean Architecture"],
        technologies: ["TypeScript / Java", "UML Modeling", "Design Patterns"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Data Structures & Algorithms"],
        practicalTasks: [
          "Refactor legacy monolithic codebase to adhere to SOLID principles",
          "Implement Strategy and Observer design patterns in an extensible event-processing system",
        ],
        projectDeliverable:
          "Modular software engine structured with clean architecture, design patterns, and high testability",
        expectedOutcome:
          "Ability to write clean, modular, and extensible object-oriented codebases.",
      },
      {
        title: "Databases, SQL & Data Access Architecture",
        phase: "INTERMEDIATE_SYSTEMS",
        description:
          "Design relational database schemas, execute complex SQL queries, manage database transactions (ACID), and explore NoSQL key-value stores.",
        whyItMatters:
          "Software engineers must know how to persist, query, and index data reliably across relational and non-relational stores.",
        skillsCovered: ["Relational & NoSQL Databases", "SQL", "Database Indexing"],
        technologies: ["PostgreSQL", "Redis", "SQL", "Docker"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Object-Oriented & Clean Code Design"],
        practicalTasks: [
          "Design normalized relational database schema with indexes and constraints",
          "Write ACID transaction handling concurrent balance updates safely",
        ],
        projectDeliverable:
          "High-performance data persistence layer with relational schemas, indexes, and connection pooling",
        expectedOutcome:
          "Proficiency in database schema design, transactions, and query optimization.",
      },
      {
        title: "Automated Testing, Test-Driven Development (TDD) & CI/CD",
        phase: "INTERMEDIATE_SYSTEMS",
        description:
          "Implement Test-Driven Development (TDD), unit testing, integration testing, mocking, and automated CI pipelines with GitHub Actions.",
        whyItMatters:
          "Rigorous automated testing prevents regressions, ensures code correctness, and enables safe continuous refactoring.",
        skillsCovered: ["Automated Testing & TDD", "CI/CD Workflows", "Code Quality"],
        technologies: ["Vitest / Jest / Pytest", "GitHub Actions", "ESLint"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Databases, SQL"],
        practicalTasks: [
          "Develop software feature strictly following the TDD Red-Green-Refactor cycle",
          "Configure automated GitHub Actions workflow enforcing test passes and lint standards on PRs",
        ],
        projectDeliverable:
          "Fully tested software project with >85% code coverage and automated GitHub Actions CI pipeline",
        expectedOutcome:
          "Expertise in automated testing strategies, TDD, and continuous integration workflows.",
      },
      {
        title: "Concurrency, Multithreading & Asynchronous Architecture",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Understand concurrency vs parallelism, race conditions, deadlocks, thread pools, async event loops, and atomic operations.",
        whyItMatters:
          "High-throughput systems must handle concurrent workloads safely without data races or performance bottlenecks.",
        skillsCovered: ["Concurrency & Asynchronous Systems", "Thread Safety", "Event Loops"],
        technologies: ["Node.js Workers / Java Threads / Python Asyncio", "Mutex / Locks"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Automated Testing & TDD"],
        practicalTasks: [
          "Implement thread-safe in-memory cache with concurrent read-write locks",
          "Build high-throughput async task processing worker pool",
        ],
        projectDeliverable:
          "Thread-safe concurrent processing library with benchmark tests proving race condition safety",
        expectedOutcome:
          "Deep understanding of concurrency, asynchronous programming, and thread safety.",
      },
      {
        title: "System Design, Scalability & Distributed Systems",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Architect scalable distributed systems: Load balancing, caching layers, database sharding, CAP theorem, and microservices.",
        whyItMatters:
          "Designing systems that scale from thousands to millions of users is the hallmark of a senior software engineer.",
        skillsCovered: ["System Design & Architecture", "Distributed Systems", "Scalability"],
        technologies: ["Docker", "Nginx", "PostgreSQL", "Redis", "Kafka"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Concurrency", "Databases"],
        practicalTasks: [
          "Design scalable system architecture for a high-traffic URL shortener or rate limiter",
          "Conduct load testing to analyze bottlenecks and implement caching strategies",
        ],
        projectDeliverable:
          "Complete System Design Document with component architecture diagrams, database schemas, and scalability calculations",
        expectedOutcome:
          "Ability to design, evaluate, and scale distributed software systems.",
      },
      {
        title: "Production Software Capstone & Algorithmic Interview Readiness",
        phase: "JOB_READINESS",
        description:
          "Deliver a production-ready software engineering capstone project, publish verified repository code, and practice live technical coding & system design interviews.",
        whyItMatters:
          "Demonstrating end-to-end software engineering excellence paired with strong problem-solving skills clears top-tier engineering interviews.",
        skillsCovered: [
          "Production Software Capstone",
          "Algorithmic & System Design Interviews",
          "Technical Interviews",
        ],
        technologies: ["TypeScript / Python", "Docker", "GitHub", "Cloud Deployment"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["System Design", "Testing"],
        practicalTasks: [
          "Deploy containerized production software capstone with CI/CD and architecture docs",
          "Complete 20+ timed live mock technical interviews covering algorithms and system design",
        ],
        projectDeliverable:
          "Production software repository with comprehensive test suite, CI/CD pipeline, system design architecture, and live deployment",
        expectedOutcome:
          "Job-ready Software Engineer equipped to ace technical coding, data structure, and system design interviews.",
      },
    ],
    projectExpectations: [
      "Modular, clean-architecture software application adhering to SOLID principles and design patterns",
      "Automated unit and integration test suite with >85% code coverage in CI/CD pipeline",
      "Comprehensive system design document detailing scalability, caching, and database partitioning",
    ],
    jobReadyOutcomes: [
      "Ability to write clean, efficient, maintainable software using strong computer science fundamentals",
      "Deep understanding of data structures, algorithms, system design, and testing",
      "Confidence in live technical coding interviews, algorithmic challenges, and system design reviews",
    ],
  },

  "UI/UX Designer": {
    roleName: "UI/UX Designer",
    aliases: [
      "ui/ux designer",
      "ui/ux",
      "ux designer",
      "ui designer",
      "product designer",
      "interaction designer",
      "user experience designer",
    ],
    domain: "Product Design & User Experience",
    description:
      "Designs intuitive, accessible, and delightful digital user experiences through user research, wireframing, interactive prototyping, visual design systems, and usability testing.",
    requiredSkills: [
      { skill: "UX Research & User Journeys", critical: true, phase: "FOUNDATIONS" },
      { skill: "Information Architecture & Wireframing", critical: true, phase: "FOUNDATIONS" },
      { skill: "Figma & Interactive Prototyping", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "Visual Design & Typography", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "Design Systems & Component Libraries", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "Usability Testing & Heuristic Evaluation", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "Accessibility (WCAG) Standards", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Micro-Interactions & Motion Design", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Comprehensive Design Case Study", critical: true, phase: "PRACTICAL_PROJECTS" },
      { skill: "Design Portfolio & Critique Readiness", critical: true, phase: "JOB_READINESS" },
    ],
    milestones: [
      {
        title: "UX Fundamentals, User Research & Problem Framing",
        phase: "FOUNDATIONS",
        description:
          "Master qualitative and quantitative user research methods, empathy mapping, user personas, problem framing, and journey mapping.",
        whyItMatters:
          "Great design begins with deep user empathy and clearly defined problem statements, not visual styling.",
        skillsCovered: ["UX Research & User Journeys", "User Personas", "Problem Framing"],
        technologies: ["Miro", "FigJam", "User Interview Guides"],
        estimatedTime: "2-3 weeks",
        prerequisites: [],
        practicalTasks: [
          "Conduct 5 user interviews to uncover core pain points",
          "Create detailed user persona and end-to-end user journey map",
        ],
        projectDeliverable:
          "Comprehensive User Research Document with empathy maps, user personas, and synthesized problem statements",
        expectedOutcome:
          "Solid foundation in user research methodologies and user-centered design thinking.",
      },
      {
        title: "Information Architecture, User Flows & Low-Fi Wireframing",
        phase: "FOUNDATIONS",
        description:
          "Structure complex digital products using card sorting, site maps, user flow diagrams, and rapid low-fidelity wireframing.",
        whyItMatters:
          "Clear information architecture ensures users can effortlessly navigate and achieve their goals.",
        skillsCovered: ["Information Architecture & Wireframing", "User Flows", "Site Mapping"],
        technologies: ["Figma", "Whimsical", "Card Sorting Tools"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["UX Fundamentals"],
        practicalTasks: [
          "Design complete site map and user flow for a complex onboarding experience",
          "Create low-fidelity wireframe set for core mobile and desktop flows",
        ],
        projectDeliverable:
          "Low-fidelity wireframe clickable prototype demonstrating intuitive information architecture and user navigation",
        expectedOutcome:
          "Proficiency in structuring navigation hierarchies and rapid low-fi wireframing.",
      },
      {
        title: "Visual Design Mastery: Typography, Color & Layout Hierarchy",
        phase: "CORE_CONCEPTS",
        description:
          "Apply visual hierarchy, typographic scales, harmonious color palettes, spacing grids (8pt grid), and modern glass/neumorphic aesthetics.",
        whyItMatters:
          "High visual polish establishes trust, elevates brand perception, and enhances readability.",
        skillsCovered: ["Visual Design & Typography", "Color Theory", "Grid Systems"],
        technologies: ["Figma", "Adobe Illustrator", "Color Contrast Checkers"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Information Architecture"],
        practicalTasks: [
          "Construct typographic scale and curated brand color system with light/dark mode variations",
          "Design pixel-perfect high-fidelity desktop and mobile UI screens following the 8pt grid",
        ],
        projectDeliverable:
          "High-fidelity UI mockups for multi-screen responsive application with polished visual styling",
        expectedOutcome:
          "Command over modern visual design principles, typography, and responsive layout grids.",
      },
      {
        title: "Figma Advanced Prototyping, Variables & Auto-Layout",
        phase: "CORE_CONCEPTS",
        description:
          "Master advanced Figma capabilities: Auto-layout 5.0, component properties, variants, interactive components, and conditional prototype variables.",
        whyItMatters:
          "Interactive prototypes allow stakeholders and users to experience realistic app interactions before code is written.",
        skillsCovered: ["Figma & Interactive Prototyping", "Auto-Layout", "Figma Variables"],
        technologies: ["Figma", "Figma Variables", "Smart Animate"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Visual Design Mastery"],
        practicalTasks: [
          "Build fully responsive dynamic component with Auto-Layout constraints",
          "Create realistic clickable prototype using Figma variables and conditional logic for cart/checkout",
        ],
        projectDeliverable:
          "Fully interactive, stateful Figma prototype simulating realistic application workflows with micro-interactions",
        expectedOutcome:
          "Expertise in advanced Figma tooling, smart animate, and variable-driven prototyping.",
      },
      {
        title: "Design Systems, Tokens & Scalable Component Architecture",
        phase: "INTERMEDIATE_SYSTEMS",
        description:
          "Architect comprehensive design systems with design tokens (colors, spacing, shadows), atomic component libraries, and documentation.",
        whyItMatters:
          "Design systems empower multidisciplinary product teams to build consistent, cohesive experiences at scale.",
        skillsCovered: ["Design Systems & Component Libraries", "Design Tokens", "Atomic Design"],
        technologies: ["Figma Design Systems", "Zeroheight", "Tokens Studio"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Figma Advanced Prototyping"],
        practicalTasks: [
          "Create complete atomic design system library (Atoms, Molecules, Organisms)",
          "Define multi-brand design tokens supporting seamless theme switching",
        ],
        projectDeliverable:
          "Enterprise-grade Figma Design System with complete component variants, documentation, and token structure",
        expectedOutcome:
          "Ability to architect, maintain, and document scalable design systems.",
      },
      {
        title: "Accessibility (WCAG 2.2), Inclusivity & Usability Testing",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Implement WCAG 2.2 accessibility standards (contrast ratios, focus states, screen reader considerations) and conduct structured usability tests.",
        whyItMatters:
          "Ethical, commercial design must be usable by everyone, regardless of ability or assistive technology.",
        skillsCovered: [
          "Accessibility (WCAG) Standards",
          "Usability Testing & Heuristic Evaluation",
          "A11y Auditing",
        ],
        technologies: ["Stark", "Contrast Checkers", "Maze", "UserTesting"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Design Systems"],
        practicalTasks: [
          "Audit UI designs against WCAG AAA standards and resolve all contrast and touch-target deficiencies",
          "Run unmoderated usability testing session with Maze and synthesize actionable insight matrix",
        ],
        projectDeliverable:
          "Accessibility Audit Report and Usability Testing Synthesis with before/after design iterations",
        expectedOutcome:
          "Expertise in digital accessibility compliance and evidence-based usability evaluation.",
      },
      {
        title: "Micro-Interactions, Motion Design & Developer Handoff",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Design meaningful UI animations with Figma Smart Animate, Rive/Lottie, and prepare comprehensive developer handoff specs.",
        whyItMatters:
          "Smooth micro-interactions provide tactile feedback, while clean developer handoff ensures designs are implemented faithfully in code.",
        skillsCovered: ["Micro-Interactions & Motion Design", "Developer Handoff", "Rive / Lottie"],
        technologies: ["Figma Dev Mode", "Rive", "LottieFiles", "Zeplin"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Accessibility Standards"],
        practicalTasks: [
          "Animate delightful micro-interactions for pull-to-refresh and completion states",
          "Create developer handoff specification with layout specs, token mappings, and animation curves",
        ],
        projectDeliverable:
          "Motion design showcase and complete developer handoff documentation ready for engineering sprint",
        expectedOutcome:
          "Proficiency in motion design, interactive micro-animations, and engineering collaboration.",
      },
      {
        title: "Design Case Study, Portfolio & Technical Interview Readiness",
        phase: "JOB_READINESS",
        description:
          "Author in-depth design case studies highlighting end-to-end design thinking, build a personal portfolio website, and practice design whiteboard challenges.",
        whyItMatters:
          "Compelling case studies that demonstrate problem-solving reasoning and business impact are essential for landing top product design roles.",
        skillsCovered: [
          "Comprehensive Design Case Study",
          "Design Portfolio & Critique Readiness",
          "Whiteboard Challenges",
        ],
        technologies: ["Framer / Webflow / Notion", "Figma", "Portfolio Case Studies"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Micro-Interactions", "Usability Testing"],
        practicalTasks: [
          "Author comprehensive case study detailing problem framing, research, iterations, and final impact",
          "Conduct timed app critique and live whiteboard design challenge simulations",
        ],
        projectDeliverable:
          "Polished design portfolio containing 2+ verified case studies, interactive prototype links, and whiteboard challenge breakdown",
        expectedOutcome:
          "Job-ready UI/UX / Product Designer equipped with an outstanding portfolio and interview readiness.",
      },
    ],
    projectExpectations: [
      "End-to-end mobile app design case study from user research to high-fidelity prototype",
      "Scalable Figma design system with tokens, auto-layout variants, and accessibility audit",
      "Published design portfolio featuring interactive prototypes and design process documentation",
    ],
    jobReadyOutcomes: [
      "Ability to lead user research, wireframing, prototyping, and visual design for web and mobile products",
      "Deep understanding of design systems, WCAG accessibility, and developer handoff workflows",
      "Confidence in portfolio presentations, design critiques, and live whiteboard interview challenges",
    ],
  },

  "Power BI Developer": {
    roleName: "Power BI Developer",
    aliases: [
      "power bi developer",
      "power bi",
      "power bi analyst",
      "power bi engineer",
      "bi developer",
      "business intelligence developer",
    ],
    domain: "Business Intelligence & Data Analytics",
    description:
      "Transforms raw enterprise data into interactive business intelligence reports, data models, DAX measures, Power Query ETL pipelines, and executive dashboards.",
    requiredSkills: [
      { skill: "Business Intelligence & Data Modeling", critical: true, phase: "FOUNDATIONS" },
      { skill: "SQL for Business Intelligence", critical: true, phase: "FOUNDATIONS" },
      { skill: "Power Query & ETL Data Transformation", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "DAX (Data Analysis Expressions) Mastery", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "Interactive Power BI Dashboard Design", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "Row-Level Security (RLS) & Governance", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Power BI Service & Gateway Administration", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Executive BI Portfolio Capstone", critical: true, phase: "PRACTICAL_PROJECTS" },
      { skill: "BI Architecture & Technical Interview Readiness", critical: true, phase: "JOB_READINESS" },
    ],
    milestones: [
      {
        title: "BI Foundations, Dimensional Modeling & Star Schema Design",
        phase: "FOUNDATIONS",
        description:
          "Master business intelligence fundamentals, dimensional modeling (Fact and Dimension tables), Star Schema vs Snowflake schema, and granularity.",
        whyItMatters:
          "A properly modeled Star Schema is the single most important factor for fast DAX calculation and scalable Power BI reports.",
        skillsCovered: ["Business Intelligence & Data Modeling", "Star Schema Design", "Data Granularity"],
        technologies: ["Power BI Desktop", "Draw.io", "Excel"],
        estimatedTime: "2-3 weeks",
        prerequisites: [],
        practicalTasks: [
          "Design star schema data model with fact tables and conformed dimensions",
          "Identify and resolve many-to-many relationship ambiguities using bridge tables",
        ],
        projectDeliverable:
          "Dimensional Data Model diagram and architecture specification for enterprise sales operations",
        expectedOutcome:
          "Solid grasp of dimensional modeling, relationships, and data warehouse fundamentals.",
      },
      {
        title: "Advanced SQL for Power BI & Data Extraction",
        phase: "FOUNDATIONS",
        description:
          "Write advanced SQL queries for BI: Window functions (RANK, DENSE_RANK, LAG, LEAD), CTEs, views, aggregation, and query performance optimization.",
        whyItMatters:
          "Performing heavy data transformations and filtering upstream in SQL maximizes report responsiveness and query folding.",
        skillsCovered: ["SQL for Business Intelligence", "Window Functions", "Query Optimization"],
        technologies: ["SQL Server (SSMS)", "PostgreSQL", "SQL"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["BI Foundations"],
        practicalTasks: [
          "Write complex SQL views aggregating multi-year customer transactional metrics",
          "Implement window functions calculating rolling revenue and customer retention cohorts",
        ],
        projectDeliverable:
          "Optimized SQL view and query repository supplying cleansed datasets to Power BI",
        expectedOutcome:
          "Proficiency in SQL data manipulation, analytical functions, and view architecture.",
      },
      {
        title: "Power Query (M Language) & Automated ETL Pipelines",
        phase: "CORE_CONCEPTS",
        description:
          "Build robust ETL data transformation pipelines with Power Query and M: Query folding, unpivoting, merging, custom columns, and parameterized connections.",
        whyItMatters:
          "Clean, automated ETL pipelines prevent data discrepancies and ensure reports refresh seamlessly without manual intervention.",
        skillsCovered: ["Power Query & ETL Data Transformation", "M Language", "Query Folding"],
        technologies: ["Power Query", "Power BI Desktop", "M Code"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Advanced SQL"],
        practicalTasks: [
          "Build Power Query pipeline transforming messy semi-structured Excel/CSV exports into normalized tables",
          "Ensure query folding is maintained across multi-step SQL database connections",
        ],
        projectDeliverable:
          "Automated Power Query ETL pipeline with custom M functions and documented transformation steps",
        expectedOutcome:
          "Mastery over data ingestion, cleaning, and automated ETL workflows in Power Query.",
      },
      {
        title: "DAX Mastery: Measures, Time Intelligence & Context Transition",
        phase: "CORE_CONCEPTS",
        description:
          "Master Data Analysis Expressions (DAX): Row context vs Filter context, CALCULATE, ALL, FILTER, and Time Intelligence functions (YTD, QTD, MoM, YoY).",
        whyItMatters:
          "DAX enables dynamic, sophisticated business metrics that adapt instantaneously to user slicers and report filters.",
        skillsCovered: ["DAX (Data Analysis Expressions) Mastery", "CALCULATE & Context Transition", "Time Intelligence"],
        technologies: ["DAX Studio", "Power BI Desktop", "Tabular Editor"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Power Query & ETL"],
        practicalTasks: [
          "Implement dynamic Year-over-Year (YoY) growth and rolling 12-month average DAX measures",
          "Optimize slow DAX calculations using DAX Studio query plans and server timings",
        ],
        projectDeliverable:
          "Comprehensive DAX calculation group repository and optimized KPI measure library",
        expectedOutcome:
          "Expertise in writing, debugging, and optimizing complex DAX calculations.",
      },
      {
        title: "Executive Dashboard Design, Data Storytelling & UX",
        phase: "INTERMEDIATE_SYSTEMS",
        description:
          "Design executive-ready Power BI reports: Visual hierarchy, bookmarks, drill-throughs, custom tooltips, responsive layout themes, and storytelling.",
        whyItMatters:
          "Clear visual storytelling ensures executive decision-makers can extract critical actionable insights at a glance.",
        skillsCovered: ["Interactive Power BI Dashboard Design", "Data Storytelling", "Bookmarks & Drillthroughs"],
        technologies: ["Power BI Desktop", "Figma for Power BI", "Charticulator"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["DAX Mastery"],
        practicalTasks: [
          "Design custom executive dashboard layout in Figma and implement in Power BI with custom navigation",
          "Build interactive scenario analysis using what-if parameters and bookmark toggles",
        ],
        projectDeliverable:
          "Executive-ready interactive Power BI report with custom navigation, drill-through pages, and KPI cards",
        expectedOutcome:
          "Ability to craft compelling, user-friendly business intelligence dashboards.",
      },
      {
        title: "Enterprise Governance, Row-Level Security (RLS) & Gateway Config",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Implement dynamic Row-Level Security (RLS) using USERPRINCIPALNAME, configure Power BI on-premises data gateways, and scheduled data refreshes.",
        whyItMatters:
          "Enterprise BI systems must guarantee strict data confidentiality so users only see data they are authorized to view.",
        skillsCovered: ["Row-Level Security (RLS) & Governance", "On-Premises Data Gateways", "Scheduled Refreshes"],
        technologies: ["Power BI Service", "Power BI Gateway", "Azure Active Directory"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Executive Dashboard Design"],
        practicalTasks: [
          "Implement dynamic RLS role filtering regional sales data based on user email address",
          "Configure on-premises data gateway and automated daily refresh schedule with error alerts",
        ],
        projectDeliverable:
          "Secured Power BI deployment with dynamic RLS, automated gateway refreshes, and governance matrix",
        expectedOutcome:
          "Proficiency in enterprise BI security, governance, and gateway infrastructure.",
      },
      {
        title: "Power BI Service, App Workspaces & ALM Deployment Pipelines",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Manage Power BI Service workspaces, publish Power BI Apps, configure Deployment Pipelines (Dev/Test/Prod), and perform Tabular Model optimization.",
        whyItMatters:
          "Continuous BI lifecycle management (ALM) ensures bug-free report upgrades and seamless corporate distribution.",
        skillsCovered: ["Power BI Service & Gateway Administration", "Deployment Pipelines", "Tabular Model Optimization"],
        technologies: ["Power BI Service", "Tabular Editor 3", "Power BI Deployment Pipelines"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Enterprise Governance"],
        practicalTasks: [
          "Set up automated 3-stage Deployment Pipeline (Development -> Test -> Production)",
          "Optimize Tabular Model memory footprint using VertiPaq analyzer in DAX Studio",
        ],
        projectDeliverable:
          "Enterprise Power BI App workspace with multi-environment deployment pipeline and VertiPaq performance report",
        expectedOutcome:
          "Expertise in managing Power BI Service distribution, workspace lifecycle, and performance tuning.",
      },
      {
        title: "Executive BI Portfolio Capstone & Technical Interview Readiness",
        phase: "JOB_READINESS",
        description:
          "Deliver a complete corporate BI solution capstone (SQL ETL + Star Schema + Advanced DAX + Executive App), publish interactive portfolio, and ace technical BI interviews.",
        whyItMatters:
          "A verified live portfolio demonstrating end-to-end data modeling and executive reporting capabilities clears top BI developer interviews.",
        skillsCovered: [
          "Executive BI Portfolio Capstone",
          "BI Architecture & Technical Interview Readiness",
          "Business Storytelling",
        ],
        technologies: ["Power BI Desktop", "Power BI Service", "SQL", "DAX Studio", "GitHub / Portfolio"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Power BI Service", "DAX Mastery"],
        practicalTasks: [
          "Publish interactive web-embedded Power BI portfolio showcase with case study write-up",
          "Practice scenario-based BI technical interviews (e.g. solve DAX context questions, model complex inventory systems)",
        ],
        projectDeliverable:
          "Full-scale enterprise Power BI Capstone project with SQL scripts, PBIX model file, DAX measure documentation, and live demo link",
        expectedOutcome:
          "Job-ready Power BI Developer equipped with an outstanding portfolio and interview readiness.",
      },
    ],
    projectExpectations: [
      "Enterprise Sales & Financial Performance Dashboard with Star Schema and dynamic DAX metrics",
      "Dynamic Row-Level Security implementation restricting data visibility across business regions",
      "Published interactive Power BI portfolio with comprehensive data modeling documentation",
    ],
    jobReadyOutcomes: [
      "Ability to architect and deploy complete end-to-end Power BI solutions for enterprise organizations",
      "Deep expertise in Star Schema data modeling, Power Query M transformations, and advanced DAX calculations",
      "Confidence in BI technical interviews, system architecture discussions, and executive presentations",
    ],
  },

  "Data Analyst": {
    roleName: "Data Analyst",
    aliases: [
      "data analyst",
      "business analyst",
      "analytics engineer",
      "bi analyst",
      "business intelligence analyst",
      "data analytics",
    ],
    domain: "Data Analytics & Business Intelligence",
    description:
      "Collects, cleans, analyzes, and visualizes data to uncover actionable business insights, drive decision-making, and build informative analytical dashboards.",
    requiredSkills: [
      { skill: "Spreadsheets & Excel Modeling", critical: true, phase: "FOUNDATIONS" },
      { skill: "SQL for Data Analysis", critical: true, phase: "FOUNDATIONS" },
      { skill: "Python for Data Analysis (Pandas/NumPy)", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "Data Cleaning & Exploratory Data Analysis (EDA)", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "BI & Dashboard Visualization (Tableau/Power BI)", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "Applied Business Statistics & A/B Testing", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Data Storytelling & Executive Presentation", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "End-to-End Analytical Case Study", critical: true, phase: "PRACTICAL_PROJECTS" },
      { skill: "Analytics Technical Interview Readiness", critical: true, phase: "JOB_READINESS" },
    ],
    milestones: [
      {
        title: "Analytical Problem Framing & Advanced Excel Modeling",
        phase: "FOUNDATIONS",
        description:
          "Master structured business problem framing, advanced spreadsheet formulas (XLOOKUP, INDEX/MATCH), Pivot Tables, dynamic arrays, and financial modeling.",
        whyItMatters:
          "Excel remains the universal lingua franca for rapid data inspection, business logic prototyping, and ad-hoc financial modeling.",
        skillsCovered: ["Spreadsheets & Excel Modeling", "Pivot Tables", "Problem Framing"],
        technologies: ["Microsoft Excel", "Google Sheets"],
        estimatedTime: "2-3 weeks",
        prerequisites: [],
        practicalTasks: [
          "Build dynamic multi-tab financial model with sensitivity analysis and scenarios",
          "Clean messy sales dataset using advanced lookup and text manipulation formulas",
        ],
        projectDeliverable:
          "Dynamic financial/sales analysis spreadsheet model with interactive pivot charts and automated summary KPIs",
        expectedOutcome:
          "Solid command of advanced spreadsheet functions, pivot analysis, and business modeling.",
      },
      {
        title: "SQL Mastery for Data Extraction, Aggregation & Joins",
        phase: "FOUNDATIONS",
        description:
          "Master relational querying: Multi-table JOINs, GROUP BY aggregations, HAVING filters, subqueries, Common Table Expressions (CTEs), and window functions.",
        whyItMatters:
          "SQL is the #1 mandatory technical skill for every data analyst to extract and transform warehouse data independently.",
        skillsCovered: ["SQL for Data Analysis", "SQL Joins & Aggregations", "Window Functions (RANK, LAG, LEAD)"],
        technologies: ["PostgreSQL", "MySQL", "DBeaver", "SQL"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Analytical Problem Framing"],
        practicalTasks: [
          "Write complex SQL queries calculating monthly customer retention cohorts",
          "Perform multi-table relational joins aggregating marketing campaign performance metrics",
        ],
        projectDeliverable:
          "SQL analytics query repository solving 15+ real-world business scenarios with documented query logic",
        expectedOutcome:
          "Fluency in complex SQL querying, cohort calculations, and analytical data retrieval.",
      },
      {
        title: "Python Data Analysis: Pandas, NumPy & Data Wrangling",
        phase: "CORE_CONCEPTS",
        description:
          "Manipulate and transform structured datasets using Python, Pandas DataFrames, and NumPy: Filtering, grouping, merging, handling missing values, and datetime operations.",
        whyItMatters:
          "Python allows analysts to automate repetitive analysis, process datasets exceeding Excel limits, and build reproducible workflows.",
        skillsCovered: ["Python for Data Analysis (Pandas/NumPy)", "Data Cleaning", "Data Transformation"],
        technologies: ["Python", "Pandas", "NumPy", "Jupyter Notebooks"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["SQL Mastery"],
        practicalTasks: [
          "Clean and impute missing data in a 500,000-row real-world dataset using Pandas",
          "Perform feature engineering creating customer lifetime value and recency metrics",
        ],
        projectDeliverable:
          "Reproducible Jupyter Notebook executing automated data cleaning, transformation, and statistical profiling",
        expectedOutcome:
          "Proficiency in Python, Pandas data wrangling, and automated data processing.",
      },
      {
        title: "Exploratory Data Analysis (EDA) & Data Visualization",
        phase: "CORE_CONCEPTS",
        description:
          "Conduct thorough Exploratory Data Analysis (EDA) using Matplotlib, Seaborn, and Plotly to identify outliers, correlation matrices, and distribution patterns.",
        whyItMatters:
          "Visual data exploration uncovers hidden trends and anomalous patterns that summary statistics alone obscure.",
        skillsCovered: [
          "Data Cleaning & Exploratory Data Analysis (EDA)",
          "Data Visualization (Seaborn/Plotly)",
          "Statistical Profiling",
        ],
        technologies: ["Matplotlib", "Seaborn", "Plotly", "Jupyter"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Python Data Analysis"],
        practicalTasks: [
          "Generate interactive distribution and correlation heatmaps identifying churn drivers",
          "Perform hypothesis-driven exploratory analysis on e-commerce transaction dataset",
        ],
        projectDeliverable:
          "Comprehensive EDA report with publication-grade interactive charts and statistical insight summaries",
        expectedOutcome:
          "Expertise in exploratory data analysis, visual pattern recognition, and statistical visualization.",
      },
      {
        title: "Business Intelligence & Interactive Dashboards (Tableau / Power BI)",
        phase: "INTERMEDIATE_SYSTEMS",
        description:
          "Build production BI dashboards in Tableau or Power BI: Calculated fields, parameters, dynamic filters, visual hierarchy, and KPI scorecards.",
        whyItMatters:
          "Interactive dashboards empower business stakeholders to explore data self-sufficiently and monitor organizational KPIs.",
        skillsCovered: ["BI & Dashboard Visualization (Tableau/Power BI)", "Interactive Dashboard Design", "KPI Tracking"],
        technologies: ["Tableau Desktop", "Power BI Desktop", "Figma for Dashboard Layouts"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Exploratory Data Analysis"],
        practicalTasks: [
          "Build interactive executive sales performance dashboard with drill-down filters",
          "Design automated KPI alerting scorecard tracking operational target variance",
        ],
        projectDeliverable:
          "Published interactive Tableau / Power BI dashboard solving an executive business monitoring use case",
        expectedOutcome:
          "Ability to construct compelling, interactive BI dashboards that drive business decisions.",
      },
      {
        title: "Applied Statistics, Probability & A/B Testing Frameworks",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Apply descriptive and inferential statistics: Hypothesis testing (t-tests, z-tests, Chi-square), confidence intervals, p-values, sample size calculation, and A/B test analysis.",
        whyItMatters:
          "Rigorous statistical analysis prevents false conclusions and validates whether product/marketing experiments truly drove measurable impact.",
        skillsCovered: ["Applied Business Statistics & A/B Testing", "Hypothesis Testing", "Statistical Significance"],
        technologies: ["Python (SciPy/Statsmodels)", "Excel Analysis Toolpak"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Python Data Analysis"],
        practicalTasks: [
          "Design and evaluate simulated marketing A/B test with sample size determination and p-value validation",
          "Conduct Chi-square test of independence on user conversion segments",
        ],
        projectDeliverable:
          "Statistical A/B test experimentation report with significance testing and executive recommendations",
        expectedOutcome:
          "Solid command of hypothesis testing, experimentation design, and statistical validation.",
      },
      {
        title: "Data Storytelling, Executive Reporting & Business Strategy",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Translate complex technical findings into clear, persuasive executive summaries, slide decks, and strategic business recommendations.",
        whyItMatters:
          "Data insights are useless unless communicated persuasively to non-technical executive decision-makers.",
        skillsCovered: ["Data Storytelling & Executive Presentation", "Executive Presentations", "Business Strategy"],
        technologies: ["Google Slides / PowerPoint", "Notion", "Tableau Story Points"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Applied Statistics", "BI Dashboards"],
        practicalTasks: [
          "Author 10-slide executive presentation delivering strategic growth recommendations backed by data",
          "Present analytical findings live simulating an executive stakeholder Q&A session",
        ],
        projectDeliverable:
          "Executive Presentation slide deck and 1-page memo summarizing data-backed strategic recommendations",
        expectedOutcome:
          "Mastery over business communication, narrative structuring, and executive data presentation.",
      },
      {
        title: "End-to-End Analytical Case Study & Technical Interview Readiness",
        phase: "JOB_READINESS",
        description:
          "Deliver an end-to-end analytical case study (SQL extract -> Python EDA -> Statistical validation -> BI dashboard -> Executive presentation), and practice analytics coding & business case interviews.",
        whyItMatters:
          "A verified portfolio of real-world business case studies is the #1 asset for landing top Data Analyst positions.",
        skillsCovered: [
          "End-to-End Analytical Case Study",
          "Analytics Technical Interview Readiness",
          "SQL / Business Case Interviews",
        ],
        technologies: ["SQL", "Python", "Tableau / Power BI", "GitHub"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Data Storytelling", "SQL Mastery"],
        practicalTasks: [
          "Publish comprehensive portfolio project repository with README documentation and dashboard links",
          "Practice 15+ live technical SQL coding challenges and business case study interview scenarios",
        ],
        projectDeliverable:
          "Complete end-to-end Data Analytics portfolio case study with code repository, interactive dashboard, and presentation deck",
        expectedOutcome:
          "Job-ready Data Analyst equipped with an impressive portfolio, sharp SQL skills, and case study interview confidence.",
      },
    ],
    projectExpectations: [
      "Customer Cohort & Retention Analysis using Advanced SQL and Python",
      "Executive Interactive Sales Performance Dashboard built in Tableau or Power BI",
      "Statistical A/B Testing Experimentation analysis with business impact recommendations",
    ],
    jobReadyOutcomes: [
      "Ability to extract, clean, analyze, and visualize enterprise data to drive business decisions",
      "Deep expertise in SQL, Python (Pandas), Tableau/Power BI dashboards, and statistical A/B testing",
      "Confidence in technical SQL interviews, data analytics case studies, and executive presentations",
    ],
  },

  "Game Developer": {
    roleName: "Game Developer",
    aliases: [
      "game developer",
      "game dev",
      "unity developer",
      "unreal developer",
      "gameplay programmer",
      "game engineer",
    ],
    domain: "Game Development & Real-Time Interactive Systems",
    description:
      "Creates interactive 2D and 3D games, real-time physics simulations, gameplay systems, graphics shaders, and game AI using modern game engines and C#/C++.",
    requiredSkills: [
      { skill: "C# / C++ Programming for Games", critical: true, phase: "FOUNDATIONS" },
      { skill: "Game Engine Architecture (Unity / Unreal)", critical: true, phase: "FOUNDATIONS" },
      { skill: "Vector Math & Game Physics", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "Gameplay Mechanics & Input Systems", critical: true, phase: "CORE_CONCEPTS" },
      { skill: "Game AI & State Machines", critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: "Shaders, Lighting & Visual Effects (VFX)", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Audio, UI & Game Optimization", critical: false, phase: "ADVANCED_ARCHITECTURE" },
      { skill: "Playable Capstone Game Project", critical: true, phase: "PRACTICAL_PROJECTS" },
      { skill: "Game Development Portfolio & Interview Readiness", critical: true, phase: "JOB_READINESS" },
    ],
    milestones: [
      {
        title: "C# / C++ Programming & Game Engine Fundamentals",
        phase: "FOUNDATIONS",
        description:
          "Master object-oriented programming for game logic, memory management, game loops, game engine editor layout, and scene/entity hierarchies.",
        whyItMatters:
          "Game logic requires fast, deterministic code execution and deep familiarity with game engine component architectures.",
        skillsCovered: ["C# / C++ Programming for Games", "Game Engine Architecture", "Game Loops"],
        technologies: ["Unity / Unreal Engine", "C# / C++", "Visual Studio"],
        estimatedTime: "2-3 weeks",
        prerequisites: [],
        practicalTasks: [
          "Implement 2D character controller with responsive input handling",
          "Construct modular entity hierarchy utilizing component-based architecture",
        ],
        projectDeliverable:
          "Playable 2D prototype game with player movement, obstacles, and scoring mechanics",
        expectedOutcome:
          "Solid command of game engine architectures, game loops, and C#/C++ gameplay scripting.",
      },
      {
        title: "Game Math, Vectors & 2D/3D Physics Simulation",
        phase: "CORE_CONCEPTS",
        description:
          "Master linear algebra for games (Vectors, Dot Product, Cross Product, Quaternions), rigidbodies, colliders, raycasting, and trigger volumes.",
        whyItMatters:
          "Realistic motion, combat ranges, line-of-sight, and physical interactions are calculated using vector mathematics and physics engines.",
        skillsCovered: ["Vector Math & Game Physics", "Raycasting", "Collisions & Triggers"],
        technologies: ["Unity Physics / PhysX", "Vector Math", "C#"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Game Engine Fundamentals"],
        practicalTasks: [
          "Implement custom physics-based trajectory aiming and projectile simulation",
          "Use raycasts to build responsive jump-checks, wall-sliding, and interaction detection",
        ],
        projectDeliverable:
          "Physics-driven puzzle game with complex projectile trajectories, gravity zones, and collision puzzles",
        expectedOutcome:
          "Proficiency in vector math, rigidbodies, raycasting, and physics simulation.",
      },
      {
        title: "Gameplay Mechanics, State Machines & Inventory Systems",
        phase: "CORE_CONCEPTS",
        description:
          "Build robust gameplay architectures: Finite State Machines (FSM) for character actions, modular inventory systems, item pickups, and save/load serialization.",
        whyItMatters:
          "Scalable gameplay systems prevent spaghetti code and allow designers to add new items/abilities without breaking existing mechanics.",
        skillsCovered: ["Gameplay Mechanics & Input Systems", "Finite State Machines", "Inventory Architecture"],
        technologies: ["C# / C++", "ScriptableObjects / Unreal DataTables", "JSON Serialization"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Game Math & Physics"],
        practicalTasks: [
          "Build modular character state machine (Idle, Run, Jump, Attack, Dash, Hurt)",
          "Implement extensible grid-based inventory system with item stacking and persistent saves",
        ],
        projectDeliverable:
          "Action-adventure gameplay prototype featuring state-driven combat, modular inventory, and persistent game state saving",
        expectedOutcome:
          "Mastery over clean gameplay architecture, state machines, and data-driven game systems.",
      },
      {
        title: "Game Artificial Intelligence: NavMesh, Behavior Trees & State Machines",
        phase: "INTERMEDIATE_SYSTEMS",
        description:
          "Implement intelligent non-player characters (NPCs) using NavMesh pathfinding, Behavior Trees, sensory perception (sight/sound), and tactical combat AI.",
        whyItMatters:
          "Engaging game AI creates tension and challenge, turning passive environments into living, reactive worlds.",
        skillsCovered: ["Game AI & State Machines", "NavMesh Pathfinding", "Behavior Trees"],
        technologies: ["Unity NavMesh / Unreal AI", "Behavior Trees", "C# / C++"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Gameplay Mechanics"],
        practicalTasks: [
          "Implement AI enemy with patrol, investigation, chase, and attack behaviors using NavMesh",
          "Build Behavior Tree for boss fight with phase transitions and telegraphed special attacks",
        ],
        projectDeliverable:
          "Interactive stealth / combat simulation with multiple reactive AI enemy archetypes",
        expectedOutcome:
          "Expertise in game AI, autonomous pathfinding, and behavior tree decision-making.",
      },
      {
        title: "Shaders, Lighting, Post-Processing & Visual Effects (VFX)",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Author custom surface shaders (Shader Graph / HLSL), configure dynamic lighting, particle systems (VFX Graph / Niagara), and post-processing stacks.",
        whyItMatters:
          "Visual atmosphere and clear feedback effects are what give games their distinctive aesthetic feel and game juice.",
        skillsCovered: ["Shaders, Lighting & Visual Effects (VFX)", "Shader Graph / HLSL", "Particle Systems"],
        technologies: ["Shader Graph / Niagara", "HLSL", "Post-Processing Stack"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Gameplay Mechanics"],
        practicalTasks: [
          "Create custom water/dissolve shader using Shader Graph",
          "Author dynamic particle explosion and spell effects with screen shake and lighting feedback",
        ],
        projectDeliverable:
          "Visually striking real-time environment showcasing custom shaders, atmospheric lighting, and particle effects",
        expectedOutcome:
          "Ability to write custom shaders, configure dynamic lighting, and create satisfying visual effects.",
      },
      {
        title: "Game UI, Audio Systems & Profiling/Optimization",
        phase: "ADVANCED_ARCHITECTURE",
        description:
          "Build responsive game UI/HUDs, integrate dynamic spatial audio with sound managers, profile CPU/GPU bottlenecks, and optimize draw calls (LOD, occlusion culling).",
        whyItMatters:
          "Smooth frame rates (60+ FPS) and clear audio-visual feedback are essential for player immersion and commercial game release.",
        skillsCovered: ["Audio, UI & Game Optimization", "Draw Call Optimization", "Game Profiling"],
        technologies: ["Unity Profiler / Unreal Insight", "FMOD / Wwise", "LOD & Occlusion Culling"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Shaders & VFX"],
        practicalTasks: [
          "Profile game using Unity/Unreal Profiler and optimize memory allocations and batching to hit 60 FPS target",
          "Build dynamic sound manager handling spatial 3D audio, footsteps, and adaptive background music",
        ],
        projectDeliverable:
          "Fully optimized game build maintaining stable 60 FPS with responsive UI and dynamic spatial audio",
        expectedOutcome:
          "Deep understanding of game optimization, frame profiling, responsive UI, and audio integration.",
      },
      {
        title: "Playable Capstone Game Project: Polish & Cross-Platform Build",
        phase: "PRACTICAL_PROJECTS",
        description:
          "Develop a complete, standalone playable capstone game with menu systems, multiple levels, progressive difficulty, win/loss states, and cross-platform export.",
        whyItMatters:
          "Finishing and polishing a complete game from start to finish proves shipping competency to game studios.",
        skillsCovered: ["Playable Capstone Game Project", "Level Design", "Build Automation"],
        technologies: ["Unity / Unreal Engine", "Itch.io / Steam SDK", "GitHub"],
        estimatedTime: "3-4 weeks",
        prerequisites: ["Game UI & Optimization", "Game AI"],
        practicalTasks: [
          "Design and balance 3 complete game levels with progressive difficulty curve",
          "Generate standalone Windows, Mac, or WebGL release build and publish to Itch.io",
        ],
        projectDeliverable:
          "Published playable capstone game on Itch.io with trailer video, gameplay mechanics documentation, and source repository",
        expectedOutcome:
          "Accomplishment of shipping a fully finished, polished, and playable game.",
      },
      {
        title: "Game Industry Portfolio & Technical Interview Readiness",
        phase: "JOB_READINESS",
        description:
          "Construct a professional game developer portfolio with gameplay video reels, clean GitHub code samples, and practice gameplay engineering technical interviews.",
        whyItMatters:
          "Game studios hire developers who can explain clean architecture, 3D math, memory constraints, and show verified playable games.",
        skillsCovered: [
          "Game Development Portfolio & Interview Readiness",
          "Game Math & Architecture Interviews",
          "Code Quality",
        ],
        technologies: ["GitHub", "Itch.io", "Portfolio Website", "Gameplay Video Showreel"],
        estimatedTime: "2-3 weeks",
        prerequisites: ["Playable Capstone Game Project"],
        practicalTasks: [
          "Produce 60-second technical gameplay mechanics showreel highlighting code architecture",
          "Practice live game development technical interviews covering memory management, vector math, and engine lifecycles",
        ],
        projectDeliverable:
          "Professional Game Developer portfolio containing verified playable games, technical breakdown articles, and video reels",
        expectedOutcome:
          "Job-ready Game Developer prepared to pass technical studio interviews and gameplay programming evaluations.",
      },
    ],
    projectExpectations: [
      "Physics-based puzzle or platformer prototype with custom character movement and collision math",
      "Action/RPG prototype featuring state-driven combat, inventory, and reactive AI enemies",
      "Published playable multi-level capstone game on Itch.io with polished audio, VFX, and stable 60 FPS performance",
    ],
    jobReadyOutcomes: [
      "Ability to program complete 2D and 3D games in Unity or Unreal Engine using C# or C++",
      "Deep understanding of game loops, vector math, physics simulation, game AI, and performance profiling",
      "Confidence in gameplay programming interviews, math challenges, and studio technical tests",
    ],
  },
};

/**
 * Dynamically constructs a structured CanonicalRoleDefinition for any custom / less common role
 * ensuring that custom roles (e.g. "Salesforce Developer", "Blockchain Developer", "Embedded Rust Engineer")
 * receive a genuine role-specific curriculum instead of being converted into "Software Engineer".
 */
export function buildDynamicRoleDefinition(roleName: string): CanonicalRoleDefinition {
  const cleanName = roleName.trim();
  const domain = `${cleanName} Engineering & Domain Practice`;

  return {
    roleName: cleanName,
    aliases: [cleanName.toLowerCase()],
    domain,
    description: `Complete professional curriculum for ${cleanName}, covering foundational principles, core tools, intermediate systems, advanced practices, real-world projects, and job readiness.`,
    requiredSkills: [
      { skill: `${cleanName} Foundations`, critical: true, phase: "FOUNDATIONS" },
      { skill: `${cleanName} Core Tools & Syntax`, critical: true, phase: "CORE_CONCEPTS" },
      { skill: `${cleanName} Architecture & Systems`, critical: true, phase: "INTERMEDIATE_SYSTEMS" },
      { skill: `${cleanName} Advanced Implementation`, critical: true, phase: "ADVANCED_ARCHITECTURE" },
      { skill: `${cleanName} Production Capstone`, critical: true, phase: "PRACTICAL_PROJECTS" },
      { skill: `${cleanName} Professional Interview Readiness`, critical: true, phase: "JOB_READINESS" },
    ],
    milestones: [
      {
        title: `${cleanName} Foundations & Core Principles`,
        phase: "FOUNDATIONS",
        description: `Master foundational syntax, theoretical concepts, and development environment setup for ${cleanName}.`,
        whyItMatters: `A strong grounding in foundational concepts is essential for mastering advanced ${cleanName} capabilities.`,
        skillsCovered: [`${cleanName} Foundations`, "Core Principles", "Tooling Setup"],
        technologies: [`${cleanName} Core Tools`, "Git", "VS Code"],
        estimatedTime: "2-3 weeks",
        prerequisites: [],
        practicalTasks: [
          `Set up development environment for ${cleanName}`,
          "Build baseline fundamental exercises demonstrating core concepts",
        ],
        projectDeliverable: `Foundational project repository implementing core ${cleanName} logic with unit tests`,
        expectedOutcome: `Solid command of fundamental ${cleanName} concepts and development workflows.`,
      },
      {
        title: `${cleanName} Core Architecture & Data Workflows`,
        phase: "CORE_CONCEPTS",
        description: `Implement core domain components, data structures, and practical workflows specific to ${cleanName}.`,
        whyItMatters: `Building reliable production systems requires mastering modular architecture and data flow in ${cleanName}.`,
        skillsCovered: [`${cleanName} Core Tools & Syntax`, "Data Modeling", "API & Integration"],
        technologies: [`${cleanName} SDK / Frameworks`, "SQL / Data Stores"],
        estimatedTime: "3-4 weeks",
        prerequisites: [`${cleanName} Foundations`],
        practicalTasks: [
          "Develop modular components handling domain logic",
          "Integrate external services and data storage",
        ],
        projectDeliverable: `Modular ${cleanName} application demonstrating core domain problem solving`,
        expectedOutcome: `Proficiency in core ${cleanName} patterns and data structures.`,
      },
      {
        title: `${cleanName} Intermediate Systems & Security`,
        phase: "INTERMEDIATE_SYSTEMS",
        description: `Build scalable, secure intermediate features, error handling pipelines, and automated testing for ${cleanName}.`,
        whyItMatters: `Production standards demand robust error handling, security compliance, and automated test coverage.`,
        skillsCovered: [`${cleanName} Architecture & Systems`, "Security & Auth", "Automated Testing"],
        technologies: [`${cleanName} Testing Frameworks`, "Security Tools"],
        estimatedTime: "3-4 weeks",
        prerequisites: [`${cleanName} Core Architecture`],
        practicalTasks: [
          "Write automated test suite covering edge cases",
          "Implement security access controls and input validation",
        ],
        projectDeliverable: `Secured, well-tested ${cleanName} service with automated test reports`,
        expectedOutcome: `Ability to engineer secure and resilient ${cleanName} systems.`,
      },
      {
        title: `${cleanName} Advanced Architecture & Performance Tuning`,
        phase: "ADVANCED_ARCHITECTURE",
        description: `Optimize performance, architect distributed / scalable workflows, and implement advanced design patterns for ${cleanName}.`,
        whyItMatters: `Advanced architectural mastery enables systems to operate efficiently under high enterprise workloads.`,
        skillsCovered: [`${cleanName} Advanced Implementation`, "Performance Optimization", "Scalability"],
        technologies: [`${cleanName} Advanced Tooling`, "Profiling Tools", "CI/CD"],
        estimatedTime: "3-4 weeks",
        prerequisites: [`${cleanName} Intermediate Systems`],
        practicalTasks: [
          "Profile system bottlenecks and optimize execution latency",
          "Architect scalable multi-tier workflow adhering to best practices",
        ],
        projectDeliverable: `High-performance ${cleanName} architecture specification and benchmark results`,
        expectedOutcome: `Expertise in advanced patterns, optimization, and scaling for ${cleanName}.`,
      },
      {
        title: `${cleanName} Production Capstone Project`,
        phase: "PRACTICAL_PROJECTS",
        description: `Deliver an end-to-end, production-ready capstone project showcasing verified competency in ${cleanName}.`,
        whyItMatters: `A verifiable, high-quality capstone project is the strongest proof of practical hiring competence.`,
        skillsCovered: [`${cleanName} Production Capstone`, "End-to-End Delivery", "Documentation"],
        technologies: [`${cleanName} Ecosystem`, "GitHub", "Cloud / Deployment"],
        estimatedTime: "3-4 weeks",
        prerequisites: [`${cleanName} Advanced Architecture`],
        practicalTasks: [
          "Deploy complete production capstone with full documentation",
          "Publish verified source repository with automated build pipeline",
        ],
        projectDeliverable: `Production-ready ${cleanName} capstone project with live demo and architecture documentation`,
        expectedOutcome: `Demonstrated capability to deliver enterprise-grade ${cleanName} solutions.`,
      },
      {
        title: `${cleanName} Portfolio Presentation & Technical Interview Readiness`,
        phase: "JOB_READINESS",
        description: `Publish a professional portfolio showcasing ${cleanName} case studies and practice domain-specific technical interviews.`,
        whyItMatters: `Clear articulation of architectural decisions and verified portfolio evidence secures top job offers.`,
        skillsCovered: [
          `${cleanName} Professional Interview Readiness`,
          "Technical Communication",
          "Case Studies",
        ],
        technologies: ["Portfolio Website", "GitHub", "Interview Scenarios"],
        estimatedTime: "2-3 weeks",
        prerequisites: [`${cleanName} Production Capstone`],
        practicalTasks: [
          "Author technical case study breakdown of capstone project",
          "Practice domain-specific technical interview questions and scenario reviews",
        ],
        projectDeliverable: `Professional portfolio website featuring ${cleanName} projects and interview preparation notes`,
        expectedOutcome: `Job-ready ${cleanName} professional prepared to excel in technical assessments and interviews.`,
      },
    ],
    projectExpectations: [
      `Modular, well-tested ${cleanName} application demonstrating core concepts`,
      `Production capstone project with architecture documentation and verified code repository`,
    ],
    jobReadyOutcomes: [
      `Ability to architect, build, and deploy production ${cleanName} solutions independently`,
      `Deep understanding of domain best practices, tooling, and performance optimization`,
      `Confidence in technical interviews and professional portfolio presentations for ${cleanName}`,
    ],
  };
}

export const FALLBACK_ROLE_DEFINITION: CanonicalRoleDefinition = CANONICAL_ROLE_CURRICULA["Software Engineer"]!;
export const FALLBACK_SKILLS: RequiredSkill[] = FALLBACK_ROLE_DEFINITION.requiredSkills;

export const CAREER_SKILLS_MAP: Record<string, RequiredSkill[]> = Object.fromEntries(
  Object.entries(CANONICAL_ROLE_CURRICULA).map(([role, def]) => [role, def.requiredSkills])
);

/**
 * Resolves any target role string (from onboarding / profile) to its canonical curriculum.
 * If the role matches a known canonical role or alias, it returns the rich static curriculum.
 * If the role is custom/dynamic (e.g. "Salesforce Developer", "Power BI Developer"), it dynamically
 * constructs a tailored CanonicalRoleDefinition preserving the exact role identity!
 */
export function getCanonicalRoleDefinition(roleName?: string | null): CanonicalRoleDefinition {
  if (!roleName) return FALLBACK_ROLE_DEFINITION;

  const raw = String(roleName).trim();
  if (!raw) return FALLBACK_ROLE_DEFINITION;

  // 1. Direct exact key match
  if (CANONICAL_ROLE_CURRICULA[raw]) {
    return CANONICAL_ROLE_CURRICULA[raw]!;
  }

  const clean = raw.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();

  // 2. Exact match against aliases
  for (const def of Object.values(CANONICAL_ROLE_CURRICULA)) {
    if (def.roleName.toLowerCase() === clean) return def;
    if (def.aliases.some((a) => a.toLowerCase() === clean)) return def;
  }

  // 3. Specific domain keyword matching
  if (clean.includes("power bi") || clean.includes("powerbi")) {
    return CANONICAL_ROLE_CURRICULA["Power BI Developer"]!;
  }
  if (
    clean.includes("ui/ux") ||
    clean.includes("ui ux") ||
    clean.includes("product design") ||
    clean.includes("ux designer") ||
    clean.includes("ui designer") ||
    clean.includes("interaction design") ||
    clean.includes("user experience")
  ) {
    return CANONICAL_ROLE_CURRICULA["UI/UX Designer"]!;
  }
  if (
    clean.includes("game") ||
    clean.includes("unity") ||
    clean.includes("unreal") ||
    clean.includes("gameplay")
  ) {
    return CANONICAL_ROLE_CURRICULA["Game Developer"]!;
  }
  if (
    clean.includes("data anal") ||
    clean.includes("business anal") ||
    clean.includes("bi anal") ||
    clean.includes("business intelligence")
  ) {
    return CANONICAL_ROLE_CURRICULA["Data Analyst"]!;
  }
  if (
    clean.includes("frontend") ||
    clean.includes("front-end") ||
    clean.includes("front end") ||
    clean.includes("react dev")
  ) {
    return CANONICAL_ROLE_CURRICULA["Frontend Developer"]!;
  }
  if (
    clean.includes("backend") ||
    clean.includes("back-end") ||
    clean.includes("back end") ||
    clean.includes("node dev") ||
    clean.includes("api dev")
  ) {
    return CANONICAL_ROLE_CURRICULA["Backend Developer"]!;
  }
  if (
    clean.includes("full stack") ||
    clean.includes("fullstack") ||
    clean.includes("web developer") ||
    clean.includes("full-stack")
  ) {
    return CANONICAL_ROLE_CURRICULA["Full Stack Developer"]!;
  }
  if (clean.includes("software") || clean.includes("swe")) {
    return CANONICAL_ROLE_CURRICULA["Software Engineer"]!;
  }

  // 4. For any other custom / less common role allowed during onboarding,
  // dynamically build a role-tailored definition preserving the EXACT role name!
  return buildDynamicRoleDefinition(raw);
}

export function getRequiredSkillsForRole(roleName?: string | null): RequiredSkill[] {
  const roleDef = getCanonicalRoleDefinition(roleName);
  return roleDef.requiredSkills;
}

export const getCanonicalRoleCurriculum = getCanonicalRoleDefinition;

export function resolveTargetRoleKey(roleName?: string | null): string {
  const roleDef = getCanonicalRoleDefinition(roleName);
  return roleDef.roleName;
}
