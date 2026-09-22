# AIPather

AI-powered adaptive career roadmap and technical mastery engine that unifies dynamic prerequisite graphs, multi-model AI simulations, verifiable GitHub proof tokens, ATS resume intelligence, voice mock interviews, and enterprise-grade admin observability.

## 1. Project Title & Tagline
AIPather: a full-stack adaptive technical career navigation and skill mastery platform built as a Next.js 16 and Express 5 decoupled monorepo.

## 2. Problem Statement
Technical career preparation is crippled by **The Static Checklist Crisis**: traditional roadmaps provide rigid, linear lists of technologies that offer zero diagnostics when progress stalls, cannot detect missing prerequisite competencies, and produce no verifiable proof of ability for employers.

AIPather targets software engineering students and tech professionals by delivering a unified, intelligent platform for:
- **Practice:** Authentic 4-stage coding and debugging simulations (Understand, Debug, Code, Explain) plus voice-enabled AI technical mock interviews.
- **Improvement:** Contextual AI Copilot guidance, ATS 4-pillar resume optimization, and zero-guilt adaptive recovery.
- **Direction:** Dynamic prerequisite graphs that adapt to learning debt, career twin benchmarks, and cryptographically verified GitHub proof tokens.

## 3. Solution
AIPather unifies an interactive Next.js 16 (React 19) frontend client with a modular Express 5 backend powered by Prisma ORM, Neon PostgreSQL, Better Auth, and an ultra-resilient multi-tier AI gateway.

At a high level:
- Users authenticate via Better Auth (Credentials, Google & GitHub OAuth, Two-Factor Authentication).
- Diagnostic assessments categorize initial competencies and map personalized prerequisite roadmaps rendered on `@xyflow/react`.
- AI pipelines powered by Groq (`qwen/qwen3.8-27b`), OpenRouter, Gemini, and Mistral generate simulations, roadmaps, copilot chat, and mock interviews with self-healing JSON repair.
- Project Studio inspects GitHub repositories, validates technology dependencies, and issues cryptographically verifiable public proof tokens (`/verify/proof/[token]`).
- Double-entry atomic ledger (`GemTransaction`) and zero-guilt recovery workflows keep learners motivated without punitive streak resets.
- Full administrative control center provides real-time AI token monitoring, system health telemetry, user management, and treasury adjustments.

## 4. Key Features

### Learner Platform (16 Integrated Subsystems)
- **1. Dynamic Interactive Roadmap Canvas (`@xyflow/react`):** Living node-edge Directed Acyclic Graph (DAG) visualizing milestone dependencies, prerequisite chains, and real-time unlock states (`LOCKED`, `UPCOMING`, `CURRENT`, `COMPLETED`).
- **2. Authentic 4-Stage Skill Mastery Simulations:** Four-tier assessment evaluating theoretical foundations (*Understand*), code debugging (*Debug*), pattern implementation (*Code*), and architectural trade-off articulation (*Explain*).
- **3. Deterministic Zero-500 Fallback Engine:** Domain-specific offline simulation engine delivering guaranteed instant fallbacks if external AI APIs encounter downtime or rate limits.
- **4. Resilient Multi-Tier AI Gateway:** Cascading inference router across Groq (`qwen/qwen3.8-27b`), Groq (`compound-mini`), OpenRouter (`qwen-2.5-coder-32b`), Google Gemini (`gemini-3.6-flash`), and Mistral AI with 4-key rotation.
- **5. Self-Healing JSON Sanitizer:** Robust parser automatically stripping markdown code fences, inline commentary, and trailing commas to prevent runtime JSON parsing failures.
- **6. Context-Aware Floating AI Copilot (`HomeFloatingChat`):** Dynamic chat assistant ingesting learner career profile, active milestones, skill debts, and recent GitHub project scores into system prompts.
- **7. Voice Agent Interaction System (`voice-agent`):** Interactive multimodal voice interface featuring `VoiceLiveModal`, animated `VoiceVisualizerOrb`, `VoiceControlBar`, speech recognition (`useSpeechRecognition`), and speech synthesis (`useSpeechSynthesis`).
- **8. Career Alignment & Diagnostic Assessment Engine:** 25+ question diagnostic test establishing baseline proficiencies and identifying prerequisite learning debt upon onboarding.
- **9. Project Studio (Dual-Mode Engineering):**
  - *Flow A (AI Build Specification):* Synthesizes complete full-stack architecture specs tailored to active skill debts.
  - *Flow B (GitHub Repository Import):* Inspects public GitHub repositories, verifies dependency manifests (`package.json`, etc.), and scores implementation authenticity.
