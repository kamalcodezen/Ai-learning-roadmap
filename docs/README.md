# AI Pather — Technical Engineering Documentation Suite

> **Evaluation Standard**: Senior Staff Software Engineer / Principal Architect Technical Review  
> **Repository**: `Ai-learning-roadmap`  
> **Status**: Verified & Reconstructed from Implemented System

Welcome to the comprehensive, evidence-based engineering documentation suite for **AI Pather**. This documentation reflects the actual system implementation, architecture, algorithms, database schema, AI gateway, and security posture derived from static code analysis.

---

## 📚 Documentation Index & Sitemap

### 1. Discovery & Product Foundations
- 🎯 **[Problem Statement](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/discovery/problem-statement.md)**: The Static Checklist Crisis and core problem spaces addressed by AI Pather.
- 👥 **[Target Users & Personas](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/discovery/target-users.md)**: Developer personas (Alex, Maya), administrator roles, and subscription tier mapping.
- 📊 **[Success Metrics & Telemetry](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/discovery/success-metrics.md)**: Four-pillar readiness formula, simulation weights, and proof thresholds.
- 🔭 **[Product Vision](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/product/product-vision.md)**: Strategic pillars (Dynamic Graphs, Resilient AI, Authentic Simulations, Verified Portfolios).
- 📋 **[Functional & Non-Functional Requirements](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/product/requirements.md)**: Full requirements breakdown mapped to code references.
- 📑 **[User Stories & Acceptance Criteria](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/product/user-stories.md)**: Reconstructed user stories, Gherkin criteria, constraints, and assumptions.
- 📄 **[Product Requirements Document (PRD)](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/product/PRD.md)**: Complete system scope, module matrix, and implementation status.
- 🛠️ **[Technical Requirements Document (TRD)](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/product/TRD.md)**: Deep functional, non-functional, security, and infrastructure technical specifications.

---

### 2. System Architecture & Diagrams
- 🏛️ **[System Architecture](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/architecture/system-architecture.md)**: High-level architectural pattern, full technology stack inventory, and request lifecycle.
- 🖥️ **[Frontend Architecture](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/architecture/frontend-architecture.md)**: Next.js 16 App Router topology (51 routes), XYFlow graph canvas, and state management.
- ⚙️ **[Backend Architecture](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/architecture/backend-architecture.md)**: Express 5 modular monolith, middleware pipeline, and Neon connection pool resilience.
- 🧩 **[Module Boundaries](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/architecture/module-boundaries.md)**: Separation of concerns between Learner (22 submodules) and Admin (21 submodules).
- 🛡️ **[Reliability Engineering](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/architecture/reliability.md)**: Fault isolation, provider cascades, retry behavior, and database pool protection.
- 📐 **[Architecture Diagrams](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/architecture/diagrams/architecture-diagrams.md)**: Mermaid topology, sequence diagrams, and failover flowcharts.

---

### 3. Architecture Decision Records (ADRs)
- 📝 **[ADR-001: Decoupled Monorepo Structure](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/decisions/ADR-001-monorepo-structure.md)**: Rationale for independent Next.js and Express services.
- 📝 **[ADR-002: Dual-Layer Authentication & Session Proxy](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/decisions/ADR-002-dual-layer-auth-session-proxy.md)**: Better-Auth Next.js integration with Express session loopback.
- 📝 **[ADR-003: Multi-Tier Resilient AI Gateway](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/decisions/ADR-003-multi-tier-resilient-ai-gateway.md)**: 4-Tier provider cascade, circuit breakers, and self-healing JSON repair.
- 📝 **[ADR-004: Prisma ORM with Neon PostgreSQL Pooling](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/decisions/ADR-004-prisma-neon-postgresql-persistence.md)**: Serverless connection pooling and idle timeout handling.
- 📝 **[ADR-005: Interactive DAG Visualization via XYFlow](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/decisions/ADR-005-xyflow-canvas-interactive-graphs.md)**: Living node-edge canvas for roadmaps and proof graphs.
- 📝 **[ADR-006: Deterministic Domain Fallbacks for Simulations](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/decisions/ADR-006-deterministic-simulation-fallback.md)**: Zero-500 offline simulation engine.

