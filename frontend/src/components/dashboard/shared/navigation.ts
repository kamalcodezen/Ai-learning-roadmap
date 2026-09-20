import {
  BarChart,
  BrainCircuit,
  ClipboardCheck,
  FolderKanban,
  GitMerge,
  LayoutDashboard,
  Map,
  Route,
  Settings,
  Target,
  User,
  UserCheck,
  Users,
  BookOpen,
  ShieldCheck,
  FileText,
  Mic,
  TrendingUp,
  Briefcase,
  Megaphone,
  Sparkles,
  CreditCard,
  Sliders,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  requiredPlan?: "PLUS" | "PRO";
}

export interface NavSection {
  title: string;
  items: NavLink[];
}

export const getDashboardNavSections = (prefix: string): NavSection[] => {
  const isAdmin = prefix === "/dashboard/admin";

  if (isAdmin) {
    return [
      {
        title: "OVERVIEW",
        items: [
          { href: `${prefix}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
          { href: `${prefix}/analytics`, label: "Analytics", icon: BarChart },
        ],
      },
      {
        title: "USERS & ECONOMY",
        items: [
          { href: `${prefix}/users`, label: "All Users", icon: Users },
          { href: `${prefix}/gem-economy`, label: "Gem Economy & Streaks", icon: Sparkles },
          { href: `${prefix}/subscriptions`, label: "Subscriptions & Pricing", icon: CreditCard },
        ],
      },
      {
        title: "LEARNING",
        items: [
          { href: `${prefix}/roadmaps`, label: "Roadmaps", icon: Route },
          { href: `${prefix}/skill-health`, label: "Skill Health", icon: Target },
          { href: `${prefix}/learning-debt`, label: "Learning Debt", icon: BookOpen },
          { href: `${prefix}/assessments`, label: "Assessments", icon: ClipboardCheck },
          { href: `${prefix}/interviews`, label: "Mock Interviews", icon: Mic },
          { href: `${prefix}/projects`, label: "Projects & Verification", icon: FolderKanban },
        ],
      },
      {
        title: "CAREER & PROOF",
        items: [
          { href: `${prefix}/resumes`, label: "Learner Resumes", icon: FileText },
          { href: `${prefix}/skill-proof`, label: "Skill Proof", icon: GitMerge },
          { href: `${prefix}/career-readiness`, label: "Career Readiness", icon: Target },
          { href: `${prefix}/job-reality`, label: "Job Reality", icon: Map },
        ],
      },
      {
        title: "AI",
        items: [
          { href: `${prefix}/ai-usage`, label: "AI Usage", icon: BarChart },
          { href: `${prefix}/ai-sandbox`, label: "AI Playground", icon: Sparkles },
        ],
      },
      {
        title: "SYSTEM",
        items: [
          { href: `${prefix}/broadcasts`, label: "Broadcasts", icon: Megaphone },
          { href: `${prefix}/activity`, label: "Activity", icon: LayoutDashboard },
          { href: `${prefix}/audit-logs`, label: "Audit Logs", icon: FileText },
          { href: `${prefix}/error-logs`, label: "Error Logs", icon: ShieldCheck },
          { href: `${prefix}/system-health`, label: "System Health", icon: ShieldCheck },
        ],
      },
      {
        title: "ACCOUNT",
        items: [
          { href: `${prefix}/profile`, label: "Profile", icon: User },
          { href: `${prefix}/settings`, label: "Settings", icon: Settings },
        ],
      },
    ];
  }

  // Learner routes - Structured in logical Step-by-Step Learner Workflow
  const learnerPrefix = "/dashboard/learner";
  return [
    {
      title: "OVERVIEW",
      items: [
        { href: `${learnerPrefix}`, label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "LEARN",
      items: [
        { href: `${learnerPrefix}/learning-path`, label: "My Roadmap", icon: Route }, // সম্পূর্ণ ফ্রি
        { href: `${learnerPrefix}/adaptive-recovery`, label: "Adaptive Pace & Recovery", icon: Sliders },
        { href: `${learnerPrefix}/skill-gaps`, label: "Skill Gaps", icon: Target },
        { href: `${learnerPrefix}/assessments`, label: "Assessments", icon: ClipboardCheck, requiredPlan: "PLUS" },
        { href: `${learnerPrefix}/portfolio`, label: "Projects", icon: FolderKanban },
        { href: `${learnerPrefix}/interview`, label: "Mock Interview", icon: Mic, requiredPlan: "PLUS" },
      ],
    },
    {
      title: "PROVE",
      items: [
        { href: `${learnerPrefix}/proof-graph`, label: "Proof Graph", icon: GitMerge, requiredPlan: "PRO" },
        { href: `${learnerPrefix}/career-twin`, label: "Career Twin", icon: UserCheck },
        { href: `${learnerPrefix}/progress`, label: "Progress", icon: TrendingUp },
      ],
    },
    {
      title: "CAREER",
      items: [
        { href: `${learnerPrefix}/resume`, label: "AI Resume & ATS", icon: FileText, requiredPlan: "PRO" },
        { href: `${learnerPrefix}/job-reality`, label: "Job Reality", icon: Briefcase, requiredPlan: "PLUS" },
        { href: `${learnerPrefix}/career-alignment`, label: "Career Alignment", icon: Map },
        { href: `${learnerPrefix}/career-intelligence`, label: "Career Intelligence", icon: BrainCircuit, requiredPlan: "PRO" },
        { href: `${learnerPrefix}/application-readiness`, label: "Application Readiness", icon: ClipboardCheck },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { href: `${learnerPrefix}/profile`, label: "Profile", icon: User },
        { href: `${learnerPrefix}/settings`, label: "Settings", icon: Settings },
      ],
    },
  ];
};

export const getBottomNavItems = (prefix: string): NavLink[] => {
  const isAdmin = prefix === "/dashboard/admin";

  if (isAdmin) {
    return [
      { href: `${prefix}/dashboard`, label: "Home", icon: LayoutDashboard },
      { href: `${prefix}/users`, label: "Users", icon: Users },
      { href: `${prefix}/system-health`, label: "System", icon: ShieldCheck },
      { href: `${prefix}/profile`, label: "Profile", icon: User },
    ];
  }

  const learnerPrefix = "/dashboard/learner";
  return [
    { href: `${learnerPrefix}`, label: "Home", icon: LayoutDashboard },
    { href: `${learnerPrefix}/learning-path`, label: "Roadmap", icon: Route },
    { href: `${learnerPrefix}/portfolio`, label: "Projects", icon: FolderKanban },
    { href: `${learnerPrefix}/career-twin`, label: "Twin", icon: UserCheck },
    { href: `${learnerPrefix}/profile`, label: "Profile", icon: User },
  ];
};
