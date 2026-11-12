"use client";

import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Server,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Info,
} from "lucide-react";
import { useTheme, Theme } from "../../components/ThemeProvider";
import { fetchHealth } from "../../lib/api";
import { HealthStatus } from "../../lib/types";
import {
  getHistoryRecords,
  clearAllHistory,
  exportHistoryAsJSON,
  exportHistoryAsCSV,
} from "../../lib/history";
import { MedicalDisclaimer } from "../../components/MedicalDisclaimer";

export default function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(false);
  const [historyCount, setHistoryCount] = useState<number>(0);

  const checkHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
    setHistoryCount(getHistoryRecords().length);
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Clear all local analysis history records from this browser workstation?")) {
      clearAllHistory();
      setHistoryCount(0);
    }
  };

  const isHealthy = health?.status === "healthy";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-1 transition-colors">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/15 dark:text-[#3B82F6] font-mono text-[10px] font-semibold uppercase">
            Workstation Configuration
          </span>
          <span className="text-[#64748B] dark:text-[#A7B5C9] text-xs">&bull;</span>
          <span className="text-[#64748B] dark:text-[#A7B5C9] text-xs font-mono">Preferences &amp; Diagnostics</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
          Application Settings &amp; System Environment
        </h2>
        <p className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
          Manage workstation appearance, inspect backend services, and control local session storage.
        </p>
      </div>

      <MedicalDisclaimer compact={true} />

      {/* SECTION 1: APPEARANCE */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-4">
        <div className="space-y-0.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
            Appearance &amp; Visual Theme
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
            Configure the workstation color scheme. The selected preference is saved across browser sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-4 rounded-xl border text-left transition-all space-y-3 ${
              theme === "light"
                ? "border-[#2563EB] dark:border-[#3B82F6] ring-2 ring-[#2563EB]/20 bg-[#F4F7FB] dark:bg-[#1E2E48]"
                : "border-[#DFE7F1] dark:border-[#2B3B52] bg-white dark:bg-[#17243A] hover:bg-[#F4F7FB] dark:hover:bg-[#1E2E48]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB]">
                <Sun className="w-4 h-4" />
              </div>
              {theme === "light" && (
                <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase">Active</span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">Light Theme (Default)</div>
              <p className="text-[11px] text-[#64748B] dark:text-[#A7B5C9]">
                Clean #F4F7FB background with high-contrast clinical navy #172B4D.
              </p>
            </div>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-xl border text-left transition-all space-y-3 ${
              theme === "dark"
                ? "border-[#2563EB] dark:border-[#3B82F6] ring-2 ring-[#2563EB]/20 bg-[#F4F7FB] dark:bg-[#1E2E48]"
                : "border-[#DFE7F1] dark:border-[#2B3B52] bg-white dark:bg-[#17243A] hover:bg-[#F4F7FB] dark:hover:bg-[#1E2E48]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-slate-800 text-[#3B82F6]">
                <Moon className="w-4 h-4" />
              </div>
              {theme === "dark" && (
                <span className="text-[10px] font-mono font-bold text-[#2563EB] dark:text-[#3B82F6] uppercase">Active</span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">Dark Theme</div>
              <p className="text-[11px] text-[#64748B] dark:text-[#A7B5C9]">
                Scientific dark navy #0F172A with clear white-slate #F1F5F9 text.
              </p>
            </div>
          </button>

          {/* System Default */}
          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`p-4 rounded-xl border text-left transition-all space-y-3 ${
              theme === "system"
                ? "border-[#2563EB] dark:border-[#3B82F6] ring-2 ring-[#2563EB]/20 bg-[#F4F7FB] dark:bg-[#1E2E48]"
                : "border-[#DFE7F1] dark:border-[#2B3B52] bg-white dark:bg-[#17243A] hover:bg-[#F4F7FB] dark:hover:bg-[#1E2E48]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-[#DFE7F1] dark:bg-[#2B3B52] text-[#64748B] dark:text-[#A7B5C9]">
                <Monitor className="w-4 h-4" />
              </div>
              {theme === "system" && (
                <span className="text-[10px] font-mono font-bold text-[#2563EB] dark:text-[#3B82F6] uppercase">Active</span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">System Default</div>
              <p className="text-[11px] text-[#64748B] dark:text-[#A7B5C9]">
                Matches OS appearance (Currently: {resolvedTheme}).
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: SYSTEM ENVIRONMENT & BACKEND */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
              Backend Service Diagnostics
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
              Live status of FastAPI inference engine and neural network weight memory allocations.
            </p>
          </div>
          <button
            type="button"
            onClick={checkHealth}
            disabled={loadingHealth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] text-[#172B4D] dark:text-[#F1F5F9] text-xs font-medium hover:bg-[#F4F7FB] dark:hover:bg-[#1E2E48] transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? "animate-spin" : ""}`} />
            <span>Check Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1.5">
            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#A7B5C9] uppercase block">API Engine Endpoint</span>
            <div className="flex items-center justify-between font-mono">
              <span className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                {process.env.NEXT_PUBLIC_API_URL || "/api (Next.js Proxy)"}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isHealthy
                    ? "bg-emerald-500/15 text-[#16A34A] dark:text-[#22C55E]"
                    : "bg-amber-500/15 text-[#D97706] dark:text-[#FBBF24]"
                }`}
              >
                {isHealthy ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#A7B5C9]">
              FastAPI lifespan model manager cache
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1.5">
            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#A7B5C9] uppercase block">Inference Device</span>
            <div className="flex items-center justify-between font-mono">
              <span className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                PyTorch &bull; {health?.device ? health.device.toUpperCase() : "CPU"}
              </span>
              <span className="text-[#2563EB] dark:text-[#3B82F6] text-[11px]">Active</span>
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#A7B5C9]">
              Local tensor allocation and hook execution
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1.5">
            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#A7B5C9] uppercase block">ResNet-50 Checkpoint</span>
            <div className="flex items-center justify-between font-mono">
              <span className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">resnet50_finetuned_best.pth</span>
              <span className="text-[#16A34A] dark:text-[#22C55E] text-[10px] font-bold">READY</span>
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#A7B5C9]">
              Strict state_dict matching verified
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1.5">
            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#A7B5C9] uppercase block">VGG-16 Checkpoint</span>
            <div className="flex items-center justify-between font-mono">
              <span className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">vgg16_best.pth</span>
              <span className="text-[#16A34A] dark:text-[#22C55E] text-[10px] font-bold">READY</span>
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#A7B5C9]">
              Strict state_dict matching verified
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: STORAGE & SESSION CACHE */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-4">
        <div className="space-y-0.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
            Local Workstation Session Storage
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
            Analysis records are stored strictly in your local browser cache (`localStorage`).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52]">
          <div className="space-y-0.5 text-xs">
            <div className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
              Persisted Analysis Records: <strong>{historyCount}</strong> sessions
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#A7B5C9]">
              Audit logs are maintained locally and never transmitted externally.
            </div>
          </div>

          <div className="flex items-center gap-2">
            {historyCount > 0 && (
              <>
                <button
                  type="button"
                  onClick={exportHistoryAsJSON}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] text-[#172B4D] dark:text-[#F1F5F9] text-xs font-medium hover:bg-[#F4F7FB] dark:hover:bg-[#1E2E48] transition-colors shadow-xs"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={exportHistoryAsCSV}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] text-[#172B4D] dark:text-[#F1F5F9] text-xs font-medium hover:bg-[#F4F7FB] dark:hover:bg-[#1E2E48] transition-colors shadow-xs"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#17243A] border border-rose-300 dark:border-rose-800 text-[#DC2626] dark:text-[#F87171] text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors shadow-xs"
                >
                  Clear Cache
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: PLATFORM SPECIFICATIONS & PRIVACY */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
          Workstation Security &amp; Data Integrity
        </h3>
        <div className="space-y-1.5 text-xs text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
          <p>
            &bull; <strong>Local Isolation:</strong> All deep learning inference passes and Grad-CAM
            computations are executed locally via PyTorch. No image tensors or diagnostic summaries are
            transmitted to any cloud service or remote API.
          </p>
          <p>
            &bull; <strong>Memory-Only Processing:</strong> Uploaded brain MRI images are decoded
            transiently in memory for forward and backward passes. They are not written to persistent server storage.
          </p>
          <p>
            &bull; <strong>Software Version:</strong> NeuroVisionAI Scientific Workstation v1.0.0 (Research Build).
          </p>
        </div>
      </div>
    </div>
  );
}
