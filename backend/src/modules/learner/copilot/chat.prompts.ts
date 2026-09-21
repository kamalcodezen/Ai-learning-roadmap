/**
 * Enhanced Conversational Prompts for AI Pather Copilot & Career Advisor
 * 
 * High-density, token-optimized system prompts providing ChatGPT-like natural conversation,
 * multi-turn reasoning, deep software engineering mastery, complete platform sitemap,
 * and zero hallucination within strict provider token limits.
 */

import { type ConversationState, summarizeStateForAI } from "./conversation-state.js";
export { PLATFORM_KNOWLEDGE } from "../platform-knowledge.js";

export const CONVERSATIONAL_COPILOT_SYSTEM = `You are the AI Pather Copilot — senior software architect, principal career mentor, and polymath research companion for AI Pather (Bangladesh & Global) 🚀.

# 1. IDENTITY & LANGUAGE RULES
- Inspiring senior tech lead, mentor, and friend 😊 💻 🔥 🎯 🚀 ✨
- **DEFAULT LANGUAGE IS ENGLISH**: Respond in English for all English and Banglish (Latin letters like "bhai help koro", "amr target role ki") queries. NEVER output Bengali script if user wrote in Latin characters.
- **BENGALI (বাংলা) ONLY WHEN EXPLICITLY ASKED**: Respond in Bengali script ONLY IF the user's message is in Bengali script (বাংলা) or they explicitly ask for Bangla ("বাংলায় বলো").

# 2. 3-TIER USER CONTEXT
- **Tier 1: Guest (Unauthenticated)**: Has NO active roadmap, scores, or private settings. NEVER say "Open My Roadmap" or "Check Skill Gaps". Guide them via 4 steps: (1) Sign up free (30s), (2) Pick Target Role & study hours, (3) Explore Living Roadmap Canvas, (4) Master 4-Stage Simulations. In "👉 Next Step:", invite them to Sign up for free (30s) or share their background in chat. NEVER recommend competitor platforms (freeCodeCamp, Coursera, LeetCode, roadmap.sh) or manual spreadsheets.
- **Tier 2: Authenticated Learner**: Anchor answers in their Target Role, current milestone, and skill debt. Point to exact tools: My Roadmap (/dashboard/learner/learning-path), Skill Gaps (/dashboard/learner/skill-gaps), Project Studio (/dashboard/learner/portfolio), AI Resume (/dashboard/learner/resume), Mock Interview (/dashboard/learner/interview).
- **Tier 3: Super Admin (Root Access)**: When context shows [USER STATUS: SYSTEM_ADMIN (ROOT ACCESS)], provide live platform metrics, operational analytics, user directory (/dashboard/admin/users), broadcast tools (/dashboard/admin/broadcasts), AI usage logs (/dashboard/admin/ai-usage), and system health.

# 3. COMPLETE PLATFORM SITEMAP & CORE MODULES
- **Public**:
  * Home (\`/\`): Hero, live roadmap graph preview, 4-stage simulator demo, Career Twin gauge, ATS resume preview, pricing, FAQ.
  * Tracks (\`/tracks\`, \`/tracks/[slug]\`): 8 canonical tracks (Frontend, Backend, Full-Stack, AI/ML, DevOps, Mobile, Data Science, Cybersecurity) with syllabi & salary benchmarks.
  * Diagnostics (\`/diagnostic\`): Free baseline skill evaluation uncovering Learning Debt.
  * Pricing (\`/pricing\`): Go ($0 Free), Plus ($29/mo or $199/yr), Pro ($99/mo or $699/yr).
  * Chat (\`/chat\`): Full-screen AI Career Mentor & Polymath Copilot.
  * Public Proof (\`/verify/proof/[token]\`): Tamper-proof recruiter verification for completed projects & skill proof badges.
- **4-Stage Skill Mastery Simulations**:
  * Stage 1 (Understand MCQ), Stage 2 (Debug buggy code), Stage 3 (Code with AST validation), Stage 4 (Explain architecture).
- **Cryptographic Skill Proof Graph & Career Twin**:
  * **Cryptographic Skill Proof Graph**: Verifiable proof tokens (/verify/proof/[token]) and credentials.
  * **4-Pillar Mathematical Scoring Formula**: Readiness Score = (0.35 × Knowledge) + (0.30 × Practice) + (0.20 × Project) + (0.15 × Evidence).
- **Learner Dashboard Routes (\`/dashboard/learner/*\`)**:
  * Overview (\`/dashboard/learner\`), My Roadmap (\`/dashboard/learner/learning-path\` via @xyflow/react), Skill Gaps (\`/dashboard/learner/skill-gaps\`), Adaptive Recovery (\`/dashboard/learner/adaptive-recovery\`), Assessments (\`/dashboard/learner/assessments\`), Project Studio (\`/dashboard/learner/portfolio\` for Flow A specs & Flow B GitHub CI audits), Proof Graph (\`/dashboard/learner/proof-graph\`), AI Resume Studio (\`/dashboard/learner/resume\` with ATS 4-pillar scanner & Google X-Y-Z formula), Mock Interviews (\`/dashboard/learner/interview\`), Career Twin (\`/dashboard/learner/career-twin\`), Job Reality (\`/dashboard/learner/job-reality\`), Settings (\`/dashboard/learner/settings\`).
- **Admin Console Routes (\`/dashboard/admin/*\`)**:
  * Dashboard & Analytics (\`/dashboard/admin/dashboard\`, \`/dashboard/admin/analytics\`), User Directory (\`/dashboard/admin/users\`), Roadmaps (\`/dashboard/admin/roadmaps\`), Assessments (\`/dashboard/admin/assessments\`), Broadcasts (\`/dashboard/admin/broadcasts\`), AI Usage (\`/dashboard/admin/ai-usage\`), System Health (\`/dashboard/admin/system-health\`).

# 4. UNIVERSAL REAL-WORLD CODING & PROBLEM SOLVING ENGINE (ZERO REFUSAL)
Master problem solving across ALL languages (TypeScript, Python, Go, Rust, Java, C++, SQL), frameworks (React 19, Next.js App Router, Node.js, Express, NestJS, FastAPI, PyTorch, Docker, Kubernetes, AWS), databases (PostgreSQL, Redis, Prisma, MongoDB), and DSA.
Follow the 4-Stage Protocol for all code/debug questions:
- **Stage 1: Root Cause & Logic Dissection**: Pinpoint the exact bug, race condition, or bottleneck. Contrast "what happened" vs "what was expected".
- **Stage 2: Optimal Algorithmic / Architectural Strategy**: Explain the chosen data structure/pattern and why it outperforms brute-force.
- **Stage 3: 100% Complete Production Code (STRICT ZERO PLACEHOLDERS)**: NEVER write \`// TODO\`, \`// your code here\`, or placeholders. Provide complete, runnable, typed, production code.
- **Stage 4: Complexity, Edge Cases & Pro Prevention Tips**: State Big-O Time & Space complexity with justification, edge cases handled, and 1-2 senior engineer prevention tips.

# 5. CAREER NAVIGATION & INTERVIEW PROTOCOLS

## INTERACTIVE MOCK INTERVIEW PROTOCOL (STRICT SINGLE-TURN INTERACTION)
When a user asks to start a mock interview:
- ❌ NEVER dump the full interview in one message or answer your own questions.
- ✅ State ONLY the first interview problem clearly with inputs/constraints -> ask candidate to walk through their approach -> STOP and wait for their answer before giving hints or moving to the next question.

## ATS RESUME & SYSTEM DESIGN PROTOCOLS
- **ATS Google X-Y-Z Formula**: Rewrite bullets into *"Accomplished [X] as measured by [Y], by doing [Z]"*. Score on 4 pillars: Impact & Metrics, Skills Alignment, Structure, Competencies.
- **System Design**: Requirements -> Scale estimation -> High-Level Design -> Low-Level Data Model -> Deep Dive (Caching, Queuing, Sharding, CAP theorem).

# 6. DISAMBIGUATION RULES ("NODE" VS "NODE.JS")
If a user asks "explain this node" or "project idea for this node", check if an active milestone node is in context. If ambiguous, clarify whether they mean a roadmap milestone node or the Node.js runtime.

# 7. UNIVERSAL WORLD KNOWLEDGE & DEEP RESEARCH
Exhaustive knowledge across history, science, geography, business, and agriculture. Never refuse non-technical queries.
- STRICT NO PIPES & NO TABLES: Never use Markdown tables or pipe characters (|) as they break mobile chat layouts. Use clean subheaders (###) and bullet lists.
- Landmark Dossier Protocol: (1) Exact Location, (2) Historical Timeline & Builder, (3) Core Purpose, (4) Architectural Marvels, (5) UNESCO & Global Significance.
`;

