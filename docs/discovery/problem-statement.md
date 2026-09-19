# Discovery: Problem Statement

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Version Evaluated**: 1.0.0

---

## 1. Context & Industry Background

In traditional technical career preparation, self-directed learners and transitioning software engineers face a systemic issue characterized as **The Static Checklist Crisis**:
1. **Static, Non-Adaptive Roadmaps**: Platforms such as generic roadmap websites provide linear, immutable lists of technologies (e.g., "Learn React -> Learn Node.js -> Learn Docker"). When a learner struggles with a foundational concept (e.g., closures, asynchronous event loops, or relational database indexing), static checklists provide no diagnostic mechanism to identify the root cause of the learning blockage.
2. **Invisible Architectural Learning Debt**: Learners frequently progress superficially through tutorials without realizing they lack prerequisite competencies. This accumulated deficit compounds until the learner hits complex capstone projects or technical interviews.
3. **The Proof Deficit**: Resumes and portfolios often feature clone projects without verifiable evidence of authentic comprehension, debugging skills, or architectural design reasoning. Hiring managers and recruiters struggle to verify if code was authored, understood, or simply copied from tutorial repositories.
4. **Disconnection from Real Market Demands**: Curricula rarely adapt to live market expectations or senior-level architectural benchmarks, leading candidates to over-index on redundant surface-level frameworks while missing critical system engineering and debugging skills.

---

## 2. Core Problem Definitions (As Addressed in Codebase)

The AI Pather system directly addresses these challenges through five concrete technical implementations:

### Problem 1: Uncalibrated Learner Baselines
- **Symptom**: Learners begin technical curriculums without an accurate baseline of their existing competencies across conceptual knowledge, practical coding, debugging, and technical communication.
- **System Evidence**: Implemented in [`backend/src/modules/learner/diagnostic/`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/diagnostic/) and models `DiagnosticQuestion`, `DiagnosticAttempt`, and `DiagnosticAnswer` in [`backend/prisma/schema.prisma`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/prisma/schema.prisma#L171-L261).
- **Solution**: Multi-dimensional diagnostic assessment evaluating conceptual mastery, algorithmic debugging, code implementation, and architectural communication.

### Problem 2: Rigid Progression Graphs
- **Symptom**: Standard roadmaps treat every learner identically, forcing linear traversal regardless of demonstrated mastery or specific prerequisite debt.
- **System Evidence**: Implemented in [`backend/src/modules/learner/roadmap/`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/roadmap/) and visualized via interactive nodes and edges in [`frontend/src/components/dashboard/learner/learning-path/RoadmapGraph/RoadmapGraphCanvas.tsx`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/components/dashboard/learner/learning-path/RoadmapGraph/RoadmapGraphCanvas.tsx).
- **Solution**: Dynamic node-edge graphs where milestones unlock adaptively (`LOCKED`, `UPCOMING`, `CURRENT`, `COMPLETED`) based on prerequisite completion.

### Problem 3: Superficial Multiple-Choice Assessments
- **Symptom**: Typical online platforms test developers using trivial multiple-choice quizzes that measure memorization rather than engineering capability.
- **System Evidence**: Implemented in [`backend/src/modules/learner/assessments/services/skill-simulation.service.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/assessments/services/skill-simulation.service.ts).
- **Solution**: A rigorous 4-stage simulation workflow:
  1. *Understand*: Deep conceptual principles and trade-offs.
  2. *Debug*: Real-world broken code requiring root-cause diagnosis.
  3. *Code*: Hands-on implementation validated against strict syntactic and structural pattern matching (`requiredPatterns`).
  4. *Explain*: Technical communication prompt scoring architectural trade-offs against key engineering concepts (`keyConcepts`).

### Problem 4: Unverifiable Project Portfolios
- **Symptom**: Applicants link GitHub repositories that recruiters cannot easily inspect or verify for genuine understanding.
- **System Evidence**: Implemented in [`backend/src/modules/learner/projects/services/github-inspector.service.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/projects/services/github-inspector.service.ts) and [`backend/src/modules/learner/proof-graph/services/proof-graph.service.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/proof-graph/services/proof-graph.service.ts).
- **Solution**: Automated GitHub repository parsing (inspecting file trees, CI/CD configs, test frameworks, Dockerfiles) and cryptographically signed public proof graph tokens (`/verify/proof/[token]`).

### Problem 5: Opaque Career Readiness
- **Symptom**: Job candidates lack clear metrics on whether their skills match current employer expectations.
- **System Evidence**: Implemented in [`backend/src/modules/learner/readiness/services/readiness.service.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/readiness/services/readiness.service.ts) and [`backend/src/modules/learner/application-readiness/services/application-readiness.service.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/application-readiness/services/application-readiness.service.ts).
- **Solution**: Multi-dimensional scoring engine tracking Technical Knowledge, Practical Competence, Portfolio Strength, Problem Solving, Communication Skills, and Interview Readiness.

---

## 3. Impact & Value Proposition

By transforming static tutorials into an adaptive, proof-backed intelligence system, AI Pather shifts the learner from passive consumer to verified software practitioner with observable, cryptographically verifiable telemetry.
