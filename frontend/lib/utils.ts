import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AnalysisResponse } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatPercent(val: number): string {
  return (val * 100).toFixed(1) + "%";
}

export function getClassDisplayName(className: string): string {
  const map: Record<string, string> = {
    glioma: "Glioma",
    meningioma: "Meningioma",
    notumor: "No Tumor Detected",
    pituitary: "Pituitary Adenoma",
  };
  return map[className.toLowerCase()] || className;
}

export function getClassColor(className: string): { bg: string; text: string; border: string } {
  switch (className.toLowerCase()) {
    case "notumor":
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-800/50",
      };
    case "glioma":
      return {
        bg: "bg-rose-50 dark:bg-rose-950/30",
        text: "text-rose-700 dark:text-rose-300",
        border: "border-rose-200 dark:border-rose-800/50",
      };
    case "meningioma":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/30",
        text: "text-amber-800 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-800/50",
      };
    case "pituitary":
      return {
        bg: "bg-indigo-50 dark:bg-indigo-950/30",
        text: "text-indigo-700 dark:text-indigo-300",
        border: "border-indigo-200 dark:border-indigo-800/50",
      };
    default:
      return {
        bg: "bg-slate-50 dark:bg-slate-900/40",
        text: "text-slate-700 dark:text-slate-300",
        border: "border-slate-200 dark:border-slate-700",
      };
  }
}

export function downloadAnalysisReport(data: AnalysisResponse) {
  const jsonReport = {
    platform: "NeuroVisionAI",
    report_type: "Brain MRI Classification & Explainability Research Report",
    generated_at: new Date().toISOString(),
    image_metadata: data.image_metadata,
    inference_results: Object.entries(data.results).map(([modelKey, result]) => ({
      model: result.display_name,
      model_id: modelKey,
      predicted_class: result.predicted_class,
      confidence_score: result.confidence,
      class_probabilities: result.probabilities,
      latency_ms: result.execution_time_ms,
      gradcam_available: Boolean(result.gradcam),
    })),
    disclaimer: data.disclaimer,
  };

  const blob = new Blob([JSON.stringify(jsonReport, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `neurovision_report_${data.image_metadata.filename.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