---

### 4. Database & API Contracts
- 💾 **[Database Design & Schema](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/database/database-design.md)**: 28 Prisma relational models, constraints, cascades, and compound indexes.
- 🔄 **[Data Flow & Mutational Lifecycles](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/database/data-flow.md)**: Diagnostic finalization, simulation grading, and project evidence linking.
- 🌐 **[API Contract & Specifications](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/api/api-contract.md)**: Complete REST endpoint catalog with auth and plan requirements.
- 🔐 **[API Authentication Flow](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/api/authentication-flow.md)**: Cookie security attributes, 2FA lifecycle, and loopback verification.

---

### 5. AI Systems & Inference Engineering
- 🤖 **[AI Gateway Architecture](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/ai/ai-architecture.md)**: `ChatService` implementation, model comparison (Code vs README), and JSON recovery.
- 🔄 **[AI Workflows & Prompt Engineering](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/ai/ai-workflow.md)**: Conversational copilot, JSON system tasks, and prompt constraints.
- 💰 **[AI Cost, Rate Limiting & Fallback Strategy](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/ai/ai-cost-and-fallback-strategy.md)**: Fair 4-key Groq rotation, regex cooldowns, and `AiUsageLog` persistence.

---

### 6. Security, Threat Modeling & Audits
- 🛡️ **[Security Architecture](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/security/security-architecture.md)**: Trust zones, Helmet headers, SSRF proxy guards, and HMAC token signing.
- ⚠️ **[Threat Model & Vulnerability Analysis](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/security/threat-model.md)**: STRIDE analysis and 4 verified vulnerability findings with code evidence.
- ✅ **[Security Checklist](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/security/security-checklist.md)**: Actionable verification checklist across Auth, RBAC, Network, and AI Safety.
- 🔍 **[Security Audit](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/audit/security-audit.md)**: In-depth technical breakdown of BOLA, subscription bypass, and webhook flaws.

---

### 7. Engineering Practices, Quality & DevOps
- 🧪 **[Testing Strategy & QA](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/engineering/testing-strategy.md)**: 8 backend automated test suites (`tsx --test`) and 29 manual test scripts.
- 🌿 **[Git Workflow & Repository Conventions](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/engineering/git-workflow.md)**: Monorepo commit conventions and proposed production branch protection.
- 🚨 **[Error Handling & Resilience Architecture](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/engineering/error-handling.md)**: Centralized error middleware, Zod formatting, and `ErrorLog` table.
- 🚢 **[Deployment Architecture & Guide](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/infrastructure/deployment.md)**: Vercel frontend, Render/Railway backend, and environment variables.
- 🔄 **[CI/CD Pipeline Analysis](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/infrastructure/ci-cd.md)**: Current state analysis and proposed GitHub Actions workflow.
- ⚙️ **[Environment & Configuration Strategy](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/infrastructure/environment-strategy.md)**: Zod schema environment validation.
- 📈 **[Observability & Monitoring Architecture](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/infrastructure/monitoring.md)**: Pino structured logging, AI telemetry tables, and admin views.

---

### 8. Audits & Production Readiness
- 🏛️ **[Architectural Audit](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/audit/architecture-audit.md)**: System strengths, loopback bottlenecks, and in-memory state concerns.
- ⚡ **[Performance Audit](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/audit/performance-audit.md)**: Auth hop latency, in-memory proof graph filtering, and compression analysis.
- 📈 **[Scalability Audit](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/audit/scalability-audit.md)**: Horizontal scaling blockers, database connection limits, and background queues.
- 📋 **[Production Readiness Scorecard](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/audit/production-readiness.md)**: Component-by-component readiness evaluation using strict status markers.
- 🏆 **[Final Engineering Audit Report](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/docs/audit/final-engineering-audit.md)**: Comprehensive 17-section final technical evaluation and remediation roadmap.
