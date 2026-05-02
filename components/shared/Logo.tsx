import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  iconOnly?: boolean;
};

const iconSizes = { sm: 28, md: 36, lg: 52 };
const textSizes = { sm: "text-xl", md: "text-2xl", lg: "text-4xl" };

export function Logo({ size = "md", className, iconOnly = false }: LogoProps) {
  const px = iconSizes[size];
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image src="/logo.svg" alt="CalSnap IA" width={px} height={px} priority />
      {!iconOnly && (
        <span className={cn("font-heading font-extrabold tracking-tight leading-none", textSizes[size])}>
          <span className="text-primary-container">Cal</span>
          <span className="text-foreground">Snap</span>
          <span className="text-secondary-container"> IA</span>
        </span>
      )}
    </span>
  );
}
