import {
  BarChart,
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavLink[];
}

export const getDashboardNavSections = (prefix: string): NavSection[] => {
  const learnerPrefix = "/dashboard/learner";

  return [
    {
      title: "OVERVIEW",
      items: [{ href: `${prefix}`, label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      title: "LEARN",
      items: [
        { href: `${learnerPrefix}/learning-path`, label: "My Roadmap", icon: Route },
        { href: `${learnerPrefix}/skill-gaps`, label: "Skill Gaps", icon: Target },
        { href: `${learnerPrefix}/assessments`, label: "Assessments", icon: ClipboardCheck },
        { href: `${learnerPrefix}/portfolio`, label: "Projects", icon: FolderKanban },
      ],
    },
    {
      title: "PROVE",
      items: [
        { href: `${learnerPrefix}/career-twin`, label: "Career Twin", icon: UserCheck },
        { href: `${learnerPrefix}/proof-graph`, label: "Proof Graph", icon: GitMerge },
        { href: `${learnerPrefix}/progress`, label: "Progress", icon: BarChart },
      ],
    },
    {
      title: "CAREER",
      items: [
        { href: `${learnerPrefix}/career-alignment`, label: "Career Alignment", icon: Map },
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
  const learnerPrefix = "/dashboard/learner";

  return [
    { href: `${prefix}`, label: "Home", icon: LayoutDashboard },
    { href: `${learnerPrefix}/learning-path`, label: "Paths", icon: Route },
    { href: `${learnerPrefix}/portfolio`, label: "Projects", icon: FolderKanban },
    { href: `${learnerPrefix}/career-twin`, label: "Twin", icon: UserCheck },
    { href: `${learnerPrefix}/profile`, label: "Profile", icon: User },
  ];
};
