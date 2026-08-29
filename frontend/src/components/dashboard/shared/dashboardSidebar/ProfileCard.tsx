interface ProfileCardProps {
  name?: string | null;
  email?: string | null;
}

export default function ProfileCard({ name, email }: ProfileCardProps) {
  const initial = (name?.trim() || "U").charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center justify-center py-4 text-center">
      {/* Outer ring gauge layout matching screenshot */}
      <div className="relative mb-3 flex size-20 items-center justify-center rounded-full border-2 border-primary/30 p-1">
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin-slow" />
        <span
          aria-hidden="true"
          className="flex size-full items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary ring-1 ring-primary/40"
        >
          {initial}
        </span>
      </div>

      <div className="w-full min-w-0 px-2">
        <p className="truncate text-sm font-bold tracking-wider text-foreground uppercase">
          {name || "Guest User"}
        </p>
        <p className="truncate text-xs text-muted-foreground mt-0.5">
          {email || "—"}
        </p>
      </div>
    </div>
  );
}
