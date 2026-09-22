# Architecture Diagrams: AI Pather

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Version Evaluated**: 1.0.0

---

## 1. End-to-End System Topology

```mermaid
graph TD
    subgraph ClientBrowser ["🌐 Client Tier (Next.js 16.3 + React 19.2)"]
        UI["Landing & Dashboard UI (Tailwind CSS v4 + HeroUI)"]
        XYFlowCanvas["Interactive Roadmap Graph Canvas (@xyflow/react)"]
        CopilotUI["Floating AI Copilot Assistant"]
        SimRunner["4-Stage Assessment & Simulation Runner"]
        ResumeViewer["ATS Resume Builder & PDF Exporter (@react-pdf/renderer)"]
    end

    subgraph NextGateway ["🛡️ Next.js Server & Proxy Tier (Port 3000)"]
        AuthHandler["Better-Auth Server Handler (/api/auth/*)"]
        ProxyHandler["Next.js Reverse Proxy Route (/api/proxy/*)"]
        StripeWebhook["Stripe Webhook Handler (/api/stripe/webhook)"]
    end

    subgraph ExpressBackend ["⚙️ Modular Backend Services (Express 5.2, Port 5000)"]
        Security["Helmet & CORS Security Pipeline"]
        AuthMiddleware["Auth Middleware (Calls Next.js Session Endpoint)"]
        PlanGuard["Plan Subscription Middleware (FREE, PLUS, PRO)"]
        
        RoadmapSvc["Roadmap & Prerequisite Engine"]
        SimSvc["Skill Simulation & Grading Engine"]
        ProjectSvc["Project Studio & GitHub Inspector"]
        ReadinessSvc["Application Readiness Scoring Engine"]
        ResumeSvc["AI Resume & ATS Parser"]
        AdminSvc["System Health, AI Usage & Audit Logs"]
    end

    subgraph RelationalDB ["💾 PostgreSQL Persistence Layer (Neon / PG)"]
        UserTable[("Users, Accounts, Sessions, 2FA")]
        CurriculumTable[("Roadmaps, Milestones, Skills")]
        EvidenceTable[("Projects, ProjectEvidence, Proof Tokens")]
        LogsTable[("AiUsageLog, ErrorLog, ActivityLog")]
    end

    subgraph AIEngine ["🤖 Resilient Multi-Tier AI Gateway"]
        GroqRotation["Groq 4-Key Cascade (qwen3.8-27b)"]
        OpenRouterCascade["OpenRouter Primary & Secondary (qwen-2.5-coder-32b)"]
        GeminiFlash["Google GenAI (gemini-3.6-flash)"]
        MistralLatest["Mistral AI (mistral-small-latest)"]
        DeterministicOffline["Deterministic Simulation Fallback (Zero-500 Guarantee)"]
    end

    UI --> ProxyHandler
    XYFlowCanvas --> ProxyHandler
    CopilotUI --> ProxyHandler
    SimRunner --> ProxyHandler
    ResumeViewer --> ProxyHandler
    UI --> AuthHandler

    ProxyHandler --> Security
    Security --> AuthMiddleware
    AuthMiddleware --> PlanGuard
    PlanGuard --> RoadmapSvc
    PlanGuard --> SimSvc
    PlanGuard --> ProjectSvc
    PlanGuard --> ReadinessSvc
    PlanGuard --> ResumeSvc
    PlanGuard --> AdminSvc

    AuthHandler --> UserTable
    StripeWebhook --> UserTable
    RoadmapSvc --> CurriculumTable
    SimSvc --> CurriculumTable
    ProjectSvc --> EvidenceTable
    ReadinessSvc --> CurriculumTable
    ReadinessSvc --> EvidenceTable
    AdminSvc --> LogsTable

    RoadmapSvc -.-> AIEngine
    SimSvc -.-> AIEngine
    ProjectSvc -.-> AIEngine
    ResumeSvc -.-> AIEngine

    GroqRotation -- "429 / Timeout (>6s)" --> OpenRouterCascade
    OpenRouterCascade -- "Failover" --> GeminiFlash
    GeminiFlash -- "Failover" --> MistralLatest
    MistralLatest -- "All Offline" --> DeterministicOffline
```

---

## 2. Authentication & Session Verification Flow

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Client Browser
    participant NextAuth as Next.js (/api/auth)
    participant NextProxy as Next.js Proxy (/api/proxy)
    participant Express as Express Backend (Port 5000)
    participant PG as PostgreSQL Database

    Browser->>NextAuth: POST /api/auth/sign-in/email { email, password }
    NextAuth->>PG: Validate credentials & create session
    PG-->>NextAuth: Session record created
    NextAuth-->>Browser: Set-Cookie: better-auth.session_token (HttpOnly)

    Note over Browser,Express: Subsequent Authenticated API Request
    Browser->>NextProxy: GET /api/proxy/api/assessments/simulation (with Cookie)
    NextProxy->>NextProxy: Check path safety (SSRF & directory traversal prevention)
    NextProxy->>Express: GET /api/assessments/simulation (Cookie forwarded)
    Express->>NextAuth: fetch(`${FRONTEND_URL}/api/auth/get-session`)
    NextAuth-->>Express: HTTP 200 { user: { id: "usr_123", role: "LEARNER" } }
    Express->>PG: Verify user plan tier (user.plan in ["PLUS", "PRO"])
    PG-->>Express: Plan confirmed ("PLUS")
    Express->>Express: Execute SkillSimulationService
    Express-->>NextProxy: HTTP 200 { success: true, data: simulation }
    NextProxy-->>Browser: Return JSON response
```

---

## 3. Four-Tier AI Failover & Cooldown Pipeline

```mermaid
flowchart TD
    Start["Incoming AI Request (Prompt + Context)"] --> CircuitCheck{"Is Groq Account Cooled Down?"}
    
    CircuitCheck -- "No" --> TryGroq["Try Primary Groq Client (qwen3.8-27b, Timeout: 6s)"]
    CircuitCheck -- "Yes" --> NextAccount{"Next Groq Account in 4-Key Rotation?"}
    
    TryGroq -- "Success (200)" --> Repair["Smart JSON Sanitizer & Auto-Repair"]
    TryGroq -- "429 Rate Limit / Timeout" --> SetCool["Set Groq Cooldown (Parse 'try again in Xm Ys')"]
    SetCool --> NextAccount
    
    NextAccount -- "Active Account Found" --> TryGroq
    NextAccount -- "All Groq Accounts Cooled Down" --> TryOpenRouter{"OpenRouter Key Configured?"}
    
    TryOpenRouter -- "Yes" --> CallOR["Try OpenRouter Cascade (qwen-2.5-coder-32b)"]
    TryOpenRouter -- "No / Failed" --> TryGemini{"Gemini API Key Configured?"}
    
    CallOR -- "Success" --> Repair
    CallOR -- "Failed" --> TryGemini
    
    TryGemini -- "Yes" --> CallGemini["Try Google Gemini (gemini-3.6-flash)"]
    TryGemini -- "No / Failed" --> TryMistral{"Mistral API Key Configured?"}
    
    CallGemini -- "Success" --> Repair
    CallGemini -- "Failed" --> TryMistral
    
    TryMistral -- "Yes" --> CallMistral["Try Mistral AI (mistral-small-latest)"]
    TryMistral -- "No / Failed" --> OfflineFallback["Deterministic Domain Fallback Generator"]
    
    CallMistral -- "Success" --> Repair
    CallMistral -- "Failed" --> OfflineFallback
    
    Repair --> Response["Valid Response Returned to Controller"]
    OfflineFallback --> Response
```
