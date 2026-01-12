import { Toaster } from "sonner";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs } from "@/components/Tabs";
import { useTheme } from "@/providers/theme";

/** App layout */
export function AppShell() {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Tabs />
        <Outlet /> {/* routed page content */}
      </main>

      <Footer />
      <Toaster position="top-center" theme={theme} closeButton={true} />
    </div>
  );
}
