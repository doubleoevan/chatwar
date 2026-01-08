/// <reference types="vite/client" />

declare module "*.svg?react" {
  import * as React from "react";

  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;

  export default ReactComponent;
}

declare type GtagArgs = [
  command: "js" | "config" | "event",
  target?: string | Date,
  params?: Record<string, unknown>,
];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag: (...args: GtagArgs) => void;
  }
}

export {};
