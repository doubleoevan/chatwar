import { ReactNode } from "react";
import { cn } from "@chatwar/ui";

export function AnalyticsSection({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={title}
      className={cn(
        "rounded-xl border bg-muted p-3 dark:bg-muted",
        "flex flex-col items-stretch",
        "min-h-56",
        className,
      )}
    >
      <header className="mb-2">
        <h2 id={title} className="text-base font-semibold leading-6 text-center">
          {title}
        </h2>
      </header>

      <div aria-hidden="true" className="flex-1">
        {children}
      </div>
    </section>
  );
}
