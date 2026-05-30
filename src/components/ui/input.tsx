import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/**
 * Editorial input. Underline-only on the cream paper, no rounded corners,
 * label as a mono caption. Inspired by ledger forms and printed catalogs.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/65 mb-2"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          ref={ref}
          className={cn(
            "block w-full bg-transparent border-0 border-b border-ink/30",
            "font-sans text-base text-ink placeholder:text-ink/30",
            "px-0 py-2.5",
            "focus:outline-none focus:border-ink focus:ring-0",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors duration-150",
            error && "border-error focus:border-error",
            className,
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-ink/40">
            {hint}
          </p>
        )}
        {error && (
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-error">
            ✕ {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
