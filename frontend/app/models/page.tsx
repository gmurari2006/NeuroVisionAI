"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Brain,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Zap,
  Table as TableIcon,
  ArrowRight,
  ShieldAlert,
  Activity,
  Maximize2,
  Clock,
  HardDrive,
  FileCheck2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MedicalDisclaimer } from "../../components/MedicalDisclaimer";
import { useTheme } from "../../components/ThemeProvider";

// Verified independent test set benchmark results (N = 1,600 independent scans)
const INDEPENDENT_TEST_METRICS = {
  resnet50: {
    name: "Fine-Tuned ResNet-50",
    architecture: "Residual Network (50 layers)",
    accuracy: 91.06,
    precision: 91.65,
    recall: 91.06,
    f1: 90.82,
    roc_auc: 0.9803,
    latency_ms: 424.4,
    parameters: "23.51 M",
    best_epoch: 8,
    per_class: {
      glioma: { precision: 98.02, recall: 74.25, f1: 84.5, specificity: 99.5, support: 400 },
      meningioma: { precision: 84.95, recall: 91.75, f1: 88.22, specificity: 94.58, support: 400 },
      notumor: { precision: 88.47, recall: 99.75, f1: 93.77, specificity: 95.67, support: 400 },
      pituitary: { precision: 95.17, recall: 98.5, f1: 96.81, specificity: 98.33, support: 400 },
    },
    confusion_matrix: [
      [297, 59, 36, 8],
      [5, 367, 16, 12],
      [0, 1, 399, 0],
      [1, 5, 0, 394],
    ],
  },
  vgg16: {
    name: "Deep VGG-16",
    architecture: "Visual Geometry Group (16 layers + 2-stage MLP)",
    accuracy: 91.63,
    precision: 92.37,
    recall: 91.63,
    f1: 91.37,
    roc_auc: 0.9791,
    latency_ms: 893.0,
    parameters: "134.27 M",
    best_epoch: 8,
    per_class: {
      glioma: { precision: 98.31, recall: 72.75, f1: 83.62, specificity: 99.58, support: 400 },
      meningioma: { precision: 82.35, recall: 94.5, f1: 88.01, specificity: 93.25, support: 400 },
      notumor: { precision: 91.72, recall: 99.75, f1: 95.57, specificity: 97.0, support: 400 },
      pituitary: { precision: 97.07, recall: 99.5, f1: 98.27, specificity: 99.0, support: 400 },
    },
    confusion_matrix: [
      [291, 79, 26, 4],
      [4, 378, 10, 8],
      [1, 0, 399, 0],
      [0, 2, 0, 398],
    ],
  },
  statistical_comparison: {
    mcnemar_chi2: 0.7711,
    p_value: 0.3799,
    is_significant: false,
    agreement_rate: 93.06,
    both_correct: 88.75,
    either_correct: 93.94,
    both_failed: 6.06,
    test_samples: 1600,
  },
};

const CLASS_LABELS = ["Glioma", "Meningioma", "No Tumor", "Pituitary"];

// Preserved historical training trajectories
const HISTORICAL_EPOCHS = [
  { epoch: 1, res_val_f1: 91.65, vgg_val_f1: 92.34, res_val_acc: 91.61, vgg_val_acc: 92.41, res_loss: 0.2427, vgg_loss: 0.1863 },
  { epoch: 2, res_val_f1: 92.21, vgg_val_f1: 93.81, res_val_acc: 92.23, vgg_val_acc: 93.75, res_loss: 0.2153, vgg_loss: 0.1628 },
  { epoch: 3, res_val_f1: 92.97, vgg_val_f1: 93.33, res_val_acc: 93.04, vgg_val_acc: 93.21, res_loss: 0.1948, vgg_loss: 0.1530 },
  { epoch: 4, res_val_f1: 93.83, vgg_val_f1: 94.79, res_val_acc: 93.84, vgg_val_acc: 94.82, res_loss: 0.1747, vgg_loss: 0.1285 },
  { epoch: 5, res_val_f1: 94.03, vgg_val_f1: 94.02, res_val_acc: 94.02, vgg_val_acc: 94.11, res_loss: 0.1670, vgg_loss: 0.1580 },
  { epoch: 6, res_val_f1: 93.41, vgg_val_f1: 95.73, res_val_acc: 93.39, vgg_val_acc: 95.71, res_loss: 0.1892, vgg_loss: 0.1207 },
  { epoch: 7, res_val_f1: 94.90, vgg_val_f1: 95.54, res_val_acc: 94.91, vgg_val_acc: 95.54, res_loss: 0.1470, vgg_loss: 0.1122 },
  { epoch: 8, res_val_f1: 95.71, vgg_val_f1: 95.98, res_val_acc: 95.71, vgg_val_acc: 95.98, res_loss: 0.1280, vgg_loss: 0.1063 },
];