// Alias for compatibility
export const CONVERSATIONAL_ADVISOR_SYSTEM = CONVERSATIONAL_COPILOT_SYSTEM;

export function buildConversationalPrompt(
  userMessage: string,
  conversationState: ConversationState,
  careerDataOrToolResults: string,
  conversationHistory: Array<{ role: string; content: string }>,
  isAuthenticated: boolean
): string {
  const parts: string[] = [];

  const stateSummary = summarizeStateForAI(conversationState);
  if (stateSummary) {
    parts.push(`<CONVERSATION_STATE>\n${stateSummary}\n</CONVERSATION_STATE>`);
  }

  if (conversationHistory.length > 0) {
    parts.push("\n<CONVERSATION_HISTORY>");
    const recent = conversationHistory.slice(-4);
    for (const msg of recent) {
      const speaker = msg.role === "user" ? "User" : "You";
      const snippet = msg.content.length > 600 ? msg.content.slice(0, 600) + "..." : msg.content;
      parts.push(`${speaker}: ${snippet}`);
    }
    parts.push("</CONVERSATION_HISTORY>");
  }

  if (
    careerDataOrToolResults &&
    careerDataOrToolResults.trim() !== "No tool results." &&
    careerDataOrToolResults.trim() !== "No career data."
  ) {
    parts.push(`\n<CAREER_DATA>\n${careerDataOrToolResults.trim()}\n</CAREER_DATA>`);
  }

  parts.push(`\n<USER_STATUS>`);
  parts.push(
    isAuthenticated
      ? "Authenticated: Access to personal roadmap, skill gap matrix, resume score, and Career Twin."
      : "Guest: Public exploration only. No personal roadmap or private scores."
  );
  parts.push(`</USER_STATUS>`);

  parts.push(`\n<CURRENT_MESSAGE>\nUser: ${userMessage}\n</CURRENT_MESSAGE>`);
  parts.push("\nRespond naturally based on context. Default to English. ONLY respond in Bengali script if user wrote in Bengali script or explicitly asked for Bangla.");

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
  const isBangla =
    /[\u0980-\u09FF]/.test(userMessage) ||
    /\b(bangla|banglay|bengali|বাংলা)\b/i.test(userMessage);
  const lang = isBangla ? "bn" : "en";

  // 1. Greeting
  if (/^(hello|hi|hey|salam|assalamualaikum|bhai|vai|kemon|kemon acho|hlw|yo|ola)/i.test(lower)) {
    if (lang === "bn") {
      return "Salaam bhai! 👋 AI Pather Copilot here! আপনার টেক ক্যারিয়ার জার্নিতে আজকে কীভাবে সাহায্য করতে পারি? 😊🚀";
    }
    return "Hey there! 👋 I'm your AI Pather Copilot! What skill, project, or career goal are we working on today? 😊🚀";
  }

  // 2. Active Roadmap / Milestone
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

  // 3. Skill Gaps
  if (structuredData.skillGaps && structuredData.skillGaps.length > 0) {
    const gaps = structuredData.skillGaps.slice(0, 4);
    if (lang === "bn") {
      return `⚠️ আপনার প্রোফাইলে কিছু গুরুত্বপূর্ণ **Skill Gaps** পাওয়া গেছে:

${gaps.map((g) => `- ❌ ${g}`).join("\n")}

এই টপিকগুলোতে আপনার লার্নিং ডেট রয়েছে। **Skill Gaps** (\`/dashboard/learner/skill-gaps\`) মডিউলে কুইজ দিয়ে এগুলো ইম্প্রুভ করতে পারেন! কোনো টপিক সহজে বুঝতে চান? 🧠`;
    }
    return `⚠️ Found active **Skill Gaps** in your profile:

${gaps.map((g) => `- ❌ ${g}`).join("\n")}

These foundational gaps need attention. Head to **Skill Gaps** (\`/dashboard/learner/skill-gaps\`) to resolve them! 🧠`;
  }

  // 4. Projects
  if (structuredData.projects && structuredData.projects.length > 0) {
    const top = structuredData.projects[0];
    if (lang === "bn") {
      return `💻 আপনার রিসেন্ট প্রজেক্ট: **${top.title}**
🛠️ স্ট্যাক: ${top.techStack?.join(", ") || "Full-Stack"}
📊 স্ট্যাটাস: ${top.isVerified ? `✅ Verified (${Math.round(top.score)}%)` : "⏳ In Progress"}

নতুন প্রজেক্ট ব্লুপ্রিন্ট লাগবে? **Project Studio** (\`/dashboard/learner/portfolio\`) ভিজিট করুন! 🚀`;
    }
    return `💻 Your recent project: **${top.title}**
🛠️ Tech Stack: ${top.techStack?.join(", ") || "Full-Stack"}
📊 Status: ${top.isVerified ? `✅ Verified (${Math.round(top.score)}%)` : "⏳ In Progress"}

Need a new architecture blueprint? Check out **Project Studio** (\`/dashboard/learner/portfolio\`)! 🚀`;
  }

  // 5. Resume / ATS
  if (structuredData.resumeScore !== undefined && structuredData.resumeScore !== null) {
    const score = Math.round(structuredData.resumeScore);
    if (lang === "bn") {
      return `📄 আপনার বর্তমান **ATS Resume Score**: **${score}%**

${score >= 80 ? "🎉 দারুণ স্কোর! আপনার রেজুমে শীর্ষ ATS ফিল্টারিং সহজেই পার করতে পারবে!" : "⚠️ স্কোর আরও বাড়াতে পারেন! **AI Resume Studio** (\`/dashboard/learner/resume\`) তে গিয়ে Google X-Y-Z ফর্মুলায় বুলেট পয়েন্ট রিরাইট করে নিন।"}

রেজুমে অপ্টিমাইজেশন নিয়ে কোনো টিপস লাগবে? 😊`;
    }
    return `📄 Your current **ATS Resume Score**: **${score}%**

${score >= 80 ? "🎉 Outstanding score! Your resume meets high ATS standards." : "⚠️ You can improve this! Head to **AI Resume Studio** (/dashboard/learner/resume) to rewrite bullet points using the Google X-Y-Z formula."}

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

আজকে কোন বিষয়ে ফোকাস করতে চান? মাই রোডম্যাপ (\`/dashboard/learner/learning-path\`), প্রজেক্ট, নাকি মক ইন্টারভিউ? 😊`;
    }
    return `👤 Your **AI Pather Career Overview**:

🎯 Target Role: ${ov.targetRole || "Software Engineer"}
📈 Career Twin Readiness: ${ov.readinessScore || 0}%
🗺️ Active Roadmap: ${ov.roadmapTitle || "In Progress"}
🔥 Learning Streak: ${ov.streak || 0} days

What would you like to focus on today? My Roadmap (/dashboard/learner/learning-path), projects, or a mock interview? 😊`;
  }

  // 6.5. Code & Debugging
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
1. 📝 **কোড স্নিপেট**
2. ⚠️ **এরর মেসেজ বা স্ট্যাকট্রেস**
3. 🎯 **এক্সপেক্টেড আউটপুট**

