import * as React from "react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   DASHBOARD HEADER · sets the page title row
   ════════════════════════════════════════════════════════════════ */

export function DashHeader({
  eyebrow,
  title,
  date,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  date?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-ink/15 pb-8">
      <div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
            {eyebrow}
          </span>
          {date && (
            <>
              <span className="text-ink/30">/</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 tabular">
                {date}
              </span>
            </>
          )}
        </div>
        <h1 className="font-display font-light tracking-[-0.03em] leading-[0.95] text-ink text-5xl sm:text-6xl">
          {title}
        </h1>
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </header>
  );
}

/* ════════════════════════════════════════════════════════════════
   STAT BLOCK · numeric KPI tile
   ════════════════════════════════════════════════════════════════ */

export function StatBlock({
  label,
  value,
  meta,
  trend,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
  trend?: "up" | "down" | "flat" | "warn";
  accent?: "marigold" | "iris" | "persimmon" | "ink";
}) {
  const trendIcon = {
    up: "trending_up",
    down: "trending_down",
    flat: "trending_flat",
    warn: "warning",
  }[trend ?? "flat"];

  const accentClass = {
    marigold: "text-marigold",
    iris: "text-iris",
    persimmon: "text-persimmon",
    ink: "text-ink",
  }[accent ?? "ink"];

  return (
    <div className="p-6 border border-ink/15 bg-cream relative flex flex-col gap-4 group hover:bg-cream-warm transition-colors">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
        {label}
      </p>
      <p className="font-display text-[44px] tracking-[-0.025em] leading-none text-ink tabular">
        {value}
      </p>
      {meta && (
        <p className={cn(
          "font-mono text-[11px] uppercase tracking-[0.18em] flex items-center gap-2",
          accentClass,
        )}>
          {trend && (
            <span className="material-symbols-outlined text-sm">{trendIcon}</span>
          )}
          {meta}
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PANEL · framed content surface for tables / lists
   ════════════════════════════════════════════════════════════════ */

export function Panel({
  index,
  title,
  meta,
  children,
  actions,
}: {
  index?: string;
  title: string;
  meta?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="border border-ink/15 bg-cream">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-ink/15">
        <div className="flex items-baseline gap-3">
          {index && (
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
              § {index}
            </span>
          )}
          <h2 className="font-display text-2xl tracking-tight text-ink leading-none">{title}</h2>
          {meta && (
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
              {meta}
            </span>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <div>{children}</div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   STATUS PILL · editorial badge with state dot
   ════════════════════════════════════════════════════════════════ */

type Tone = "neutral" | "info" | "warn" | "success" | "danger" | "muted";

export function StatusPill({ tone = "neutral", label }: { tone?: Tone; label: string }) {
  const map: Record<Tone, { border: string; text: string; dot: string }> = {
    neutral: { border: "border-ink/30",       text: "text-ink",         dot: "bg-ink" },
    info:    { border: "border-iris/40",      text: "text-iris-deep",   dot: "bg-iris" },
    warn:    { border: "border-marigold-deep/40", text: "text-marigold-deep", dot: "bg-marigold" },
    success: { border: "border-success/40",   text: "text-success",     dot: "bg-success" },
    danger:  { border: "border-error/40",     text: "text-error",       dot: "bg-error" },
    muted:   { border: "border-ink/15",       text: "text-ink/60",      dot: "bg-ink/30" },
  };
  const t = map[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-[3px] border bg-cream",
        "font-mono text-[10px] uppercase tracking-[0.16em]",
        t.border,
        t.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} aria-hidden />
      {label}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   DATA TABLE · editorial table (use within <Panel>)
   ════════════════════════════════════════════════════════════════ */

export function DataTable({
  columns,
  children,
}: {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink/15">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "px-6 py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55",
                  c.align === "right" ? "text-right" : "text-left",
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">{children}</tbody>
      </table>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PROGRESS METER · capacity / quota display
   ════════════════════════════════════════════════════════════════ */

export function ProgressMeter({
  label,
  value,
  max = 100,
  accent = "ink",
}: {
  label: string;
  value: number;
  max?: number;
  accent?: "ink" | "marigold" | "iris" | "persimmon";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const bar = {
    ink: "bg-ink",
    marigold: "bg-marigold",
    iris: "bg-iris",
    persimmon: "bg-persimmon",
  }[accent];
  return (
    <div>
      <div className="flex items-end justify-between mb-1.5">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/65">
          {label}
        </span>
        <span className="font-display text-base tabular text-ink">
          {Math.round(pct)}<span className="text-ink/55 text-xs">%</span>
        </span>
      </div>
      <div className="h-1 bg-ink/10 relative">
        <div className={cn("h-full", bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   AVATAR · initials in a square ink block
   ════════════════════════════════════════════════════════════════ */

export function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-7 w-7 text-[11px]",
    md: "h-9 w-9 text-[13px]",
    lg: "h-12 w-12 text-base",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center bg-ink text-cream font-display tracking-tight shrink-0",
        sizes[size],
      )}
    >
      {initials}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   ACTION BUTTON · letterpress button used in dashboards
   ════════════════════════════════════════════════════════════════ */

type ActionVariant = "ink" | "outline" | "marigold" | "iris" | "persimmon" | "danger";

const ACTION_CLASSES: Record<ActionVariant, string> = {
  ink: "bg-ink text-cream hover:bg-ink-soft",
  outline: "border border-ink/40 text-ink hover:border-ink hover:bg-ink hover:text-cream",
  marigold: "bg-marigold text-ink hover:bg-marigold-deep hover:text-cream",
  iris: "bg-iris text-cream hover:bg-iris-deep",
  persimmon: "bg-persimmon text-cream hover:bg-persimmon-deep",
  danger: "bg-error text-cream hover:bg-[#7a2820]",
};

export function ActionBtn({
  variant = "ink",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ActionVariant }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center h-10 px-5 font-sans text-[12.5px] tracking-tight transition-colors rv-press",
        "disabled:opacity-50 disabled:pointer-events-none",
        ACTION_CLASSES[variant],
        className,
      )}
    />
  );
}

/* ════════════════════════════════════════════════════════════════
   LINE ROW · "Catering · 142 · $24.8M" hub strip
   ════════════════════════════════════════════════════════════════ */

export function LineRow({
  accent,
  code,
  name,
  metric,
  count,
  href,
  onClick,
}: {
  accent: "marigold" | "iris" | "persimmon";
  code: string;
  name: string;
  metric: string;
  count: string;
  href?: string;
  onClick?: () => void;
}) {
  const accentColor = {
    marigold: "text-marigold",
    iris: "text-iris",
    persimmon: "text-persimmon",
  }[accent];

  const inner = (
    <div className="flex items-baseline justify-between p-5 border border-ink/15 hover:bg-cream-warm transition-colors group cursor-pointer">
      <div className="flex items-baseline gap-4">
        <span className={cn("font-mono text-[10.5px] uppercase tracking-[0.22em]", accentColor)}>
          {code}
        </span>
        <span className="font-display text-2xl tracking-tight text-ink">{name}</span>
      </div>
      <div className="flex items-baseline gap-6">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink/55">
          {count}
        </span>
        <span className="font-display text-2xl tabular text-ink">{metric}</span>
        <span className="font-display text-2xl text-ink/40 group-hover:translate-x-1 transition-transform">
          →
        </span>
      </div>
    </div>
  );

  if (href) return <a href={href}>{inner}</a>;
  return <button onClick={onClick} className="block w-full text-left">{inner}</button>;
}
