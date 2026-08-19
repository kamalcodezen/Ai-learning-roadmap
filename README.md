# AIPather

> **Adaptive AI Learning Roadmap Platform** — Solving the static learning crisis through dynamic, milestone-driven technical pathways and prerequisite intelligence.

---

## 1. Project Title & Tagline

**AIPather**: A modern, interactive AI-powered learning roadmap platform designed to replace rigid, one-size-fits-all tech roadmaps with dynamic, personalized learning pathways.

---

## 2. Real-World Problem Statement

Current self-taught developers and tech learners face three critical challenges with existing resources:

1. **The "Static Checklist" Failure:** Traditional roadmap websites provide static, linear lists. If a learner gets stuck on an advanced topic (e.g., _Server Components_), the roadmap cannot explain _why_ they are struggling or what prerequisite is missing.
2. **Invisible Learning Debt:** Learners often rush through high-level tutorials without solid fundamentals. This hidden gap surfaces later as imposter syndrome or failure in coding interviews.
3. **High Abandonment & Rigidity:** When life happens and a learner misses a week, traditional roadmaps offer no dynamic recalibration, causing learners to drop out due to guilt and loss of momentum.

---

## 3. Real-World Solution

AIPather transforms passive roadmap viewing into an intelligent, adaptive guidance system:

- **Dynamic Roadmaps (Not Static Images):** AI-generated personalized pathways tailored to current knowledge, target roles, and available study hours.
- **Prerequisite Intelligence:** Automatically identifies missing foundational concepts and injects actionable sub-nodes to clear learning debt.
- **Milestone Progress & Real Proof:** Moves beyond checkmarks by tracking practical milestone completion.
- **Smart Pacing Engine:** Adjusts estimated milestone completion timelines dynamically based on real-time learner bandwidth.

---

## 4. Current Status & Active Features

- [x] **Interactive Landing Architecture:** Production-ready dark-themed interface built with Tailwind CSS and Motion.
- [x] **Progress Bridge & Roadmap Pulse:** Dynamic visual indicators representing real-time skill synchronization and milestone tracking.
- [x] **Interactive Step Showcase:** Click-based 4-stage learning process walkthrough (Diagnose → Unblock → Prove → Adapt).
- [x] **Responsive Navigation & Smooth Scroll:** Integrated anchor scroll targeting across mobile and desktop breakpoints.
- [x] **Self-Healing Error & 404 Boundaries:** Cybernetic runtime recovery interfaces for uninterrupted UX.
- [ ] **AI Graph Generation Engine (In Progress):** Next.js Server Actions connecting to LLMs for dynamic node/edge JSON generation.
- [ ] **Interactive React Flow Canvas (In Progress):** Node-edge visualization for milestone management.

---

## 5. Tech Stack

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, Motion (`motion/react`), React Icons (`react-icons/lu`).
- **Backend Architecture (Target):** Next.js Server Actions, Route Handlers, Zod Validation.
- **Database & Persistence (Target):** PostgreSQL via Prisma (User & Roadmap Nodes), MongoDB (Task Submissions).
- **Caching & Memory (Target):** Upstash Redis (Graph Caching), Pinecone Vector DB (Prerequisite Concept Matching).
- **AI Engine (Target):** Groq / Google Gemini for structured roadmap graph generation.

---

