# ADR-003: Multi-Tier Resilient AI Gateway & Cascade Failover

> **Document Status**: Reconstructed from the implemented system.  
> **Original Decision Rationale**: Original decision rationale could not be verified from the codebase. Reconstructed based on repository structure.

---

## Context & Problem
Generative AI inference is the core value driver of AI Pather (diagnostic questions, simulation scenarios, dynamic roadmaps, project build specifications, and copilot responses). However, public LLM inference providers frequently experience:
1. Token rate limits (HTTP 429) on free or pay-as-you-go tiers.
2. Latency spikes and gateway timeouts.
3. Formatting irregularities (e.g. models wrapping JSON responses in markdown fences, adding trailing commas, or including conversational preambles).

---

## Decision
Implement a centralized, multi-tier AI Gateway (`ChatService`) in [`backend/src/modules/learner/copilot/services/chat.service.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts):
1. **Multi-Account Groq Key Rotation**: Up to 4 separate Groq API keys rotated in round-robin fashion to maximize token capacity.
2. **Four-Tier Provider Cascade**:
   - *Tier 1 (Primary)*: Groq (`qwen/qwen3.8-27b`) with automatic fallback to `groq/compound-mini`.
   - *Tier 2 (Fast Secondary)*: OpenRouter (`qwen/qwen-2.5-coder-32b-instruct`) supporting both primary and secondary keys.
   - *Tier 3 (Tertiary)*: Google Gemini (`gemini-3.6-flash`).
   - *Tier 4 (Quaternary)*: Mistral AI (`mistral-small-latest`).
3. **Regex-Based Circuit Breakers**: Models hitting 429 rate limits parse retry strings (e.g. `try again in Xm Ys`) and cool down in an in-memory Map.
4. **Self-Healing JSON Sanitizer**: `extractValidJsonString` extracts outermost JSON structures, strips markdown backticks, and repairs trailing commas and line comments before parsing.

---

## Consequences & Trade-offs

### Positive Consequences:
- **Zero-500 Guarantee**: LLM rate limits do not disrupt end-user workflows.
- **Cost & Speed Efficiency**: Fast inference is attempted first (Groq LPUs), escalating to paid/external providers only when necessary.

### Negative Consequences:
- **In-Memory Circuit Breaker State**: Because cooldowns are stored in a local `Map<string, number>`, running multiple backend instances in production will result in desynchronized circuit-breaker states without a shared Redis store.
- **Vendor Divergence**: Different LLMs may exhibit subtle variations in tone, depth, or schema compliance during failovers.