- **10. Cryptographic Public Proof Graph:** Shareable, tamper-proof verification badges and links (`/verify/proof/[token]`) for recruiter verification signed via HMAC-SHA256.
- **11. 4-Pillar Application Readiness Scoring Engine:** Mathematical readiness model evaluating candidate qualifications against real job market demands:
  $$\text{Readiness Score} = 0.35 \times \text{Knowledge} + 0.30 \times \text{Practice} + 0.20 \times \text{Project} + 0.15 \times \text{Evidence}$$
- **12. Career Twin Senior Market Benchmark:** Comparative radar visualization benchmarking candidate verified skills against senior industry percentiles.
- **13. AI Resume Builder & ATS 4-Pillar Scanner:** Automated evaluation across Impact & Metrics, Skills Alignment, Structure, and Competencies with client-side PDF export via `@react-pdf/renderer`.
- **14. AI Technical Mock Interview Simulator:** Role-calibrated technical interviews with real-time feedback on technical depth, communication clarity, and trade-off rationale.
- **15. Dynamic Gem Economy & Atomic Balance Ledger:** Double-entry immutable ledger (`GemTransaction`) recording daily streaks, milestone achievements, and comeback rewards with cryptographic running balances.
- **16. Zero-Guilt Adaptive Recovery System:** Inactivity telemetry (7+ days) triggering non-punitive 4-day micro catch-up plans, Roadmap Velocity Simulator (3-40 hrs/week), and AI Dependency Meter without progress resets.

### Admin Operations & Observability (24 Management Modules)
- **1. AI Usage & Token Tracker (`/ai-usage`):** Real-time monitoring of token consumption, latency distribution, and cost analytics across AI providers.
- **2. Admin Treasury Control & Gifts (`/gem-economy`):** Interactive modal with live autocomplete search across 100k+ learners for manual adjustments, comeback bonuses, and audited grants.
- **3. System Health Telemetry (`/system-health`):** Real-time database connection pool ping, API response times, and AI provider availability.
- **4. Centralized Error Log Classifier (`/error-logs`):** Exception tracking with automated endpoint, method, status code, and stack trace categorization.
- **5. Administrative Audit Trail (`/audit-logs`):** Immutable audit log recording administrative actions, role modifications, and manual overrides.
- **6. Analytics Snapshots (`/analytics`):** Automated daily snapshots tracking active users (DAU/MAU), total roadmaps, assessments completed, and career readiness ratios.
- **7. User Management & RBAC (`/users`):** Directory with role elevation (`LEARNER` to `ADMIN`), plan tier management (`FREE`, `PLUS`, `PRO`), and 2FA verification status.
- **8. Job Reality Scraper & Classifier (`/job-reality`):** Automated scraping and classification of live market postings to keep prerequisite graphs aligned with industry trends.
- **9. Broadcast Dispatcher (`/broadcasts`):** Platform-wide system announcements and targeted milestone broadcast notifications.
- **10. Skill Health & Cohort Analytics (`/skill-health`):** Aggregate tracking of skill proficiencies, learning debt concentrations, and pass/fail distributions.
- **11. AI Sandbox Playground (`/ai-sandbox`):** Isolated environment for testing system prompts, token limits, and AI model parameters.
- **12. Subscription Management (`/subscriptions`):** Stripe subscription tracking across Free, Plus, and Pro tiers with revenue analytics.
- **13. Learning Debt Heatmap (`/learning-debt`):** Identifies bottleneck nodes and prerequisite debt concentrations across all active roadmaps.
- **14. Project Review & Overrides (`/projects`):** Direct inspection of learner project submissions, repository evidence, and verification scores.
- **15. Interview Transcript Audits (`/interviews`):** Full inspection of mock interview sessions, questions asked, candidate transcripts, and AI evaluations.
- **16. Resume Quality Inspector (`/resumes`):** Global overview of learner resume data, ATS match scores, and missing keyword frequencies.
- **17. Additional Admin Controls:** Activity feed (`/activity`), Assessment oversight (`/assessments`), Career readiness cohorts (`/career-readiness`), Dashboard overview (`/dashboard`), Profile (`/profile`), Roadmaps distribution (`/roadmaps`), Settings (`/settings`), Skill proof validation (`/skill-proof`), and Data export in CSV/JSON (`/export/:entity`).

