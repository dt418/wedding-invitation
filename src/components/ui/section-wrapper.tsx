import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "large" | "compact";
  id?: string;
}

const sizeStyles = {
  default: "py-20 md:py-28",
  large: "py-24 md:py-36",
  compact: "py-12 md:py-16",
};

export function SectionWrapper({
  children,
  className,
  size = "default",
  id,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "w-full",
        sizeStyles[size],
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-6">{children}</div>
    </section>
  );
}