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

export const dashboardNavSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "LEARN",
    items: [
      { href: "/learning-path", label: "My Roadmap", icon: Route },
      { href: "/skill-gaps", label: "Skill Gaps", icon: Target },
      { href: "/assessments", label: "Assessments", icon: ClipboardCheck },
      { href: "/portfolio", label: "Projects", icon: FolderKanban },
    ],
  },
  {
    title: "PROVE",
    items: [
      { href: "/career-twin", label: "Career Twin", icon: UserCheck },
      { href: "/proof-graph", label: "Proof Graph", icon: GitMerge },
      { href: "/progress", label: "Progress", icon: BarChart },
    ],
  },
  {
    title: "CAREER",
    items: [
      { href: "/career-alignment", label: "Career Alignment", icon: Map },
      { href: "/application-readiness", label: "Application Readiness", icon: ClipboardCheck },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { href: "/profile", label: "Profile", icon: User },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const bottomNavItems: NavLink[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/learning-path", label: "Paths", icon: Route },
  { href: "/portfolio", label: "Projects", icon: FolderKanban },
  { href: "/career-twin", label: "Twin", icon: UserCheck },
  { href: "/profile", label: "Profile", icon: User },
];
