import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
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
        <div className="relative">
          <select
            id={id}
            ref={ref}
            className={cn(
              "block w-full appearance-none bg-transparent border-0 border-b border-ink/30",
              "font-sans text-base text-ink",
              "px-0 py-2.5 pr-8",
              "focus:outline-none focus:border-ink focus:ring-0",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-150",
              error && "border-error focus:border-error",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="material-symbols-outlined pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-ink/60 text-lg"
          >
            expand_more
          </span>
        </div>
        {error && (
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-error">
            ✕ {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
