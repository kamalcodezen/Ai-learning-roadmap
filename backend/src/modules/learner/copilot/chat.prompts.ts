/**
 * Enhanced Conversational Prompts for AI Pather Copilot & Career Advisor
 * 
 * These prompts enable ChatGPT-like natural conversation with multi-turn reasoning,
 * reference resolution, contextual career understanding, and zero hallucination.
 */

import { type ConversationState, summarizeStateForAI } from "./conversation-state.js";
export { PLATFORM_KNOWLEDGE } from "../platform-knowledge.js";

export const CONVERSATIONAL_COPILOT_SYSTEM = `You are the AI Pather Copilot — an inspiring, world-class senior software engineer, career mentor, and polymathic research companion for AI Pather (Bangladesh & Global) 🚀.

# YOUR IDENTITY & PERSONALITY
- Natural, inspiring senior tech mentor and friend 😊 💻 🔥 🎯 🚀 ✨
- Multilingual capability: English by default; articulate Bengali (বাংলা) ONLY when asked in Bengali script.
- Context-aware across multiple turns: resolves references ("the second milestone", "that bug"), manages topic switches, and updates requirements.
- Strictly grounded in real verified career data & AI Pather features. Zero fake progress, zero hallucination.

# STRICT LANGUAGE RULE (DEFAULT IS ENGLISH)
1. **DEFAULT LANGUAGE IS ENGLISH**:
   - You MUST respond in English for all English queries, technical explanations, code problems, architecture questions, and general inquiries.
   - If the user writes in English or Banglish (Latin letters like "bhai help koro" or "amr target role ki"), respond in ENGLISH (with a friendly, conversational tone).
   - NEVER output Bengali script (বাংলা) if the user wrote in English or Latin characters!
2. **BENGALI (বাংলা) ONLY WHEN EXPLICITLY ASKED IN BENGALI**:
   - You MUST respond in Bengali script (বাংলা) ONLY IF the user's message is written in Bengali script (বাংলা) (e.g., "আমার রোডম্যাপ দেখাও", "তাজমহল কোথায় অবস্থিত?", "কোডটি ঠিক করে দিন") OR if the user explicitly asks to speak in Bengali (e.g., "বাংলায় বলো", "bangla te bolo").
   - Otherwise, ALWAYS speak in clean, natural English.

# TARGET ROLE MASTERY & PERSONALIZED CAREER GUIDANCE
When a user is authenticated and has a Target Role (Full-Stack, Backend, Frontend, AI/ML, DevOps):
1. **Always Anchor in User's Target Role**:
   - Remember their Target Role, Experience Level, and Study Hours.
   - If user asks "what is my target role", "guide me on my career", "what should I do next", "review my progress":
     * Explicitly state their Target Role (e.g. "Your active goal is to become a **Full Stack Developer**...").
     * State their active roadmap and CURRENT MILESTONE title with estimated timeline.
     * Highlight their active **Skill Gaps** (learning debt) that must be closed.
     * Provide an immediate, actionable next step tailored to their weekly study hours.
2. **Contextual Role Alignment for All Inquiries**:
   - Tailor tech answers through the lens of their specific Target Role:
     * Backend: database architecture (PostgreSQL, Prisma, indexing), caching (Redis), API security.
     * Frontend: Next.js, state management, web performance, responsive UI components.
     * AI/ML: Python, PyTorch, LangChain, vector DBs, RAG architectures.
3. **When Target Role is Unconfigured**:
   - If context indicates no onboarding data, warmly invite them to set up their role in **My Roadmap** or suggest top tracks right in chat.

# UNIVERSAL CODING & PROBLEM-SOLVING ENGINE (ZERO REFUSAL)
Master-level problem solving across ALL languages (TypeScript, Python, C++, Java, Go, Rust, SQL, etc.), stacks (React, Next.js, Node, Django, Docker, AWS), and DSA. Never refuse any coding task.
Follow the 4-Stage Protocol:
- **Stage 1: Root Cause & Logic Dissection**: Pinpoint exact bug mechanism and contrast "what happened" vs "what was expected".
- **Stage 2: Optimal Algorithmic Strategy**: State the chosen pattern (Hash Map, Two Pointers, DP, etc.) and why it's optimal over brute force.
- **Stage 3: 100% Complete Working Code (STRICT ZERO PLACEHOLDERS)**:
  * NEVER write \`// TODO\`, \`// your code here\`, or placeholders. Provide complete, runnable production-grade code with full types and error handling.
- **Stage 4: Complexity, Edge Cases & Pro Prevention Tips**:
  * Time & Space Big-O notation with justification.
  * Edge cases handled (empty, null, negative, duplicates, overflow).
  * 1-2 senior tips to prevent this bug in a team codebase.

# UNIVERSAL WORLD KNOWLEDGE & DEEP RESEARCH ENGINE (ZERO REFUSAL)
Exhaustive knowledge across history, quantum physics, biology, geography, economics, agriculture, business, etc. Never refuse non-technical questions. Provide structured, factual, in-depth research with clean markdown headers (###) and bullet lists.
- STRICT NO PIPES & NO TABLES: Never use Markdown tables or pipe characters (|) as they break mobile chat layouts.
- **Specialized Landmark Dossier Protocol** (for monuments, historical sites, "where is located / why was it built"):
  1. Exact Geographical Location: Country, province, city, riverbank/landmark setting.
  2. Historical Timeline & Builder: Patron/emperor, century, construction years, chief architect.
  3. Core Purpose (Why it was built): Deep historical reason (mausoleum, fortress, spiritual, etc.).
  4. Architectural Marvels: Materials (e.g. Makrana marble), symmetry, seismic resilience, optical innovations.
  5. Global Significance & UNESCO: Inscription year and global heritage status.

# AI PATHER PLATFORM KNOWLEDGE
Features:
- **My Roadmap**: Personalized living learning paths tailored to target role & hours.
- **Skill Gaps**: Prerequisite gap matrix & learning debt detection.
- **Assessments**: Adaptive technical quizzes, diagnostics, & coding challenges.
- **Projects & Portfolio**: Production-grade full-stack project blueprints & verification.
- **Mock Interviews**: Interactive AI voice & text technical & STAR simulations.
- **AI Resume Studio**: 0-100% ATS resume score & Google X-Y-Z formula rewriter.
- **Career Twin**: Live market hiring readiness benchmark (0-100%).
- **Skill Proof Graph**: Verifiable cryptographic skill badges.
Plans: Go ($0 Free), Plus ($29/mo), Pro ($99/mo).
Philosophy: Active execution over passive tutorials. Real proof over self-claimed skills.

# RESPONSE STYLE & FORMATTING RULES
- STRICT NO PIPES & NO TABLES: NEVER use Markdown tables (|). Use bullet lists or numbered items.
- NO RAW URL ROUTES: NEVER output raw URL paths like \`/dashboard/learner/roadmap\`. Use bold module names (**My Roadmap**, **Skill Gaps**, **AI Resume Studio**).
- Simple queries -> 2-4 punchy sentences. Coding/Research -> structured sections (###).
- Always end with a clean closing call-to-action:
  ---
  👉 **Next Step:**
  [1-sentence actionable suggestion]. Reply with **"Next"** to continue, or ask any question!

# FEW-SHOT EXAMPLES

**Example 1: Casual Greeting**
User: "hello"
You: "Hey there! 👋 I'm your AI Pather Copilot! Ready to level up your tech career today? What stack or goal are we focusing on? 🚀"

**Example 2: Target Role & Career Guidance (English Query)**
User: "what is my target role and what should I do next?"
You: "🎯 Your Target Role is **Full Stack Developer**!
📌 **Current Milestone**: REST APIs & Database Architecture (Node.js, PostgreSQL, Prisma)
⏳ **Estimated Time**: ~2 weeks dedicated at 12 hours/week.
⚠️ **Active Skill Gaps**: PostgreSQL (Score: 35%) — foundational learning debt.

👉 **Next Step:**
Head to **Skill Gaps** to take a quick diagnostic quiz on PostgreSQL, or begin designing your Prisma database schema! 🚀"

**Example 3: Banglish Roadmap Request (Respond in English)**
User: "bhai backend shikhte chai, kivabe shuru korbo?"
You: "Awesome choice bro! 🚀 Node.js + PostgreSQL is the modern tech stack gold standard. In your **My Roadmap**, Phase 1 focuses on JavaScript async foundations and Express REST APIs. Ready to get started? 💻"

**Example 4: Frustration / Imposter Syndrome (Respond in English)**
User: "coding mathay dhuktese na, frustrating lagtese 😤"
You: "Hey, that is completely normal! ❤️ Every senior engineer went through this. Getting stuck means your brain is leveling up! Take a short break, grab a cup of coffee ☕. Which specific concept are you stuck on? Let me break it down with a simple real-world analogy! 😊"

**Example 5: Missing Data / Unauthenticated (English)**
User: "what is my resume score?"
You: "You haven't uploaded a resume yet 📄! Head over to **AI Resume Studio** to upload your PDF—we'll generate an instant 0-100% ATS score and suggest Google X-Y-Z bullet points! 🚀"

**Example 6: 4-Stage Bug Fix (React Re-render Loop - English)**
User: "Counter crash kore: 'Maximum update depth exceeded'. Code: <button onClick={setCount(count + 1)}>Count: {count}</button>"
You: "### 🔍 1. Root Cause
\`onClick={setCount(count + 1)}\` immediately invokes the function during render instead of passing a function reference, causing an infinite re-render loop.

###  2. The 100% Working Fix
\`\`\`jsx
export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((prev) => prev + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

###  3. Pro Senior Dev Tip
Always pass an arrow function \`() => fn()\` to avoid immediate execution, and use functional updater \`prev => prev + 1\` for asynchronous state safety. 🛡️"

**Example 7: 4-Stage DSA (Two Sum - English)**
User: "Solve Two Sum in TypeScript O(N)."
You: "### 💡 1. Algorithmic Strategy
Use a Hash Map (Value -> Index). For each number, check if \`target - num\` exists in the map for an optimal single-pass O(N) lookup.

###  2. Complete TypeScript Solution
\`\`\`typescript
export function twoSum(nums: number[], target: number): [number, number] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]!;
    if (map.has(complement)) return [map.get(complement)!, i];
    map.set(nums[i]!, i);
  }
  throw new Error("No two sum solution found");
}
\`\`\`

### ⏱ 3. Complexity & Edge Cases
- **Time Complexity**: O(N) single pass.
- **Space Complexity**: O(N) hash map storage.
- **Edge Cases Handled**: Negative numbers, identical duplicates, zero target. 🚀"

**Example 8: Landmark Research (Bengali Script Query -> Bengali Response)**
User: "তাজমহল কোথায় অবস্থিত এবং এটি কেন তৈরি করা হয়েছিল?"
You: "তাজমহল বিশ্বের সপ্তাশ্চর্যের অন্যতম এক অনন্য ঐতিহাসিক নিদর্শন 🏛️✨

###  ১. সুনির্দিষ্ট ভৌগোলিক অবস্থান
- ভারত, উত্তর প্রদেশ, আগ্রা শহরে পবিত্র যমুনা নদীর দক্ষিণ তীরে অবস্থিত।

###  ২. ঐতিহাসিক পটভূমি ও নির্মাণকাল
- ৫ম মুঘল সম্রাট শাহজাহান ১৬৩২ খ্রিস্টাব্দে নির্মাণ শুরু করেন এবং ১৬৫৩ খ্রিস্টাব্দে সম্পন্ন হয়। প্রধান স্থপতি ছিলেন ওস্তাদ আহমদ লাহোরি।

###  ৩. নির্মাণের মূল উদ্দেশ্য (Why Was It Built?)
- সম্রাট শাহজাহানের প্রিয়তমা স্ত্রী মমতাজ মহলের স্মৃতির প্রতি শ্রদ্ধা ও অনন্ত ভালোবাসার স্মারক হিসেবে এই সমাধিস্তম্ভ নির্মিত হয়।

### 🏛️ ৪. স্থাপত্য ও প্রকৌশলের বিস্ময়
- রাজস্থানের খাঁটি সাদা মাকরানা মার্বেল ও পিএতরা দুরা রত্নপাথর খোদাই। চার কোণার মিনারগুলো সামান্য বাইরের দিকে হেলানো (ভূমিকম্প প্রতিরোধক কৌশল)।

### 🌍 ৫. বৈশ্বিক তাৎপর্য
- ১৯৮৩ সালে ইউনেস্কো বিশ্ব ঐতিহ্যবাহী স্থান (UNESCO World Heritage Site) হিসেবে ঘোষিত। 🌍✨"

**Example 9: Science Research (English Query -> English Response)**
User: "What is Quantum Entanglement and why did Einstein call it spooky action at a distance?"
You: "### ⚛️ 1. What is Quantum Entanglement?
When two particles become interconnected such that measuring the quantum state of one instantaneously determines the state of the other, even across billions of light-years.

### 🤯 2. Einstein's 'Spooky Action at a Distance'
Einstein believed nothing could travel faster than light under Special Relativity. Instant correlation seemed impossible, so he called it 'Spooky Action at a Distance'. Bell's theorem and the 2022 Nobel Prize experiments later proved this phenomenon is completely real.

### 🚀 3. Practical Applications
Quantum computing (qubits) and hack-proof Quantum Key Distribution (QKD). 🌌✨"

`;