### Marketing & Visual Experience
- **3D Coverflow Carousel:** Responsive carousel with smooth perspective depth, 4:5 aspect ratio cards, and dynamic video previews.
- **Netflix-Style Curved Top Arc & Marquee (`ProgressBridge`):** Luminous brand purple neon stroke with continuous horizontal capability marquee seamlessly anchored in 100vh viewport.
- **Problem Breakdown & Comparison Matrix:** Interactive visual breakdown comparing traditional static roadmaps with AIPather's adaptive proof engine.

## 5. Tech Stack
- **Frontend Framework:** Next.js 16.3 (App Router), React 19.2, TypeScript 5.9.
- **Styling & Design System:** Tailwind CSS 4.0, HeroUI 3.2, MagicUI, tw-animate-css.
- **Icons & Visual Effects:** Lucide React, React Icons, Three.js, React Three Fiber, OGL, Canvas Confetti.
- **Animation & Micro-Interactions:** Motion 13.1 (Framer Motion), GSAP, Lenis smooth scrolling, AOS.
- **Graph & Document Runtimes:** `@xyflow/react` 12.11 (React Flow), `@react-pdf/renderer` 4.9.
- **Charts & Media:** Recharts 3.10, Swiper 14.1.
- **Backend API:** Express 5.2 (Modular Monolith), Node.js 20/22, TypeScript 7.0, Tsx.
- **Datastore & ORM:** Neon Serverless PostgreSQL (`@neondatabase/serverless`), Prisma ORM 7.9 (`@prisma/client`, `@prisma/adapter-pg`, `@prisma/adapter-neon`).
- **Authentication:** Better Auth 1.7 (`better-auth`, `@better-auth/prisma-adapter`).
- **AI Inference Providers:**
  - Groq SDK 1.5 (`qwen/qwen3.8-27b`, `groq/compound-mini`) with round-robin 4-key rotation.
  - OpenRouter (`qwen/qwen-2.5-coder-32b-instruct`).
  - Google GenAI 2.18 (`@google/genai` - `gemini-3.6-flash`).
  - Mistral AI 2.6 (`@mistralai/mistralai`).
  - Deterministic offline simulation engine (Zero-500 fallback).
- **Security & Middleware:** Helmet 8.3, CORS 2.8, Express Rate Limit 8.6, Zod 4.4, Pino 10.3, Pino-HTTP.
- **Payments:** Stripe 22.6 Checkout & Webhooks (Free, Plus, and Pro tiers).
- **State Management & Data Fetching:** TanStack React Query 5.102, Axios, Use-Debounce.
- **Testing & Quality:** Node.js native test runner (`tsx --test`), TypeScript strict mode (`tsc --noEmit`), ESLint.

## 6. System Architecture

