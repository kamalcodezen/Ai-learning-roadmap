# API Contract & Route Specifications: AI Pather

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap/backend/src/app.ts`)  
> **Base URLs**:
> - Browser Proxy: `/api/proxy/*`
> - Direct Backend API: `http://localhost:5000/*`

---

## 1. Global Response Standards

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation message"
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description message",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

---

## 2. API Endpoint Catalog

### A. Authentication & Session (`/api/auth/*` on Next.js Port 3000)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/sign-in/email` | Public | Authenticates via email and password |
| `POST` | `/api/auth/sign-up/email` | Public | Creates new user with email and password |
| `POST` | `/api/auth/sign-out` | Session | Revokes active session and clears cookies |
| `GET` | `/api/auth/get-session` | Cookie | Returns active user object and session metadata |
| `POST` | `/api/auth/two-factor/verify-otp` | 2FA Temp | Verifies two-factor login OTP |
| `POST` | `/api/auth/demo-admin` | Public | Creates/signs in instant demo admin user |

---

### B. Learner Copilot (`/api/chat`)
| Method | Endpoint | Auth | Rate Limit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/chat` | Optional | 20 req/min | Dispatches message to AI Copilot with dynamic context |

---

### C. Diagnostic Assessments (`/api/diagnostic`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/diagnostic/questions` | Public | Returns active diagnostic question bank |
| `POST` | `/api/diagnostic/start` | `requireAuth` | Initializes new `DiagnosticAttempt` record |
| `POST` | `/api/diagnostic/answer` | `requireAuth` | Submits answer to specific diagnostic question |
| `POST` | `/api/diagnostic/submit` | `requireAuth` | Finalizes attempt, scores answers, updates skills |
| `GET` | `/api/diagnostic/result` | `requireAuth` | Retrieves latest completed diagnostic score and summary |

---

### D. Learning Path & Dynamic Roadmap (`/api/learning-path`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/learning-path` | `requireAuth` | Retrieves active roadmap and milestone DAG nodes |
| `POST` | `/api/learning-path/generate` | `requireAuth` | Synthesizes custom AI roadmap for target role |
| `PATCH` | `/api/learning-path/milestones/:id` | `requireAuth` | Updates milestone status (`CURRENT`, `COMPLETED`) |

---

### E. Skill Mastery Simulations (`/api/assessments`)
| Method | Endpoint | Auth | Plan Tier | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/assessments` | `requireAuth` | `FREE` | Retrieves assessment history and overview |
| `GET` | `/api/assessments/simulation` | `requireAuth` | `PLUS`, `PRO` | Generates 4-stage simulation (or fallback) |
| `POST` | `/api/assessments/simulation/submit` | `requireAuth` | `PLUS`, `PRO` | Grades submission across 4 stages (25% each) |
| `GET` | `/api/assessments/simulation/result` | `requireAuth` | `PLUS`, `PRO` | Retrieves recent simulation score breakdown |

---

### F. Portfolio & Project Studio (`/api/portfolio`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/portfolio` | `requireAuth` | Lists user projects and verified evidence |
| `POST` | `/api/portfolio/projects` | `requireAuth` | Creates project record manually |
| `POST` | `/api/portfolio/import` | `requireAuth` | Inspects and imports public GitHub repository (Flow B) |
| `POST` | `/api/portfolio/generate` | `requireAuth` | Generates AI architectural build spec (Flow A) |
| `POST` | `/api/portfolio/projects/:id/verify` | `requireAuth` | Evaluates project artifacts and issues verification score |

---

### G. Proof Graph (`/api/proof-graph`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/proof-graph` | `requireAuth` | Computes nodes and edges for user proof graph |
| `GET` | `/api/proof-graph/share-token` | `requireAuth` | Generates cryptographically signed HMAC-SHA256 token |
| `GET` | `/api/proof-graph/public/:token` | Public | Returns candidate credentials for public verification |

---

### H. Career Readiness & Career Twin (`/api/application-readiness`, `/api/career-twin`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/application-readiness` | `requireAuth` | Returns 4-pillar readiness index and category states |
| `GET` | `/api/career-twin` | `requireAuth` | Compares skills against senior-level market benchmarks |

---

### I. Resume & Mock Interview (`/api/resume`, `/api/interview`)
| Method | Endpoint | Auth | Plan Tier | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/resume` | `requireAuth` | `FREE` | Retrieves user resume data |
| `POST` | `/api/resume/analyze-ats` | `requireAuth` | `PLUS`, `PRO` | Performs 4-pillar ATS analysis against job description |
| `POST` | `/api/resume/rewrite-bullet` | `requireAuth` | `PLUS`, `PRO` | AI rewrites experience bullet for impact metrics |
| `POST` | `/api/interview/start` | `requireAuth` | `PLUS`, `PRO` | Starts new AI technical mock interview session |
| `POST` | `/api/interview/answer` | `requireAuth` | `PLUS`, `PRO` | Submits answer and receives immediate AI feedback |

---

### J. Subscriptions & Plan Management (`/api/subscription`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/subscription/status` | `requireAuth` | Returns active plan tier (`FREE`, `PLUS`, `PRO`) |
| `POST` | `/api/subscription/sync` | `requireAuth` | Updates user plan tier *(Vulnerability noted)* |

---

### K. Administrative Operations (`/api/admin/*`)
*Protected by `requireAdmin` middleware ([admin.middleware.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/middlewares/admin.middleware.ts))*

| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | `userId=<admin_id>` | Returns administrative system metrics |
| `GET` | `/api/admin/users` | `userId=<admin_id>&skip=0&take=10` | Returns paginated user accounts |
| `PATCH`| `/api/admin/users/:id/role` | `userId=<admin_id>`, `{ role: "ADMIN" }` | Elevates or demotes user role |
| `PATCH`| `/api/admin/users/:id/plan` | `userId=<admin_id>`, `{ plan: "PRO" }` | Overrides user subscription plan |
| `DELETE`| `/api/admin/users/:id` | `userId=<admin_id>` | Permanently deletes user account |
| `GET` | `/api/admin/subscriptions` | `userId=<admin_id>` | Returns subscription tiers & user counts |
| `GET` | `/api/admin/system-health` | `userId=<admin_id>` | Returns database ping and AI model latencies |
| `GET` | `/api/admin/audit-logs` | `userId=<admin_id>&skip=0&take=20` | Returns administrative audit log records |
| `GET` | `/api/admin/error-logs` | `userId=<admin_id>&skip=0&take=20` | Returns unhandled server exception logs |
| `GET` | `/api/admin/ai-usage` | `userId=<admin_id>&skip=0&take=20` | Returns token consumption and model usage logs |
| `GET` | `/api/admin/activity` | `userId=<admin_id>&skip=0&take=20` | Returns global platform activity feed |
| `GET` | `/api/admin/broadcasts` | `userId=<admin_id>` | Returns platform system broadcasts |
| `POST` | `/api/admin/broadcasts` | `userId=<admin_id>`, `{ title, message, type }` | Publishes platform system announcement |
| `GET` | `/api/admin/ai-sandbox/models` | `userId=<admin_id>` | Returns available models for playground testing |
| `POST` | `/api/admin/ai-sandbox/test` | `userId=<admin_id>`, `{ model, prompt }` | Tests prompt against selected AI provider |
| `GET` | `/api/admin/roadmaps` | `userId=<admin_id>&skip=0&take=20` | Returns learner roadmap oversight & milestones |
| `GET` | `/api/admin/assessments` | `userId=<admin_id>&skip=0&take=20` | Returns diagnostic and simulation attempt records |
| `GET` | `/api/admin/interviews` | `userId=<admin_id>&skip=0&take=20` | Returns mock interview session listings |
| `GET` | `/api/admin/interviews/:id` | `userId=<admin_id>` | Returns detailed transcript & scores for interview |
| `GET` | `/api/admin/projects` | `userId=<admin_id>&skip=0&take=20` | Returns learner project submissions & scores |
| `PATCH`| `/api/admin/projects/:id/verify`| `userId=<admin_id>`, `{ isVerified, score }` | Manually verifies or overrides project score |
| `GET` | `/api/admin/resumes` | `userId=<admin_id>&skip=0&take=20` | Returns learner ATS resumes & scores |
| `GET` | `/api/admin/resumes/:id` | `userId=<admin_id>` | Returns full structured resume data & feedback |
| `GET` | `/api/admin/skill-health` | `userId=<admin_id>` | Returns platform skill proficiency health distribution |
| `GET` | `/api/admin/learning-debt` | `userId=<admin_id>` | Returns stuck node and prerequisite debt metrics |
| `GET` | `/api/admin/career-readiness` | `userId=<admin_id>` | Returns cohort 4-pillar readiness distribution |
| `GET` | `/api/admin/job-reality` | `userId=<admin_id>` | Returns job market scraping & classification overview |
| `GET` | `/api/admin/skill-proof` | `userId=<admin_id>&skip=0&take=20` | Returns verified skill proof records |
| `GET` | `/api/admin/analytics` | `userId=<admin_id>&days=30` | Returns aggregated daily analytics snapshots |
| `GET` | `/api/admin/export/:entity` | `userId=<admin_id>` | Exports JSON/CSV dataset for specified entity |
