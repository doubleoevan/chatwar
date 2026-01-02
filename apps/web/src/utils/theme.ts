export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY: string = "chatwar.theme";

/**
 * Saves the user's theme to localStorage
 */
export function storeTheme(theme: Theme) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Applies the theme to the document
 */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

/**
 * Returns
 * 1. the user's theme from localStorage
 * 2. the operating system theme
 * 3. the dark theme by default
 */
export function getTheme(): Theme {
  return getUserTheme() ?? getSystemTheme() ?? "dark";
}

/**
 * Returns the user's theme from localStorage
 */
export function getUserTheme(): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }
  const theme = localStorage.getItem(THEME_STORAGE_KEY);
  return theme === "light" || theme === "dark" ? theme : null;
}

/**
 * Returns the operating system theme
 */
export function getSystemTheme(): Theme | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