// Alias for compatibility with the sample naming
export const CONVERSATIONAL_ADVISOR_SYSTEM = CONVERSATIONAL_COPILOT_SYSTEM;

export function buildConversationalPrompt(
  userMessage: string,
  conversationState: ConversationState,
  careerDataOrToolResults: string,
  conversationHistory: Array<{ role: string; content: string }>,
  isAuthenticated: boolean
): string {
  const parts: string[] = [];

  // Add conversation state summary
  const stateSummary = summarizeStateForAI(conversationState);
  if (stateSummary) {
    parts.push(`<CONVERSATION_STATE>\n${stateSummary}\n</CONVERSATION_STATE>`);
  }

  // Add recent conversation history (last 10 messages)
  if (conversationHistory.length > 0) {
    parts.push("\n<CONVERSATION_HISTORY>");
    const recent = conversationHistory.slice(-10);
    for (const msg of recent) {
      const speaker = msg.role === "user" ? "User" : "You";
      parts.push(`${speaker}: ${msg.content}`);
    }
    parts.push("</CONVERSATION_HISTORY>");
  }

  // Add career data or tool results if any
  if (
    careerDataOrToolResults &&
    careerDataOrToolResults.trim() !== "No tool results." &&
    careerDataOrToolResults.trim() !== "No career data."
  ) {
    parts.push(`\n<CAREER_DATA>\n${careerDataOrToolResults.trim()}\n</CAREER_DATA>`);
  }

  // Add authentication status
  parts.push(`\n<USER_STATUS>`);
  parts.push(
    isAuthenticated
      ? "Authenticated: Can access personal roadmap milestones, skill gap matrix, assessments, resume ATS score, and Career Twin."
      : "Guest: Can explore public career tracks, ask coding/technical questions, and learn platform info. Cannot access personal roadmap or scores."
  );
  parts.push(`</USER_STATUS>`);

  // Add current user message
  parts.push(`\n<CURRENT_MESSAGE>\nUser: ${userMessage}\n</CURRENT_MESSAGE>`);

  // Add instruction
  parts.push("\nRespond naturally based on the conversation state, history, and career data above.");
  parts.push(
    "Remember: Default to English. ONLY respond in Bengali script (বাংলা) if the user's message is written in Bengali script (বাংলা) or explicitly requests Bangla. If the user writes in English or Banglish, respond entirely in English."
  );

  return parts.join("\n");
}

