# Infrastructure: Environment & Configuration Strategy

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Schema Definition**: [`backend/src/config/env.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/config/env.ts)

---

## 1. Environment Segregation

The system distinguishes runtime environments via the `NODE_ENV` variable:
- **`development`**: Local development; verbose error outputs; Pino logging muted for noisy request loops; fallback CORS origin `http://localhost:3000`.
- **`production`**: Strict SSL pooling; Pino HTTP logging enabled for all endpoints; secure cookie flags activated.
- **`test`**: Automated test execution using test databases or mocked responses.

---

## 2. Backend Environment Variables (`backend/.env`)

Validated at server startup using **Zod** ([env.ts](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/config/env.ts)):

| Variable | Type | Required | Default | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | `enum` | No | `"development"` | Application runtime environment |
| `PORT` | `number` | No | `5000` | HTTP port for Express server |
| `CORS_ORIGIN` | `url` | No | `"http://localhost:3000"` | Allowed client origin for CORS |
| `FRONTEND_URL` | `url` | No | `"http://localhost:3000"` | Internal URL for auth session loopback |
| `DATABASE_URL` | `url` | **YES** | None | PostgreSQL connection string |
| `GROQ_API_KEY` | `string` | No | `""` | Primary Groq inference API key |
| `GROQ_API_KEY_SECONDARY` | `string` | No | `""` | Second-tier Groq rotation key |
| `GROQ_API_KEY_3` | `string` | No | `""` | Third-tier Groq rotation key |
| `GROQ_API_KEY_4` | `string` | No | `""` | Fourth-tier Groq rotation key |
| `OPENROUTER_API_KEY` | `string` | No | `""` | Primary OpenRouter backup key |
| `OPENROUTER_API_KEY_SECONDARY` | `string` | No | `""` | Secondary OpenRouter backup key |
| `GEMINI_API_KEY` | `string` | No | `""` | Google Cloud GenAI API key |
| `MISTRAL_API_KEY` | `string` | No | `""` | Mistral AI API key |

---

## 3. Frontend Environment Variables (`frontend/.env`)

| Variable | Scope | Required | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public Client | Yes | Public canonical web URL |
| `NEXT_PUBLIC_API_URL` | Public Client | Yes | Public backend API URL |
| `BACKEND_API_URL` | Server Secret | Optional | Internal server-side URL to reach Express backend |
| `BETTER_AUTH_URL` | Server & Client | Yes | Canonical Better-Auth issuer URL |
| `BETTER_AUTH_SECRET` | Server Secret | Yes | 32-character random key for signing cookies |
| `DATABASE_URL` | Server Secret | Yes | PostgreSQL connection string for Better-Auth |
| `EMAIL_USER` & `EMAIL_PASSWORD` | Server Secret | Optional | Gmail credentials for Nodemailer OTP delivery |
| `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` | Server Secret | Optional | Google OAuth 2.0 credentials |
| `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` | Server Secret | Optional | GitHub OAuth credentials |
| `STRIPE_SECRET_KEY` | Server Secret | Optional | Stripe API key for checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | Server Secret | Optional | Stripe webhook HMAC signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public Client | Optional | Stripe Elements public publishable key |
