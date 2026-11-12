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
        className={`w-9 h-9 rounded-lg border border-[#DFE7F1] dark:border-[#2B3B52] bg-white dark:bg-[#17243A] text-[#64748B] dark:text-[#A7B5C9] flex items-center justify-center transition-colors cursor-pointer ${className}`}
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
      className={`w-9 h-9 rounded-lg border border-[#DFE7F1] dark:border-[#2B3B52] bg-white dark:bg-[#17243A] text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#F4F7FB] dark:hover:bg-[#1E2E48] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs ${className}`}
      title={isDark ? "Switch to Light Clinical Theme" : "Switch to Dark Workstation Theme"}
      aria-label={isDark ? "Switch to Light Clinical Theme" : "Switch to Dark Workstation Theme"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#FBBF24] hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="w-4 h-4 text-[#17365D] hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};
