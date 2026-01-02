// src/components/ChatWarIcon.tsx
import { ReactNode } from "react";

export function Spinner({ children }: { children: ReactNode }) {
  return (
    <span
      className="
        inline-flex
        perspective-dramatic
        transform-3d
        animate-[coinspin_900ms_linear_infinite]
      "
    >
      {children}
    </span>
  );
}
