import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-sm font-medium tracking-tight transition-[transform,box-shadow,background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        // Solid ink — the workhorse, letterpress feel
        default:
          "bg-ink text-cream rv-press hover:bg-ink-soft active:bg-ink",
        // Acento por línea: marigold (Catering)
        marigold:
          "bg-marigold text-ink rv-press hover:bg-marigold-deep hover:text-cream",
        // Acento iris (Pharma)
        iris:
          "bg-iris text-cream rv-press hover:bg-iris-deep",
        // Acento persimmon (Liofilizados)
        persimmon:
          "bg-persimmon text-cream rv-press hover:bg-persimmon-deep",
        // Editorial outline — paper button with single rule
        outline:
          "bg-transparent text-ink border border-ink/40 hover:border-ink hover:bg-ink hover:text-cream",
        // Cream chip — for secondary actions
        cream:
          "bg-cream-warm text-ink border border-ink/10 hover:border-ink/40",
        // Ghost — minimal, for nav
        ghost:
          "text-ink/70 hover:text-ink hover:bg-ink/5",
        // Destructive
        destructive:
          "bg-error text-cream rv-press hover:bg-[#7a2820]",
        // Link — uses the rv-link animated underline
        link:
          "text-ink rv-link p-0 h-auto",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-10 text-base tracking-tight",
        xl: "h-16 px-12 text-base tracking-tight",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
