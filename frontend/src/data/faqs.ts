export interface FaqItem {
  question: string;
  answer: string;
}

export const mainFaqs: FaqItem[] = [
  {
    question: "What is AI Pather?",
    answer:
      "AI Pather is an AI-powered learning platform that turns scattered engineering learning into a structured, career-ready path. Instead of another course library, it combines a skills diagnostic, personalized roadmap, hands-on milestone projects, live mock interviews, and cryptographically-verified proof of your skills — all in one place.",
  },
  {
    question: "Is AI Pather free to use?",
    answer:
      "Yes. You can start completely free. The free plan gives you an AI skill diagnostic, a personalized roadmap, and access to core learning content. Paid plans (Plus and Pro) unlock deeper analytics, unlimited mock interviews, project-based proof verification, and expedited job-readiness reports. You can upgrade or cancel anytime.",
  },
  {
    question: "Do I need to already know how to code to start?",
    answer:
      "Not at all. AI Pather is built for beginners and experienced engineers alike. The diagnostic starts by measuring your current level, and your roadmap is generated from the gaps it finds. If you're brand new, you start with foundational concepts; if you're experienced, you skip straight to the skills you lack.",
  },
  {
    question: "What kind of career tracks do you offer?",
    answer:
      "Our tracks cover the demand-driven roles: AI Engineer, Machine Learning, Data Scientist, Fullstack Developer, Frontend Developer, and Backend Developer. Each track includes real market data — salaries, growth forecasts, top skills, and regional demand — so you know exactly where the opportunities are.",
  },
  {
    question: "How does the AI skill diagnostic work?",
    answer:
      "The diagnostic evaluates you across a set of questions and tasks mapped to your chosen track. The AI analyzes your answers, recognizes skills you've already mastered, and isolates the exact gaps blocking you. That gap analysis becomes the foundation of your personalized learning roadmap.",
  },
  {
    question: "Can my progress and skills be verified or proven?",
    answer:
      "Yes. AI Pather issues cryptographically-signed proof — call it a career proof. Milestone projects and verified assessments you complete can be shared as tamper-evident badges and a Proof Graph passport, giving employers confidence in your actual skills rather than just your word.",
  },
  {
    question: "Are my code repositories and personal data secure?",
    answer:
      "Absolutely. Your private code, diagnostic answers, and mock interview recordings are never used to train public AI models. Architectural audits run in isolated, ephemeral environments with zero retention, and your data is protected by enterprise-grade encryption and privacy controls.",
  },
  {
    question: "How much time do I need to put in per week?",
    answer:
      "That's up to you and your schedule. The roadmap is designed to adapt to the time you can commit — whether that's a few focused hours a week or a full-time push. What matters is consistency: every session moves you one step closer to job readiness.",
  },
  {
    question: "How does AI Pather decide what I should learn next?",
    answer:
      "Your roadmap is generated from your diagnostic gap analysis and continuously adapts. As you complete milestones and level up, the AI re-evaluates your progress and reorders upcoming topics so you always work on the highest-impact next step — never rehashing what you already know.",
  },
  {
    question: "How do I get help if I'm stuck?",
    answer:
      "We've got you covered. Use the in-platform AI mentor for step-by-step guidance whenever you're blocked, check the FAQ and documentation, or reach out to our support team through the contact page. We're actively building the platform alongside our users, so feedback is always welcome.",
  },
];