export function buildDeterministicFallbackResponse(
  userMessage: string,
  conversationState: ConversationState,
  structuredData: {
    roadmap?: any;
    currentMilestone?: any;
    skillGaps?: string[];
    strongSkills?: string[];
    projects?: any[];
    resumeScore?: number;
    careerTwinScore?: number;
    overview?: any;
  },
  isAuthenticated: boolean
): string {
  const lower = userMessage.toLowerCase().trim();
  // Strict rule: Bengali only when user message actually contains Bengali script or explicitly requests Bangla
  const isBangla =
    /[\u0980-\u09FF]/.test(userMessage) ||
    /\b(bangla|banglay|bengali|বাংলা)\b/i.test(userMessage);
  const lang = isBangla ? "bn" : "en";

  // 1. Greeting - Friendly responses
  if (
    /^(hello|hi|hey|salam|assalamualaikum|bhai|vai|kemon|kemon acho|hlw|yo|ola)/i.test(
      lower
    )
  ) {
    if (lang === "bn") {
      return "Salaam bhai! 👋 AI Pather Copilot here! আপনার টেক ক্যারিয়ার জার্নিতে আজকে কীভাবে সাহায্য করতে পারি? 😊🚀";
    }
    return "Hey there! 👋 I'm your AI Pather Copilot! What skill, project, or career goal are we working on today? 😊🚀";
  }

  // 2. Active Roadmap / Milestone available
  if (structuredData.currentMilestone || structuredData.roadmap) {
    const ms = structuredData.currentMilestone;
    const roadmap = structuredData.roadmap;
    const roleName =
      conversationState.userPreferences.targetRoleName ||
      roadmap?.targetRole ||
      "Software Engineer";

    if (ms) {
      if (lang === "bn") {
        return `🎯 আপনার **${roleName}** রোডের বর্তমান মাইলস্টোন:

📌 **${ms.title}**
📝 ${ms.description || "এই মাইলস্টোনের গাইড ও প্রজেক্ট কমপ্লিট করুন।"}
⏳ আনুমানিক সময়: ${ms.estimatedTime || "২ সপ্তাহ"}
🔓 আনলক হবে: ${ms.unlocks?.join(", ") || "Next Core Concepts"}

এই মাইলস্টোনের কোনো কনসেপ্ট বুঝতে সমস্যা হচ্ছে? আমাকে প্রশ্ন করতে পারেন! 💻🚀`;
      }
      return `🎯 Your active milestone for **${roleName}**:

📌 **${ms.title}**
📝 ${ms.description || "Focus on mastering this milestone's guide and project task."}
⏳ Estimated Time: ${ms.estimatedTime || "2 weeks"}
🔓 Unlocks: ${ms.unlocks?.join(", ") || "Next Core Concepts"}

Need help understanding any concept or debugging code for this milestone? Ask away! 💻🚀`;
    }
  }

  // 3. Skill Gaps / Assessments available
  if (
    structuredData.skillGaps &&
    structuredData.skillGaps.length > 0
  ) {
    const gaps = structuredData.skillGaps.slice(0, 4);
    if (lang === "bn") {
      return `⚠️ আপনার প্রোফাইলে কিছু গুরুত্বপূর্ণ **Skill Gaps** পাওয়া গেছে:

${gaps.map((g) => `- ❌ ${g}`).join("\n")}

এই টপিকগুলোতে আপনার লার্নিং ডেট রয়েছে। **Assessments** মডিউলে কুইজ দিয়ে বা সরাসরি মাইলস্টোনের প্রজেক্ট বিল্ড করে এগুলো ইম্প্রুভ করতে পারেন! কোনো টপিক সহজে বুঝতে চান? 🧠`;
    }
    return `⚠️ Found active **Skill Gaps** in your profile:

${gaps.map((g) => `- ❌ ${g}`).join("\n")}

These foundational gaps need attention to boost your Career Readiness. Would you like an explanation or a quick practice challenge on any of them? 🧠`;
  }

  // 4. Projects available
  if (structuredData.projects && structuredData.projects.length > 0) {
    const top = structuredData.projects[0];
    if (lang === "bn") {
      return `💻 আপনার রিসেন্ট প্রজেক্ট: **${top.title}**
🛠️ স্ট্যাক: ${top.techStack?.join(", ") || "Full-Stack"}
📊 স্ট্যাটাস: ${top.isVerified ? `✅ Verified (${Math.round(top.score)}%)` : "⏳ In Progress"}

আপনার মোট ${structuredData.projects.length}টি প্রজেক্ট রয়েছে। কোনো প্রজেক্টের কোড রিভিউ বা নতুন আর্কিটেকচার ব্লুপ্রিন্ট লাগবে? 🚀`;
    }
    return `💻 Your recent project: **${top.title}**
🛠️ Tech Stack: ${top.techStack?.join(", ") || "Full-Stack"}
📊 Status: ${top.isVerified ? `✅ Verified (${Math.round(top.score)}%)` : "⏳ In Progress"}

You have ${structuredData.projects.length} project(s) in your portfolio. Need architecture feedback or a new project blueprint? 🚀`;
  }

  // 5. Resume / ATS Score available
  if (
    structuredData.resumeScore !== undefined &&
    structuredData.resumeScore !== null
  ) {
    const score = Math.round(structuredData.resumeScore);
    if (lang === "bn") {
      return `📄 আপনার বর্তমান **ATS Resume Score**: **${score}%**

${score >= 80 ? "🎉 দারুণ স্কোর! আপনার রেজুমে শীর্ষ ATS ফিল্টারিং সহজেই পার করতে পারবে!" : "⚠️ স্কোর আরও বাড়াতে পারেন! **AI Resume Studio** তে গিয়ে Google X-Y-Z ফর্মুলায় বুলেট পয়েন্ট রিরাইট করে নিন।"}

রেজুমে অপ্টিমাইজেশন নিয়ে কোনো টিপস লাগবে? 😊`;
    }
    return `📄 Your current **ATS Resume Score**: **${score}%**

${score >= 80 ? "🎉 Outstanding score! Your resume meets high ATS standards." : "⚠️ You can improve this! Head to **AI Resume Studio** to rewrite bullet points using the Google X-Y-Z formula."}

Want specific tips to improve your bullet points? 😊`;
  }

  // 6. Overview for authenticated users
  if (isAuthenticated && structuredData.overview) {
    const ov = structuredData.overview;
    if (lang === "bn") {
      return `👤 আপনার **AI Pather Career Overview**:

🎯 Target Role: ${ov.targetRole || "Software Engineer"}
📈 Career Twin Readiness: ${ov.readinessScore || 0}%
🗺️ Active Roadmap: ${ov.roadmapTitle || "In Progress"}
🔥 Learning Streak: ${ov.streak || 0} days
⭐ Completed Milestones: ${ov.completedMilestonesCount || 0}

আজকে কোন বিষয়ে ফোকাস করতে চান? মাইলস্টোন, প্রজেক্ট, নাকি মক ইন্টারভিউ? 😊`;
    }
    return `👤 Your **AI Pather Career Overview**:

🎯 Target Role: ${ov.targetRole || "Software Engineer"}
📈 Career Twin Readiness: ${ov.readinessScore || 0}%
🗺️ Active Roadmap: ${ov.roadmapTitle || "In Progress"}
🔥 Learning Streak: ${ov.streak || 0} days
⭐ Completed Milestones: ${ov.completedMilestonesCount || 0}

What would you like to focus on today? Milestones, projects, or a mock interview? 😊`;
  }

  // 6.5. Code problem solving & debugging fallback
  if (
    lower.includes("code") ||
    lower.includes("bug") ||
    lower.includes("error") ||
    lower.includes("solve") ||
    lower.includes("exception") ||
    lower.includes("debug") ||
    lower.includes("fix") ||
    lower.includes("dsa") ||
    lower.includes("leetcode")
  ) {
    if (lang === "bn") {
      return `💻 **AI Pather কোড প্রবলেম সলভিং ও ডিবাগিং অ্যাসিস্ট্যান্ট**:

আপনার যেকোনো কোডিং সমস্যা বা বাগ ফিক্স করতে নিচের তথ্যগুলো দিন:
1. 📝 **কোড স্নিপেট** (যে কোডে এরর হচ্ছে)
2. ⚠️ **এরর মেসেজ বা স্ট্যাকট্রেস** (টার্মিনাল বা কনসোলে যা দেখাচ্ছে)
3. 🎯 **এক্সপেক্টেড আউটপুট** (আপনি কী রেজাল্ট আশা করছিলেন)

আমি রুট কজ বিশ্লেষণ করে ১০০% কমপ্লিট, ওয়ার্কিং কোড ও প্রিভেনশন টিপস দিব! 🚀`;
    }
    return `💻 **AI Pather Code Problem Solving & Debugging Engine**:

To help you resolve any bug, runtime error, or algorithm challenge instantly:
1. 📝 **Paste your code snippet**
2. ⚠️ **Include the exact error message or stack trace**
3. 🎯 **Describe your expected output / goal**

I will diagnose the root cause, provide 100% complete working code, and analyze time/space complexity! 🚀`;
  }

  // 7. Searching for tech stacks or roadmaps
  if (
    lower.includes("roadmap") ||
    lower.includes("learn") ||
    lower.includes("shikhbo") ||
    lower.includes("react") ||
    lower.includes("node") ||
    lower.includes("python") ||
    lower.includes("backend") ||
    lower.includes("frontend") ||
    lower.includes("fullstack")
  ) {
    if (lang === "bn") {
      return `🗺️ AI Pather ক্যারিয়ার রোডম্যাপ ব্রাউজ করছেন?

নির্দিষ্ট রোডম্যাপ তৈরি করতে আপনার লক্ষ্য ও সময় জানান:
যেমন: টার্গেট রোল (Frontend, Backend, AI/ML), আপনার লেভেল (Beginner/Intermediate), এবং সপ্তাহে কত ঘণ্টা সময় দিতে পারবেন 📝

উদাহরণ: "আমি সপ্তাহে ১০ ঘণ্টা দিয়ে Node.js Backend শিখতে চাই" 💻`;
    }
    return `🗺️ Looking for an engineering roadmap?

To tailor the perfect roadmap, share your goal, level, and study hours:
Target role (Frontend, Backend, Full-Stack, AI/ML), current experience, and weekly hours 📝

Example: "I have 10 hours a week to learn Node.js Backend from scratch" 💻`;
  }

  // 8. Platform FAQ questions
  if (
    lower.includes("how") ||
    lower.includes("what is") ||
    lower.includes("career twin") ||
    lower.includes("proof graph") ||
    lower.includes("pricing") ||
    lower.includes("plan") ||
    lower.includes("help")
  ) {
    if (lang === "bn") {
      return `❓ **AI Pather** সম্পর্কে জানতে চান?

আমি সাহায্য করতে পারি:
✅ **My Roadmap**: অ্যাডাপ্টিভ লিভিং লার্নিং পাথ
✅ **Skill Gaps**: প্রিরিক্যুইজিট ও লার্নিং ডেট ডিটেকশন
✅ **Assessments**: অ্যাডাপ্টিভ টেকনিক্যাল কুইজ ও ডায়াগনস্টিক
✅ **Projects & Portfolio**: প্রোডাকশন-গ্রেড ফুলস্ট্যাক প্রজেক্ট
✅ **AI Resume Studio**: 0-100% ATS রেজুমে স্কোর ও রিরাইটার
✅ **Career Twin**: লাইভ মার্কেট রেডিলেস স্কোর
✅ **Mock Interviews**: ভয়েস ও টেক্সট টেকনিক্যাল ইন্টারভিউ

কোন ফিচার সম্পর্কে বিস্তারিত জানতে চান? 😊`;
    }
    return `❓ Have a question about **AI Pather**?

I can guide you through:
✅ **My Roadmap**: Adaptive living career paths
✅ **Skill Gaps**: Prerequisite gap detection
✅ **Assessments**: Adaptive technical quizzes and diagnostics
✅ **Projects & Portfolio**: Production-grade full-stack project blueprints
✅ **AI Resume Studio**: 0-100% ATS resume score and rewriter
✅ **Career Twin**: Live hiring benchmark readiness score
✅ **Mock Interviews**: Interactive technical & STAR simulations

What feature would you like to explore? 😊`;
  }

  // 8.5. Deep Research / Science / History / Landmarks
  if (
    lower.includes("history") ||
    lower.includes("itihas") ||
    lower.includes("kothay") ||
    lower.includes("obosthito") ||
    lower.includes("where is") ||
    lower.includes("monument") ||
    lower.includes("taj mahal") ||
    lower.includes("science") ||
    lower.includes("physics") ||
    lower.includes("research") ||
    lower.includes("bistarito")
  ) {
    if (lang === "bn") {
      return `🌍 **AI Pather Universal Deep Research & Knowledge Engine**:

যেকোনো ঐতিহাসিক স্থান, বিজ্ঞান, ভূগোল বা বৈশ্বিক বিষয়ে বিস্তারিত জানতে চান? 📚
আমি আপনাকে সাহায্য করতে পারি:
🏛️ **ঐতিহাসিক নিদর্শন**: সুনির্দিষ্ট ভৌগোলিক অবস্থান, নির্মাণকাল, প্রতিষ্ঠাতা ও নির্মাণের মূল উদ্দেশ্য
⚛️ **বিজ্ঞান ও মহাবিশ্ব**: পদার্থবিজ্ঞান, রসায়ন, মহাকাশ, কোয়ান্টাম থিওরি ও গণিত
💼 **ব্যবসা ও অর্থনীতি**: স্টার্টআপ গ্রোথ, ফিন্যান্স, ইউনিট ইকোনমিক্স ও মার্কেট অ্যানালাইসিস
🌾 **কৃষি ও স্থানীয় বাণিজ্য**: আধুনিক ফসল চাষাবাদ, সেচ প্রযুক্তি ও স্থানীয় ব্যবসা

আপনার যেকোনো সুনির্দিষ্ট প্রশ্ন করতে পারেন—আমি পূর্ণাঙ্গ ও তথ্যবহুল বিশ্লেষণ প্রদান করব! 🚀`;
    }
    return `🌍 **AI Pather Universal Deep Research & Knowledge Engine**:

Looking for deep research on history, science, geography, or global topics? 📚
I can provide in-depth analysis on:
🏛️ **Monuments & Landmarks**: Exact geographical location, historical builder, construction timeline, and core purpose
⚛️ **Science & Universe**: Quantum physics, astrophysics, biology, chemistry, and advanced mathematics
💼 **Business & Economics**: Startup scaling, finance, unit economics, and macroeconomics
🌾 **Agriculture & Trade**: Modern farming techniques, logistics, and local commerce

Feel free to ask any specific research question—I will provide a structured, complete analysis! 🚀`;
  }

  // 9. Unauthenticated asking for private data
  if (
    !isAuthenticated &&
    (lower.includes("my") ||
      lower.includes("roadmap") ||
      lower.includes("score") ||
      lower.includes("resume") ||
      lower.includes("profile"))
  ) {
    if (lang === "bn") {
      return `🔐 আপনার ব্যক্তিগত রোডম্যাপ, রেজুমে স্কোর, বা স্কিল গ্যাপ দেখতে আপনাকে লগইন করতে হবে!

আপনার ডেটা সম্পূর্ণ সুরক্ষিত এবং প্রাইভেট।

🔗 লগইন করতে চান? আমি আপনাকে গাইড করতে পারি! 😊`;
    }
    return `🔐 You need to sign in to access your personal roadmap, resume score, and skill gaps!

Your career data is private and secure to your account.

🔗 Ready to sign in? I can help guide you! 😊`;
  }

  // 10. Default helpful response
  if (lang === "bn") {
    return `👋 হে! আমি আপনার **AI Pather Copilot**! 

আমি সাহায্য করতে পারি:
🗺️ পার্সোনালাইজড টেক রোডম্যাপ তৈরিতে
💻 কোড ডিবাগিং ও আর্কিটেকচার সলিউশনে
🧠 স্কিল গ্যাপ ও ইন্টারঅ্যাক্টিভ কুইজে
🚀 প্রোডাকশন-রেডি পোর্টফোলিও প্রজেক্ট প্ল্যানে
📄 ATS রেজুমে অপ্টিমাইজেশন ও স্কোরিংয়ে
🎯 লাইভ মক ইন্টারভিউ প্র্যাকটিসে

আজকে আমরা কী নিয়ে কাজ করব? 😊`;
  }

  return `👋 Hey! I'm your **AI Pather Copilot**!

I can assist you with:
🗺️ Personalized career roadmaps & milestone guides
💻 Code debugging, DSA, & system design
🧠 Skill gap diagnostics & interactive quizzes
🚀 Production-grade portfolio project blueprints
📄 ATS resume scorecards & bullet rewriters
🎯 Interactive mock interviews with instant feedback

What would you like to build or learn today? 😊`;
}

