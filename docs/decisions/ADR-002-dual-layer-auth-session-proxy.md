# ADR-002: Dual-Layer Authentication & Session Proxying

> **Document Status**: Reconstructed from the implemented system.  
> **Original Decision Rationale**: Original decision rationale could not be verified from the codebase. Reconstructed based on repository structure.

---

## Context & Problem
Authentication is managed via Better-Auth, which runs inside the Next.js runtime (`frontend/src/lib/auth.ts`) to easily manage OAuth redirects, session cookies, and Next.js React client hooks. However, domain business logic, roadmaps, and simulation assessments reside in the separate Express server (`backend/`).

The system needed a secure, cross-origin communication strategy that avoids CORS cookie blocking and prevents exposing internal backend URLs directly to browsers.

---

## Decision
1. Better-Auth operates in Next.js, writing secure `HttpOnly`, `SameSite=lax` session cookies to the browser.
2. A Next.js dynamic Route Handler (`frontend/src/app/api/proxy/[...path]/route.ts`) acts as an internal API Gateway reverse-proxy:
   - Intercepts client calls targeting `/api/proxy/*`.
   - Sanitizes paths against directory traversal and protocol injection.
   - Forwards the incoming `Cookie` header to the Express backend.
3. Express auth middleware (`backend/src/middlewares/auth.middleware.ts`) verifies sessions by executing a loopback fetch:
   ```typescript
   const response = await fetch(`${NEXT_JS_URL}/api/auth/get-session`, {
     headers: { cookie: cookieHeader },
   });
   ```
   If valid, `req.userId` is attached to the request.

---

## Consequences & Trade-offs

### Positive Consequences:
- **Zero CORS Friction**: The browser only communicates with its own origin (port 3000), eliminating third-party cookie restrictions across modern browsers.
- **Unified Auth State**: Client-side React hooks (`authClient.useSession()`) remain reactive while backend services receive verified identity.

### Negative Consequences:
- **Network Overhead (Hop Multiplication)**: Every authenticated backend API request induces an extra HTTP loopback request from Express back to Next.js (`/api/auth/get-session`), doubling network roundtrips if not cached.
- **Tight Coupling**: Backend cannot function if the Next.js auth endpoint is unreachable.
