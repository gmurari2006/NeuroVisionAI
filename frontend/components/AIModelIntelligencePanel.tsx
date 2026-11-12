"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Brain,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Sparkles,
  Zap,
  Clock,
  Server,
  BarChart2,
} from "lucide-react";
import { fetchHealth } from "../lib/api";
import { HealthStatus } from "../lib/types";
import { getHistoryRecords } from "../lib/history";

export interface AIModelIntelligencePanelProps {
  selectedModel: "both" | "resnet50" | "vgg16";
  activeCamModel?: "resnet50" | "vgg16";
  loading: boolean;
  isAnalyzed: boolean;
  lastAnalysisTimestamp?: string | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AIModelIntelligencePanel: React.FC<AIModelIntelligencePanelProps> = ({
  selectedModel,
  activeCamModel = "resnet50",
  loading,
  isAnalyzed,
  lastAnalysisTimestamp,
  collapsed = false,
  onToggleCollapse,
}) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(false);
  const [totalAnalyses, setTotalAnalyses] = useState<number>(0);

  const checkStatus = async () => {
    setCheckingHealth(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setCheckingHealth(false);
    }
  };

  const updateHistoryCount = () => {
    try {
      const recs = getHistoryRecords();
      setTotalAnalyses(recs.length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    checkStatus();
    updateHistoryCount();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAnalyzed) {
      updateHistoryCount();
    }
  }, [isAnalyzed]);

  const isHealthy = health?.status === "healthy";
  const resnetLoaded = health?.models_loaded?.resnet50 ?? false;
  const vggLoaded = health?.models_loaded?.vgg16 ?? false;
  const computeDevice = (health?.device || "cpu").toUpperCase();

