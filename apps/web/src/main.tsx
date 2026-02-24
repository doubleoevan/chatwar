import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";
import "@fontsource-variable/inter";
import "@/index.css";
import "@/theme.css";
import "@chatwar/ui/styles.css";
import App from "@/App";
import { AppProviders } from "@/app/Providers";
import { enableMocks } from "@/mocks";

// enable mock service worker in dev
if (import.meta.env.DEV) {
  await enableMocks();
}

// bootstrap Google Analytics in prod
const GA_ID = import.meta.env.VITE_GA_ID;
if (GA_ID && import.meta.env.PROD) {
  const scriptSrc = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${scriptSrc}"]`);
  if (!existingScript) {
    const script = document.createElement("script");
    script.async = true;
    script.src = scriptSrc;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window?.dataLayer?.push?.(arguments);
    };

  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
