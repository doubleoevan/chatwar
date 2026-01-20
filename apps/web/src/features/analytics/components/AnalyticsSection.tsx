import { ReactNode } from "react";
import { cn } from "@chatwar/ui";

export function AnalyticsSection({
  title,
  children,
  tooltip,
  className,
}: {
  title: string;
  children?: ReactNode;
  tooltip?: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={title}
      className={cn(
        "rounded-xl border bg-muted p-3 dark:bg-muted",
        "flex flex-col items-stretch",
        className,
      )}
    >
      <header className="mb-2">
        <h2 id={title} className="text-base font-semibold leading-6 text-center">
          {title} {tooltip && <>{tooltip}</>}
        </h2>
      </header>

      <div
        aria-hidden="true"
        role="presentation"
        className={`
          flex flex-1 
          *:flex *:h-full *:w-full
          border rounded-xl bg-background
        `}
      >
        {children}
      </div>
    </section>
  );
}
