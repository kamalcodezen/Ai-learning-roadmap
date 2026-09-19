# Discovery: Success Metrics & Telemetry

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Version Evaluated**: 1.0.0

---

## 1. Primary Mathematical Objectives & KPIs

Based on the implemented data models and scoring services, AI Pather defines measurable learner progress through several core mathematical constructs:

### 1. Application Readiness Index
- **Formula Implementation**: [`backend/src/modules/learner/readiness/services/readiness.service.ts:L141-L159`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/readiness/services/readiness.service.ts#L141-L159)
- **Calculation**: Dynamically averages active assessed dimensions:
  $$\text{Readiness Score} = \frac{1}{N} \sum_{i=1}^{N} \text{Dimension}_i$$
  where dimensions include:
  - $\text{Knowledge Score}$ (from diagnostic & simulations)
  - $\text{Practical Competence}$ (from simulation Stage 3 & hands-on exercises)
  - $\text{Project Execution}$ (from verified portfolio projects)
  - $\text{Problem Solving}$ (from diagnostic debugging questions)
  - $\text{Technical Communication}$ (from diagnostic explanation questions)
  - $\text{Interview Preparedness}$ (from completed mock interviews)
  - $\text{Evidence Score}$ (from verified GitHub repositories & proof tokens)
- **Target Threshold**: A candidate is classified as `Career Ready` (`isReady: true`) when the overall readiness score is $\ge 70\%$ ([application-readiness.service.ts:L131](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/application-readiness/services/application-readiness.service.ts#L131)).

---

### 2. Four-Stage Skill Mastery Simulation Score
- **Formula Implementation**: [`backend/src/modules/learner/assessments/services/skill-simulation.service.ts:L591-L596`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/assessments/services/skill-simulation.service.ts#L591-L596)
- **Stage Weights**:
  $$\text{Simulation Score} = 0.25 \times \text{Understand} + 0.25 \times \text{Debug} + 0.25 \times \text{Code} + 0.25 \times \text{Explain}$$
- **Thresholds**:
  - $\ge 80\%$: *Exceptional Mastery* (updates canonical `knowledgeScore` and sets `practiceScore` to $\ge 72\%$)
  - $60\% - 79\%$: *Functional Proficiency*
  - $< 60\%$: *Foundational / Learning Debt Flagged*

---

### 3. Proof Graph Verification Threshold
- **Implementation**: [`backend/src/modules/learner/proof-graph/services/proof-graph.service.ts:L108-L117`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/proof-graph/services/proof-graph.service.ts#L108-L117)
- **Criteria for Verified Node Status (`status: "verified"`)**:
  A skill node achieves verified status if any of the following conditions are met:
  1. Composite display score $\ge 60\%$
  2. Diagnostic knowledge score $\ge 70\%$
  3. Practical competence score $\ge 60\%$
  4. Telemetry evidence score $\ge 50\%$
  5. Associated diagnostic question answered correctly
  6. Completed 4-stage simulation assessment recorded
  7. Connected to a verified GitHub project repository

---

## 2. System Performance & Reliability Metrics

The backend tracks system reliability through specific database logs and observability endpoints:

| Metric Category | Target Standard | Observed Mechanism | Relevant Files |
| :--- | :--- | :--- | :--- |
| **Zero-500 Error Rate on AI Failure** | 100% Graceful Fallback | Circuit Breaker Cooldowns + Deterministic Simulation Fallback | [chat.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts), [skill-simulation.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/assessments/services/skill-simulation.service.ts#L115) |
| **AI Inference Latency** | $< 6000\text{ms}$ per attempt | AbortController timeouts (`attemptTimeout = Math.min(timeoutMs, 6000)`) | [chat.service.ts:L717](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/services/chat.service.ts#L717) |
| **AI Provider Health Tracking** | Continuous Health State | Aggregated `AiUsageLog` status (`SUCCESS` vs `FAILURE`) | [system-health.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/system-health/system-health.service.ts), [ai-usage.service.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/admin/ai-usage/ai-usage.service.ts) |
| **System Error Auditing** | Fire-and-forget async write | Centralized `ErrorLog` table populated via Express middleware | [error.middleware.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/middlewares/error.middleware.ts) |
| **Platform Daily Snapshots** | Daily aggregate capture | `AnalyticsSnapshot` entity tracking users, roadmaps, assessments, career-ready count | [schema.prisma:L482-L495](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/prisma/schema.prisma#L482-L495) |
