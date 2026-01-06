import { ReactNode } from "react";
import { cn } from "@chatwar/ui";

export function Spinner({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex perspective-dramatic transform-3d animate-[coinspin_900ms_linear_infinite]",
        className,
      )}
    >
      {children}
    </span>
  );
}
