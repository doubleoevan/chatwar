import { cn } from "@chatwar/ui";
import React from "react";

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn("underline", className)}>
      {children}
    </a>
  );
}
