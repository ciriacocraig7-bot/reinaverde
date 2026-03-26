import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-emerald-50 text-emerald-700",
        secondary: "bg-surface-container-low text-on-surface-variant",
        destructive: "bg-red-50 text-red-700",
        warning: "bg-amber-50 text-amber-700",
        info: "bg-blue-50 text-blue-700",
        success: "bg-emerald-50 text-emerald-700",
        outline: "border border-outline-variant/20 text-on-surface-variant",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