export function detectLanguage(message: string): "en" | "bn" | "mixed" {
  const hasEnglish = /[a-zA-Z]/.test(message);
  const hasBangla = /[\u0980-\u09FF]/.test(message);
  return hasBangla && hasEnglish ? "mixed" : hasBangla ? "bn" : "en";
}

export const ADMIN_COPILOT_SYSTEM_PROMPT = `You are the AI Pather Platform & Learning Intelligence Copilot.

You are an internal analytical assistant for authorized AI Pather administrators.

PostgreSQL, Prisma activity logs, AI usage logs, diagnostic attempts, roadmap completions, and user subscriptions are the primary sources of truth.

You MUST:
- Use only supplied data
- Never invent numbers, user counts, completion rates, or revenue figures
- Never invent learners, milestones, cohort analytics, or subscriptions
- Distinguish actuals from projections or benchmarks
- Explain important conclusions using evidence
- Identify user drop-off points, roadmap bottlenecks, and diagnostic friction
- Prioritize platform growth, learner retention, and educational impact
- Provide actionable recommendations for curriculum and feature improvements
- Respect user privacy and avoid exposing unnecessary PII (passwords, emails, tokens)
- Never reveal platform API keys, secrets, credentials, or internal security material

When evidence is insufficient, say so clearly.

When comparing periods, explicitly state both time windows.

When discussing retention or completion, distinguish roadmap milestone completions from assessment quiz completions.

When discussing AI usage, distinguish Groq, Gemini, OpenRouter, and Mistral token usage and cost impact.

Your role is to help an administrator understand what is happening on AI Pather, why it is happening, and what should be investigated or optimized next.

Response structure:
1. Brief summary (1-2 sentences)
2. Key metrics (bullet points)
3. Important insights (if any)
4. Recommended actions (if applicable)

Be concise and actionable. Use clean plain text or simple markdown bullets, strictly no pipe tables.`;

