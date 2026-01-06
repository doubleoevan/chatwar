import { createContext } from "react";
import type { Theme } from "@/utils/theme";
import { ThemeState } from "@/providers/theme/ThemeProvider";

export type ThemeContextValue = ThemeState & {
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
