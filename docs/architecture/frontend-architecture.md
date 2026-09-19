# Frontend Architecture: AI Pather

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap/frontend`)  
> **Version Evaluated**: 1.0.0

---

## 1. Directory Structure & App Router Layout

The frontend application is built using Next.js 16 with the App Router architecture located in [`frontend/src/app/`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/app/).

```
frontend/src/
├── app/
│   ├── (auth)/                         # Authentication route group (signin, signup, forgot-password)
│   ├── (dashboard)/                    # Dashboard route group
│   │   └── dashboard/
│   │       ├── (admin)/admin/          # 21 Admin feature views & analytics
│   │       └── (learner)/learner/      # 16 Learner domain pages
│   ├── (main)/                         # Public marketing pages (landing, features, pricing)
│   ├── api/
│   │   ├── auth/                       # Better-Auth server handler ([...all]/route.ts)
│   │   ├── proxy/                      # API Gateway reverse proxy ([...path]/route.ts)
│   │   └── stripe/                     # Stripe checkout sessions & webhook handler
│   ├── diagnostic/                     # Initial learner onboarding diagnostic assessment
│   ├── verify/                         # Public proof graph token verification (/verify/proof/[token])
│   ├── layout.tsx                      # Root layout, theme providers, top loader
│   └── globals.css                     # Tailwind CSS v4 variables & glassmorphic styling
│
├── components/                         # Modular component library
│   ├── auth/                           # Auth forms, 2FA OTP input, DemoAdminButton
│   ├── chat/                           # Floating AI Copilot assistant (HomeFloatingChat)
│   ├── dashboard/
│   │   ├── admin/                      # Admin views, shared skeletons, health charts
│   │   └── learner/                    # Roadmap canvas, assessment runner, ATS resume editor
│   └── ui/                             # Buttons, inputs, modals, ambient glow cards
│
├── hooks/                              # Custom React hooks (useChatMentor, useNotifications)
├── lib/
│   ├── api/                            # Feature-specific typed API client functions (admin/ and learner/)
│   ├── core/                           # Base fetcher (serverFetch, serverMutation, baseUrl resolver)
│   ├── auth.ts                         # Server-side Better-Auth configuration with PostgreSQL pool
│   └── auth-client.ts                  # Client-side Better-Auth React client with 2FA plugins
└── types/                              # Shared TypeScript data models and response types
```

---

## 2. Route Topology & Page Counts

The Next.js application compiles 51 routes categorized into distinct lifecycle areas:

### A. Public & Landing Routes
- `/`: Interactive marketing landing page with feature previews, testimonial sliders, and dynamic hero banners.
- `/checkout`: Stripe subscription selection page (`FREE`, `PLUS`, `PRO`).
- `/verify/proof/[token]`: Public, unauthenticated proof verification view rendering cryptographic candidate credentials.

### B. Learner Dashboard Routes (`/dashboard/learner/*`)
1. `/dashboard/learner`: Core dashboard summary showing career readiness, active milestones, and skill radar.
2. `/dashboard/learner/learning-path`: Dynamic XYFlow graph canvas displaying prerequisite milestones.
3. `/dashboard/learner/assessments`: 4-stage skill simulation runner with real-time feedback.
4. `/dashboard/learner/portfolio`: Project Studio managing AI specifications (Flow A) and GitHub imports (Flow B).
5. `/dashboard/learner/proof-graph`: Interactive skill evidence dependency graph.
6. `/dashboard/learner/resume`: AI Resume builder with ATS 4-pillar scoring and `@react-pdf/renderer` export.
7. `/dashboard/learner/interview`: AI Technical Mock Interview simulator.
8. `/dashboard/learner/career-twin`: Senior-level benchmark comparison and skill deficit analysis.
9. `/dashboard/learner/skill-gaps`: Detailed inventory of verified skills, in-progress skills, and learning debts.
10. `/dashboard/learner/career-alignment`: Target role skill map and milestone alignment.
11. `/dashboard/learner/application-readiness`: Four-pillar readiness index and evaluation breakdown.
12. `/dashboard/learner/job-reality`: Live job market role requirements and matched competencies.
13. `/dashboard/learner/career-intelligence`: Career decision engine and progression recommendations.
14. `/dashboard/learner/progress`: Activity history, completion trends, and XP tracking.
15. `/dashboard/learner/profile`: Career profile target settings and study hour preferences.
16. `/dashboard/learner/settings`: Account credentials, 2FA configuration, and notification preferences.

### C. Admin Dashboard Routes (`/dashboard/admin/*`)
21 operational pages including System Health, AI Usage Logs, Audit Logs, Error Logs, User Management, AI Prompt Sandbox, Broadcast Announcements, Roadmaps, Assessments, Interviews, Projects, Resumes, and Analytics Snapshots.

---

## 3. State Management & Data Fetching

1. **Server vs Client Separation**:
   - Page containers use `"use client"` where dynamic hooks or React Query is required.
   - Skeletons provide immediate loading states via `loading.tsx` and custom full-page skeletons ([AdminPageSkeleton.tsx](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/components/dashboard/admin/shared/AdminPageSkeleton.tsx)).
2. **Data-Fetching Protocol**:
   - Components invoke modular client functions in `frontend/src/lib/api/` (e.g. `getLearningPath`, `submitSimulation`, `getProofGraph`).
   - All browser requests target the Next.js API proxy (`/api/proxy/*`) via [`server.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/lib/core/server.ts).
   - In-memory caching and revalidation are handled by TanStack React Query (`@tanstack/react-query`).
3. **Interactive Graph Engine**:
   - The platform uses `@xyflow/react` (React Flow) for both the Roadmap DAG Canvas and the Proof Graph Canvas.
   - Custom node types (`RoadmapMilestoneNode`, `ProofGraphNode`) render status-based animations, progress bars, and interaction handles.