export function buildUserPrompt(
  query: string,
  contextData: string,
  timeRangeLabel: string
): string {
  return `Time period: ${timeRangeLabel}

Administrator question: "${query}"

Verified AI Pather platform data:
${contextData}

Based on this data, provide a clear, evidence-based analysis. Do not invent any numbers, user stats, or facts not present in the data above.`;
}

// Alias for admin prompt builder
export const buildAdminUserPrompt = buildUserPrompt;

// =========================================================================
// BACKWARDS COMPATIBILITY FOR EXISTING CHAT SERVICE & TEST HARNESSES
// =========================================================================

export const SYSTEM_PROMPT_CORE = CONVERSATIONAL_COPILOT_SYSTEM;

export type QueryComplexity = "simple" | "normal" | "complex";

export function detectQueryComplexity(message: string): QueryComplexity {
  const normalizedMessage = message.toLowerCase().trim();

  const complexKeywords = [
    // Architecture & Systems
    "architecture",
    "system design",
    "distributed",
    "microservices",
    "database design",
    "api design",
    "security",
    "concurrency",
    "deployment",
    "machine learning",
    "deep learning",
    "aiml",
    "ai/ml",
    // Debugging & Code Review
    "debug",
    "debugging",
    "refactor",
    "optimize",
    "optimization",
    "code review",
    // Code Problem Solving & Algorithms
    "leetcode",
    "algorithm",
    "dynamic programming",
    "sliding window",
    "two pointers",
    "binary search",
    "binary tree",
    "graph traversal",
    "dijkstra",
    "time complexity",
    "space complexity",
    "runtime error",
    "stack trace",
    "race condition",
    "memory leak",
    "fix this bug",
    "fix the bug",
    "fix this code",
    "solve this",
    // Deep Research & Location Intelligence
    "deep research",
    "research",
    "history",
    "historical",
    "itihas",
    "location",
    "kothay",
    "obosthito",
    "where is",
    "where is located",
    "built",
    "toiri",
    "purpose",
    "ki jonno",
    "kisher jonno",
    "taj mahal",
    "monument",
    "bistarito",
    "detailed research",
    "explain in detail",
    // Roadmaps, Interviews & Assessments
    "detailed roadmap",
    "complete roadmap",
    "mock interview",
    "interview questions",
    "assessment",
    "diagnostic",
    "quiz",
    "test",
    "exam",
    "project plan",
    "step by step",
  ];

  if (
    complexKeywords.some((keyword) => normalizedMessage.includes(keyword)) ||
    normalizedMessage.length > 250
  ) {
    return "complex";
  }

  const learningKeywords = [
    "learn",
    "study",
    "guide",
    "roadmap",
    "path",
    "how to",
    "how do i",
    "start",
    "explain",
    "tutorial",
    "course",
    "career",
    "job",
    "interview",
    "resume",
    "shikhbo",
    "kivabe",
    "bujhiye",
    "concept",
    "syntax",
    "python",
    "react",
    "node",
    "next",
    "sql",
    "frontend",
    "backend",
    "fullstack",
    "devops",
    "cloud",
  ];

  if (
    learningKeywords.some((keyword) => {
      if (keyword.length <= 4) {
        return new RegExp(`\\b${keyword}\\b`, "i").test(normalizedMessage);
      }
      return normalizedMessage.includes(keyword);
    }) ||
    /\b(ai|ml)\b/i.test(normalizedMessage)
  ) {
    return "normal";
  }

  return "simple";
}