### High-Level System
```mermaid
%%{init: {"theme": "base", "themeVariables": {"background": "#0b1020", "primaryColor": "#1b2333", "primaryBorderColor": "#3a4a66", "primaryTextColor": "#e6edf3", "lineColor": "#9aa6b2"}, "flowchart": {"curve": "basis"}}}%%
flowchart LR
  U([User Browser]) --> N([Next.js 16 App Router])
  N --> PXY([Next.js Proxy /api/proxy/*])
  PXY --> SEC([Better Auth Session & RBAC Guard])

  SEC --> BEND([Express 5 Modular Backend])

  BEND --> PG[(PostgreSQL / Prisma ORM)]
  BEND --> AI([Multi-Tier AI Gateway])
  BEND --> GH([GitHub REST API])
  BEND --> STP([Stripe Checkout & Webhooks])

  AI --> GQ([Groq Llama / Qwen])
  AI --> OR([OpenRouter])
  AI --> GM([Google Gemini])
  AI --> MS([Mistral AI])

  classDef frontend fill:#1e3a8a,stroke:#60a5fa,color:#e0f2fe,stroke-width:1.5px;
  classDef api fill:#4c1d95,stroke:#a78bfa,color:#f5f3ff,stroke-width:1.5px;
  classDef database fill:#0f766e,stroke:#2dd4bf,color:#ccfbf1,stroke-width:1.5px;
  classDef external fill:#9a3412,stroke:#fb923c,color:#fff7ed,stroke-width:1.5px;

  class U,N frontend;
  class PXY,SEC,BEND api;
  class PG database;
  class AI,GQ,OR,GM,MS,GH,STP external;
```

### Backend Component View
```mermaid
%%{init: {"theme": "base", "themeVariables": {"background": "#0b1020", "primaryColor": "#1b2333", "primaryBorderColor": "#3a4a66", "primaryTextColor": "#e6edf3", "lineColor": "#9aa6b2"}, "flowchart": {"curve": "basis"}}}%%
flowchart TD
  subgraph Core
    M1([Express Middleware / Helmet / CORS])
    M2([Rate Limiting])
    M3([Better Auth Guard & RBAC])
  end

  subgraph LearnerDomain ["16 Learner Domain Services"]
    D1([Roadmap & XYFlow Adapter])
    D2([4-Stage Simulation Engine])
    D3([Context-Aware Copilot])
    D4([Project Studio & GitHub Inspector])
    D5([Application Readiness 4-Pillar])
    D6([AI Resume & ATS Scanner])
    D7([Gamification & Gem Ledger])
    D8([Zero-Guilt Adaptive Recovery])
    D9([Career Twin Benchmark Engine])
    D10([AI Technical Mock Interview])
    D11([Diagnostic Assessment Engine])
    D12([Job Reality & Market Matcher])
  end

  subgraph AdminDomain ["24 Admin Operations Modules"]
    A1([AI Usage & Token Tracker])
    A2([Admin Treasury Adjustments])
    A3([System Health & Audit Logs])
    A4([Job Reality Scraper & Classifier])
    A5([Cohort Readiness Analytics])
    A6([Subscription Manager])
    A7([Error Log Classifier])
    A8([Broadcast Dispatcher])
  end

  subgraph DataLayer ["Persistence (PostgreSQL via Prisma 7)"]
    DB1[(Users, Accounts & Sessions)]
    DB2[(Roadmaps, Milestones & Skills)]
    DB3[(Projects & Verified Proof Evidence)]
    DB4[(Gamification & GemTransactions)]
    DB5[(Resumes, ATS & Interviews)]
    DB6[(Logs, Audits & Analytics Snapshots)]
  end

  M3 --> LearnerDomain
  M3 --> AdminDomain

  LearnerDomain --> DataLayer
  AdminDomain --> DataLayer

  classDef core fill:#4c1d95,stroke:#a78bfa,color:#f5f3ff,stroke-width:1.5px;
  classDef learner fill:#1e3a8a,stroke:#60a5fa,color:#e0f2fe,stroke-width:1.5px;
  classDef admin fill:#78350f,stroke:#f59e0b,color:#fef3c7,stroke-width:1.5px;
  classDef database fill:#0f766e,stroke:#2dd4bf,color:#ccfbf1,stroke-width:1.5px;

  class M1,M2,M3 core;
  class D1,D2,D3,D4,D5,D6,D7,D8,D9,D10,D11,D12 learner;
  class A1,A2,A3,A4,A5,A6,A7,A8 admin;
  class DB1,DB2,DB3,DB4,DB5,DB6 database;
```