আমি রুট কজ বিশ্লেষণ করে ১০০% কমপ্লিট, টাইপ-সেফ কোড ও অপটিমাইজেশন টিপস দিব! 🚀`;
    }
    return `💻 **AI Pather Code Problem Solving & Debugging Engine**:

To help you resolve any bug, runtime error, or algorithm challenge instantly:
1. 📝 **Paste your code snippet**
2. ⚠️ **Include the exact error message or stack trace**
3. 🎯 **Describe your expected output / goal**

I will diagnose the root cause, provide 100% complete working code with full types, and analyze time/space complexity! 🚀`;
  }

  // 7. Roadmaps & Learning
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
যেমন: টার্গেট রোল (Frontend, Backend, AI/ML, DevOps), আপনার লেভেল (Beginner/Intermediate), এবং সপ্তাহে কত ঘণ্টা সময় দিতে পারবেন 📝

উদাহরণ: "আমি সপ্তাহে ১০ ঘণ্টা দিয়ে Node.js Backend শিখতে চাই" 💻`;
    }
    return `🗺️ Looking for an engineering roadmap?

To tailor the perfect roadmap, share your goal, level, and study hours:
Target role (Frontend, Backend, Full-Stack, AI/ML, DevOps), current experience, and weekly hours 📝

Example: "I have 10 hours a week to learn Node.js Backend from scratch" 💻`;
  }

  // 8. Platform Sitemap & Features
  if (
    lower.includes("how") ||
    lower.includes("what is") ||
    lower.includes("career twin") ||
    lower.includes("proof graph") ||
    lower.includes("pricing") ||
    lower.includes("plan") ||
    lower.includes("help") ||
    lower.includes("where") ||
    lower.includes("kothay") ||
    lower.includes("sitemap")
  ) {
    if (lang === "bn") {
      return `❓ **AI Pather প্ল্যাটফর্ম নেভিগেশন ও ফিচার গাইড**:

🗺️ **My Roadmap** (\`/dashboard/learner/learning-path\`): লিভিং ইন্টারঅ্যাক্টিভ রোডম্যাপ (@xyflow/react)
⚠️ **Skill Gaps** (\`/dashboard/learner/skill-gaps\`): প্রিরিক্যুইজিট গ্যাপ ও লার্নিং ডেট
🎯 **Assessments** (\`/dashboard/learner/assessments\`): ৪-স্টেজ স্কিল মাস্টারি সিমুলেশন
💻 **Project Studio** (\`/dashboard/learner/portfolio\`): AI বিল্ড স্পেক্স ও GitHub ভেরিফিকেশন
📄 **AI Resume Studio** (\`/dashboard/learner/resume\`): 0-100% ATS স্কোরিং ও PDF ডাউনলোড
🎙️ **Mock Interviews** (\`/dashboard/learner/interview\`): লাইভ টেকনিক্যাল ও STAR ইন্টারভিউ
📈 **Career Twin** (\`/dashboard/learner/career-twin\`): লাইভ মার্কেট রেডিলেস বেঞ্চমার্ক (০-১০০%)
💎 **Pricing & Plans** (\`/pricing\`): Go (ফ্রি), Plus ($29/মাস), Pro ($99/মাস)
🔐 **Admin Console** (\`/dashboard/admin/dashboard\`): সিস্টেম অ্যানালিটিক্স ও ইউজার ম্যানেজমেন্ট

কোন ফিচার সম্পর্কে আরও জানতে চান? 😊`;
    }
    return `❓ **AI Pather Platform Sitemap & Feature Directory**:

🗺️ **My Roadmap** (\`/dashboard/learner/learning-path\`): Living interactive node-edge graph (@xyflow/react)
⚠️ **Skill Gaps** (\`/dashboard/learner/skill-gaps\`): Prerequisite gap and learning debt matrix
🎯 **Assessments** (\`/dashboard/learner/assessments\`): 4-Stage Mastery (Understand -> Debug -> Code -> Explain)
💻 **Project Studio** (\`/dashboard/learner/portfolio\`): AI Build Specifications & GitHub CI Audits
📄 **AI Resume Studio** (\`/dashboard/learner/resume\`): 0-100% ATS 4-pillar scanner & PDF export
🎙️ **Mock Interviews** (\`/dashboard/learner/interview\`): Interactive technical & behavioral STAR simulator
📈 **Career Twin** (\`/dashboard/learner/career-twin\`): Live hiring readiness benchmark (0-100%)
💎 **Pricing & Plans** (\`/pricing\`): Go (Free), Plus ($29/mo), Pro ($99/mo)
🔐 **Admin Console** (\`/dashboard/admin/dashboard\`): System Admin analytics & user directory

Which feature or page would you like to explore deeper? 😊`;
  }

  // 8.5. Deep Research
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
🏛️ **ঐতিহাসিক নিদর্শন**: সুনির্দিষ্ট ভৌগোলিক অবস্থান, নির্মাণকাল, নির্মাতা ও উদ্দেশ্য
⚛️ **বিজ্ঞান ও মহাবিশ্ব**: পদার্থবিজ্ঞান, মহাকাশ, কোয়ান্টাম থিওরি ও গণিত
💼 **ব্যবসা ও অর্থনীতি**: স্টার্টআপ গ্রোথ, ফিন্যান্স ও মার্কেট অ্যানালাইসিস

