import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/providers/theme";
import { ChatProvider } from "@/providers/chat";
import { CredentialsProvider } from "@/providers/credentials";

/** App context providers */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CredentialsProvider>
          <ChatProvider>{children}</ChatProvider>
        </CredentialsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
