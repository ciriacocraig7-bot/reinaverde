import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
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
        <textarea
          id={id}
          ref={ref}
          className={cn(
            "block w-full bg-transparent border-0 border-b border-ink/30",
            "font-sans text-base text-ink placeholder:text-ink/30",
            "px-0 py-2.5 resize-y min-h-[88px]",
            "focus:outline-none focus:border-ink focus:ring-0",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors duration-150",
            error && "border-error focus:border-error",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-error">
            ✕ {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
