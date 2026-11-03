"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className={`w-9 h-9 rounded-lg border border-[#DCE5EF] dark:border-[#1E344D] bg-white dark:bg-[#132235] text-[#64748B] flex items-center justify-center transition-colors cursor-pointer ${className}`}
        aria-label="Toggle theme"
      >
        <Moon className="w-4 h-4 opacity-40" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`w-9 h-9 rounded-lg border border-[#DCE5EF] dark:border-[#1E344D] bg-white dark:bg-[#132235] text-[#243447] dark:text-[#E2E8F0] hover:bg-[#F7F9FC] dark:hover:bg-[#1A2E46] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs ${className}`}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="w-4 h-4 text-[#1769AA] hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};
