import { useContext } from "react";
import { type ThemeContextValue } from "@/providers/theme";
import { ThemeContext } from "@/providers/theme/ThemeContext";

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within <ThemeProvider />");
  }
  return context;
}
