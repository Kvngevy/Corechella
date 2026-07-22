import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "bg-violet/20 text-electric border border-electric/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]",
        secondary: "bg-white/5 text-muted border border-white/10",
        success: "bg-green-500/15 text-green-400 border border-green-400/30 shadow-[0_0_12px_rgba(74,222,128,0.15)]",
        warning: "bg-orange-500/15 text-orange-400 border border-orange-400/30",
        gold: "bg-gold/15 text-gold border border-gold/30 shadow-[0_0_12px_rgba(255,229,102,0.15)]",
        date: "bg-black/70 text-white backdrop-blur-md border border-electric/20 font-bold",
        trending: "bg-magenta/20 text-magenta border border-magenta/40 shadow-[0_0_16px_rgba(255,0,128,0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
