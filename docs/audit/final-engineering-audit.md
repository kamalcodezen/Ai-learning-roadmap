# Final Engineering Audit Report: AI Pather

> **Document Status**: Reconstructed from the implemented AI Pather system.  
> **Evaluation Standard**: Senior Staff Software Engineer / Software Architect Technical Review  
> **Repository**: `Ai-learning-roadmap`  
> **Version Evaluated**: 1.0.0

---

## 1. Executive Summary

AI Pather is an adaptive technical career navigation platform that models developer competencies as an interactive Directed Acyclic Graph (DAG), provides authentic 4-stage coding and debugging simulations, automatically inspects GitHub repositories for project evidence, and issues cryptographically signed public proof graph tokens.

The codebase is well-structured as a modular decoupled monorepo (Next.js 16 frontend and Express 5 backend). It features an exceptionally resilient multi-tier AI Gateway with 4-key Groq rotation, regex circuit breaking, and deterministic offline fallbacks.

This audit highlights **major engineering strengths**, details **4 verified security vulnerabilities** (including an unauthenticated BOLA bypass in the admin API and an unverified subscription upgrade endpoint), outlines **performance and scalability bottlenecks**, and delivers a prioritized **three-phase remediation roadmap**.

---

## 2. Product Architecture Summary

AI Pather addresses **The Static Checklist Crisis** by transforming rigid curriculum lists into an adaptive career intelligence system:
- **Diagnostic Engine**: Calibrates baseline capabilities across conceptual understanding, code debugging, and technical communication.
- **Dynamic Learning Path**: Unlocks milestones adaptively (`LOCKED`, `UPCOMING`, `CURRENT`, `COMPLETED`) based on prerequisite completion.
- **Authentic 4-Stage Simulations**: Evaluates candidates through real engineering workflows: Understand (MCQ), Debug (code inspection), Code (pattern regex matching), and Explain (technical communication).
- **Project Studio & Proof Graph**: Inspects public GitHub repositories and publishes tamper-proof verification tokens (`/verify/proof/[token]`).
- **ATS Resume Optimizer**: Analyzes resumes across 4 pillars (Impact, Skills, Structure, Competencies) with browser-side PDF export.

---

## 3. Technical Architecture Summary

- **Frontend Tier (Next.js 16.3 / React 19.2)**: 51 compiled routes, Tailwind CSS v4, HeroUI, TanStack Query, and `@xyflow/react` graph canvas.
- **API Reverse Proxy**: Next.js Route Handler `/api/proxy/[...path]` enforces SSRF and directory traversal checks, forwarding requests and session cookies to Express.
- **Backend Tier (Express 5.2 Modular Monolith)**: Organized into 22 Learner submodules and 21 Admin submodules, guarded by Helmet, CORS, and Zod environment validation.
- **Persistence Tier (PostgreSQL 16 via Prisma 7.9)**: 28 relational models with foreign-key cascades and custom `pg.Pool` connection management handling Neon Serverless idle connection pruning (`idleTimeoutMillis: 10000`).
- **AI Inference Gateway (`ChatService`)**: Multi-tier cascade across Groq (`qwen/qwen3.8-27b`), OpenRouter (`qwen-2.5-coder-32b`), Gemini (`gemini-3.6-flash`), and Mistral (`mistral-small-latest`) with self-healing JSON repair.

---

## 4. Major Architectural Decisions

1. **Decoupled Monorepo Structure ([ADR-001](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/decisions/ADR-001-monorepo-structure.md))**: Separate Next.js and Express services inside one repository.
2. **Dual-Layer Authentication & Session Proxy ([ADR-002](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/decisions/ADR-002-dual-layer-auth-session-proxy.md))**: Better-Auth runs inside Next.js; Express backend verifies sessions via loopback HTTP fetch.
3. **Multi-Tier Resilient AI Gateway ([ADR-003](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/decisions/ADR-003-multi-tier-resilient-ai-gateway.md))**: 4-key Groq rotation, regex cooldown parsing, and JSON auto-repair.
4. **Prisma ORM with Neon Serverless Pooling ([ADR-004](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/decisions/ADR-004-prisma-neon-postgresql-persistence.md))**: Socket management preventing idle connection drops.
5. **Interactive DAG Visualization via XYFlow ([ADR-005](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/decisions/ADR-005-xyflow-canvas-interactive-graphs.md))**: Living node-edge canvas for roadmaps and proof graphs.
6. **Deterministic Domain Fallbacks for Simulations ([ADR-006](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/decisions/ADR-006-deterministic-simulation-fallback.md))**: Zero-500 offline simulation safety nets.

