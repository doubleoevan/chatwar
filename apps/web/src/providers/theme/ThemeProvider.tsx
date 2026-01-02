import type { ReactNode } from "react";
import { useEffect, useReducer } from "react";
import { applyTheme, getTheme, getUserTheme, saveTheme, type Theme } from "@/utils/theme";
import { ThemeContext } from "@/providers/theme/ThemeContext";

type ThemeState = { theme: Theme };
type ThemeAction = { type: "SET_THEME"; theme: Theme } | { type: "SYSTEM_THEME_UPDATED" };

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case "SET_THEME":
      return { theme: action.theme };

    case "SYSTEM_THEME_UPDATED":
      if (getUserTheme()) {
        return state;
      }
      return { theme: getTheme() };

    default:
      return state;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, { theme: getTheme() });

  useEffect(() => {
    applyTheme(state.theme);
  }, [state.theme]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onThemeChange = () => dispatch({ type: "SYSTEM_THEME_UPDATED" });

    if (systemTheme.addEventListener) {
      systemTheme.addEventListener("change", onThemeChange);
      return () => systemTheme.removeEventListener("change", onThemeChange);
    }

    // Safari fallback
    systemTheme.addListener(onThemeChange);
    return () => systemTheme.removeListener(onThemeChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onStorageChange = (event: StorageEvent) => {
      if (event.key === "chatwar.theme") {
        dispatch({ type: "SYSTEM_THEME_UPDATED" });
      }
    };

    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  const setTheme = (theme: Theme) => {
    saveTheme(theme);
    dispatch({ type: "SET_THEME", theme });
  };

  return (
    <ThemeContext.Provider value={{ theme: state.theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
