import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useReducer } from "react";

import {
  applyTheme,
  getTheme,
  getUserTheme,
  storeTheme,
  type Theme,
  THEME_STORAGE_KEY,
} from "@/utils/theme";
import { ThemeContext } from "@/providers/theme/ThemeContext";

export type ThemeState = { theme: Theme };
type ThemeAction = { type: "SET_THEME"; theme: Theme } | { type: "SYSTEM_THEME_UPDATED" };

const initialState: ThemeState = { theme: getTheme() };

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case "SET_THEME": {
      return { theme: action.theme };
    }

    case "SYSTEM_THEME_UPDATED": {
      if (getUserTheme()) {
        return state;
      }
      return { theme: getTheme() };
    }

    default:
      return state;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // apply the initial theme
  useEffect(() => {
    applyTheme(state.theme);
  }, [state.theme]);

  // listen to system theme changes
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

  // listen to local storage changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onStorageChange = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        dispatch({ type: "SYSTEM_THEME_UPDATED" });
      }
    };

    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    storeTheme(theme);
    dispatch({ type: "SET_THEME", theme });
  }, []);

  // memoize context to avoid rerendering consumers
  const value = useMemo(
    () => ({
      ...state,
      setTheme,
    }),
    [state, setTheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
