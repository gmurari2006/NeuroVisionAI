/**
 * NeuroVisionAI - Local Workstation Analysis History Store
 * Persists actual user analysis sessions locally in the browser's localStorage.
 * Does NOT generate or simulate fake patient or hospital records.
 */

export interface AnalysisRecordResult {
  model_id: string;
  display_name: string;
  predicted_class: string;
  confidence: number;
  probabilities: Record<string, number>;
  execution_time_ms: number;
  has_gradcam: boolean;
}

export interface AnalysisRecord {
  id: string;
  timestamp: string;
  filename: string;
  file_size_bytes: number;
  image_dimensions: { width: number; height: number };
  model_selection: "both" | "resnet50" | "vgg16";
  results: Record<string, AnalysisRecordResult>;
  consensus_agreement?: boolean;
}

const STORAGE_KEY = "neurovision_workstation_history_v1";

export function getHistoryRecords(): AnalysisRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistoryRecord(
  data: Omit<AnalysisRecord, "id" | "timestamp">
): AnalysisRecord {
  const newRecord: AnalysisRecord = {
    ...data,
    id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getHistoryRecords();
      // Keep up to 100 historical sessions
      const updated = [newRecord, ...existing].slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to persist analysis record to localStorage:", err);
    }
  }

  return newRecord;
}

export function deleteHistoryRecord(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getHistoryRecords();
    const filtered = existing.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn("Failed to delete record:", err);
  }
}

export function clearAllHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to clear history:", err);
  }
}

export function exportHistoryAsJSON(): void {
  const records = getHistoryRecords();
  const blob = new Blob([JSON.stringify(records, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `neurovision_history_export_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportHistoryAsCSV(): void {
  const records = getHistoryRecords();
  if (records.length === 0) return;

  const headers = [
    "ID",
    "Timestamp",
    "Filename",
    "Model Selection",
    "ResNet-50 Prediction",
    "ResNet-50 Confidence",
    "VGG-16 Prediction",
    "VGG-16 Confidence",
    "Consensus Agreement",
  ];

  const rows = records.map((r) => {
    const resResult = r.results["resnet50"];
    const vggResult = r.results["vgg16"];
    return [
      r.id,
      r.timestamp,
      `"${r.filename}"`,
      r.model_selection,
      resResult ? resResult.predicted_class : "N/A",
      resResult ? (resResult.confidence * 100).toFixed(1) + "%" : "N/A",
      vggResult ? vggResult.predicted_class : "N/A",
      vggResult ? (vggResult.confidence * 100).toFixed(1) + "%" : "N/A",
      r.consensus_agreement !== undefined ? (r.consensus_agreement ? "YES" : "NO") : "N/A",
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `neurovision_history_export_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
