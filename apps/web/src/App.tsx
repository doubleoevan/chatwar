import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/layouts/AppShell";
import { ChatPage } from "@/features/chat/ChatPage";
import { AnalyticsPage } from "@/features/analytics/AnalyticsPage";
import { ChatProvider } from "@/providers/chat";
import { AnalyticsProvider } from "@/providers/analytics";

/** App routes */
export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route
          path="/chat"
          element={
            <ChatProvider>
              <ChatPage />
            </ChatProvider>
          }
        />
        <Route
          path="/analytics"
          element={
            <AnalyticsProvider>
              <AnalyticsPage />
            </AnalyticsProvider>
          }
        />
      </Route>
    </Routes>
  );
}
