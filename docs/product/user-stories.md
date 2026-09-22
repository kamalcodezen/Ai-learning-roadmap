# Product: User Stories & Acceptance Criteria

> **Document Status**: Reconstructed from the implemented AI Pather system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Methodology**: Agile User Stories & Verifiable Acceptance Criteria (Gherkin format where applicable)

---

## 1. Learner Journey User Stories

### US-01: Diagnostic Skill Assessment & Baseline Profiling
- **User Story**:  
  *As a new learner transitioning into a software role,*  
  *I want to complete an initial multi-category diagnostic assessment,*  
  *So that the platform can establish my baseline competencies and calibrate my learning path.*
- **Acceptance Criteria**:
  - **AC-01.1**: The system must present questions spanning conceptual understanding, code debugging, and technical communication ([diagnostic.routes.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/diagnostic/diagnostic.routes.ts)).
  - **AC-01.2**: Submitting the diagnostic must create a `DiagnosticAttempt` with status `COMPLETED` and calculate a score between 0 and 100 ([schema.prisma:L210-L234](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/prisma/schema.prisma#L210-L234)).
  - **AC-01.3**: Individual evaluated skills must initialize corresponding `SkillState` entries with baseline `knowledgeScore` and `practiceScore` without overwriting existing higher historical scores.

---

### US-02: Interactive Dynamic Roadmap Navigation
- **User Story**:  
  *As an active learner,*  
  *I want to view my roadmap as an interactive dependency graph with milestone unlocking logic,*  
  *So that I understand my critical prerequisite path and clear learning debts systematically.*
- **Acceptance Criteria**:
  - **AC-02.1**: Roadmaps must render as an interactive DAG canvas powered by `@xyflow/react` ([RoadmapGraphCanvas.tsx](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/components/dashboard/learner/learning-path/RoadmapGraph/RoadmapGraphCanvas.tsx)).
  - **AC-02.2**: Milestones must reflect one of four states: `LOCKED`, `UPCOMING`, `CURRENT`, or `COMPLETED` ([schema.prisma:L318](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/prisma/schema.prisma#L318)).
  - **AC-02.3**: Clicking a milestone must open an inspector drawer detailing estimated hours, strategic purpose ("Why"), target technologies, and unlocking prerequisites.

---

### US-03: Authentic 4-Stage Skill Mastery Simulations
- **User Story**:  
  *As a learner pursuing practical mastery,*  
  *I want to be tested through realistic engineering workflows (Understand, Debug, Code, Explain),*  
  *So that my evaluation reflects actual software engineering job responsibilities rather than trivia memorization.*
- **Acceptance Criteria**:
  - **AC-03.1**: The simulation generator must produce 4 distinct stages:
    1. *Stage 1 (Understand)*: Multiple-choice question on theoretical edge cases.
    2. *Stage 2 (Debug)*: Buggy code snippet requiring root-cause diagnosis.
    3. *Stage 3 (Code)*: Starter code implementation graded against structural pattern regexes (`requiredPatterns`).
    4. *Stage 4 (Explain)*: Written technical communication evaluated against core engineering concepts (`keyConcepts`).
  - **AC-03.2**: Submission must calculate overall score weighting each stage at exactly 25% ([skill-simulation.service.ts:L591-L596](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/assessments/services/skill-simulation.service.ts#L591-L596)).
  - **AC-03.3**: If external AI inference is rate-limited or offline, the system must transparently serve a domain fallback simulation with zero HTTP 500 errors ([skill-simulation.service.ts:L115](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/assessments/services/skill-simulation.service.ts#L115)).

---

### US-04: Project Studio & GitHub Evidence Verification
- **User Story**:  
  *As a candidate building a portfolio,*  
  *I want to generate architectural build specifications (Flow A) or import public GitHub repositories (Flow B),*  
  *So that my projects provide verified code telemetry for my proof graph.*
- **Acceptance Criteria**:
  - **AC-04.1**: Flow A must generate dynamic architectural requirements, entity models, and planned-vs-actual comparison data ([portfolio.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/projects/services/portfolio.service.ts)).
  - **AC-04.2**: Flow B must parse public GitHub URLs, inspecting repository files, Dockerfiles, CI/CD pipelines, and test frameworks ([github-inspector.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/projects/services/github-inspector.service.ts)).
  - **AC-04.3**: Project verification must link detected skills into `ProjectEvidence` and elevate the user's `projectScore` and `evidenceScore` in `SkillState`.

---

### US-05: Verifiable Public Proof Graph Token
- **User Story**:  
  *As a job-seeking developer,*  
  *I want to generate a tamper-proof public verification link for recruiters,*  
  *So that third parties can verify my technical competency without requiring a platform login.*
- **Acceptance Criteria**:
  - **AC-05.1**: The backend must generate a cryptographically signed HMAC-SHA256 token encoding `{ u: userId, t: timestamp }` ([proof-graph.service.ts:L275](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/proof-graph/services/proof-graph.service.ts#L275)).
  - **AC-05.2**: The public endpoint (`/api/proof-graph/public/:token`) must verify the signature using timing-safe comparison (`crypto.timingSafeEqual`).
  - **AC-05.3**: The public verification view (`/verify/proof/[token]`) must render candidate target role, verified skills, and project nodes without exposing private account credentials.

---

### US-06: ATS Resume Scanner & AI Bullet Rewriter
- **User Story**:  
  *As an applicant tailoring my job application,*  
  *I want to scan my resume against target job descriptions and receive 4-pillar ATS feedback,*  
  *So that my resume emphasizes quantifiable business impact and aligns with recruiter screening filters.*
- **Acceptance Criteria**:
  - **AC-06.1**: The ATS scanner must calculate scores across 4 pillars: Impact & Metrics, Skills Alignment, Structure & Formatting, and Core Competencies ([resume-ai.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/resume/services/resume-ai.service.ts)).
  - **AC-06.2**: The AI bullet rewriter must transform weak resume bullets into action-verb, metrics-driven accomplishment statements.
  - **AC-06.3**: The system must export production-ready PDF resumes generated directly in the browser via `@react-pdf/renderer`.

---

## 2. Administrator Journey User Stories

### US-07: Platform Observability & Health Monitoring
- **User Story**:  
  *As a platform administrator or course director,*  
  *I want real-time visibility into AI provider latencies, token consumption, and error trends,*  
  *So that I can identify system degradations and manage operational expenses.*
- **Acceptance Criteria**:
  - **AC-07.1**: The admin health dashboard must display live availability and latency for all configured AI providers ([system-health.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/system-health/system-health.service.ts)).
  - **AC-07.2**: The AI usage view must report token consumption, request counts, and error rates filterable by provider, model, and feature ([ai-usage.controller.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/ai-usage/ai-usage.controller.ts)).
  - **AC-07.3**: The error log viewer must display captured runtime exceptions, HTTP paths, and stack traces ([error-logs.controller.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/error-logs/error-logs.controller.ts)).

---

### US-08: AI Prompt Playground & Model Testing
- **User Story**:  
  *As a system engineer evaluating new model releases,*  
  *I want an administrative sandbox to test system prompts across Groq, OpenRouter, Gemini, and Mistral,*  
  *So that I can compare token efficiency and formatting compliance before deploying prompts.*
- **Acceptance Criteria**:
  - **AC-08.1**: The AI sandbox must list all available provider models ([ai-sandbox.controller.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/ai-sandbox/ai-sandbox.controller.ts)).
  - **AC-08.2**: The test runner must execute prompts against the selected model, displaying response content, execution duration, and token usage.

---

## 3. Constraints & Assumptions

### System Constraints:
1. **Third-Party Rate Limits**: AI inference is subject to upstream provider token limits (e.g. Groq TPM/RPM). The system must operate within multi-account rotation and circuit-breaker backoffs.
2. **Database Idle Timeouts**: Cloud serverless PostgreSQL (Neon) drops idle connections after short inactivity periods; the backend pool must close idle sockets proactively (`idleTimeoutMillis: 10000`).
3. **Stateless API Proxy**: The Next.js reverse proxy must stream request and response bodies without caching sensitive user payloads on disk.

### System Assumptions:
1. **GitHub API Availability**: Public repository inspection assumes reasonable GitHub REST API uptime; rate-limited requests receive a fallback repository profile.
2. **Modern Browser Support**: The client assumes browsers support ES2022, CSS Grid/Flexbox, Canvas rendering, and Web Audio/Workers.
