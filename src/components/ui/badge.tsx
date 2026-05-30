import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Editorial badge — a stamp on paper, not a pill. Mono uppercase caption,
 * square corners (or near-square), a single rule border.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-[3px] font-mono text-[10px] uppercase tracking-[0.16em]",
  {
    variants: {
      variant: {
        default:     "bg-ink text-cream",
        outline:     "border border-ink/30 text-ink/80",
        soft:        "bg-cream-warm text-ink border border-ink/10",
        marigold:    "bg-marigold text-ink",
        iris:        "bg-iris text-cream",
        persimmon:   "bg-persimmon text-cream",
        destructive: "bg-error text-cream",
        success:     "border border-success/40 text-success",
        warning:     "bg-warning/15 text-warning border border-warning/30",
        // ── Back-compat aliases (dashboards internos) — map a tokens nuevos
        info:        "bg-iris/15 text-iris border border-iris/25",
        secondary:   "bg-cream-warm text-ink border border-ink/10",
      },
    },
    defaultVariants: { variant: "soft" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
