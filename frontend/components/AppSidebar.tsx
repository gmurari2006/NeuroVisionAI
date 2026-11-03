"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scan,
  LineChart,
  History,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
  Layers,
  X,
  ShieldAlert,
} from "lucide-react";

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "MRI Analysis",
      href: "/analysis",
      icon: Scan,
      badge: "Workspace",
    },
    {
      label: "Model Benchmark",
      href: "/models",
      icon: LineChart,
      badge: null,
    },
    {
      label: "Analysis History",
      href: "/history",
      icon: History,
      badge: null,
    },
    {
      label: "Methodology",
      href: "/methodology",
      icon: BookOpen,
      badge: null,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-ws-sidebar border-r border-ws-border transition-all duration-200 ease-in-out ${
          collapsed ? "w-18" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        aria-label="Scientific Workstation Navigation"
      >
        {/* Branding Area */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-ws-border">
          <Link
            href="/"
            className={`flex items-center gap-2.5 transition-opacity overflow-hidden ${
              collapsed ? "justify-center w-full" : ""
            }`}
            title="NeuroVisionAI — Brain MRI Research Platform"
          >
            <div className="w-9 h-9 rounded-ws-sm bg-ws-action text-white flex items-center justify-center shrink-0 shadow-xs">
              <Brain className="w-5 h-5 text-white" />
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-ws-text text-base tracking-tight truncate">
                    NeuroVisionAI
                  </span>
                  <span className="px-1.5 py-0.2 rounded-xs bg-ws-accent/15 text-ws-accent text-[10px] font-mono font-semibold uppercase tracking-wider">
                    v1.0
                  </span>
                </div>
                <span className="text-[11px] text-ws-muted truncate leading-tight">
                  Research Workstation
                </span>
              </div>
            )}
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-ws-sm text-ws-muted hover:text-ws-text hover:bg-ws-hover"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
          {!collapsed && (
            <div className="px-2 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-ws-muted">
              Navigation
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-ws-sm text-xs font-medium transition-all ${
                  isActive
                    ? "bg-ws-action/10 text-ws-action font-semibold"
                    : "text-ws-text hover:bg-ws-hover hover:text-ws-action"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-ws-action rounded-r-full" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-ws-action" : "text-ws-muted group-hover:text-ws-action"
                  }`}
                />

                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono bg-ws-action/15 text-ws-action uppercase font-semibold">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for collapsed desktop view */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-ws-sm shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Architecture & Safety Summary Footer in Sidebar */}
        <div className="p-3 border-t border-ws-border">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="p-2.5 rounded-ws-sm bg-ws-bg border border-ws-border text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-ws-muted">
                  <span className="font-semibold text-ws-text flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-ws-action" />
                    Dual Architecture
                  </span>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">Strict</span>
                </div>
                <div className="text-[10px] text-ws-muted leading-tight">
                  ResNet-50 &bull; VGG-16 &bull; Grad-CAM
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded-ws-sm border border-amber-500/20">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Research Prototype Only</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                title="Models: ResNet-50 and VGG-16 strict mode verified"
              />
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 mt-2 py-1.5 text-xs text-ws-muted hover:text-ws-text hover:bg-ws-hover rounded-ws-sm border border-transparent transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[11px]">Collapse View</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
