"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Database,
  Layers,
} from "lucide-react";
import { fetchHealth } from "../lib/api";
import { HealthStatus } from "../lib/types";
import { ThemeToggle } from "./ThemeToggle";

interface AppHeaderProps {
  onMobileMenuToggle: () => void;
}

const PAGE_META: Record<string, { title: string; category: string }> = {
  "/": { title: "Research Dashboard", category: "Overview" },
  "/analysis": { title: "MRI Analysis Workspace", category: "Inference & XAI" },
  "/models": { title: "Model Benchmark & Performance", category: "Evaluation" },
  "/history": { title: "Analysis History", category: "Session Logs" },
  "/methodology": { title: "Research Methodology", category: "Documentation" },
  "/about": { title: "Research Methodology", category: "Documentation" },
  "/settings": { title: "Application Settings", category: "Configuration" },
};

export const AppHeader: React.FC<AppHeaderProps> = ({ onMobileMenuToggle }) => {
  const pathname = usePathname();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const checkStatus = async () => {
    setLoadingHealth(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
      if (data.status === "healthy") {
        setErrorDetails(null);
      } else {
        setErrorDetails("Backend reported non-healthy state");
      }
    } catch (err: unknown) {
      setHealth(null);
      setErrorDetails(err instanceof Error ? err.message : "Connection failed to backend API engine");
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 20000);
    return () => clearInterval(interval);
  }, []);

  const meta = PAGE_META[pathname] || { title: "NeuroVisionAI Workstation", category: "Platform" };
  const isHealthy = health?.status === "healthy";
  const resnetOk = health?.models_loaded?.resnet50 ?? false;
  const vggOk = health?.models_loaded?.vgg16 ?? false;
  const modelsReady = resnetOk && vggOk;

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-ws-border bg-ws-header backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger + Page Title + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-ws-sm text-ws-muted hover:text-ws-text hover:bg-ws-hover focus:outline-hidden"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-ws-muted">
            <span>Workstation</span>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className="truncate">{meta.category}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-ws-text tracking-tight truncate leading-tight">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Right: Analytical Status Badges + Theme Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Device Indicator */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-ws-sm bg-ws-card border border-ws-border text-[11px] font-mono text-ws-text shadow-ws"
          title={`Compute Accelerator: ${health?.device || "CPU"} for local PyTorch tensors`}
        >
          <Cpu className="w-3.5 h-3.5 text-ws-action" />
          <span className="uppercase text-[10px] font-semibold tracking-wider text-ws-muted">
            {health?.device || "CPU"}
          </span>
        </div>

        {/* Model Availability Indicator */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-ws-sm bg-ws-card border border-ws-border text-[11px] text-ws-text shadow-ws"
          title={
            modelsReady
              ? "Both ResNet-50 & VGG-16 checkpoints are verified and resident in memory"
              : "Models are loading or missing from backend/models"
          }
        >
          <Layers className="w-3.5 h-3.5 text-ws-action" />
          <span className="text-[11px] font-medium hidden lg:inline">Models:</span>
          {modelsReady ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ResNet50 + VGG16
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              {loadingHealth ? "Validating..." : "Partial"}
            </span>
          )}
        </div>

        {/* Backend Connection Indicator with Refresh Button */}
        <div className="flex items-center">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-ws-sm border text-[11px] font-medium shadow-ws transition-colors ${
              isHealthy
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
            }`}
            title={
              isHealthy
                ? "FastAPI backend reachable and operational"
                : `Backend offline or unreachable (${errorDetails || "checking..."}). Ensure FastAPI backend server is running.`
            }
          >
            {isHealthy ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Engine Online</span>
                <span className="sm:hidden">Online</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{loadingHealth ? "Connecting" : "Offline"}</span>
              </>
            )}

            <button
              onClick={checkStatus}
              className="ml-1 p-0.5 hover:opacity-80 transition-opacity"
              title="Refresh connection status"
              aria-label="Refresh backend status"
            >
              <RefreshCw className={`w-3 h-3 ${loadingHealth ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Theme Switcher Toggle */}
        <ThemeToggle showLabel={false} />
      </div>
    </header>
  );
};
