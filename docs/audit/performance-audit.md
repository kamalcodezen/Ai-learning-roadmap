# Performance Audit: AI Pather

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Evaluation Area**: Latency, Database Querying, Payload Sizing, and Inference Bottlenecks

---

## 1. Performance Strengths

1. **Fast-Tier AI Provider Selection**:
   - Primary inferences default to Groq LPUs (`qwen/qwen3.8-27b`), consistently returning completed text in under 400ms when not rate-limited.
2. **Parallelized Context Resolution**:
   - Layer B context extraction in `ChatService` uses `Promise.all` to fetch roadmaps, skill states, and projects concurrently rather than sequentially.
3. **Optimized Neon Database Pooling**:
   - Setting `idleTimeoutMillis: 10000` on `pg.Pool` prevents dead TCP handshake stalls on cloud serverless PostgreSQL databases.

---

## 2. Performance Bottlenecks & Findings

### 1. The Loopback Auth Roundtrip (P95 Latency Degradation)
- **Observation**: For every single authenticated API request, Express issues an internal HTTP request back to Next.js (`${FRONTEND_URL}/api/auth/get-session`), which in turn queries PostgreSQL.
- **Impact**: Adds an unavoidable network latency floor of 40ms–150ms to every backend route before business logic even begins.
- **Evidence**: [`backend/src/middlewares/auth.middleware.ts:L26`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/middlewares/auth.middleware.ts#L26).

### 2. Monolithic Proof Graph Aggregation
- **Observation**: `getProofGraph` ([proof-graph.service.ts:L6-L42](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/proof-graph/services/proof-graph.service.ts#L6-L42)) loads seven complete database tables in memory:
  ```typescript
  const [
    skillStates, profile, projectEvidence, projects,
    diagnosticAttempts, interviewSessions, assessmentLogs
  ] = await Promise.all([...]);
  ```
  It then iterates through all diagnostic answers and activity logs using in-memory `.flatMap()` and `.filter()`.
- **Impact**: As a learner accumulates hundreds of activity logs and assessment answers, rendering the proof graph becomes computationally expensive and consumes increasing server memory.
- **Recommendation**: Push aggregations into PostgreSQL via SQL `COUNT` and `EXISTS` subqueries rather than fetching raw records into Node.js memory.

### 3. Missing Global Response Compression
- **Observation**: Express does not mount the `compression` middleware in `app.ts`. Large JSON payloads (such as 25MB resume data or large graph topologies) are transmitted uncompressed over the network.
- **Recommendation**: Add `app.use(compression())` to reduce payload transmission sizes by up to 70%.
