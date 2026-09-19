# Product Requirements: Functional & Non-Functional

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Version Evaluated**: 1.0.0

---

## 1. Functional Requirements (FR)

### FR-1: Authentication & User Accounts
- **FR-1.1**: The system must support user registration and sign-in via Email/Password, Google OAuth, and GitHub OAuth ([auth.ts:L567-L649](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/lib/auth.ts#L567-L649)).
- **FR-1.2**: The system must support Two-Factor Authentication (2FA OTP) and email verification OTP ([auth.ts:L17](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/lib/auth.ts#L17)).
- **FR-1.3**: The system must assign a default role (`LEARNER`) and plan tier (`FREE`) upon creation ([auth.ts:L550-L564](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/lib/auth.ts#L550-L564)).
- **FR-1.4**: The system must provide a 1-click Demo Admin login for evaluation mode ([DemoAdminButton.tsx](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/components/auth/DemoAdminButton.tsx)).

### FR-2: Career Profile & Diagnostic Evaluation
- **FR-2.1**: The system must allow learners to configure a target role, target role name, experience level, and weekly available study hours ([career-profile.routes.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/profile/career-profile.routes.ts)).
- **FR-2.2**: The system must present a diagnostic question bank evaluating conceptual knowledge, debugging, and technical communication ([diagnostic.routes.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/diagnostic/diagnostic.routes.ts)).
- **FR-2.3**: Completed diagnostics must persist question answers, calculate an overall diagnostic score, and initialize user `SkillState` entries ([diagnostic-answer.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/diagnostic/services/diagnostic-answer.service.ts)).

### FR-3: Dynamic Roadmaps & Learning Path
- **FR-3.1**: The system must dynamically generate roadmap milestones tailored to target roles and skill debts ([learning-path.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/roadmap/services/learning-path.service.ts)).
- **FR-3.2**: Milestones must support statuses: `LOCKED`, `UPCOMING`, `CURRENT`, and `COMPLETED` ([schema.prisma:L318](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/prisma/schema.prisma#L318)).
- **FR-3.3**: The frontend must render roadmaps on an interactive graph canvas powered by `@xyflow/react` ([RoadmapGraphCanvas.tsx](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/components/dashboard/learner/learning-path/RoadmapGraph/RoadmapGraphCanvas.tsx)).

### FR-4: AI Skill Simulations
- **FR-4.1**: The system must deliver 4-stage simulations comprising: *Understand* (MCQ), *Debug* (code inspection), *Code* (syntax/pattern completion), and *Explain* (technical communication) ([skill-simulation.service.ts:L10-L41](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/assessments/services/skill-simulation.service.ts#L10-L41)).
- **FR-4.2**: Simulation submissions must evaluate each stage at 25% weight and update corresponding `SkillState` knowledge and practice scores ([skill-simulation.service.ts:L591-L646](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/assessments/services/skill-simulation.service.ts#L591-L646)).
- **FR-4.3**: Simulations must provide high-quality deterministic fallback content when external AI providers are offline ([skill-simulation.service.ts:L115](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/assessments/services/skill-simulation.service.ts#L115)).

### FR-5: Project Studio & Proof Graph
- **FR-5.1**: Flow A: Generate full-stack architectural build specifications tailored to active milestones ([portfolio.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/projects/services/portfolio.service.ts)).
- **FR-5.2**: Flow B: Import and inspect public GitHub repositories to extract tech stacks, Dockerfiles, CI/CD workflows, test suites, and commit data ([github-inspector.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/projects/services/github-inspector.service.ts)).
- **FR-5.3**: Issue cryptographically signed HMAC-SHA256 share tokens for public proof verification ([proof-graph.service.ts:L275-L294](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/proof-graph/services/proof-graph.service.ts#L275-L294)).

### FR-6: AI Resume & Mock Interview
- **FR-6.1**: Parse and score developer resumes against ATS benchmarks and specific job descriptions ([resume.routes.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/resume/resume.routes.ts)).
- **FR-6.2**: Provide simulated technical mock interview sessions with real-time feedback scoring ([interview.routes.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/interview/interview.routes.ts)).

### FR-7: Admin Control Center
- **FR-7.1**: Provide administrative dashboards for user management, role updates, audit logs, system health, and AI usage monitoring ([admin.routes.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/admin.routes.ts)).

---

## 2. Non-Functional Requirements (NFR)

### NFR-1: Reliability & Availability
- The AI Gateway must never fail with an unhandled HTTP 500 when external LLMs rate-limit or fail. It must cascade through up to 4 rotated Groq accounts, 2 OpenRouter keys, Google Gemini, Mistral, and finally offline deterministic generators ([chat.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts)).

### NFR-2: Performance & Latency
- High-frequency chat responses must utilize lightweight baseline context (1 database query) by default, loading deep career context (4 parallel queries) only when triggered by career keywords ([chat.service.ts:L326-L370](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts#L326-L370)).
- AI provider attempts must enforce strict timeouts (6,000ms for Groq, 12,000ms overall) using `AbortController` ([chat.service.ts:L173-L180](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts#L173-L180)).

### NFR-3: Security & Data Isolation
- Sensitive data access must be authenticated via Better Auth session cookies ([auth.middleware.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/middlewares/auth.middleware.ts)).
- The Next.js API proxy must validate against directory traversal (`..`, `\`) and protocol injection before forwarding to Express backend ([route.ts:L12-L23](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/app/api/proxy/[...path]/route.ts#L12-L23)).

### NFR-4: Observability
- All production requests must log structured data via Pino HTTP ([app.ts:L47-L57](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/app.ts#L47-L57)).
- All unhandled exceptions must persist to the database `ErrorLog` table asynchronously ([error.middleware.ts:L31-L33](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/middlewares/error.middleware.ts#L31-L33)).
- All AI inferences must record provider, model, tokens used, duration, and status in `AiUsageLog` ([chat.service.ts:L464-L480](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts#L464-L480)).
