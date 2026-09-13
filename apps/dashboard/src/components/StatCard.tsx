export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warn" | "accent";
}) {
  const toneClass =
    tone === "warn" ? "text-warn-600" : tone === "accent" ? "text-accent-600" : "text-ink-900";
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