### AI Processing & Failover Pipeline
```mermaid
%%{init: {"theme": "base", "themeVariables": {"background": "#0b1020", "primaryColor": "#1b2333", "primaryBorderColor": "#3a4a66", "primaryTextColor": "#e6edf3", "lineColor": "#9aa6b2"}, "flowchart": {"curve": "basis"}}}%%
flowchart TD
  REQ([AI Generation Request]) --> T1{Tier 1: Groq Primary<br/>qwen3.8-27b}
  
  T1 -. "Success" .-> SMR([Smart JSON Sanitizer & Auto-Repair])
  T1 -. "HTTP 429 / Timeout >6s" .-> T2{Tier 2: Groq Fallback<br/>compound-mini}
  
  T2 -. "Success" .-> SMR
  T2 -. "Account Exhaustion / Error" .-> T3{Tier 3: OpenRouter Cascade<br/>qwen-2.5-coder-32b}
  
  T3 -. "Success" .-> SMR
  T3 -. "Error" .-> T4{Tier 4: Multi-Cloud<br/>Gemini / Mistral}
  
  T4 -. "Success" .-> SMR
  T4 -. "All Providers Offline" .-> T5([Deterministic Offline Simulation Engine])
  
  SMR --> RESP([Structured Valid Output])
  T5 --> RESP

  classDef request fill:#1e3a8a,stroke:#60a5fa,color:#e0f2fe,stroke-width:1.5px;
  classDef decision fill:#1f2937,stroke:#94a3b8,color:#e2e8f0,stroke-width:1.5px;
  classDef sanitize fill:#14532d,stroke:#4ade80,color:#dcfce7,stroke-width:1.5px;
  classDef fallback fill:#9a3412,stroke:#fb923c,color:#fff7ed,stroke-width:1.5px;

  class REQ request;
  class T1,T2,T3,T4 decision;
  class SMR,RESP sanitize;
  class T5 fallback;
```

### Learner Mastery & Proof Lifecycle
```mermaid
%%{init: {"theme": "base", "themeVariables": {"background": "#0b1020", "primaryColor": "#1b2333", "primaryBorderColor": "#3a4a66", "primaryTextColor": "#e6edf3", "lineColor": "#9aa6b2"}, "flowchart": {"curve": "basis"}}}%%
flowchart LR
  A([Target Role & Onboarding]) --> B([Diagnostic Assessment])
  B --> C([Dynamic XYFlow Roadmap])
  C --> D([4-Stage Simulation Loop])
  D --> E([Project Studio & GitHub Import])
  E --> F([4-Pillar Application Readiness])
  F --> G([Verifiable Public Proof Token])
  G --> H([ATS Resume & Mock Interview])

  classDef step fill:#1e3a8a,stroke:#60a5fa,color:#e0f2fe,stroke-width:1.5px;
  classDef verified fill:#14532d,stroke:#4ade80,color:#dcfce7,stroke-width:1.5px;

  class A,B,C,D,E,F step;
  class G,H verified;
```

## 7. Core Pipelines

- **Dynamic Roadmap & Prerequisite Pipeline:**
  1. Learner defines target career role and completes the diagnostic assessment.
  2. Engine calculates prerequisite relationships, initial scores, and unlocks Milestone 1.
  3. Dynamic curriculum synthesizes custom milestone tracks for canonical or arbitrary job titles.
  4. Interactive canvas rendered via `@xyflow/react` updates milestone unlock states (`LOCKED`, `UPCOMING`, `CURRENT`, `COMPLETED`).

