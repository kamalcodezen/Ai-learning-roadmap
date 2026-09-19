# Technical Requirements Document (TRD): AI Pather

> **Document Status**: Reconstructed from the implemented AI Pather system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Authors**: Software Architecture, Security & DevOps Engineering  
> **Version Evaluated**: 1.0.0

---

## 1. System Objectives

The primary engineering objective of the AI Pather platform is to deliver a resilient, high-throughput career intelligence and technical mastery platform that:
1. Translates static syllabus checklists into interactive Directed Acyclic Graphs (DAGs) with automated prerequisite dependency tracking.
2. Provides zero-downtime AI generation across curriculum synthesis, simulation grading, and contextual mentorship through multi-tier fallback engineering.
3. Automatically evaluates code repositories and issues cryptographically verifiable competency proofs.

---

## 2. Functional Technical Requirements

| ID | Functional Area | Implemented Technical Requirement | Verification / Evidence |
| :--- | :--- | :--- | :--- |
| **FTR-01** | **Authentication** | Dual-tier Better-Auth with bcrypt hashing, session cookies (`HttpOnly`, `SameSite=lax`), and 2FA email OTP. | [`frontend/src/lib/auth.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/lib/auth.ts) |
| **FTR-02** | **API Reverse-Proxy** | Next.js dynamic Route Handler `/api/proxy/[...path]` proxying browser traffic to Express with traversal and SSRF guards. | [`route.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/app/api/proxy/[...path]/route.ts) |
| **FTR-03** | **Interactive Graph** | Client-side DAG rendering using `@xyflow/react` with custom milestone nodes and glowing status edges. | [`RoadmapGraphCanvas.tsx`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/components/dashboard/learner/learning-path/RoadmapGraph/RoadmapGraphCanvas.tsx) |
| **FTR-04** | **4-Stage Simulation** | Zod-validated 4-stage simulation (Understand, Debug, Code, Explain) with 25% stage weighting and `SkillState` score updates. | [`skill-simulation.service.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/assessments/services/skill-simulation.service.ts) |
| **FTR-05** | **GitHub Inspector** | Public GitHub repo tree crawler inspecting Dockerfiles, CI/CD configs, test frameworks, and commit history via GitHub REST API. | [`github-inspector.service.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/projects/services/github-inspector.service.ts) |
| **FTR-06** | **Proof Cryptography** | HMAC-SHA256 token signing over `{ u: userId, t: timestamp }` with timing-safe verification (`crypto.timingSafeEqual`). | [`proof-graph.service.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/proof-graph/services/proof-graph.service.ts) |
| **FTR-07** | **Readiness Engine** | Multi-dimensional scoring engine dynamically averaging up to 7 active assessed competencies. | [`readiness.service.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/readiness/services/readiness.service.ts) |
| **FTR-08** | **AI Resume & ATS** | 4-pillar ATS scanner with AI bullet point rewriting and client-side `@react-pdf/renderer` export. | [`resume-ai.service.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/resume/services/resume-ai.service.ts) |

---

## 3. Non-Functional Technical Requirements (NFR)

### A. Performance Requirements
- **NFR-P1 (AI Inference Latency)**: Primary conversational and structured responses must target $< 600\text{ms}$ latency via Groq LPU acceleration ([chat.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts)).
- **NFR-P2 (Inference Timeouts)**: Individual provider attempts must be capped via `AbortController` (Groq capped at 6,000ms; overall timeout capped at 12,000ms) ([chat.service.ts:L173-L180](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts#L173-L180)).
- **NFR-P3 (Context Sizing)**: Chat queries must screen messages against career keywords, defaulting to a lightweight 1-query baseline context to minimize database roundtrips ([chat.service.ts:L326-L345](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts#L326-L345)).

### B. Reliability & Availability Requirements
- **NFR-R1 (Zero-500 Error Guarantee)**: If all upstream LLM providers (Groq, OpenRouter, Gemini, Mistral) fail concurrently, the simulation engine must return calibrated deterministic offline simulations without returning HTTP 500 ([skill-simulation.service.ts:L115](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/assessments/services/skill-simulation.service.ts#L115)).
- **NFR-R2 (Database Connection Resilience)**: Node-postgres pool must set `idleTimeoutMillis: 10000` and handle idle socket termination gracefully to prevent Neon Serverless connection drop crashes ([prisma.ts:L27-L33](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/lib/prisma.ts#L27-L33)).
- **NFR-R3 (Circuit Breaker Cooldown)**: Providers returning HTTP 429 must parse retry windows (`try again in Xm Ys`) and pause calls to that key/model for the required duration plus a 1,500ms buffer ([chat.service.ts:L75-L97](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts#L75-L97)).

### C. Security Requirements
- **NFR-S1 (Defense-in-Depth Transport)**: Helmet security headers (CSP, HSTS, X-Frame-Options) and strict CORS origin validation matching `env.CORS_ORIGIN` must be enforced on Express ([app.ts:L36-L44](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/app.ts#L36-L44)).
- **NFR-S2 (Path Traversal & SSRF Guard)**: Next.js API proxy must reject requests containing `..`, `\`, or protocol indicators (`://`) ([route.ts:L12-L23](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/app/api/proxy/[...path]/route.ts#L12-L23)).
- **NFR-S3 (SQL Injection Prevention)**: All persistence queries must execute via Prisma parameterized queries ([schema.prisma](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/prisma/schema.prisma)).
- **NFR-S4 (Timing Attack Prevention)**: Proof token verification must utilize `crypto.timingSafeEqual` ([proof-graph.service.ts:L286](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/proof-graph/services/proof-graph.service.ts#L286)).

### D. Scalability Considerations
- **NFR-SC1 (Horizontal Worker Isolation)**: Heavy operations (such as multi-file GitHub repository crawling and deep ATS resume parsing) are identified for future extraction into asynchronous background worker queues (BullMQ + Redis).
- **NFR-SC2 (Shared Circuit Breaker State)**: In-process `modelCooldowns` Map must be externalized to Redis to support multi-container horizontal scaling without desynchronization.

---

## 4. AI-Specific Technical Requirements

1. **Self-Healing JSON Sanitization**: System prompt responses must pass through `extractValidJsonString`, which strips markdown fences (` ```json `), strips inline comments, and regex-repairs trailing commas before invoking `JSON.parse`.
2. **Query Complexity Routing**: Inbound chat prompts must be categorized into `simple` (1200 tokens), `normal` (1800 tokens), or `complex` (2200 tokens) to govern token budgets.
3. **Multi-Account Groq Key Rotation**: Up to 4 distinct Groq API keys must be rotated in round-robin fashion to distribute token consumption evenly.

---

## 5. Infrastructure & Operational Requirements

- **Runtime Environments**: Node.js 20.x or 22.x LTS (Backend), Next.js 16.3 with Turbopack (Frontend), PostgreSQL 16 (Neon Serverless).
- **Environment Schema**: All backend environment variables must be strictly validated at boot time via Zod (`backend/src/config/env.ts`).
- **Telemetry Logging**: Every AI invocation must persist provider, model, tokens used, duration, and status in the `AiUsageLog` database table.
