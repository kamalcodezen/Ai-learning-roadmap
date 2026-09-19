# Engineering: Git Workflow & Repository Conventions

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Version Evaluated**: 1.0.0

---

## 1. Repository Layout & Branching Strategy

The AI Pather project is maintained as a single Git repository containing decoupled frontend and backend applications:
- **Default Branch**: `main`
- **Development Workflow**: Feature branch or direct commit progression observed in Git history.
- **Pull Request Automation**: **NOT IMPLEMENTED** (No branch protection rules or required status checks configured via repository files).

---

## 2. Commit & Workspace Conventions

Based on git log inspection and repository structure:
1. **Commit Granularity**: Commits align with cohesive feature boundaries (e.g. `feat(simulation): implement 4-stage skill evaluation`, `fix(auth): update session cookie handling`).
2. **Artifact Preservation**:
   - `dist/` and `node_modules/` are strictly ignored via [`.gitignore`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/.gitignore).
   - `.env` files are ignored; `.env.example` templates are provided in both `frontend/` and `backend/`.
   - Temporary test scripts reside in `backend/scripts/` to keep production runtime directories clean.

---

## 3. Recommended Production Git Governance

To evolve the project toward enterprise standards:
1. **Branch Protection**: Enforce protection on `main` requiring at least one peer code review and clean CI pipeline execution.
2. **Conventional Commits**: Formalize Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`) enforced via Husky and `commitlint`.
3. **Automated Release Tagging**: Implement Semantic Versioning (`v1.0.0`, `v1.1.0`) with automated GitHub Releases generated on merge to `main`.
