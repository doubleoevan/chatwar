import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import "@chatwar/ui/styles.css";
import App from "@/App";
import { AppProviders } from "@/app/Providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