- **Multi-Tier Resilient AI Failover Pipeline:**
  1. Primary inference request is sent to Groq (`qwen/qwen3.8-27b`) with round-robin key rotation across 4 API keys.
  2. On rate limits (HTTP 429) or latency timeouts (>6s), execution automatically cascades to Groq `compound-mini`.
  3. Subsequent failures fall back to OpenRouter (`qwen-2.5-coder-32b-instruct`), followed by Google Gemini and Mistral AI.
  4. Raw LLM responses pass through a self-healing JSON sanitizer to strip markdown fences, trailing commas, and commentary.
  5. If all AI providers are unreachable, a deterministic domain simulation engine delivers zero-500 fallback content.

- **4-Stage Skill Mastery Simulation Pipeline:**
  1. Stage 1 (*Understand*): Conceptual challenge testing foundational architecture and edge cases.
  2. Stage 2 (*Debug*): Buggy code snippet requiring root-cause diagnosis and correction.
  3. Stage 3 (*Code*): Practical coding implementation evaluated via AST keyword and pattern matching.
  4. Stage 4 (*Explain*): Technical reasoning prompt scoring architectural explanation and trade-off articulation.
  5. Successful completion triggers atomic XP/Gem reward transactions and updates learner skill scores.

- **Project Studio & GitHub Evidence Pipeline:**
  1. Flow A: Generates comprehensive architecture specifications tailored to active skill debts.
  2. Flow B: Ingests public GitHub repository URLs, verifies dependency manifests (`package.json`, etc.), and scores implementation authenticity.
  3. Project verification generates an immutable public proof token accessible at `/verify/proof/[token]`.

- **Application Readiness & Career Twin Pipeline:**
  1. Mathematical scoring engine computes:
     $$\text{Readiness Score} = 0.35 \times \text{Knowledge} + 0.30 \times \text{Practice} + 0.20 \times \text{Project} + 0.15 \times \text{Evidence}$$
  2. Compares active profile competencies against job market requirements scraped from live industry postings.
  3. Renders visual Career Twin benchmarking candidate proficiency against senior industry percentiles.

- **AI Resume & ATS 4-Pillar Pipeline:**
  1. Ingests candidate profile, verified projects, and skill states.
  2. Evaluates resume against 4 pillars: Impact & Metrics, Skills Alignment, Structure, and Competencies.
  3. Generates actionable optimization recommendations and exports pixel-perfect PDF resumes via `@react-pdf/renderer`.

- **Voice & AI Mock Interview Pipeline:**
  1. Ingests candidate target role, seniority level, and active roadmap skill debts.
  2. Generates dynamic technical interview question sets with progressive difficulty.
  3. Candidates respond via text or voice interface (`VoiceLiveModal` & `VoiceVisualizerOrb`).
  4. Evaluates candidate responses with structured feedback on technical accuracy, clarity, and architectural trade-offs.

- **Dynamic Gem Economy & Recovery Pipeline:**
  1. Immutable double-entry ledger records all rewards and expenditures in `GemTransaction`.
  2. Daily activity streaks reward 1, 2, or 5 gems; milestone completions award 5-15 gems.
  3. Automated inactivity telemetry flags learners inactive for 7+ days and generates non-punitive 4-day micro catch-up plans.

- **Admin Observability & AI Telemetry Pipeline:**
  1. All AI requests log duration, token usage, model, and provider status in `AiUsageLog`.
  2. Unhandled server exceptions are captured and classified in `ErrorLog`.
  3. Administrative actions, role elevations, and treasury gifts are persisted in `AdminAuditLog`.
  4. Automated snapshot service generates daily platform statistics in `AnalyticsSnapshot`.

