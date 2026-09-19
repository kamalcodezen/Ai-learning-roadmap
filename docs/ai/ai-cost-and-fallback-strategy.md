# AI Cost, Rate Limiting & Fallback Strategy: AI Pather

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Source Files**: [`backend/src/modules/learner/copilot/services/chat.service.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts), [`backend/src/modules/admin/ai-usage/`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/ai-usage/)

---

## 1. Provider Cost & Priority Strategy

AI Pather manages token expenditure and inference latency through a prioritized multi-tier hierarchy:

| Priority | Provider Tier | Cost Profile | Latency Profile | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | Groq (`qwen/qwen3.8-27b`) | Free / Low LPU cost | Ultra-low (200–500ms) | Primary chat, simulations, roadmaps |
| **Tier 1b**| Groq (`groq/compound-mini`) | Free / Minimal tokens | Ultra-low (150–350ms) | Fast fallback on token limits |
| **Tier 2** | OpenRouter (`qwen-2.5-coder-32b`) | Low / Moderate per-token | Moderate (800–1500ms) | Code generation & parsing backup |
| **Tier 3** | Google Gemini (`gemini-3.6-flash`) | Moderate per-token | Moderate (600–1200ms) | Deep reasoning & complex analysis |
| **Tier 4** | Mistral AI (`mistral-small-latest`)| Moderate per-token | Moderate (700–1400ms) | Multilingual & structured fallback |
| **Offline**| Deterministic Simulation Engine | Zero compute cost | Instant (0ms) | Guaranteed zero-500 safety net |

---

## 2. Fair Multi-Key Rotation Algorithm

To maximize free-tier token allocations across multiple accounts, `getRotatedGroqClients` implements a fair round-robin cascade ([chat.service.ts:L107-L120](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts#L107-L120)):
1. Discovers configured keys: `GROQ_API_KEY`, `GROQ_API_KEY_SECONDARY`, `GROQ_API_KEY_3`, `GROQ_API_KEY_4`.
2. Rotates the starting client index on each request, distributing traffic evenly across accounts (25% each across 4 keys).
3. If an account encounters a rate limit or error, the cascade seamlessly attempts the remaining active accounts before falling back to OpenRouter.

---

## 3. Circuit Breaker Cooldown Logic

Rate limit errors (HTTP 429) trigger `setModelCooldown(modelKey, errMessage, statusCode)` ([chat.service.ts:L75-L97](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts#L75-L97)):
- **Dynamic Regex Parsing**: Parses provider error messages matching:
  `try again in (?:(\d+)m)?(?:([\d.]+)s)?`
  Extracts required wait time and adds a 1,500ms safety buffer.
- **Default 429 Cooldown**: 30 to 40 seconds (matching Groq's 60-second rolling TPM/RPM window).
- **Invalid Model Cooldown**: 1 hour for HTTP 404 models.
- **Unauthorized Key Cooldown**: 30 minutes for HTTP 401 invalid API keys.
- **Fast Bypass**: Invocations check `isModelCoolingDown()`; cooled-down models are skipped immediately without network calls.

---

## 4. Observability & Token Logging

Every AI request writes telemetry asynchronously to the `AiUsageLog` database table ([chat.service.ts:L464-L480](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts#L464-L480)):
- `provider`: Provider name (e.g. `Groq`, `Groq-2`, `OpenRouter`, `Gemini`, `Mistral`)
- `model`: Specific model ID invoked
- `feature`: Invoking domain feature (`CHAT`, `DIAGNOSTIC`, `ROADMAP`, `SIMULATION`)
- `status`: `SUCCESS` or `FAILURE`
- `durationMs`: Total execution time
- `tokensUsed`: Token count reported by provider
- `errorMessage`: Captured exception message if failed

Admins inspect these metrics in real-time at `/dashboard/admin/ai-usage` and `/dashboard/admin/system-health`.