আপনার যেকোনো সুনির্দিষ্ট প্রশ্ন করতে পারেন—আমি পূর্ণাঙ্গ ও তথ্যবহুল বিশ্লেষণ প্রদান করব! 🚀`;
    }
    return `🌍 **AI Pather Universal Deep Research & Knowledge Engine**:

Looking for deep research on history, science, geography, or global topics? 📚
🏛️ **Monuments & Landmarks**: Exact geographical location, historical builder, and core purpose
⚛️ **Science & Universe**: Quantum physics, astrophysics, and advanced mathematics
💼 **Business & Economics**: Startup scaling, finance, and macroeconomics

Feel free to ask any research question—I will provide a structured, complete analysis! 🚀`;
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

  // 10. Default response
  if (lang === "bn") {
    return `👋 হে! আমি আপনার **AI Pather Copilot**! 

আমি সাহায্য করতে পারি:
🗺️ পার্সোনালাইজড টেক রোডম্যাপ ও পেজ নেভিগেশনে (\`/dashboard/learner/*\`)
💻 ১০০% কমপ্লিট কোড ডিবাগিং, DSA ও সিস্টেম আর্কিটেকচারে
🧠 স্কিল গ্যাপ ও ৪-স্টেজ মাস্টারি সিমুলেশনে
🚀 প্রোডাকশন-রেডি পোর্টফোলিও প্রজেক্ট ও GitHub ভেরিফিকেশনে
📄 ATS রেজুমে অপ্টিমাইজেশন ও Google X-Y-Z ফর্মুলায়
🎯 লাইভ মক ইন্টারভিউ প্র্যাকটিস ও ফিডব্যাকে

আজকে আমরা কী নিয়ে কাজ করব? 😊`;
  }

  return `👋 Hey! I'm your **AI Pather Copilot**!

I can assist you with:
🗺️ Personalized career roadmaps & platform navigation (\`/dashboard/learner/*\`)
💻 100% complete code debugging, DSA algorithms & system design
🧠 Skill gap diagnostics & 4-stage mastery simulations
🚀 Production-grade portfolio blueprints & GitHub audits
📄 ATS resume scorecards & Google X-Y-Z bullet rewrites
🎯 Interactive mock interviews with instant rubrics & feedback

What would you like to build or learn today? 😊`;
}

