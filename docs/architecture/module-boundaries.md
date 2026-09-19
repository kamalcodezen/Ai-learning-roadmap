# Architecture: Module Boundaries & Separation of Concerns

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Version Evaluated**: 1.0.0

---

## 1. Domain Module Boundaries

The backend strictly separates learner feature workflows from administrative and system oversight workflows:

```
                  +-----------------------------------+
                  |        Express Application        |
                  +-----------------+-----------------+
                                    |
          +-------------------------+-------------------------+
          |                                                   |
+---------v----------+                             +----------v---------+
|   Learner Domain   |                             |    Admin Domain    |
| (22 Submodules)    |                             |  (21 Submodules)   |
+--------------------+                             +--------------------+
| - assessments      |                             | - system-health    |
| - copilot          |                             | - ai-usage         |
| - diagnostic       |                             | - error-logs       |
| - roadmap          |                             | - audit-logs       |
| - projects         |                             | - ai-sandbox       |
| - proof-graph      |                             | - broadcast        |
| - readiness        |                             | - analytics        |
| - resume           |                             | - users            |
+--------------------+                             +--------------------+
          |                                                   |
          +-------------------------+-------------------------+
                                    |
                  +-----------------v-----------------+
                  |      Shared Infrastructure        |
                  |  - ChatService (AI Gateway)       |
                  |  - Prisma Client & pg.Pool        |
                  |  - Error & Auth Middlewares       |
                  +-----------------------------------+
```

---

## 2. Learner Domain Submodules

| Module | Core Responsibility | Upstream Dependencies | Downstream Consumer |
| :--- | :--- | :--- | :--- |
| `copilot` | Central AI inference router, prompt builders, context extraction | Groq, OpenRouter, Gemini, Mistral SDKs | All AI-enabled modules (`resume`, `roadmap`, `assessments`, `projects`) |
| `diagnostic` | Initial question bank, user attempt scoring, initial baseline | `prisma.diagnosticAttempt`, `ChatService` | `profile`, `roadmap`, `readiness` |
| `roadmap` | Prerequisite dependency graph generation & milestone state tracking | `prisma.roadmap`, `prisma.milestone`, `career-skills.map` | Learning path canvas UI |
| `assessments` | 4-stage skill simulations, pattern-based code grading, deterministic fallbacks | `prisma.skillState`, `ChatService` | Skill gaps, Readiness scoring |
| `projects` | Full-stack project specs (Flow A) & GitHub repository import (Flow B) | GitHub REST API, `prisma.project`, `ChatService` | Proof Graph, Portfolio UI |
| `proof-graph` | Multi-node verified telemetry graph and HMAC-SHA256 share tokens | `prisma.projectEvidence`, `prisma.diagnosticAttempt` | Public verification `/verify/proof/[token]` |
| `readiness` | Multi-dimensional application readiness mathematical calculation | `prisma.skillState`, `prisma.project`, `careerProfile` | Career twin UI, Dashboard summary |
| `resume` | ATS 4-pillar resume scanning, AI bullet rewriting, and PDF generation | `prisma.resume`, `ChatService`, `@react-pdf/renderer` | Resume builder UI |
| `interview` | Technical mock interview questions and answer grading | `prisma.interviewSession`, `ChatService` | Readiness engine, Interview UI |
| `job-reality` | Industry job market scraping, role requirement matching | `prisma.careerProfile`, `ChatService` | Job reality dashboard |
| `gamification`| User XP ledger and milestone achievement awards | `prisma.XPTransaction`, `prisma.UserAchievement` | Learner profile and badge UI |

---

## 3. Admin Domain Submodules

| Module | Core Responsibility | Data Sources |
| :--- | :--- | :--- |
| `system-health` | Real-time monitoring of AI provider availability, latency, database ping | `ChatService.checkHealth()`, `prisma.$queryRaw` |
| `ai-usage` | Token expenditure, provider model usage, duration, and error trends | `prisma.aiUsageLog` |
| `error-logs` | Inspection of unhandled server exceptions and stack traces | `prisma.errorLog` |
| `audit-logs` | Administrative action audit trails (e.g. role modifications) | `prisma.adminAuditLog` |
| `ai-sandbox` | Interactive multi-model prompt testing playground | Groq SDK, OpenRouter, Gemini, Mistral |
| `broadcast` | Global platform announcement dispatching | `prisma.notification` |
| `users` | Paginated user accounts, plan adjustments, role elevations | `prisma.user` |
| `analytics` | Historical daily snapshot graphs and telemetry export | `prisma.analyticsSnapshot` |

---

## 4. Shared Infrastructure Boundaries

1. **AI Inference Isolation**: No domain service initiates direct HTTP requests to Groq, Gemini, or Mistral. All requests pass through `ChatService.processChat` or `ChatService.processJsonCompletion` located in [`backend/src/modules/learner/copilot/services/chat.service.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts).
2. **Session Verification Isolation**: The Express backend does not maintain its own session store or JWT verification secret. It delegates session token validation entirely to Next.js via [`auth.middleware.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/middlewares/auth.middleware.ts).
3. **Database Client Singleton**: All database access shares the pooled singleton exported from [`backend/src/lib/prisma.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/lib/prisma.ts).
