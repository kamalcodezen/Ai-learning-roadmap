import { DashboardData } from "@/src/app/(dashboard)/dashboard/types";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
  career: DashboardData["career"];
}

export default function DashboardHeader({ user, career }: DashboardHeaderProps) {
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 w-full">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-2 text-foreground">
          Good morning, {firstName} <span className="text-2xl md:text-3xl">👋</span>
        </h1>
        <div className="flex items-center gap-3 mt-3 text-muted-foreground">
          <span className="font-semibold text-primary">{career.targetRole}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{career.experienceLevel}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border shadow-sm">
          <div className={`w-2 h-2 rounded-full animate-pulse ${career.status === "Needs Attention" ? "bg-amber-500" : "bg-primary"}`} />
          <span className="text-sm font-medium text-foreground">{career.status || "You're on track"}</span>
        </div>
      </div>
    </header>
  );
}
