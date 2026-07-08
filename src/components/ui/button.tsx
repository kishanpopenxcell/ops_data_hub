import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: Variant;
  loading?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-[#16151a] font-semibold hover:bg-accent-strong shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]",
  secondary:
    "bg-surface-raised text-text border border-border hover:border-text-faint",
  ghost: "bg-transparent text-text-muted hover:text-text hover:bg-surface",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, className, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
        transition={{ duration: 0.15 }}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-colors duration-150",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {loading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";
