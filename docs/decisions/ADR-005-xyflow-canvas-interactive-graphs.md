# ADR-005: Interactive DAG Visualization via XYFlow

> **Document Status**: Reconstructed from the implemented system.  
> **Original Decision Rationale**: Original decision rationale could not be verified from the codebase. Reconstructed based on repository structure.

---

## Context & Problem
Traditional technical career roadmaps present linear lists or static raster images (PNG/SVG) that cannot respond to learner actions. AI Pather requires interactive, living node-edge graphs for two core features:
1. **Adaptive Prerequisite Graphs**: Nodes represent milestones, edges represent strict dependencies, and nodes dynamically transition between `LOCKED`, `UPCOMING`, `CURRENT`, and `COMPLETED`.
2. **Public Proof Graphs**: Nodes represent verified skills, diagnostics, and project evidence, linked by validation edges.

The team needed an interactive canvas library that supports custom React components inside nodes, smooth zooming/panning, and dynamic layout recalculation.

---

## Decision
Adopt **`@xyflow/react`** (v12.11.6, formerly React Flow) as the foundational graph rendering engine for both:
- `RoadmapGraphCanvas.tsx` & `RoadmapMilestoneNode.tsx` ([learning-path/RoadmapGraph/](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/components/dashboard/learner/learning-path/RoadmapGraph/))
- `ProofGraphCanvas.tsx` & `ProofGraphNode.tsx` ([proof-graph/ProofGraphCanvas/](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/frontend/src/components/dashboard/learner/proof-graph/ProofGraphCanvas/))

---

## Consequences & Trade-offs

### Positive Consequences:
- **Rich Interactive UX**: Learners can drag, pan, zoom, click milestones to open detailed inspector drawers, and view glowing dependency paths.
- **Custom DOM Nodes**: Milestone nodes render custom badges, completion rings, and status-based glassmorphism styles using native React components and Tailwind CSS.

### Negative Consequences:
- **Bundle Size**: `@xyflow/react` and its internal dependencies (such as zustand) add to client bundle weight.
- **Mobile Responsiveness**: Managing complex multi-node canvas navigation on smaller mobile screens requires viewport constraints and mini-map optimizations.
