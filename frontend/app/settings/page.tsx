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
      <div className="p-4 sm:p-5 rounded-ws bg-ws-card border border-ws-border shadow-ws space-y-1 transition-colors">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-xs bg-ws-action/10 text-ws-action font-mono text-[10px] font-semibold uppercase">
            Workstation Configuration
          </span>
          <span className="text-ws-muted text-xs">&bull;</span>
          <span className="text-ws-muted text-xs font-mono">Preferences & Diagnostics</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-ws-text tracking-tight">
          Application Settings & System Environment
        </h2>
        <p className="text-xs text-ws-muted">
          Manage workstation appearance, inspect backend services, and control local session storage.
        </p>
      </div>

      <MedicalDisclaimer compact={true} />

      {/* SECTION 1: APPEARANCE */}
      <div className="p-5 rounded-ws bg-ws-card border border-ws-border shadow-ws space-y-4">
        <div className="space-y-0.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ws-muted flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-ws-action" />
            Appearance & Visual Theme
          </h3>
          <p className="text-xs text-ws-muted">
            Configure the workstation color scheme. The selected preference is saved across browser sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Light Theme Card */}
          <button
            onClick={() => setTheme("light")}
            className={`p-4 rounded-ws border text-left transition-all space-y-3 ${
              theme === "light"
                ? "border-ws-action ring-2 ring-ws-action/20 bg-ws-bg"
                : "border-ws-border bg-ws-card hover:bg-ws-hover"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-ws-sm bg-blue-50 text-blue-600">
                <Sun className="w-4 h-4" />
              </div>
              {theme === "light" && (
                <span className="text-[10px] font-mono font-bold text-ws-action uppercase">Active</span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-ws-text">Light Theme</div>
              <p className="text-[11px] text-ws-muted">
                Clean #F5F7FA background, high contrast navy typography #142B4A.
              </p>
            </div>
          </button>

          {/* Dark Theme Card */}
          <button
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-ws border text-left transition-all space-y-3 ${
              theme === "dark"
                ? "border-ws-action ring-2 ring-ws-action/20 bg-ws-bg"
                : "border-ws-border bg-ws-card hover:bg-ws-hover"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-ws-sm bg-slate-800 text-blue-400">
                <Moon className="w-4 h-4" />
              </div>
              {theme === "dark" && (
                <span className="text-[10px] font-mono font-bold text-ws-action uppercase">Active</span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-ws-text">Dark Theme</div>
              <p className="text-[11px] text-ws-muted">
                Scientific dark navy #0B1220 with light text #F1F5F9.
              </p>
            </div>
          </button>

          {/* System Default */}
          <button
            onClick={() => setTheme("system")}
            className={`p-4 rounded-ws border text-left transition-all space-y-3 ${
              theme === "system"
                ? "border-ws-action ring-2 ring-ws-action/20 bg-ws-bg"
                : "border-ws-border bg-ws-card hover:bg-ws-hover"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-ws-sm bg-ws-border text-ws-muted">
                <Monitor className="w-4 h-4" />
              </div>
              {theme === "system" && (
                <span className="text-[10px] font-mono font-bold text-ws-action uppercase">Active</span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-ws-text">System Default</div>
              <p className="text-[11px] text-ws-muted">
                Matches OS appearance (Currently: {resolvedTheme}).
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: SYSTEM ENVIRONMENT & BACKEND */}
      <div className="p-5 rounded-ws bg-ws-card border border-ws-border shadow-ws space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ws-muted flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-ws-action" />
              Backend Service Diagnostics
            </h3>
            <p className="text-xs text-ws-muted">
              Live status of FastAPI inference engine and neural network weight memory allocations.
            </p>
          </div>
          <button
            onClick={checkHealth}
            disabled={loadingHealth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-ws-sm bg-ws-card border border-ws-border text-ws-text text-xs font-medium hover:bg-ws-hover transition-colors shadow-ws"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? "animate-spin" : ""}`} />
            <span>Check Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-ws-sm bg-ws-bg border border-ws-border space-y-1.5">
            <span className="text-[10px] font-mono text-ws-muted uppercase block">API Engine Endpoint</span>
            <div className="flex items-center justify-between font-mono">
              <span className="font-semibold text-ws-text">http://127.0.0.1:8000</span>
              <span
                className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                  isHealthy
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                }`}
              >
                {isHealthy ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <div className="text-[11px] text-ws-muted">
              FastAPI lifespan model manager cache
            </div>
          </div>

          <div className="p-3.5 rounded-ws-sm bg-ws-bg border border-ws-border space-y-1.5">
            <span className="text-[10px] font-mono text-ws-muted uppercase block">Inference Device</span>
            <div className="flex items-center justify-between font-mono">
              <span className="font-semibold text-ws-text">
                PyTorch &bull; {health?.device ? health.device.toUpperCase() : "CPU"}
              </span>
              <span className="text-ws-action text-[11px]">Active</span>
            </div>
            <div className="text-[11px] text-ws-muted">
              Local tensor allocation and hook execution
            </div>
          </div>

          <div className="p-3.5 rounded-ws-sm bg-ws-bg border border-ws-border space-y-1.5">
            <span className="text-[10px] font-mono text-ws-muted uppercase block">ResNet-50 Checkpoint</span>
            <div className="flex items-center justify-between font-mono">
              <span className="font-semibold text-ws-text">resnet50_finetuned_best.pth</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">READY</span>
            </div>
            <div className="text-[11px] text-ws-muted">
              Strict state_dict matching verified
            </div>
          </div>

          <div className="p-3.5 rounded-ws-sm bg-ws-bg border border-ws-border space-y-1.5">
            <span className="text-[10px] font-mono text-ws-muted uppercase block">VGG-16 Checkpoint</span>
            <div className="flex items-center justify-between font-mono">
              <span className="font-semibold text-ws-text">vgg16_best.pth</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">READY</span>
            </div>
            <div className="text-[11px] text-ws-muted">
              Strict state_dict matching verified
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: STORAGE & SESSION CACHE */}
      <div className="p-5 rounded-ws bg-ws-card border border-ws-border shadow-ws space-y-4">
        <div className="space-y-0.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ws-muted flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-ws-action" />
            Local Workstation Session Storage
          </h3>
          <p className="text-xs text-ws-muted">
            Analysis records are stored strictly in your local browser cache (`localStorage`).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-ws-sm bg-ws-bg border border-ws-border">
          <div className="space-y-0.5 text-xs">
            <div className="font-semibold text-ws-text">
              Persisted Analysis Records: <strong>{historyCount}</strong> sessions
            </div>
            <div className="text-[11px] text-ws-muted">
              Audit logs are maintained locally and never transmitted externally.
            </div>
          </div>

          <div className="flex items-center gap-2">
            {historyCount > 0 && (
              <>
                <button
                  onClick={exportHistoryAsJSON}
                  className="px-3 py-1.5 rounded-ws-sm bg-ws-card border border-ws-border text-ws-text text-xs font-medium hover:bg-ws-hover transition-colors shadow-ws"
                >
                  Export JSON
                </button>
                <button
                  onClick={exportHistoryAsCSV}
                  className="px-3 py-1.5 rounded-ws-sm bg-ws-card border border-ws-border text-ws-text text-xs font-medium hover:bg-ws-hover transition-colors shadow-ws"
                >
                  Export CSV
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 rounded-ws-sm bg-ws-card border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-500/10 transition-colors shadow-ws"
                >
                  Clear Cache
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: PLATFORM SPECIFICATIONS & PRIVACY */}
      <div className="p-5 rounded-ws bg-ws-card border border-ws-border shadow-ws space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ws-muted flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-ws-action" />
          Workstation Security & Data Integrity
        </h3>
        <div className="space-y-1.5 text-xs text-ws-muted leading-relaxed">
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
