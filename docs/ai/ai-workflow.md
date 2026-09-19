# AI Workflows & Prompt Engineering Lifecycle: AI Pather

> **Document Status**: Reconstructed from the implemented system.  
> **Target System**: AI Pather (Repository: `Ai-learning-roadmap`)  
> **Prompt Definitions**: [`backend/src/modules/learner/copilot/chat.prompts.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/chat.prompts.ts) (49,941 bytes)

---

## 1. Primary AI Workflow Pipelines

AI Pather implements three primary AI execution pipelines:

### Pipeline 1: Contextual Conversational Copilot
```
User Message
    ↓
Query Complexity Classification (detectQueryComplexity)
    ↓
Token Limit Sizing (simple: 1200, normal: 1800, complex: 2200)
    ↓
Context Extraction (2-Layer DB fetch)
    ↓
System Prompt Synthesis (buildChatPrompt)
    ↓
Multi-Tier Gateway (Groq → OpenRouter → Gemini → Mistral)
    ↓
Completion Sanitization (ensureCleanResponseCompletion)
    ↓
AiUsageLog DB Persistence
    ↓
Client Response
```

### Pipeline 2: Structured JSON System Tasks (Roadmap & Diagnostic)
Used by `LearningPathService` and `DiagnosticAiService`:
- Invokes `ChatService.processJsonCompletion(systemInstruction, userPrompt, timeoutMs)`.
- Appends strict enforcement: `"Return ONLY valid JSON. The response must be a valid JSON object."`
- Configures provider `response_format: { type: "json_object" }`.
- Passes raw response through `extractValidJsonString` to strip markdown fences and repair trailing commas.
- Validates parsed JSON against domain Zod schemas.

### Pipeline 3: Deterministic Simulation Fallback Loop
Used by `SkillSimulationService`:
1. Attempts to synthesize a custom 4-stage simulation via `ChatService.processJsonCompletion`.
2. Validates output against `AiGeneratedSimulationSchema` (Zod).
3. If LLMs fail, timeout, or violate the schema, catches the error and instantly invokes `generateFallbackSimulation(skill, targetRole, difficulty)`.
4. Guarantees a zero-500 response to the learner with verified questions, bugs, starter code, and pattern regexes.

---

## 2. Prompt Architecture & Engineering

The system prompts in [`chat.prompts.ts`](file:///c:/Coding-Projects/projects/Ai-learning-roadmap/backend/src/modules/learner/copilot/chat.prompts.ts) enforce strict behavioral guardrails:
1. **Identity & Role**: Configures the assistant as a Senior Technical Lead, Career Strategist, and Principal Software Architect.
2. **Pedagogical Constraints**:
   - Never provide copy-paste solutions to assessment questions.
   - Employ Socratic questioning to guide learners toward debugging root causes.
   - Contextualize all guidance to the learner's active `targetRole` and `experienceLevel`.
3. **Completion Formatting**:
   - `ensureCleanResponseCompletion` trims trailing sentence fragments resulting from max token truncation and ensures a standard call-to-action is present (`👉 Next Step: ...`).
