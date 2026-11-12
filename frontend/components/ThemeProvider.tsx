"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Light theme is the default for first-time visitors
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount, preserving user preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("neurovision_theme") as Theme | null;
      if (saved && ["light", "dark", "system"].includes(saved)) {
        setThemeState(saved);
        if (saved === "dark") {
          setResolvedTheme("dark");
          document.documentElement.classList.add("dark");
        } else if (saved === "light") {
          setResolvedTheme("light");
          document.documentElement.classList.remove("dark");
        } else if (saved === "system") {
          const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          setResolvedTheme(sysDark ? "dark" : "light");
          if (sysDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      } else {
        // First-time visitor: default to light theme explicitly
        setThemeState("light");
        setResolvedTheme("light");
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // Local storage unavailable: default to light theme
      setThemeState("light");
      setResolvedTheme("light");
      document.documentElement.classList.remove("dark");
    }

    setMounted(true);
  }, []);

  // System listener when theme === "system"
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemChange = () => {
      if (theme === "system") {
        const active = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(active);
        if (active === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("neurovision_theme", newTheme);
    } catch {}

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    let active: "light" | "dark" = "light";
    if (newTheme === "dark") {
      active = "dark";
    } else if (newTheme === "light") {
      active = "light";
    } else {
      active = mediaQuery.matches ? "dark" : "light";
    }

    setResolvedTheme(active);
    if (active === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const next: "light" | "dark" = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
