"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Menu, X } from "lucide-react";
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
    { label: "Home / MRI Analysis", href: "/" },
    { label: "History", href: "/history" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#DCE5EF] dark:border-[#1E344D] bg-[#FFFFFF] dark:bg-[#132235] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#1769AA] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#16324F] dark:text-[#F1F5F9] text-lg tracking-tight leading-none">
              NeuroVisionAI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navLinks.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname === "/analysis"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#1769AA]/10 dark:bg-[#2196F3]/15 text-[#1769AA] dark:text-[#2196F3] font-semibold"
                    : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#16324F] dark:hover:text-[#F1F5F9] hover:bg-[#F7F9FC] dark:hover:bg-[#1A2E46]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Discreet Status Indicator + Theme Toggle + Mobile Menu Button */}
        <div className="flex items-center gap-3">
          {/* Discreet Backend Status Indicator */}
          <div
            className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] cursor-pointer"
            onClick={checkStatus}
            title={isHealthy ? "Backend server is online and operational" : "Backend server is offline"}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isHealthy ? "bg-[#15803D]" : "bg-amber-500 animate-pulse"
              }`}
            />
            <span className="hidden sm:inline text-xs font-medium">
              {isHealthy ? "Online" : "Offline"}
            </span>
          </div>

          <ThemeToggle showLabel={false} />

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F7F9FC] dark:hover:bg-[#1A2E46] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DCE5EF] dark:border-[#1E344D] bg-[#FFFFFF] dark:bg-[#132235] px-4 py-3 space-y-1">
          {navLinks.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname === "/analysis"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                  isActive
                    ? "bg-[#1769AA]/10 dark:bg-[#2196F3]/15 text-[#1769AA] dark:text-[#2196F3] font-semibold"
                    : "text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F7F9FC] dark:hover:bg-[#1A2E46]"
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
