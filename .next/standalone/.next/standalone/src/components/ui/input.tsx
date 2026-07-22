import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-electric/15 bg-surface-elevated/80 px-4 py-2 font-body text-sm text-white placeholder:text-muted transition-all focus:border-electric/50 focus:outline-none focus:ring-2 focus:ring-electric/20 focus:shadow-[0_0_20px_rgba(0,240,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
