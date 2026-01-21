import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function RouteAnalytics() {
  const location = useLocation();
  const GA_ID = import.meta.env.VITE_GA_ID;

  // track route changes as page views
  useEffect(() => {
    // don't send analytics in development
    if (import.meta.env.DEV) {
      return;
    }

    // don't send analytics if GA_ID and window.gtag are not set
    if (!GA_ID || !window.gtag) {
      return;
    }

    // notify Google Analytics of a page view
    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [GA_ID, location.pathname, location.search]);

  // nothing to render
  return null;
}