## 8. Project Structure
```text
Ai-learning-roadmap/
├── backend/                              # Express 5 & Prisma API Server
│   ├── prisma/
│   │   └── schema.prisma                 # 22 PostgreSQL models, relations & indices
│   ├── src/
│   │   ├── config/                       # Zod-validated environment config
│   │   ├── lib/                          # Better Auth server, Prisma client, Logger
│   │   ├── middlewares/                  # Auth guards, RBAC, error handlers, rate limiting
│   │   ├── modules/
│   │   │   ├── admin/                    # 24 Admin operations modules
│   │   │   │   ├── activity/, ai-sandbox/, ai-usage/, analytics/, assessments/, audit-logs/
│   │   │   │   ├── broadcasts/, career-readiness/, dashboard/, error-logs/, gem-economy/
│   │   │   │   ├── interviews/, job-reality/, learning-debt/, profile/, projects/, resumes/
│   │   │   │   └── roadmaps/, settings/, skill-health/, skill-proof/, subscriptions/, system-health/, users/
│   │   │   └── learner/                  # 16 Learner domain modules
│   │   │       ├── adaptive-recovery/, application-readiness/, assessments/, career-alignment/
│   │   │       ├── career-intelligence/, career-twin/, copilot/, dashboard/, diagnostic/
│   │   │       ├── gamification/, gem-economy/, interview/, job-reality/, notifications/
│   │   │       ├── profile/, progress/, projects/, proof-graph/, readiness/, resume/, roadmap/, skill-gaps/
│   │   ├── utils/                        # CSV utilities, formatters, helpers
│   │   ├── app.ts                        # Express application configuration
│   │   └── server.ts                     # HTTP server bootstrap entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                             # Next.js 16 App Router Client
│   ├── src/
│   │   ├── app/                          # Next.js App Router (63 verified routes)
│   │   │   ├── (auth)/                   # Signin, Signup, Forgot password, Reset password
│   │   │   ├── (dashboard)/              # Nested dashboard layouts & guards
│   │   │   │   └── dashboard/
│   │   │   │       ├── (admin)/admin/    # 25 Admin operations dashboard pages
│   │   │   │       └── (learner)/learner/# 18 Learner navigation pages
│   │   │   ├── (main)/                   # Marketing landing, About, Contact, Tracks, Pricing
│   │   │   ├── api/                      # Next.js proxy (/api/proxy/*) & Stripe routes
│   │   │   ├── chat/                     # Standalone AI Copilot full-page interface
│   │   │   ├── diagnostic/               # Interactive career diagnostic evaluation
│   │   │   ├── onboarding/               # Multi-step role & experience onboarding
│   │   │   ├── payment/, checkout/       # Stripe checkout & subscription management
│   │   │   └── verify/                   # Public proof verification routes (/verify/proof/[token])
│   │   ├── components/                   # 27 Modular component domains
│   │   │   ├── home/                     # Coverflow carousel, ProgressBridge, features, pricing
│   │   │   ├── voice-agent/              # VoiceLiveModal, VoiceVisualizerOrb, VoiceControlBar
│   │   │   ├── layout/                   # Navbar, footer, admin guard
│   │   │   └── ui/                       # Buttons, modals, cards, badges, inputs
│   │   ├── hooks/                        # Custom React hooks & TanStack Query integrations
│   │   ├── lib/                          # Better Auth client, Axios instance, utils
│   │   ├── registry/                     # MagicUI & animated interactive components
│   │   └── types/                        # TypeScript domain interfaces
│   ├── package.json
│   └── next.config.ts
│
├── docs/                                 # 11 Architectural specification directories
├── .gitignore
└── README.md                             # Monorepo technical documentation
```

## 9. How the System Works
1. **User Authentication:** User registers or signs in via Better Auth (Credentials, Google, or GitHub OAuth) with optional Two-Factor Authentication.
2. **Career Diagnostic & Onboarding:** Learner selects target role and completes an interactive diagnostic assessment.
3. **Adaptive Roadmap Synthesis:** Engine constructs a dynamic prerequisite graph rendered interactively via `@xyflow/react`.
4. **Interactive Learning & Simulation:** Learner progresses through milestones by completing 4-stage simulations (Understand, Debug, Code, Explain).
5. **AI Failover Inference:** Multi-tier AI gateway routes requests through Groq, OpenRouter, Gemini, and Mistral with automated self-healing JSON repair.
6. **Project Verification & Proof Token:** Learner submits GitHub repositories to Project Studio, extracting tech stack proof and generating public proof tokens.
7. **Readiness & Career Twin Benchmarking:** Engine computes the 4-pillar readiness score and benchmarks candidate profile against real job market requirements.
8. **Career Transition & Mock Interviews:** Learner compiles an ATS-optimized resume, exports PDF via `@react-pdf/renderer`, and performs AI mock interviews via text or voice agent.

