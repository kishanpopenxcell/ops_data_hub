import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-xs font-medium uppercase tracking-wide text-text-muted"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint",
            "transition-colors duration-150 outline-none",
            "focus:border-accent focus:ring-2 focus:ring-accent/20",
            error && "border-crit focus:border-crit focus:ring-crit/20",
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-crit">{error}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";
