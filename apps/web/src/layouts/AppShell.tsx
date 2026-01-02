import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs } from "@/components/Tabs";

/** App layout */
export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Tabs />
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
