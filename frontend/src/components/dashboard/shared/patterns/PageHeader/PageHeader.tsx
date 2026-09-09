export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
