# Discovery: Target Users & Personas

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Version Evaluated**: 1.0.0

---

## 1. User Categorization (From Database & Code Evidence)

The AI Pather system recognizes two primary operational roles in its database schema and middleware:
- **`LEARNER`**: Primary platform consumers pursuing technical upskilling and career readiness.
- **`ADMIN`**: Platform operators, teachers, or evaluators overseeing system health, curriculum, users, and AI usage.

Evidence: [`backend/prisma/schema.prisma`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/prisma/schema.prisma#L69) and [`backend/src/middlewares/admin.middleware.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/middlewares/admin.middleware.ts#L44).

---

## 2. Learner Personas & User Profiles

### Persona 1: The Transitioning Software Developer ("Alex")
- **Experience Level**: `INTERMEDIATE` ([schema.prisma:L10-L13](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/prisma/schema.prisma#L10-L13))
- **Target Roles**: `Full Stack Developer`, `Backend Developer`, `DevOps Engineer` ([career-skills.map.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/career-alignment/services/career-skills.map.ts))
- **Primary Need**: Transition from basic frontend or scripting to production-grade distributed architectures and verifiable backend engineering.
- **Pain Points**:
  - Trapped in tutorial cycles without deep architectural confidence.
  - Missing hands-on debugging experience with real codebases.
  - Unsure how to structure full-stack capstone projects to impress hiring managers.
- **Relevant Platform Capabilities**:
  - 4-Stage Skill Simulations ([skill-simulation.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/assessments/services/skill-simulation.service.ts))
  - Project Studio Build Specifications (Flow A) & GitHub Import (Flow B) ([portfolio.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/projects/services/portfolio.service.ts))
  - Verifiable Proof Graph Tokens ([proof-graph.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/proof-graph/services/proof-graph.service.ts))

### Persona 2: The Self-Directed CS Student / Career Switcher ("Maya")
- **Experience Level**: `BEGINNER`
- **Target Roles**: `Frontend Developer`, `Full Stack Developer`, `AI Engineer`
- **Primary Need**: Clear, dynamic, adaptive roadmap that provides contextual answers when stuck on technical roadblocks.
- **Pain Points**:
  - Overwhelmed by disparate tools and frameworks.
  - Lack of immediate technical mentorship or feedback when coding.
  - Resume lacks keywords, formatting, or project impact metrics aligned to ATS requirements.
- **Relevant Platform Capabilities**:
  - Diagnostic Skill Assessment & Prerequisite Roadmap ([diagnostic-ai.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/diagnostic/services/diagnostic-ai.service.ts))
  - Interactive Roadmap Canvas with XYFlow graph visualization ([RoadmapGraphCanvas.tsx](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/components/dashboard/learner/learning-path/RoadmapGraph/RoadmapGraphCanvas.tsx))
  - Context-Aware AI Chat Copilot ([chat.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts))
  - ATS Resume Builder & AI Keyword Optimizer ([resume-ai.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/resume/services/resume-ai.service.ts))

---

## 3. Administrator / Educator Persona ("Dr. Aris")

### Persona 3: Technical Course Director & Academic Evaluator
- **Role**: `ADMIN`
- **Primary Need**: Real-time observability into student learning debt, completion rates, AI provider health, token expenditure, and academic integrity.
- **Relevant Platform Capabilities**:
  - Admin Overview Dashboard & Analytics ([dashboard.controller.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/dashboard/dashboard.controller.ts))
  - System Health & Provider Latency Tracker ([system-health.controller.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/system-health/system-health.controller.ts))
  - AI Usage, Token Metrics & Error Logs ([ai-usage.controller.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/ai-usage/ai-usage.controller.ts), [error-logs.controller.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/error-logs/error-logs.controller.ts))
  - Project Verification & Student Skill Proof Oversight ([projects.controller.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/projects/projects.controller.ts), [skill-proof.controller.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/skill-proof/skill-proof.controller.ts))
  - 1-Click Demo Admin Mode for instant evaluation ([DemoAdminButton.tsx](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/components/auth/DemoAdminButton.tsx), [route.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/app/api/auth/demo-admin/route.ts))

---

## 4. Subscription Plan Alignment

Learner capabilities are segmented by account plan (`FREE`, `PLUS`, `PRO` in [`backend/src/middlewares/plan.middleware.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/middlewares/plan.middleware.ts)):

| User Tier | Target Segment | Accessible Capabilities |
| :--- | :--- | :--- |
| **FREE** | Exploratory learners & onboarding candidates | Onboarding, initial diagnostic, active roadmap view, basic copilot queries, standard dashboard telemetry |
| **PLUS** | Active learners preparing for junior/mid roles | Interactive 4-stage coding simulations, Project Studio Flow A/B, Job reality scanner, AI Mock Interviews |
| **PRO** | Serious candidates entering active job search | Advanced AI resume optimization, unlimited mock interviews, capstone project architecture specs, verifiable proof tokens |
