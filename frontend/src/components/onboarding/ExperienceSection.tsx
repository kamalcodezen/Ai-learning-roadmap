import { BrainCircuit, Check, Zap } from "lucide-react";

export type ExperienceLevel = "beginner" | "intermediate";

export const experienceLevels: {
  id: ExperienceLevel;
  title: string;
  description: string;
  icon: typeof BrainCircuit;
}[] = [
  {
    id: "beginner",
    title: "Beginner",
    description: "I'm still building my fundamentals.",
    icon: BrainCircuit,
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description:
      "I can build projects but want stronger production and job readiness.",
    icon: Zap,
  },
];

interface ExperienceSectionProps {
  experience: ExperienceLevel | "";
  setExperience: (exp: ExperienceLevel | "") => void;
}

export function ExperienceSection({ experience, setExperience }: ExperienceSectionProps) {
  return (
    <section
      className="
        rounded-[28px]
        border
        border-border
        bg-card/80
        p-5
        shadow-[var(--shadow)]
        backdrop-blur-xl
        sm:p-7
      "
    >
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <BrainCircuit className="h-4 w-4 text-primary" />
          </div>

          <h2 className="text-lg font-semibold sm:text-xl">
            What is your current level?
          </h2>
        </div>

        <p className="text-sm text-muted-foreground">
          This helps CareerOS calibrate your initial diagnostic.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {experienceLevels.map((level) => {
          const selected = experience === level.id;
          const Icon = level.icon;

          return (
            <button
              key={level.id}
              type="button"
              onClick={() => setExperience(level.id)}
              className={`
                group
                rounded-2xl
                border
                p-5
                text-left
                transition-all
                duration-300
                ${
                  selected
                    ? "border-primary/50 bg-primary/[0.08] shadow-[0_0_30px_rgba(206,255,31,0.06)]"
                    : "border-border bg-card-soft hover:-translate-y-0.5 hover:border-primary/30"
                }
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div
                    className={`
                      mb-4
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      ${
                        selected
                          ? "bg-primary text-secondary"
                          : "bg-muted text-muted-foreground"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <h3 className="text-sm font-semibold sm:text-base">
                    {level.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {level.description}
                  </p>
                </div>

                <span
                  className={`
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    ${
                      selected
                        ? "border-primary bg-primary text-secondary"
                        : "border-border"
                    }
                  `}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
