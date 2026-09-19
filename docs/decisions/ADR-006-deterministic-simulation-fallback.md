# ADR-006: Deterministic Domain Fallbacks for Skill Simulations

> **Document Status**: Reconstructed from the implemented system.  
> **Original Decision Rationale**: Original decision rationale could not be verified from the codebase. Reconstructed based on repository structure.

---

## Context & Problem
Learners engaging in 4-stage coding simulations expect prompt, zero-error execution. If all external AI providers (Groq, OpenRouter, Gemini, Mistral) fail simultaneously due to network partition, billing limits, or concurrent global outages, traditional architectures return HTTP 500 or display broken UI error screens.

---

## Decision
Implement **`generateFallbackSimulation`** in [`backend/src/modules/learner/assessments/services/skill-simulation.service.ts:L115-L410`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/assessments/services/skill-simulation.service.ts#L115-L410):
1. The service maintains rich, hand-crafted deterministic simulation templates for major engineering disciplines:
   - React / Frontend Engineering
   - Node.js / Backend & API Engineering
   - Database / PostgreSQL / SQL Query Optimization
   - DevOps / Docker / CI/CD Pipelines
   - Python / Data / AI Systems
   - Generic Fallback for unlisted technologies
2. Each fallback scenario satisfies the strict `AiGeneratedSimulationSchema` (Zod), containing calibrated questions, buggy snippets, starter code, required patterns, and key conceptual phrases.
3. If LLM generation throws an error or exceeds timeouts, the system transparently serves the deterministic fallback without logging an unhandled exception or degrading user experience.

---

## Consequences & Trade-offs

### Positive Consequences:
- **Absolute Availability**: The simulation service achieves near-100% availability for standard curriculum skills even in complete offline or air-gapped environments.
- **Predictable Quality**: Deterministic fallbacks are thoroughly vetted, ensuring bug snippets and grading pattern regexes are accurate.

### Negative Consequences:
- **Template Stagnation**: Hand-crafted templates require periodic manual updating as industry libraries and frameworks evolve.
- **Limited Long-Tail Support**: Unlisted niche frameworks receive generic fallback simulations rather than deeply customized scenarios.
