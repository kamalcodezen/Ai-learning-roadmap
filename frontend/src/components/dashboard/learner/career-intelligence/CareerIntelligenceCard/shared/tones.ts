export type Tone = "purple" | "green" | "blue" | "amber" | "neutral";

export const toneStyles: Record<
  Tone,
  {
    text: string;
    soft: string;
    border: string;
    dot: string;
  }
> = {
  purple: {
    text: "text-primary",
    soft: "bg-primary/[0.07]",
    border: "border-primary/20",
    dot: "bg-primary",
  },

  green: {
    text: "text-emerald-600 dark:text-emerald-400",
    soft: "bg-emerald-500/[0.07]",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },

  blue: {
    text: "text-blue-600 dark:text-blue-400",
    soft: "bg-blue-500/[0.07]",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
  },

  amber: {
    text: "text-amber-600 dark:text-amber-400",
    soft: "bg-amber-500/[0.07]",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
  },

  neutral: {
    text: "text-muted-foreground",
    soft: "bg-muted/40",
    border: "border-border",
    dot: "bg-muted-foreground",
  },
};