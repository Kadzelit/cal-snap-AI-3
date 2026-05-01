import { cn } from "@/lib/utils";

type TopBarProps = {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  transparent?: boolean;
};

export function TopBar({ title, left, right, className, transparent }: TopBarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-6",
        !transparent && "bg-background/95 backdrop-blur-sm border-b border-border/50",
        className
      )}
    >
      <div className="w-10">{left}</div>
      {title && (
        <h1 className="font-heading font-bold text-[17px] text-foreground">{title}</h1>
      )}
      <div className="w-10 flex justify-end">{right}</div>
    </header>
  );
}
