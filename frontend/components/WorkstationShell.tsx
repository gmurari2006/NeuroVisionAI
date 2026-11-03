"use client";

import React, { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Footer } from "./Footer";

export const WorkstationShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collapsed, setCollapsedState] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Read saved collapsed preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("neurovision_sidebar_collapsed");
      if (saved !== null) {
        setCollapsedState(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const setCollapsed = (val: boolean) => {
    setCollapsedState(val);
    try {
      localStorage.setItem("neurovision_sidebar_collapsed", String(val));
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-ws-bg text-ws-text flex transition-colors">
      {/* Persistent Left Sidebar */}
      <AppSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          collapsed ? "lg:pl-18" : "lg:pl-64"
        }`}
      >
        <AppHeader onMobileMenuToggle={() => setMobileOpen(true)} />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};
