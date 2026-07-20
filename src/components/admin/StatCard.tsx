import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: boolean;
}

/** Compact KPI tile used across the admin dashboards. Server-rendered. */
export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-1"
      style={{
        background: 'var(--color-surface)',
        borderColor: accent ? 'var(--color-primary)' : 'var(--color-border)',
      }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
        {label}
      </span>
      <span
        className="text-3xl font-heading tracking-tight leading-none"
        style={{ color: accent ? 'var(--color-primary)' : 'var(--color-text)' }}
      >
        {value}
      </span>
      {sub != null && <span className="text-xs text-text-secondary">{sub}</span>}
    </div>
  );
}
