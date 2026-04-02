type KpiCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function KpiCard({ label, value, helper }: KpiCardProps) {
  return (
    <article className="surface flex h-full flex-col rounded-[26px] p-5 shadow-soft">
      <p className="text-sm text-ink/60">{label}</p>
      <h3 className="mt-4 font-[var(--font-heading)] text-3xl text-ink">{value}</h3>
      <p className="mt-3 text-sm text-ink/55">{helper}</p>
    </article>
  );
}