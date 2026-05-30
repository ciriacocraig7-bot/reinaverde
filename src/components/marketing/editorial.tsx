import { cn } from "@/lib/utils";

/**
 * Editorial rule with a section label — e.g. "§ 02 — Catálogo Pharma".
 * Renders a mono uppercase label then a 1px ink rule that grows on mount.
 */
export function EditorialRule({
  index,
  label,
  className,
  animated = true,
}: {
  index?: string | number;
  label: string;
  className?: string;
  animated?: boolean;
}) {
  return (
    <div className={cn("rv-rule", animated && "rv-rule-anim", className)}>
      {index !== undefined && <span className="opacity-100">§ {String(index).padStart(2, "0")}</span>}
      <span>{label}</span>
    </div>
  );
}

/**
 * Asymmetric section heading. Eyebrow + display headline. Optional kicker
 * sub-line in serif italic. The display font auto-tunes opsz at this size.
 */
export function SectionHeading({
  eyebrow,
  title,
  kicker,
  align = "left",
  size = "lg",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  kicker?: React.ReactNode;
  align?: "left" | "center";
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    md: "text-[40px] sm:text-5xl",
    lg: "text-5xl sm:text-6xl lg:text-[80px]",
    xl: "text-6xl sm:text-7xl lg:text-[112px]",
  };
  return (
    <header className={cn("flex flex-col gap-5", align === "center" ? "items-center text-center" : "items-start", className)}>
      {eyebrow && (
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/60">
          {eyebrow}
        </span>
      )}
      <h2 className={cn("font-display font-light tracking-tight leading-[0.92] text-ink", sizes[size])}>
        {title}
      </h2>
      {kicker && (
        <p className={cn("font-serif italic text-ink/70 text-lg sm:text-xl leading-snug max-w-2xl", align === "center" && "mx-auto")}>
          {kicker}
        </p>
      )}
    </header>
  );
}

/**
 * Two-column editorial row: ordinal big numeral + content.
 */
export function NumberedRow({
  ordinal,
  title,
  children,
  className,
}: {
  ordinal: number | string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-x-6 sm:gap-x-10 py-8 border-t border-ink/15", className)}>
      <span className="font-display text-5xl sm:text-6xl text-ink/30 leading-none tabular pt-1">
        {String(ordinal).padStart(2, "0")}
      </span>
      <div>
        <h3 className="font-display text-2xl sm:text-3xl text-ink tracking-tight mb-2 leading-tight">
          {title}
        </h3>
        <div className="text-[15px] leading-relaxed text-ink/70 max-w-prose">{children}</div>
      </div>
    </article>
  );
}

/**
 * Editorial price tag — big serif numeral + currency in mono caption.
 */
export function PriceTag({
  amount,
  currency = "COP",
  className,
}: {
  amount: number;
  currency?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5 font-display text-ink", className)}>
      <span className="text-[10px] font-mono uppercase tracking-widest text-ink/50 self-start mt-1">$</span>
      <span className="tabular leading-none">
        {new Intl.NumberFormat("es-CO").format(amount)}
      </span>
      <span className="text-[10px] font-mono uppercase tracking-widest text-ink/50 self-start mt-1">
        {currency}
      </span>
    </span>
  );
}

/**
 * Marquee-style mono caption strip — for stating credentials, certifications,
 * or running facts above a hero.
 */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={cn("flex items-center gap-6 sm:gap-10 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/55", className)}>
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-6 whitespace-nowrap">
          {it}
          {i < items.length - 1 && <span aria-hidden className="opacity-50">◆</span>}
        </span>
      ))}
    </div>
  );
}
