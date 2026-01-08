import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function RouteAnalytics() {
  const location = useLocation();

  // track route changes as page views
  useEffect(() => {
    if (import.meta.env.DEV || !import.meta.env.VITE_GA_ID || !window.gtag) {
      return;
    }

    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
    });
  }, [location]);

  return null;
}