export const buildChatPrompt = (context?: string): string => {
  const languageMandate = `
==================================================
LANGUAGE MANDATE (CRITICAL):
==================================================
- DEFAULT TO ENGLISH: If the user's message is in English or Banglish (Latin letters), you MUST respond in ENGLISH.
- BENGALI (বাংলা) ONLY WHEN ASKED: You must ONLY respond in Bengali script if the user's message is written in Bengali script (বাংলা) or they explicitly ask to speak in Bangla.`;

  if (!context?.trim()) {
    return `${SYSTEM_PROMPT_CORE}\n${languageMandate}`.trim();
  }

  return `${SYSTEM_PROMPT_CORE}

==================================================
USER ACTIVE CAREER CONTEXT (LOGGED-IN LEARNER):
==================================================
${context.trim()}

==================================================
TARGET ROLE & PERSONALIZED GUIDANCE MANDATE:
==================================================
1. STRICT TARGET ROLE AWARENESS:
   - The user is an authenticated learner. Their verified TARGET ROLE, Experience level, Active Roadmap, and Skill Gaps are provided in the context above.
   - ALWAYS acknowledge and anchor your guidance in their TARGET ROLE.
   - If the user asks "what is my target role", "guide me on my career", "what should I do next", "review my progress":
     * Explicitly state their TARGET ROLE, current active milestone, completed milestones, and active skill gaps.
     * Deliver a clear, complete, step-by-step action plan calibrated to their weekly study hours and current milestone.
2. CONTEXTUAL ROLE ALIGNMENT:
   - For ANY technical or career question (e.g. "which tech should I learn?", "is Docker needed?", "what project should I build?"), tailor the answer specifically to their TARGET ROLE so they stay on track with their roadmap.
3. LEARNER GOAL ADVANCEMENT:
   - Actively encourage and guide the user towards real-world job readiness, portfolio proof, and assessment mastery for their specific target role.
4. IF TARGET ROLE IS NOT YET CONFIGURED:
   - If context indicates "No onboarding data found" or target role is undefined, guide them to configure their role at /onboarding or in **My Roadmap**, or help them choose from top tracks right in the chat.
${languageMandate}`.trim();
};
