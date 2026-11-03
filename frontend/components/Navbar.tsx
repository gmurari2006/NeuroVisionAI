"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Brain, BarChart3, Info, Cpu, CheckCircle2, AlertCircle } from "lucide-react";
import { fetchHealth } from "../lib/api";
import { HealthStatus } from "../lib/types";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetchHealth().then(setHealth);
    const interval = setInterval(() => {
      fetchHealth().then(setHealth);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Activity },
    { href: "/analysis", label: "MRI Analysis", icon: Brain },
    { href: "/models", label: "Model Benchmark", icon: BarChart3 },
    { href: "/about", label: "Methodology", icon: Info },
  ];

  const isHealthy = health?.status === "healthy";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xs group-hover:scale-102 transition-transform">
            <Brain className="w-5 h-5 text-blue-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-lg tracking-tight">NeuroVision</span>
              <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-md bg-blue-100/80 text-blue-700">AI</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Brain MRI Research Suite</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Status Pill */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span className="uppercase font-mono text-[10px] tracking-wider text-slate-500">
              {health?.device || "CPU"}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isHealthy
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
            title={`Backend Status: ${health?.status || "Connecting..."}`}
          >
            {isHealthy ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Engine Online</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>Connecting</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