  if (collapsed) {
    return (
      <div className="w-10 flex flex-col items-center py-4 bg-white dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] rounded-xl shadow-xs transition-all">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[#64748B] dark:text-[#A7B5C9] hover:text-[#17365D] dark:hover:text-[#3B82F6] hover:bg-[#F4F7FB] dark:hover:bg-[#17243A] transition-colors"
          title="Expand Model Intelligence"
          aria-label="Expand Model Intelligence"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="mt-8 [writing-mode:vertical-rl] rotate-180 text-xs font-bold tracking-wider uppercase text-[#64748B] dark:text-[#A7B5C9] flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 rotate-90 text-[#0D9488] dark:text-[#2DD4BF]" />
          <span>AI Intelligence</span>
        </div>
      </div>
    );
  }

  return (
    <aside
      className="w-full lg:w-[280px] shrink-0 bg-white dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] rounded-xl shadow-xs p-3.5 space-y-3 text-xs transition-colors flex flex-col"
      aria-label="AI Model Intelligence Panel"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#DFE7F1] dark:border-[#2B3B52]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#0D9488]/10 dark:bg-[#2DD4BF]/15 text-[#0D9488] dark:text-[#2DD4BF] flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-[#172B4D] dark:text-[#F1F5F9] text-xs truncate leading-tight">
              AI Intelligence
            </h2>
            <p className="text-[10px] text-[#64748B] dark:text-[#A7B5C9] truncate">
              Models &bull; Metrics &bull; XAI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={checkStatus}
            disabled={checkingHealth}
            className="p-1 rounded text-[#64748B] dark:text-[#A7B5C9] hover:text-[#172B4D] dark:hover:text-[#F1F5F9] hover:bg-[#F4F7FB] dark:hover:bg-[#17243A] transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? "animate-spin" : ""}`} />
          </button>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1 rounded text-[#64748B] dark:text-[#A7B5C9] hover:text-[#172B4D] dark:hover:text-[#F1F5F9] hover:bg-[#F4F7FB] dark:hover:bg-[#17243A] transition-colors"
              title="Collapse AI Intelligence Panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 1. BACKEND STATUS */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] block">
          Backend Status
        </span>
        <div className="p-2.5 rounded-lg bg-[#F4F7FB] dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">FastAPI Gateway:</span>
            <span className="font-semibold flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isHealthy ? "bg-[#16A34A]" : "bg-[#D97706] animate-pulse"
                }`}
              />
              <span className={isHealthy ? "text-[#16A34A] dark:text-[#22C55E]" : "text-[#D97706]"}>
                {isHealthy ? "Connected" : "Offline"}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">Compute Device:</span>
            <span className="font-mono font-bold text-[#172B4D] dark:text-[#F1F5F9] px-1.5 py-0.5 rounded bg-white dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] text-[10px]">
              {computeDevice}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">ResNet-50 Status:</span>
            <span className="font-medium text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-1">
              {resnetLoaded ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A] dark:text-[#22C55E]" />
                  <span>Loaded</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-[#D97706]" />
                  <span>Standby</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">VGG-16 Status:</span>
            <span className="font-medium text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-1">
              {vggLoaded ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A] dark:text-[#22C55E]" />
                  <span>Loaded</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-[#D97706]" />
                  <span>Standby</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 2. MODEL PERFORMANCE (COMPACT COMPARISON ROWS) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9]">
            Model Benchmarks (Test N=1,600)
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#F4F7FB] dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-2 text-[10.5px]">
          {/* Header row */}
          <div className="grid grid-cols-3 font-bold text-[#64748B] dark:text-[#A7B5C9] text-[10px] pb-1 border-b border-[#DFE7F1] dark:border-[#2B3B52]">
            <span>Metric</span>
            <span className="text-center text-[#17365D] dark:text-[#3B82F6]">ResNet-50</span>
            <span className="text-right text-[#0D9488] dark:text-[#2DD4BF]">VGG-16</span>
          </div>

          {/* Test Accuracy */}
          <div className="grid grid-cols-3 items-center">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">Test Acc:</span>
            <span className="font-mono font-bold text-center text-[#172B4D] dark:text-[#F1F5F9]">91.06%</span>
            <span className="font-mono font-bold text-right text-[#172B4D] dark:text-[#F1F5F9]">91.63%</span>
          </div>

          {/* Macro F1 */}
          <div className="grid grid-cols-3 items-center">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">Macro F1:</span>
            <span className="font-mono text-center text-[#172B4D] dark:text-[#F1F5F9]">90.82%</span>
            <span className="font-mono text-right text-[#172B4D] dark:text-[#F1F5F9]">91.37%</span>
          </div>

          {/* Latency */}
          <div className="grid grid-cols-3 items-center">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">Latency:</span>
            <span className="font-mono text-center text-[#172B4D] dark:text-[#F1F5F9]">424 ms</span>
            <span className="font-mono text-right text-[#172B4D] dark:text-[#F1F5F9]">893 ms</span>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-3 items-center">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">Params:</span>
            <span className="font-mono text-center text-[#172B4D] dark:text-[#F1F5F9]">23.5M</span>
            <span className="font-mono text-right text-[#172B4D] dark:text-[#F1F5F9]">134.3M</span>
          </div>

          {/* Architecture */}
          <div className="grid grid-cols-3 items-center pt-1 border-t border-[#DFE7F1] dark:border-[#2B3B52] text-[10px]">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">Layers:</span>
            <span className="text-center font-medium text-[#172B4D] dark:text-[#F1F5F9]">Residual 50</span>
            <span className="text-right font-medium text-[#172B4D] dark:text-[#F1F5F9]">ConvNet 16</span>
          </div>

          <div className="text-[9.5px] text-[#64748B] dark:text-[#A7B5C9] pt-0.5 leading-tight">
            Independent test split: McNemar p=0.380 (no significant difference).
          </div>
        </div>
      </div>

      {/* 3. EXPLAINABILITY (GRAD-CAM) */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] block">
          Explainability (Grad-CAM)
        </span>
        <div className="p-2.5 rounded-lg bg-[#F4F7FB] dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">Grad-CAM Status:</span>
            <span className="font-semibold text-[#16A34A] dark:text-[#22C55E] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Active</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">Active Model:</span>
            <span className="font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
              {activeCamModel === "resnet50" ? "ResNet-50" : "VGG-16"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">Target Layer:</span>
            <span className="font-mono text-[10px] text-[#0D9488] dark:text-[#2DD4BF] font-bold">
              {activeCamModel === "resnet50" ? "layer4[2].conv3" : "features[28]"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">Colormap:</span>
            <span className="text-[10px] font-medium text-[#172B4D] dark:text-[#F1F5F9]">
              JET (Heat Intensity)
            </span>
          </div>
        </div>
      </div>

      {/* 4. SESSION SUMMARY */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] block">
          Session Summary
        </span>
        <div className="p-2.5 rounded-lg bg-[#F4F7FB] dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">Total Analyses:</span>
            <span className="font-mono font-bold text-[#172B4D] dark:text-[#F1F5F9]">
              {totalAnalyses} {totalAnalyses === 1 ? "scan" : "scans"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">Last Analysis:</span>
            <span className="font-mono text-[#172B4D] dark:text-[#F1F5F9]">
              {lastAnalysisTimestamp || "--:--"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B] dark:text-[#A7B5C9]">Session Status:</span>
            <span
              className={`font-semibold ${
                loading
                  ? "text-[#D97706] animate-pulse"
                  : isAnalyzed
                  ? "text-[#16A34A] dark:text-[#22C55E]"
                  : "text-[#64748B] dark:text-[#A7B5C9]"
              }`}
            >
              {loading ? "Inferring..." : isAnalyzed ? "Complete" : "Ready"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
