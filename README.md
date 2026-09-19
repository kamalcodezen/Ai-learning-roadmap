# 🚀 AIPather — Adaptive AI Career Roadmap & Technical Mastery Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Groq AI](https://img.shields.io/badge/Groq-Llama%20%7C%20Qwen-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.7-black?style=for-the-badge&logo=auth0&logoColor=white)](https://better-auth.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<br />

**Transforming static tutorial purgatory into an adaptive, proof-backed technical career intelligence engine.**

[Features](#-key-features--capabilities) • [Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [Environment Setup](#-environment-variables) • [NPM Scripts](#-available-scripts) • [Deployment](#-deployment-guide)

</div>

---

## 📖 Executive Summary

Most software developers and tech learners suffer from **The Static Checklist Crisis**: traditional roadmaps provide static, linear lists of technologies. When learners get stuck or miss a week, static roadmaps cannot diagnose *why* they are struggling, what prerequisites are missing, or how to prove their competencies to employers.

**AIPather** replaces passive checklists with a living, reactive technical career navigation system:
1. **Adaptive Prerequisite Graphs**: Dynamically identifies knowledge gaps and injects sub-nodes to clear architectural learning debt.
2. **Multi-Tier Resilient AI Engine**: Ultra-fast inference with automatic multi-model failover across Groq (`qwen/qwen3.8-27b`, `groq/compound-mini`), OpenRouter (`qwen-2.5-coder-32b-instruct`), Gemini (`gemini-3.6-flash`), and Mistral with self-healing JSON repair.
3. **Authentic 4-Stage Simulations**: Rigorous, multi-faceted evaluations (*Understand*, *Debug*, *Code*, *Explain*) with zero-500 deterministic fallbacks.
4. **Verified Evidence & Public Proof Graph**: Converts GitHub repositories into cryptographically verifiable proof tokens with automated dependency and architecture inspection.
5. **Real-Time Application Readiness**: Four-pillar mathematical scoring engine measuring candidate readiness against real job market demands.

### 📐 High-Level Solution Architecture

```mermaid
graph TB
    subgraph ProblemSpace ["❌ The Static Checklist Crisis"]
        P1["Rigid Static Checklists & PDFs"]
        P2["Invisible Learning Debt & Stuck Nodes"]
        P3["Zero Evidence / Unverifiable Claims"]
    end

    subgraph AIPatherCore ["✨ AIPather Adaptive Navigation Architecture"]
        direction TB
        S1["🎯 1. Target Role & Diagnostic Profile"]
        S2["🗺️ 2. Dynamic Prerequisite Graph (XYFlow Canvas)"]
        S3["🤖 3. Resilient Multi-Tier AI Gateway (Groq Failover)"]
        S4["⚡ 4. 4-Stage Simulations (Understand · Debug · Code · Explain)"]
        S5["💼 5. Project Studio & GitHub Evidence Inspector"]
        S6["📊 6. 4-Pillar Application Readiness Scoring Engine"]
    end

    subgraph OutcomeSpace ["🏆 Verified Market-Ready Developer"]
        O1["🔗 Cryptographic Public Proof Token (/verify/proof)"]
        O2["📄 ATS 4-Pillar Resume & Real Job Market Qualified"]
    end

    ProblemSpace -.->|"Replaced & Solved by"| AIPatherCore
    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> S5
    S5 --> S6
    AIPatherCore ==> OutcomeSpace
```

---

## ✨ Key Features & Capabilities

### 🗺️ 1. Dynamic Interactive Roadmap Canvas (`@xyflow/react`)
- **Living Node-Edge Graphs**: Visualizes milestones, dependencies, and prerequisite chains dynamically.
- **Unlock Mechanics**: Milestones transition between `LOCKED`, `UPCOMING`, `CURRENT`, and `COMPLETED`.
- **Milestone Inspector Drawer**: Deep-dives into strategic milestones, estimated time commitments, target technologies, and prerequisite concepts.
- **Dynamic Curriculum Synthesis**: Supports canonical roles (*Full Stack, DevOps, AI Engineer, Mobile*) plus dynamic AI roadmaps for any custom target job title.

### 🤖 2. Resilient Multi-Tier AI Gateway & Copilot
- **Intelligent Multi-Model Fallback**:
  - **Tier 1 (Primary Groq)**: `qwen/qwen3.8-27b` across 4 rotating API keys for fast contextual generation.
  - **Tier 2 (Groq Fallback)**: Automatically switches to `groq/compound-mini` when encountering HTTP 429 token limits or timeouts (>6s).
  - **Tier 3 (OpenRouter Cascade)**: `qwen/qwen-2.5-coder-32b-instruct` and `qwen/qwen-2.5-72b-instruct`.
  - **Tier 4 (Multi-Cloud Provider)**: Google Gemini (`gemini-3.6-flash`) and Mistral (`mistral-small-latest`).
- **Self-Healing JSON Sanitizer**: Automatically cleans trailing commas and inline comments produced by LLMs to prevent JSON parse errors.
- **Context-Aware Chat Copilot**: Ingests real-time career profile, active roadmap milestones, skill debts, and recent GitHub project scores into system prompts.

### 🎯 3. Authentic 4-Stage Skill Mastery Simulations
- **Stage 1: Understand**: Conceptual multiple-choice challenge targeting theoretical principles and edge cases.
- **Stage 2: Debug**: Real-world buggy code snippet requiring root-cause diagnosis and correction.
- **Stage 3: Code**: Practical coding implementation evaluated via AST keyword and pattern validation.
- **Stage 4: Explain**: Technical communication prompt scoring architectural reasoning and trade-off articulation.
- **Zero-500 Deterministic Fallback**: If all external AI providers are in cooldown or offline, a domain-specific simulation engine provides high-quality fallback simulations instantly.

### 📈 4. Application Readiness & Career Twin Engine
- **4-Pillar Mathematical Scoring Engine**:
  $$\text{Readiness Score} = 0.35 \times \text{Knowledge} + 0.30 \times \text{Practice} + 0.20 \times \text{Project} + 0.15 \times \text{Evidence}$$
- **Market Job Reality Matcher**: Analyzes active industry job requirements, identifies required skills, and matches user proficiency.
- **Career Twin Visualization**: Compares the candidate's verified profile against senior-level market benchmarks.

### 💼 5. Project Studio & Verifiable Proof Graph
- **Flow A (AI Build Specification)**: Dynamically generates architecture specifications tailored to the learner's active skill gaps or milestones.
- **Flow B (GitHub Repository Import)**: Automatically inspects real repositories, extracts tech stack evidence, and scores project verification.
- **Public Proof Token**: Generates shareable, tamper-proof verification links (`/verify/proof/[token]`) for recruiters and portfolio showcasing.

### 📄 6. AI Resume Builder & ATS 4-Pillar Scanner
- **ATS 4-Pillar Scoring**: Impact & Metrics, Skills Alignment, Structure & Formatting, Core Competencies.
- **Job Description Matcher**: Scans resumes against custom target job descriptions and provides actionable optimization suggestions.
- **Client-Side PDF Generation**: Direct PDF export powered by `@react-pdf/renderer`.

### 🎙️ 7. AI Technical Mock Interview Simulator
- **Adaptive Questions**: Questions calibrated to learner seniority, target role, and identified skill gaps.
- **Real-Time Evaluation**: Instant feedback with scores on communication clarity, technical depth, and trade-off explanations.

### 🛡️ 8. Admin Control Center & Observability
- **AI Token & Cost Monitoring**: Real-time provider analytics, token usage graphs, and latency trackers.
- **System Health & Audit Logs**: Full visibility into user activity logs, error trends, and learning debt metrics.
- **Job Reality Scraper & Classifier**: Automated batch classification of job market data.

---

## 🏛️ System Architecture & Interactive Graphs

### 1. End-to-End Platform Architecture
```mermaid
graph TD
    subgraph ClientLayer ["🖥️ Frontend Client Layer (Next.js 16 + React 19)"]
        UI["Landing & Dashboard UI (Tailwind CSS + HeroUI)"]
        XYFlowCanvas["Interactive Roadmap Graph Canvas (@xyflow/react)"]
        CopilotUI["AI Copilot Floating Assistant"]
        SimUI["4-Stage Assessment & Simulation Runner"]
        ResumePDF["ATS Resume Builder & PDF Renderer (@react-pdf/renderer)"]
    end

    subgraph ProxyLayer ["🛡️ API Gateway & Proxy Layer"]
        Proxy["Next.js Route Handler (/api/proxy/*)"]
        SessionCheck["Better Auth Session & Role Verification"]
    end

    subgraph BackendServices ["⚙️ Modular Backend Domain Services (Express 5)"]
        RoadmapEngine["Roadmap & Prerequisite Engine"]
        SimService["Skill Simulation & Grading Service"]
        CopilotService["Context-Aware Chat Service"]
        ProjectService["Project Studio & GitHub Inspector"]
        ReadinessEngine["Application Readiness & Career Twin Engine"]
        ResumeEngine["Resume AI & ATS Scanner"]
        JobRealityEngine["Job Market Scraper & Role Classifier"]
    end

    subgraph PersistenceLayer ["💾 PostgreSQL Database (Neon / PG + Prisma ORM)"]
        Users["Users, Sessions & Accounts"]
        Roadmaps["Roadmaps, Milestones & Nodes"]
        SkillStates["Skill States & History"]
        ProjectEvidence["Projects, Verification & Proof Graph"]
        ActivityLogs["Activity & AI Usage Logs"]
    end

    subgraph AIGateway ["🤖 Resilient Multi-Tier AI Engine"]
        GroqPrimary["Primary: Groq (qwen/qwen3.8-27b)"]
        GroqFallback["Tier-1 Fallback: Groq (groq/compound-mini)"]
        ExternalAI["Tier-2: OpenRouter (qwen-2.5-coder-32b) / Gemini / Mistral"]
        DeterministicSim["Deterministic Simulation Engine (Zero-500 Fallback)"]
    end

    UI --> Proxy
    XYFlowCanvas --> Proxy
    CopilotUI --> Proxy
    SimUI --> Proxy
    ResumePDF --> Proxy

    Proxy --> SessionCheck
    SessionCheck --> RoadmapEngine
    SessionCheck --> SimService
    SessionCheck --> CopilotService
    SessionCheck --> ProjectService
    SessionCheck --> ReadinessEngine
    SessionCheck --> ResumeEngine
    SessionCheck --> JobRealityEngine

    RoadmapEngine --> Roadmaps
    SimService --> SkillStates
    ProjectService --> ProjectEvidence
    ReadinessEngine --> SkillStates
    ReadinessEngine --> ProjectEvidence
    CopilotService --> ActivityLogs

    RoadmapEngine -.-> AIGateway
    SimService -.-> AIGateway
    CopilotService -.-> AIGateway
    ResumeEngine -.-> AIGateway
    JobRealityEngine -.-> AIGateway

    GroqPrimary -- "On 429 / Token Limit / Timeout (>6s)" --> GroqFallback
    GroqFallback -- "On Error / Account Exhaustion" --> ExternalAI
    ExternalAI -- "If All Offline" --> DeterministicSim
```

---

### 2. Learner Mastery & Proof-Backed Progression Lifecycle
```mermaid
flowchart LR
    A["👤 Onboarding & Career Target"] --> B["🧪 Diagnostic Skill Assessment"]
    B --> C["🗺️ Adaptive Prerequisite Graph (XYFlow)"]
    
    subgraph MilestoneCycle ["🔄 Milestone Mastery Loop"]
        C --> D["🎯 Select Active Milestone"]
        D --> E["⚡ 4-Stage Skill Simulation"]
        
        subgraph SimStages ["Authentic 4 Stages"]
            E1["1. Understand (Concepts)"] --> E2["2. Debug (Code Inspection)"]
            E2 --> E3["3. Code (Pattern Validation)"]
            E3 --> E4["4. Explain (Technical Reasoning)"]
        end
        
        E --> SimStages
        SimStages --> F["💻 Project Studio (GitHub Evidence)"]
    end
    
    F --> G["📊 4-Pillar Application Readiness (0-100%)"]
    G --> H["🔗 Verifiable Public Proof Graph (/verify/proof)"]
    H --> I["📄 ATS 4-Pillar Resume & Mock Interview"]
    I --> J["🏆 Job Market Reality Qualified"]
```

---

### 3. Resilient Multi-Tier AI Failover Pipeline
```mermaid
graph TD
    Req["Incoming AI Generation Request (Roadmap / Simulation / Copilot)"] --> Step1{"Try Primary Groq (qwen/qwen3.8-27b)"}
    
    Step1 -- "HTTP 200 (Success)" --> Sanitizer["Smart JSON Sanitizer & Auto-Repair"]
    Step1 -- "HTTP 429 / Rate Limit / Timeout (>6s)" --> Step2{"Try Tier-1 Groq Fallback (groq/compound-mini)"}
    
    Step2 -- "HTTP 200 (Success)" --> Sanitizer
    Step2 -- "On Error / Account Exhaustion" --> Step3{"Try External Providers (OpenRouter / Gemini / Mistral)"}
    
    Step3 -- "HTTP 200 (Success)" --> Sanitizer
    Step3 -- "All AI Providers Offline" --> Step4["Deterministic Offline Simulation Engine"]
    
    Sanitizer --> Response["Valid, Parsed JSON Response to Client (Zero 500 Errors)"]
    Step4 --> Response
```

---

## 📁 Monorepo Structure

```bash
Ai-learning-roadmap/
├── backend/                              # Express 5 & Prisma API Server
│   ├── prisma/
│   │   └── schema.prisma                 # Relational database schema & relations
│   ├── src/
│   │   ├── config/                       # Zod-validated environment config
│   │   ├── lib/                          # Database connection & Better-Auth server
│   │   ├── middleware/                   # Authentication & rate limiting
│   │   ├── modules/
│   │   │   ├── admin/                    # Admin analytics, health & AI usage logs
│   │   │   └── learner/
│   │   │       ├── assessments/          # 4-stage skill simulations & fallbacks
│   │   │       ├── copilot/              # AI Chat service & multi-model router
│   │   │       ├── diagnostic/           # Initial diagnostic evaluation
│   │   │       ├── interview/            # AI mock interview simulator
│   │   │       ├── job-reality/          # Job market scraping & classifier
│   │   │       ├── profile/              # Career profile & onboarding
│   │   │       ├── projects/             # Project Studio & GitHub inspector
│   │   │       ├── resume/               # AI Resume builder & ATS scanner
│   │   │       ├── roadmap/              # Dynamic roadmap engine & XYFlow adapter
│   │   │       └── skill-gaps/           # Skill state & learning debt calculation
│   │   └── server.ts                     # Main Express application entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                             # Next.js 16 App Router Client
│   ├── src/
│   │   ├── app/                          # Next.js routes (51 optimized routes)
│   │   │   ├── (auth)/                   # Signin, Signup, Password reset
│   │   │   ├── api/                      # Next.js proxy & Stripe checkout routes
│   │   │   └── dashboard/
│   │   │       ├── admin/                # Admin operations dashboard
│   │   │       └── learner/              # Roadmap, Assessments, Projects, Resume, etc.
│   │   ├── components/                   # Modular UI components & design system
│   │   ├── hooks/                        # Custom React hooks & TanStack Query mutations
│   │   ├── lib/                          # Better Auth client & API Axios instance
│   │   └── types/                        # Shared TypeScript interfaces
│   ├── package.json
│   └── next.config.ts
│
├── .gitignore
└── README.md                             # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or higher
- **PostgreSQL**: Local PostgreSQL or Cloud database (Neon, Supabase, Render, Railway)

### 1. Clone the Repository
```bash
git clone https://github.com/kamalcodezen/Ai-learning-roadmap.git
cd Ai-learning-roadmap
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env
```
Update your `backend/.env` with your PostgreSQL connection string and AI keys.

Run Prisma migrations:
```bash
npx prisma db push
npx prisma generate
```

Start the backend development server:
```bash
npm run dev
# Backend API will run on http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env
```
Update `frontend/.env` with your backend API URL and auth configuration.

Start the Next.js frontend:
```bash
npm run dev
# Frontend application will run on http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
# Server Configuration
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
GROQ_API_KEY_SECONDARY=""          # Optional: Automatic second-tier failover account
OPENROUTER_API_KEY=""              # Optional: Multi-provider backup
GEMINI_API_KEY=""                  # Optional: Google GenAI backup
MISTRAL_API_KEY=""                 # Optional: Mistral AI backup

# Third-Party Integrations (Optional)
GITHUB_TOKEN=""                    # Higher GitHub rate limits for Project Inspector
STRIPE_SECRET_KEY=""               # Premium subscriptions
```

### Frontend (`frontend/.env`)
```env
# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:5000"

# Authentication
BETTER_AUTH_URL="http://localhost:5000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:5000"

# Payment (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
```

---

## 🛠️ Available Scripts

### Backend (`backend/`)
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts development server with live reload (`tsx watch`) |
| `npm run type-check` | Runs strict TypeScript type-checking (`tsc --noEmit`) |
| `npm run test` | Runs 46 automated unit & integration test suites (`tsx --test`) |
| `npm run build` | Compiles TypeScript into production JavaScript (`dist/`) |
| `npm start` | Runs compiled production server (`node dist/server.js`) |

### Frontend (`frontend/`)
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server with Turbopack |
| `npm run lint` | Runs ESLint analysis with zero errors and zero warnings |
| `npx tsc --noEmit` | Runs strict TypeScript type-checking across all components |
| `npm run build` | Compiles and optimizes all 51 Next.js production routes |
| `npm start` | Runs the Next.js production server |

---

## 🚢 Deployment Guide

### Deploying Frontend (Vercel)
1. Import the repository in **Vercel**.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Next.js**.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_APP_URL`: Your production frontend domain (e.g. `https://aipather.com`).
   - `NEXT_PUBLIC_API_URL`: Your production backend domain (e.g. `https://api.aipather.com`).
   - `BETTER_AUTH_URL`: Your production backend domain.
5. Click **Deploy**.

### Deploying Backend (Railway / Render / VPS)
1. Create a new service pointing to the repository.
2. Set **Root Directory** to `backend`.
3. Build Command: `npm install && npm run build`.
4. Start Command: `npm start`.
5. Add all required environment variables (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `GROQ_API_KEY`, etc.).
6. Ensure PostgreSQL database is accessible with SSL enabled.

---

## 🧪 Quality Assurance & Test Verification

Both repositories maintain strict automated quality standards:
- **Unit & Integration Tests**: 46/46 passed across 9 test suites.
- **Type Safety**: 0 TypeScript compiler errors across backend and frontend.
- **Lint Integrity**: 0 ESLint errors and 0 warnings.
- **Production Build**: 51/51 Next.js routes static/dynamic optimized (Exit Code 0).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with precision by <strong>Kamal</strong> • Powered by Adaptive AI & Prerequisite Intelligence</sub>
</div>
