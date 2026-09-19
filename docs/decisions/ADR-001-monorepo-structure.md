# ADR-001: Decoupled Monorepo Structure (Next.js & Express)

> **Document Status**: Reconstructed from the implemented system.  
> **Original Decision Rationale**: Original decision rationale could not be verified from the codebase. Reconstructed based on repository structure.

---

## Context & Problem
The AI Pather application requires a rich client application with dynamic DAG graph visualization, interactive forms, and real-time AI copilot capabilities, alongside a heavy domain API server responsible for long-running AI completions, GitHub parsing, scoring calculations, and database migrations.

The engineering team needed to choose between:
1. An integrated Next.js monolith using Server Actions and Route Handlers for everything.
2. Separate independent repositories (Frontend repo and Backend repo).
3. A decoupled monorepo containing `frontend/` (Next.js) and `backend/` (Express) within a single Git repository.

---

## Decision
Adopt a decoupled monorepo structure containing two distinct root packages:
- `frontend/`: Next.js 16.3 App Router client and API reverse-proxy.
- `backend/`: Express 5.2 TypeScript modular API server.

---

## Consequences & Trade-offs

### Positive Consequences:
- **Independent Lifecycles**: Frontend can be deployed to edge/serverless platforms (Vercel) while backend runs as a continuous Node.js process (Render/Railway/VPS) suitable for long AI streams and connection pooling.
- **Unified Versioning**: Both frontend and backend contracts evolve within a single commit history, avoiding synchronization friction during rapid iteration.
- **Optimized Tooling**: Frontend utilizes Turbopack and React 19 compiler tooling; backend utilizes lightweight `tsx watch` without bundling overhead.

### Negative Consequences:
- **No Shared Package Workspace**: The repository does not use pnpm or npm workspaces; shared types between `frontend/` and `backend/` are duplicated rather than linked via a shared workspace package.
- **Port Coordination**: Local development requires running two distinct servers on ports 3000 and 5000.
