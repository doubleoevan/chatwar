import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/providers/theme";
import { ChatProvider } from "@/providers/chat";
import { TooltipProvider } from "@chatwar/ui";
import { CredentialsProvider } from "@/providers/credentials";
import { RouteAnalytics } from "@/app/RouteAnalytics";
import { AnalyticsProvider } from "@/providers/analytics";

/** App context providers */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <RouteAnalytics />
      <ThemeProvider>
        <TooltipProvider delayDuration={0}>
          <CredentialsProvider>
            <ChatProvider>
              <AnalyticsProvider>{children}</AnalyticsProvider>
            </ChatProvider>
          </CredentialsProvider>
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
