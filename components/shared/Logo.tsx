import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
};

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <span className={cn("font-heading font-extrabold tracking-tight", sizes[size], className)}>
      <span className="text-primary-container">Cal</span>
      <span className="text-foreground">Snap</span>
      <span className="text-secondary-container"> IA</span>
    </span>
  );
}