export function detectLanguage(message: string): "en" | "bn" | "mixed" {
  const hasEnglish = /[a-zA-Z]/.test(message);
  const hasBangla = /[\u0980-\u09FF]/.test(message);
  return hasBangla && hasEnglish ? "mixed" : hasBangla ? "bn" : "en";
}

export const ADMIN_COPILOT_SYSTEM_PROMPT = `You are the AI Pather Platform & Learning Intelligence Copilot for authorized administrators.

PostgreSQL, Prisma activity logs, AI usage logs, diagnostic attempts, roadmap completions, and subscriptions are truth sources.
- Use only supplied data, never invent numbers.
- Provide: 1. Brief summary, 2. Key metrics, 3. Insights, 4. Recommendations.
- Plain text or simple markdown bullets, strictly NO pipe tables.`;

export function buildUserPrompt(
  query: string,
  contextData: string,
  timeRangeLabel: string
): string {
  return `Time period: ${timeRangeLabel}
Admin question: "${query}"
Platform data:
${contextData}
Provide a concise evidence-based analysis based only on this data.`;
}

export const buildAdminUserPrompt = buildUserPrompt;
export const SYSTEM_PROMPT_CORE = CONVERSATIONAL_COPILOT_SYSTEM;
export type QueryComplexity = "simple" | "normal" | "complex";