export default function ModelComparisonPage() {
  const { resolvedTheme } = useTheme();
  const [activeMetricTab, setActiveMetricTab] = useState<"f1" | "accuracy" | "loss">("f1");

  const isDark = resolvedTheme === "dark";
  const gridColor = isDark ? "#2B3B52" : "#DFE7F1";
  const textColor = isDark ? "#A7B5C9" : "#64748B";
  const resnetColor = isDark ? "#3B82F6" : "#2563EB";
  const vggColor = isDark ? "#2DD4BF" : "#0D9488";

  const res = INDEPENDENT_TEST_METRICS.resnet50;
  const vgg = INDEPENDENT_TEST_METRICS.vgg16;
  const stats = INDEPENDENT_TEST_METRICS.statistical_comparison;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-3 transition-colors">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#3B82F6] text-xs font-bold border border-[#DFE7F1] dark:border-[#2B3B52]">
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Independent Test-Set Evaluation Results (Held-Out N = 1,600 Scans)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
          Model Performance & Comparison
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#A7B5C9] max-w-4xl leading-relaxed">
          Scientific benchmark comparing <strong>ResNet-50</strong> and <strong>VGG-16</strong> on an independent, non-leaked testing dataset of 1,600 brain MRI scans across all four diagnostic categories.
        </p>
      </div>

      <MedicalDisclaimer />

      {/* Primary KPI Grid (Independent Test Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] block">
            ResNet-50 Test Acc
          </span>
          <div className="text-3xl font-extrabold text-[#2563EB] dark:text-[#3B82F6]">
            {res.accuracy.toFixed(2)}%
          </div>
          <span className="text-[11px] text-[#64748B] dark:text-[#A7B5C9] block">
            Macro F1: <strong>{res.f1.toFixed(2)}%</strong> &bull; AUC: 0.9803
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] block">
            VGG-16 Test Acc
          </span>
          <div className="text-3xl font-extrabold text-[#0D9488] dark:text-[#2DD4BF]">
            {vgg.accuracy.toFixed(2)}%
          </div>
          <span className="text-[11px] text-[#64748B] dark:text-[#A7B5C9] block">
            Macro F1: <strong>{vgg.f1.toFixed(2)}%</strong> &bull; AUC: 0.9791
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] block">
            Model Agreement
          </span>
          <div className="text-3xl font-extrabold text-[#172B4D] dark:text-[#F1F5F9]">
            {stats.agreement_rate.toFixed(1)}%
          </div>
          <span className="text-[11px] text-[#64748B] dark:text-[#A7B5C9] block">
            Both Agree on 1,489 / 1,600 Scans
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] block">
            McNemar Test
          </span>
          <div className="text-3xl font-extrabold text-[#172B4D] dark:text-[#F1F5F9]">
            p = 0.380
          </div>
          <span className="text-[11px] text-[#64748B] dark:text-[#A7B5C9] block">
            Difference Not Statistically Significant
          </span>
        </div>
      </div>

      {/* SECTION 1: GLOBAL BENCHMARK METRIC TABLE */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DFE7F1] dark:border-[#2B3B52]">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
              Independent Testing Split Evaluation (N = 1,600)
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
              Evaluated on frozen weights using independent held-out data. Validation metrics from training are strictly excluded.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#DFE7F1] dark:border-[#2B3B52] text-[#64748B] dark:text-[#A7B5C9] font-bold uppercase">
                <th className="py-3 px-3">Metric Description</th>
                <th className="py-3 px-3 text-[#2563EB] dark:text-[#3B82F6]">ResNet-50</th>
                <th className="py-3 px-3 text-[#0D9488] dark:text-[#2DD4BF]">VGG-16</th>
                <th className="py-3 px-3">Delta (VGG - ResNet)</th>
                <th className="py-3 px-3">Practical Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE7F1] dark:divide-[#2B3B52]">
              <tr className="hover:bg-[#F4F7FB] dark:hover:bg-[#111C30]/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-[#172B4D] dark:text-[#F1F5F9]">Overall Accuracy</td>
                <td className="py-2.5 px-3 font-bold text-[#2563EB] dark:text-[#3B82F6]">{res.accuracy.toFixed(2)}%</td>
                <td className="py-2.5 px-3 font-bold text-[#0D9488] dark:text-[#2DD4BF]">{vgg.accuracy.toFixed(2)}%</td>
                <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">+0.57%</td>
                <td className="py-2.5 px-3 text-[#64748B] dark:text-[#A7B5C9]">Marginal (+9 of 1,600 images)</td>
              </tr>
              <tr className="hover:bg-[#F4F7FB] dark:hover:bg-[#111C30]/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-[#172B4D] dark:text-[#F1F5F9]">Macro Precision</td>
                <td className="py-2.5 px-3 font-mono">{res.precision.toFixed(2)}%</td>
                <td className="py-2.5 px-3 font-mono">{vgg.precision.toFixed(2)}%</td>
                <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">+0.72%</td>
                <td className="py-2.5 px-3 text-[#64748B] dark:text-[#A7B5C9]">Comparable class confidence</td>
              </tr>
              <tr className="hover:bg-[#F4F7FB] dark:hover:bg-[#111C30]/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-[#172B4D] dark:text-[#F1F5F9]">Macro Recall (Sensitivity)</td>
                <td className="py-2.5 px-3 font-mono">{res.recall.toFixed(2)}%</td>
                <td className="py-2.5 px-3 font-mono">{vgg.recall.toFixed(2)}%</td>
                <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">+0.57%</td>
                <td className="py-2.5 px-3 text-[#64748B] dark:text-[#A7B5C9]">Equivalent sensitivity overall</td>
              </tr>
              <tr className="hover:bg-[#F4F7FB] dark:hover:bg-[#111C30]/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-[#172B4D] dark:text-[#F1F5F9]">Macro F1-Score</td>
                <td className="py-2.5 px-3 font-bold text-[#2563EB] dark:text-[#3B82F6]">{res.f1.toFixed(2)}%</td>
                <td className="py-2.5 px-3 font-bold text-[#0D9488] dark:text-[#2DD4BF]">{vgg.f1.toFixed(2)}%</td>
                <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">+0.55%</td>
                <td className="py-2.5 px-3 text-[#64748B] dark:text-[#A7B5C9]">Harmonic balance identical</td>
              </tr>
              <tr className="hover:bg-[#F4F7FB] dark:hover:bg-[#111C30]/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-[#172B4D] dark:text-[#F1F5F9]">Macro ROC-AUC</td>
                <td className="py-2.5 px-3 font-mono">{res.roc_auc.toFixed(4)}</td>
                <td className="py-2.5 px-3 font-mono">{vgg.roc_auc.toFixed(4)}</td>
                <td className="py-2.5 px-3 font-mono text-rose-600 dark:text-rose-400">-0.0012</td>
                <td className="py-2.5 px-3 text-[#64748B] dark:text-[#A7B5C9]">Both models exhibit high separation</td>
              </tr>
              <tr className="hover:bg-[#F4F7FB] dark:hover:bg-[#111C30]/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-[#172B4D] dark:text-[#F1F5F9]">CPU Inference Latency</td>
                <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">{res.latency_ms} ms</td>
                <td className="py-2.5 px-3 font-mono text-[#64748B] dark:text-[#A7B5C9]">{vgg.latency_ms} ms</td>
                <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">-468.6 ms</td>
                <td className="py-2.5 px-3 font-bold text-emerald-700 dark:text-emerald-400">ResNet is 2.1x faster</td>
              </tr>
              <tr className="hover:bg-[#F4F7FB] dark:hover:bg-[#111C30]/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-[#172B4D] dark:text-[#F1F5F9]">Parameter Count</td>
                <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">{res.parameters}</td>
                <td className="py-2.5 px-3 font-mono text-[#64748B] dark:text-[#A7B5C9]">{vgg.parameters}</td>
                <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">-110.76 M</td>
                <td className="py-2.5 px-3 font-bold text-emerald-700 dark:text-emerald-400">ResNet is 5.7x smaller</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: SIDE-BY-SIDE CONFUSION MATRICES */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DFE7F1] dark:border-[#2B3B52]">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
              Side-by-Side Confusion Matrices (Independent Test Set, N = 1,600)
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
              Ground truth rows vs. predicted columns. Exactly 400 test scans per class.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] text-[#64748B] dark:text-[#A7B5C9]">
            400 Scans / Class
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Matrix 1: ResNet-50 */}
          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm text-[#2563EB] dark:text-[#3B82F6] flex items-center gap-1.5">
                <Brain className="w-4 h-4" />
                <span>ResNet-50 (Accuracy: 91.06%)</span>
              </div>
              <span className="text-[11px] text-[#64748B] dark:text-[#A7B5C9]">1,457 / 1,600 Correct</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="text-[11px] text-[#64748B] dark:text-[#A7B5C9] border-b border-[#DFE7F1] dark:border-[#2B3B52]">
                    <th className="py-2 text-left font-semibold">True \ Pred</th>
                    {CLASS_LABELS.map((c) => (
                      <th key={c} className="py-2 px-1 font-bold">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE7F1] dark:divide-[#2B3B52] font-mono">
                  {res.confusion_matrix.map((row, i) => (
                    <tr key={CLASS_LABELS[i]} className="hover:bg-white/50 dark:hover:bg-[#111C30]/30">
                      <td className="py-2.5 text-left font-sans font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                        {CLASS_LABELS[i]}
                      </td>
                      {row.map((cell, j) => {
                        const isDiagonal = i === j;
                        return (
                          <td
                            key={j}
                            className={`py-2.5 px-2 ${
                              isDiagonal
                                ? "bg-blue-100/70 dark:bg-blue-900/40 font-bold text-[#2563EB] dark:text-[#3B82F6]"
                                : cell > 0
                                ? "text-rose-600 dark:text-rose-400 font-semibold"
                                : "text-[#A7B5C9]"
                            }`}
                          >
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-[#A7B5C9] italic pt-1">
              Diagonal shows true positives. Glioma row reveals 59 confused with Meningioma and 36 as No Tumor.
            </p>
          </div>

          {/* Matrix 2: VGG-16 */}
          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm text-[#0D9488] dark:text-[#2DD4BF] flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>VGG-16 (Accuracy: 91.63%)</span>
              </div>
              <span className="text-[11px] text-[#64748B] dark:text-[#A7B5C9]">1,466 / 1,600 Correct</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="text-[11px] text-[#64748B] dark:text-[#A7B5C9] border-b border-[#DFE7F1] dark:border-[#2B3B52]">
                    <th className="py-2 text-left font-semibold">True \ Pred</th>
                    {CLASS_LABELS.map((c) => (
                      <th key={c} className="py-2 px-1 font-bold">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE7F1] dark:divide-[#2B3B52] font-mono">
                  {vgg.confusion_matrix.map((row, i) => (
                    <tr key={CLASS_LABELS[i]} className="hover:bg-white/50 dark:hover:bg-[#111C30]/30">
                      <td className="py-2.5 text-left font-sans font-semibold text-[#172B4D] dark:text-[#F1F5F9]">
                        {CLASS_LABELS[i]}
                      </td>
                      {row.map((cell, j) => {
                        const isDiagonal = i === j;
                        return (
                          <td
                            key={j}
                            className={`py-2.5 px-2 ${
                              isDiagonal
                                ? "bg-teal-100/70 dark:bg-teal-900/40 font-bold text-[#0D9488] dark:text-[#2DD4BF]"
                                : cell > 0
                                ? "text-rose-600 dark:text-rose-400 font-semibold"
                                : "text-[#A7B5C9]"
                            }`}
                          >
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-[#A7B5C9] italic pt-1">
              Diagonal shows true positives. Glioma row reveals 79 confused with Meningioma and 26 as No Tumor.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: PER-CLASS PERFORMANCE & GLIOMA ALERT */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-5">
        <div className="space-y-1 pb-3 border-b border-[#DFE7F1] dark:border-[#2B3B52]">
          <h2 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9]">
            Per-Class Performance Breakdown & Error Analysis
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
            Detailed diagnostic precision, recall, and F1-score across each brain tumor pathology.
          </p>
        </div>

        {/* GLIOMA RECALL HIGHLIGHT NOTICE (CRITICAL CLINICAL HONESTY) */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Diagnostic Sensitivity Notice: Low Glioma Recall (72.8% – 74.3%)</span>
          </div>
          <p className="leading-relaxed">
            While both models achieve high precision when predicting Glioma (<strong>98.02%</strong> for ResNet-50 and <strong>98.31%</strong> for VGG-16), recall is comparatively low (<strong>74.25%</strong> and <strong>72.75%</strong>).
            Approximately <strong>1 in 4 true gliomas are missed</strong> ($103$ scans by ResNet-50, $109$ by VGG-16).
            Gliomas are predominantly misclassified as <strong>Meningioma (57.3% – 72.5% of errors)</strong> due to peripheral mass-effect feature overlap, and as <strong>No Tumor (23.8% – 35.0% of errors)</strong> on peripheral slices with subtle parenchymal infiltration.
          </p>
        </div>

        {/* 4 Cards for Per-Class Diagnostics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Glioma */}
          <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-rose-700 dark:text-rose-300">Glioma</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                Low Sensitivity
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">ResNet-50 F1:</span>
                <span className="font-bold font-mono text-[#172B4D] dark:text-[#F1F5F9]">84.50%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">VGG-16 F1:</span>
                <span className="font-bold font-mono text-[#172B4D] dark:text-[#F1F5F9]">83.62%</span>
              </div>
              <div className="flex justify-between border-t border-rose-200/60 dark:border-rose-900/30 pt-1">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">Recall (ResNet / VGG):</span>
                <span className="font-bold font-mono text-rose-600 dark:text-rose-400">74.3% / 72.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">Precision (ResNet / VGG):</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">98.0% / 98.3%</span>
              </div>
            </div>
          </div>

          {/* Meningioma */}
          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#172B4D] dark:text-[#F1F5F9]">Meningioma</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#3B82F6]">
                High Sensitivity
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">ResNet-50 F1:</span>
                <span className="font-bold font-mono text-[#172B4D] dark:text-[#F1F5F9]">88.22%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">VGG-16 F1:</span>
                <span className="font-bold font-mono text-[#172B4D] dark:text-[#F1F5F9]">88.01%</span>
              </div>
              <div className="flex justify-between border-t border-[#DFE7F1] dark:border-[#2B3B52] pt-1">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">Recall (ResNet / VGG):</span>
                <span className="font-bold font-mono text-[#172B4D] dark:text-[#F1F5F9]">91.8% / 94.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">Precision (ResNet / VGG):</span>
                <span className="font-bold font-mono text-[#64748B] dark:text-[#A7B5C9]">85.0% / 82.4%</span>
              </div>
            </div>
          </div>

          {/* No Tumor */}
          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#172B4D] dark:text-[#F1F5F9]">No Tumor (Control)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                99.8% Recall
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">ResNet-50 F1:</span>
                <span className="font-bold font-mono text-[#172B4D] dark:text-[#F1F5F9]">93.77%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">VGG-16 F1:</span>
                <span className="font-bold font-mono text-[#172B4D] dark:text-[#F1F5F9]">95.57%</span>
              </div>
              <div className="flex justify-between border-t border-[#DFE7F1] dark:border-[#2B3B52] pt-1">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">Recall (ResNet / VGG):</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">99.8% / 99.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">Precision (ResNet / VGG):</span>
                <span className="font-bold font-mono text-[#172B4D] dark:text-[#F1F5F9]">88.5% / 91.7%</span>
              </div>
            </div>
          </div>

          {/* Pituitary */}
          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#172B4D] dark:text-[#F1F5F9]">Pituitary Adenoma</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400">
                Top Accuracy
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">ResNet-50 F1:</span>
                <span className="font-bold font-mono text-[#172B4D] dark:text-[#F1F5F9]">96.81%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">VGG-16 F1:</span>
                <span className="font-bold font-mono text-[#172B4D] dark:text-[#F1F5F9]">98.27%</span>
              </div>
              <div className="flex justify-between border-t border-[#DFE7F1] dark:border-[#2B3B52] pt-1">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">Recall (ResNet / VGG):</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">98.5% / 99.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#A7B5C9]">Precision (ResNet / VGG):</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">95.2% / 97.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: HISTORICAL TRAINING LOGS (PRESERVED CONTEXT) */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFE7F1] dark:border-[#2B3B52] pb-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
              Historical Validation Convergence (Training History CSVs)
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
              Epoch-by-epoch validation progress during initial transfer learning fine-tuning.
            </p>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] text-xs">
            <button
              onClick={() => setActiveMetricTab("f1")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeMetricTab === "f1"
                  ? "bg-white dark:bg-[#111C30] text-[#2563EB] dark:text-[#3B82F6] shadow-xs"
                  : "text-[#64748B] dark:text-[#A7B5C9]"
              }`}
            >
              Validation F1
            </button>
            <button
              onClick={() => setActiveMetricTab("accuracy")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeMetricTab === "accuracy"
                  ? "bg-white dark:bg-[#111C30] text-[#2563EB] dark:text-[#3B82F6] shadow-xs"
                  : "text-[#64748B] dark:text-[#A7B5C9]"
              }`}
            >
              Accuracy
            </button>
            <button
              onClick={() => setActiveMetricTab("loss")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeMetricTab === "loss"
                  ? "bg-white dark:bg-[#111C30] text-[#2563EB] dark:text-[#3B82F6] shadow-xs"
                  : "text-[#64748B] dark:text-[#A7B5C9]"
              }`}
            >
              Loss
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeMetricTab === "f1" ? (
              <LineChart data={HISTORICAL_EPOCHS}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="epoch" stroke={textColor} fontSize={11} tickFormatter={(e) => `Ep ${e}`} />
                <YAxis domain={[90, 97]} unit="%" stroke={textColor} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#17243A" : "#FFFFFF",
                    borderColor: isDark ? "#2B3B52" : "#DFE7F1",
                    color: isDark ? "#F1F5F9" : "#172B4D",
                    fontSize: "12px",
                    borderRadius: "8px",
                  }}
                  formatter={(val: number) => [`${val}%`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="res_val_f1" name="ResNet-50 Val Macro-F1" stroke={resnetColor} strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="vgg_val_f1" name="VGG-16 Val Macro-F1" stroke={vggColor} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            ) : activeMetricTab === "accuracy" ? (
              <LineChart data={HISTORICAL_EPOCHS}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="epoch" stroke={textColor} fontSize={11} tickFormatter={(e) => `Ep ${e}`} />
                <YAxis domain={[90, 97]} unit="%" stroke={textColor} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#17243A" : "#FFFFFF",
                    borderColor: isDark ? "#2B3B52" : "#DFE7F1",
                    color: isDark ? "#F1F5F9" : "#172B4D",
                    fontSize: "12px",
                    borderRadius: "8px",
                  }}
                  formatter={(val: number) => [`${val}%`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="res_val_acc" name="ResNet-50 Val Acc" stroke={resnetColor} strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="vgg_val_acc" name="VGG-16 Val Acc" stroke={vggColor} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            ) : (
              <LineChart data={HISTORICAL_EPOCHS}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="epoch" stroke={textColor} fontSize={11} tickFormatter={(e) => `Ep ${e}`} />
                <YAxis domain={[0.08, 0.26]} stroke={textColor} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#17243A" : "#FFFFFF",
                    borderColor: isDark ? "#2B3B52" : "#DFE7F1",
                    color: isDark ? "#F1F5F9" : "#172B4D",
                    fontSize: "12px",
                    borderRadius: "8px",
                  }}
                  formatter={(val: number) => [val.toFixed(4), ""]}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="res_loss" name="ResNet-50 Val Loss" stroke={resnetColor} strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="vgg_loss" name="VGG-16 Val Loss" stroke={vggColor} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom CTA to MRI Analysis */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs">
        <div className="space-y-0.5">
          <div className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">Evaluate with Real MRI Scans</div>
          <div className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
            Upload axial brain MRI images to classify tumors and inspect Grad-CAM activation heatmaps.
          </div>
        </div>
        <Link
          href="/analysis"
          className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <span>ANALYSE MRI SCAN</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
