# Architectural Audit: AI Pather

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Evaluation Date**: Current Repository State  
> **Evaluation Standard**: Senior Staff Software Architecture Audit

---

## 1. Architectural Strengths

1. **Clean Separation of Presentation and Domain Logic**:
   - The decoupling between Next.js (`frontend/`) and Express (`backend/`) allows independent scaling and hosting.
   - Next.js acts cleanly as the user-facing web tier and API gateway proxy, shielding the Express domain API from direct internet exposure.
2. **Unified, Resilient AI Gateway**:
   - `ChatService` encapsulates all LLM logic behind clean static interfaces (`processChat` and `processJsonCompletion`).
   - Domain services (`SkillSimulationService`, `LearningPathService`, `ResumeAiService`) remain agnostic to whether an inference was completed by Groq, OpenRouter, Gemini, or Mistral.
3. **Comprehensive Relational Modeling**:
   - The Prisma schema defines 28 well-normalized models with explicit foreign-key constraints, cascading deletes, and strategic indexes.
4. **Deterministic Fallback Safety Nets**:
   - Incorporating hand-crafted, schema-valid fallback simulations ensures that third-party LLM outages do not produce broken UI experiences.

---

## 2. Architectural Concerns & Anti-Patterns

### 1. Loopback Session Fetching Bottleneck
- **Finding**: On every authenticated API request, the Express backend executes a network HTTP `fetch` call back to the Next.js Better-Auth endpoint:
  ```typescript
  const response = await fetch(`${NEXT_JS_URL}/api/auth/get-session`, {
    headers: { cookie: cookieHeader },
  });
  ```
- **Architectural Impact**: This creates a circular architectural dependency between the backend and frontend. If the Next.js server experiences high CPU usage during SSR rendering, API response times in Express degrade simultaneously.
- **Severity**: **MEDIUM-HIGH**
- **Recommendation**: Transition to cryptographically signed JWT sessions or a shared Redis session store so Express can verify session tokens locally in under 1ms without an HTTP round-trip.

### 2. Duplicated Types Without Shared Package Workspaces
- **Finding**: TypeScript interfaces representing shared models (e.g. `SkillSimulation`, `ProofGraphNode`, `AdminUserListItem`) are manually duplicated between `frontend/src/types/` and `backend/src/modules/`.
- **Architectural Impact**: Type drift over time leads to runtime deserialization bugs.
- **Severity**: **MEDIUM**
- **Recommendation**: Formalize npm workspaces or pnpm workspaces with a `packages/shared-types` package.

### 3. In-Memory Circuit Breaker Desynchronization
- **Finding**: `modelCooldowns = new Map<string, number>()` in `chat.service.ts` tracks provider rate-limit states purely in Node.js process memory.
- **Architectural Impact**: In a horizontally scaled production deployment (multiple backend containers), one container encountering a 429 rate limit will cool down, while sibling containers continue hammering the exhausted API key.
- **Severity**: **MEDIUM**
- **Recommendation**: Move circuit-breaker cooldown timestamps to a shared Redis key store with automated TTLs.