## 10. Installation
```bash
# Clone the repository
git clone https://github.com/kamalcodezen/Ai-learning-roadmap.git
cd Ai-learning-roadmap

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 11. Running the Project
```bash
# Terminal 1: Start Backend API (runs on http://localhost:5000)
cd backend
npx prisma db push
npm run dev

# Terminal 2: Start Frontend Application (runs on http://localhost:3000)
cd frontend
npm run dev

# Run Backend Automated Tests (58 tests across 10 suites)
cd backend
npm run test

# Run Type-Check & Linting
cd frontend
npx tsc --noEmit
npm run lint
```

## 12. Environment Variables
Required by current code paths:

### Backend (`backend/.env`)
```env
# Server
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:3000

# PostgreSQL Database (Neon / Supabase / Local)
DATABASE_URL="postgresql://user:password@localhost:5432/aipather?sslmode=prefer"

# Better Auth
BETTER_AUTH_SECRET="your-32-character-random-secret-key-here"
BETTER_AUTH_URL="http://localhost:5000"

# AI Inference Providers
GROQ_API_KEY="gsk_..."
GROQ_API_KEY_SECONDARY=""
OPENROUTER_API_KEY=""
GEMINI_API_KEY=""
MISTRAL_API_KEY=""

# Integrations (Optional)
GITHUB_TOKEN=""
STRIPE_SECRET_KEY=""
```

### Frontend (`frontend/.env`)
```env
# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:5000"

# Better Auth
BETTER_AUTH_URL="http://localhost:5000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:5000"

# Stripe (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
```

## 13. Performance Optimizations
- **Multi-Tier AI Failover:** Sub-second primary response times via Groq with cascading fallbacks to eliminate HTTP 429 outages.
- **Self-Healing JSON Sanitization:** Prevents JSON parsing failures by auto-stripping markdown blocks, trailing commas, and LLM commentary.
- **Relational Indexing:** PostgreSQL composite indices on high-frequency paths (`userId`, `status`, `targetRole`, `createdAt`, `actionType`).
- **Scale-Optimized Aggregations:** Negative-relation indices and raw SQL aggregations (`COUNT(DISTINCT "userId")`) supporting 100k+ learners with sub-50ms query latency.
- **Client-Side Virtualization & Canvas:** Smooth 60fps rendering of large milestone graphs powered by `@xyflow/react` and Tailwind CSS v4 GPU acceleration.
- **Single-Pass PDF Generation:** Instant client-side document creation via `@react-pdf/renderer` without server-side headless browser overhead.

## 14. Performance Benchmarking & Latency Optimization
AIPather uses an enterprise multi-tier caching and failover architecture to optimize database-heavy and LLM-heavy operations.

Automated benchmarks and verification metrics across the platform:
- **Database Query Latency:** Sub-50ms aggregate reporting across 100,000+ registered learners using raw PostgreSQL aggregations and composite indexing.
- **AI Latency & Fallback:** Sub-second inference (~400-800ms) on Groq Tier-1 with automatic cascade preventing user-facing HTTP 429 timeouts.
- **Automated Test Coverage:** 58/58 automated unit and integration tests passing across 10 test suites (`tsx --test`).
- **Zero-500 Resilience:** 100% continuous uptime for skill simulations and diagnostics enabled by domain-specific deterministic fallback generators.
- **Static Analysis & Type Safety:** 0 TypeScript compiler errors (`tsc --noEmit`) and 0 ESLint warnings across the entire monorepo.

## 15. Rights and License
- Repository ownership: This repository belongs to **Kamal** ([@kamalcodezen](https://github.com/kamalcodezen)).
- License status: Licensed under the **MIT License**.
- Rights notice: Copyright (c) 2026 Kamal. All rights reserved.
- Third-party notice: External SDKs, icons, frameworks, and APIs utilized by this project remain under their respective licenses and terms.