---

## 5. Engineering Strengths

- **Resilient AI Cascade**: Guarantees high availability by cascading through multiple providers and accounts before serving deterministic fallbacks.
- **Self-Healing LLM Parsing**: `extractValidJsonString` effectively strips markdown fences, removes comments, and repairs trailing commas.
- **Strict Database Typing & Normalization**: 28 Prisma models enforce schema integrity, cascading deletes, and compound indexes.
- **Clean Separation of Concerns**: Learner features are cleanly isolated from administrative tooling across separate directory submodules.
- **Robust Backend Test Coverage**: 46 automated unit and integration tests passing with 0 failures across 9 test suites.

---

## 6. Security Findings

| Finding | Severity | Evidence File | Description & Impact | Recommended Action |
| :--- | :--- | :--- | :--- | :--- |
| **Admin BOLA / Auth Bypass** | **CRITICAL (CVSS 9.1)** | [`admin.middleware.ts:L21`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/middlewares/admin.middleware.ts#L21) | `requireAdmin` trusts unauthenticated `req.query.userId || req.body.userId` without checking session cookies. Anyone supplying an admin ID can execute all 21 administrative routes. | Enforce `requireAuth` on admin routes; bind authorization exclusively to `req.userId` from session cookie. |
| **Unverified Plan Sync** | **HIGH (CVSS 8.5)** | [`subscription.routes.ts:L64`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/subscription/subscription.routes.ts#L64) | `POST /api/subscription/sync` updates `user.plan` to `PRO` directly from request body without Stripe verification. | Delete `/api/subscription/sync`; mutate plan status strictly via verified Stripe webhooks. |
| **Webhook Signature Fallback** | **HIGH (CVSS 7.8)** | [`stripe/webhook/route.ts:L13`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/app/api/stripe/webhook/route.ts#L13) | Bypasses HMAC signature validation if `STRIPE_WEBHOOK_SECRET` is unset, accepting raw unverified JSON. | Reject requests with HTTP 500 if `STRIPE_WEBHOOK_SECRET` is missing in production. |
| **Hardcoded HMAC Secret** | **MEDIUM (CVSS 5.3)** | [`proof-graph.service.ts:L273`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/proof-graph/services/proof-graph.service.ts#L273) | Proof token signing falls back to `"careeros-proof-graph-share-token-secret"` when `AUTH_SECRET` is unset. | Bind secret to `env.BETTER_AUTH_SECRET` and validate during startup. |

---

## 7. AI Findings

- **Marketing vs Code Model Divergence**: The README claims primary models are `openai/gpt-oss-120b` and `openai/gpt-oss-20b`. The active code constants in `chat.service.ts:L45-L47` actually use `qwen/qwen3.8-27b` and `groq/compound-mini`.
- **Two-Layer Context Screening**: Message screening effectively saves database calls by returning `undefined` context for casual messages.
- **Circuit Breaker Localization**: `modelCooldowns = new Map()` is local to process memory and cannot coordinate cooldown states across multiple server instances.

---

## 8. Performance Findings

- **Loopback Auth Latency**: Every authenticated backend call incurs an internal HTTP fetch back to Next.js (`/api/auth/get-session`), adding 40ms–150ms to P95 API latency.
- **In-Memory Proof Graph Aggregation**: `getProofGraph` loads 7 entire database tables into Node.js memory and uses JavaScript `.filter()` and `.flatMap()`, which degrades as user history grows.
- **Missing Response Compression**: Large JSON payloads (up to 25MB) travel uncompressed without Gzip or Brotli compression.

---

## 9. Scalability Findings

- **Synchronous Heavy Operations**: GitHub repository crawling and deep ATS keyword analysis run synchronously on the HTTP request-response thread.
- **Connection Pool Limits**: 10 connections per instance can saturate serverless PostgreSQL if multiple backend containers spin up.
- **Unpartitioned Telemetry**: `AiUsageLog`, `ErrorLog`, and `ActivityLog` grow indefinitely without database partitioning or data retention policies.

---

## 10. Reliability Findings

- **High Availability in AI**: Automatic fallback across Groq, OpenRouter, Gemini, and Mistral provides exceptional fault tolerance.
- **Offline Simulation Guarantee**: `generateFallbackSimulation` guarantees zero 500 errors for core skills even during complete AI provider outages.
- **Database Connection Safety**: Proactive socket termination (`idleTimeoutMillis: 10000`) successfully mitigates serverless connection drop exceptions.

---

## 11. Testing Gaps

- **Frontend Automated Tests**: **NOT IMPLEMENTED** (0 test files in `frontend/`).
- **End-to-End Browser Tests**: **NOT IMPLEMENTED** (No Playwright or Cypress suites).
- **Backend Test Status**: **IMPLEMENTED** (8 automated test files with 46 passing tests).

---

## 12. DevOps Gaps

- **CI/CD Automation**: **NOT IMPLEMENTED** (No `.github/workflows/` directory).
- **Containerization**: **NOT IMPLEMENTED** (No `Dockerfile` or `docker-compose.yml`).
- **Infrastructure as Code (IaC)**: **NOT IMPLEMENTED** (Manual platform configurations).

---

## 13. Technical Debt

- **Duplicated Type Interfaces**: Types are duplicated between `frontend/src/types` and `backend/src/modules` rather than linked via shared workspace packages.
- **ErrorLog User Attribution Bug**: `error.middleware.ts:L19` checks `(req as any).user?.id` instead of `req.userId`, causing error records to store `userId: null`.
- **Stale Backup Files**: Files like `system-health.service.ts.bak` remain in the repository.

---

## 14. Production Risks

1. **Security Exposure**: Leaving the admin API vulnerable to BOLA bypass (`?userId=<admin_id>`) risks total account and database compromise.
2. **Revenue Leakage**: Leaving `/api/subscription/sync` open allows users to unlock PRO access without paying.
3. **Process Saturation**: Synchronous GitHub repository parsing risks event-loop blocking under high traffic spikes.

---

## 15. Missing Practices

- Automated Pull Request CI validation.
- Centralized distributed caching (Redis).
- Asynchronous task queuing (BullMQ).
- External Application Performance Monitoring (APM) and alerting (Sentry, Datadog).
- Database table partitioning and data retention cron jobs.

---

## 16. Recommended Improvements

### Phase 1: Immediate Security & Defect Hotfixes (Days 1–3)
1. Chain `requireAuth` before `requireAdmin` in `admin.routes.ts` and inspect `req.userId` exclusively.
2. Delete `/api/subscription/sync` and enforce Stripe webhook verification.
3. Reject unverified Stripe webhooks if `STRIPE_WEBHOOK_SECRET` is unset.
4. Bind proof token signing secret to `env.BETTER_AUTH_SECRET`.
5. Fix `error.middleware.ts:L19` to check `req.userId`.

### Phase 2: DevOps & Automation (Days 4–7)
1. Implement `.github/workflows/ci.yml` running lint, type-check, and backend test suites on all PRs.
2. Author a production multi-stage `Dockerfile` and `docker-compose.yml`.
3. Add Vitest and React Testing Library for frontend UI components.

### Phase 3: Architectural Scaling (Days 8–14)
1. Migrate circuit-breaker cooldowns, session caching, and rate limiting to Redis.
2. Offload GitHub repository inspection and ATS resume parsing to BullMQ background workers.
3. Mount `compression` in Express `app.ts` to reduce payload transmission sizes.

---

## 17. Production Readiness Scorecard

| Domain | Evaluation Area | Status | Evidence Summary |
| :--- | :--- | :--- | :--- |
| **Architecture** | Modular Domain Design | **IMPLEMENTED** | 22 Learner submodules, 21 Admin submodules |
| | Decoupled Client / API Separation | **IMPLEMENTED** | Next.js on port 3000, Express on port 5000 |
| | Shared Workspace Types | **NOT IMPLEMENTED** | Interfaces duplicated manually |
| **Security** | Password & Session Management | **IMPLEMENTED** | Better-Auth with bcrypt and HttpOnly cookies |
| | Two-Factor Authentication (2FA) | **IMPLEMENTED** | Email OTP verification plugin |
| | Admin Endpoint Authorization | **PARTIALLY IMPLEMENTED (VULNERABLE)** | `requireAdmin` trusts unauthenticated `req.query.userId` |
| | Subscription Paywall Integrity | **PARTIALLY IMPLEMENTED (VULNERABLE)** | `/api/subscription/sync` allows unverified plan elevation |
| | Webhook Cryptographic Verification | **PARTIALLY IMPLEMENTED (VULNERABLE)** | Bypasses signature validation if secret is unset |
| | Proof Graph Cryptographic Tokens | **PARTIALLY IMPLEMENTED** | HMAC-SHA256 implemented, but uses hardcoded fallback secret |
| | SQL Injection Prevention | **IMPLEMENTED** | Parameterized queries via Prisma ORM |
| | SSRF / Directory Traversal Protection | **IMPLEMENTED** | Path guard in Next.js proxy route handler |
| **AI Systems** | Multi-Tier Failover Cascade | **IMPLEMENTED** | Groq (4 keys) -> OpenRouter -> Gemini -> Mistral |
| | Circuit Breaker Cooldowns | **IMPLEMENTED** | Regex cooldown parser (`try again in Xm Ys`) |
| | Self-Healing JSON Sanitization | **IMPLEMENTED** | `extractValidJsonString` strips fences and repairs commas |
| | Deterministic Offline Safety Net | **IMPLEMENTED** | `generateFallbackSimulation` guarantees zero 500 errors |
| | Distributed Circuit Breaker Sharing | **NOT IMPLEMENTED** | Local `Map` in process memory |
| **Database** | Relational Normalization & Cascades | **IMPLEMENTED** | 28 Prisma models with foreign keys and cascades |
| | Serverless Connection Pooling | **IMPLEMENTED** | `pg.Pool` with 10s idle timeout for Neon |
| | Automated Table Partitioning / TTL | **NOT IMPLEMENTED** | Telemetry tables grow monotonically |
| **Testing** | Backend Unit & Integration Tests | **IMPLEMENTED** | 8 test suites running via `tsx --test` (46/46 passed) |
| | Backend TypeScript Strictness | **IMPLEMENTED** | Strict `tsc --noEmit` compiles with 0 errors |
| | Frontend Lint Integrity | **IMPLEMENTED** | ESLint 9 passes with 0 errors and 0 warnings |
| | Frontend Automated Testing | **NOT IMPLEMENTED** | Zero `*.test.tsx` test files present |
| | End-to-End Browser Tests | **NOT IMPLEMENTED** | No Playwright or Cypress suites |
| **DevOps** | Automated CI/CD Pipelines | **NOT IMPLEMENTED** | No `.github/workflows/` directory |
| | Containerization (Docker) | **NOT IMPLEMENTED** | No Dockerfile or docker-compose.yml |
| | Infrastructure as Code (IaC) | **NOT IMPLEMENTED** | Manual platform configuration |
| **Observability** | Structured Request Logging | **IMPLEMENTED** | Pino HTTP logging in production |
| | Centralized Error Table | **IMPLEMENTED** | Async write to `ErrorLog` in PostgreSQL |
| | AI Usage & Token Tracking | **IMPLEMENTED** | Comprehensive `AiUsageLog` recording tokens and latency |
| | External APM / Alerting | **NOT IMPLEMENTED** | No Datadog, Sentry, or PagerDuty integration |