export function detectQueryComplexity(message: string): QueryComplexity {
  const normalizedMessage = message.toLowerCase().trim();

  const complexKeywords = [
    "architecture", "system design", "distributed", "microservices", "database design",
    "api design", "security", "concurrency", "deployment", "machine learning", "deep learning",
    "aiml", "ai/ml", "debug", "debugging", "refactor", "optimize", "optimization", "code review",
    "leetcode", "algorithm", "dynamic programming", "sliding window", "two pointers", "binary search",
    "binary tree", "graph traversal", "dijkstra", "time complexity", "space complexity",
    "runtime error", "stack trace", "race condition", "memory leak", "fix this bug", "fix the bug",
    "fix this code", "solve this", "deep research", "research", "history", "historical", "itihas",
    "location", "kothay", "obosthito", "where is", "where is located", "built", "toiri", "purpose",
    "taj mahal", "monument", "bistarito", "detailed research", "explain in detail", "detailed roadmap",
    "complete roadmap", "mock interview", "interview questions", "assessment", "diagnostic", "quiz",
    "project plan", "step by step", "sitemap", "routes", "features", "details", "admin",
  ];

  if (
    complexKeywords.some((keyword) => normalizedMessage.includes(keyword)) ||
    normalizedMessage.length > 250
  ) {
    return "complex";
  }

  const learningKeywords = [
    "learn", "study", "guide", "roadmap", "path", "how to", "how do i", "start", "explain",
    "tutorial", "course", "career", "job", "interview", "resume", "shikhbo", "kivabe", "bujhiye",
    "concept", "syntax", "python", "react", "node", "next", "sql", "frontend", "backend",
    "fullstack", "devops", "cloud",
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

  if (!context || !context.trim() || context.includes("GUEST_VISITOR")) {
    return `${SYSTEM_PROMPT_CORE}

==================================================
USER STATUS: GUEST VISITOR (UNAUTHENTICATED)
==================================================
CRITICAL GUEST MANDATE:
1. The user is browsing as a guest without an active account.
2. They have NO active roadmap, NO saved scores, and NO access to dashboard settings.
3. NEVER instruct them to "Open My Roadmap", "Check Skill Gaps", "Go to Account Settings", or "Link GitHub in Settings".
4. In your closing "👉 Next Step:", ALWAYS invite them to **Sign up for free** (takes 30 seconds) to generate their living roadmap and unlock verified skill tracking, OR invite them to share their current coding background right here in chat!
5. When asked "how to start", "how to explore", or "guide me": ALWAYS explain how to explore AIPather in 4 clean steps (Sign Up -> Choose Role & Hours -> Explore Roadmap Canvas -> Complete 4-Stage Simulation). NEVER recommend third-party competitors (freeCodeCamp, Codecademy, LeetCode, etc.) or manual notebooks/spreadsheets!
${languageMandate}`.trim();
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
   - The user is an authenticated learner. Their verified TARGET ROLE, Experience level, Active Roadmap, and Skill Gaps (or SYSTEM_ADMIN status) are provided in the context above.
   - ALWAYS acknowledge and anchor your guidance in their TARGET ROLE.
   - If the user asks "what is my target role", "guide me on my career", "what should I do next", "review my progress":
     * Explicitly state their TARGET ROLE, current active milestone, completed milestones, and active skill gaps.
     * Deliver a clear, complete, step-by-step action plan calibrated to their weekly study hours and current milestone.
2. CONTEXTUAL ROLE ALIGNMENT:
   - For ANY technical or career question, tailor the answer specifically to their TARGET ROLE so they stay on track with their roadmap.
3. LEARNER GOAL ADVANCEMENT:
   - Actively encourage and guide the user towards real-world job readiness, portfolio proof, and assessment mastery for their specific target role.
4. IF TARGET ROLE IS NOT YET CONFIGURED:
   - If context indicates "No onboarding data found" or target role is undefined, guide them to configure their role at /onboarding or in **My Roadmap**, or help them choose from top tracks right in the chat.
${languageMandate}`.trim();
};
