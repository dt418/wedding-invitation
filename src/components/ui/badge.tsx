import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "accent";
  className?: string;
}

const badgeStyles = {
  default: "bg-rose-100 text-rose-700 border border-rose-200",
  outline: "bg-transparent text-rose-600 border-2 border-rose-200",
  accent: "bg-amber-50 text-amber-700 border border-amber-200",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full",
        badgeStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}