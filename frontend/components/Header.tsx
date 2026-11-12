"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Menu, X, CheckCircle2, AlertCircle } from "lucide-react";
import { fetchHealth } from "../lib/api";
import { HealthStatus } from "../lib/types";
import { ThemeToggle } from "./ThemeToggle";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const checkStatus = async () => {
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = health?.status === "healthy";

  const navLinks = [
    { label: "Dashboard", href: "/" },
    { label: "MRI Analysis", href: "/analysis" },
    { label: "Models", href: "/models" },
    { label: "History", href: "/history" },
    { label: "Methodology", href: "/methodology" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-[68px] border-b border-[#DFE7F1] dark:border-[#2B3B52] bg-white dark:bg-[#111C30] transition-colors shadow-xs">
      <div className="max-w-[1600px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand & Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#17365D] dark:bg-[#3B82F6] text-white flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[#172B4D] dark:text-[#F1F5F9] text-lg tracking-tight leading-none">
              NeuroVisionAI
            </span>
            <span className="text-[10px] text-[#64748B] dark:text-[#A7B5C9] font-medium tracking-wide">
              Brain MRI Analysis &bull; Research Workstation
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
          {navLinks.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/analysis"
                ? pathname === "/analysis"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#17365D]/10 dark:bg-[#3B82F6]/15 text-[#17365D] dark:text-[#3B82F6] font-semibold"
                    : "text-[#64748B] dark:text-[#A7B5C9] hover:text-[#172B4D] dark:hover:text-[#F1F5F9] hover:bg-[#F4F7FB] dark:hover:bg-[#17243A]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Backend Connection Indicator + Theme Toggle + Mobile Menu Button */}
        <div className="flex items-center gap-3">
          {/* Backend Connection Indicator */}
          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#F4F7FB] dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] text-xs text-[#64748B] dark:text-[#A7B5C9] cursor-pointer"
            onClick={checkStatus}
            title={isHealthy ? "FastAPI backend online and operational" : "FastAPI backend is offline"}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isHealthy ? "bg-[#16A34A] shadow-[0_0_8px_#16A34A]" : "bg-[#D97706] animate-pulse"
              }`}
            />
            <span className="hidden sm:inline text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
              {isHealthy ? "Connected" : "Offline"}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#64748B] dark:text-[#A7B5C9] hover:bg-[#F4F7FB] dark:hover:bg-[#17243A] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#DFE7F1] dark:border-[#2B3B52] bg-white dark:bg-[#111C30] px-4 py-3 space-y-1 shadow-lg transition-colors">
          {navLinks.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/analysis"
                ? pathname === "/analysis"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#17365D]/10 dark:bg-[#3B82F6]/15 text-[#17365D] dark:text-[#3B82F6] font-semibold"
                    : "text-[#64748B] dark:text-[#A7B5C9] hover:bg-[#F4F7FB] dark:hover:bg-[#17243A]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
