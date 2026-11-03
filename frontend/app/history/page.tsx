"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  History as HistoryIcon,
  Search,
  Filter,
  Download,
  Trash2,
  Scan,
  Brain,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Eye,
  X,
  FileText,
} from "lucide-react";
import {
  getHistoryRecords,
  deleteHistoryRecord,
  clearAllHistory,
  exportHistoryAsJSON,
  exportHistoryAsCSV,
  AnalysisRecord,
} from "../../lib/history";
import { formatBytes, getClassDisplayName, getClassColor } from "../../lib/utils";
import { MedicalDisclaimer } from "../../components/MedicalDisclaimer";

export default function AnalysisHistoryPage() {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);

  const loadRecords = () => {
    setRecords(getHistoryRecords());
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryRecord(id);
    if (selectedRecord?.id === id) setSelectedRecord(null);
    loadRecords();
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all analysis history records from this workstation?")) {
      clearAllHistory();
      setSelectedRecord(null);
      loadRecords();
    }
  };

  // Filter records
  const filteredRecords = records.filter((rec) => {
    // Search
    const matchesSearch =
      rec.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(rec.results).some((res) =>
        res.predicted_class.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Model filter
    const matchesModel =
      modelFilter === "all" || rec.model_selection === modelFilter;

    // Class filter
    const matchesClass =
      classFilter === "all" ||
      Object.values(rec.results).some((res) => res.predicted_class === classFilter);

    return matchesSearch && matchesModel && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 rounded-2xl bg-white dark:bg-[#132235] border border-[#DCE5EF] dark:border-[#1E344D] shadow-sm transition-colors">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] dark:text-[#F1F5F9] tracking-tight">
            Analysis History
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            View, search, and export records of past brain MRI classification runs.
          </p>
        </div>

        {records.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportHistoryAsJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-ws-sm bg-ws-card border border-ws-border text-ws-text text-xs font-medium hover:bg-ws-hover transition-colors shadow-ws"
              title="Export all records as JSON"
            >
              <Download className="w-3.5 h-3.5 text-ws-action" />
              <span>JSON</span>
            </button>
            <button
              onClick={exportHistoryAsCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-ws-sm bg-ws-card border border-ws-border text-ws-text text-xs font-medium hover:bg-ws-hover transition-colors shadow-ws"
              title="Export all records as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-ws-accent" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-ws-sm bg-ws-card border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-500/10 transition-colors shadow-ws"
              title="Clear all stored sessions"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      <MedicalDisclaimer />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-ws bg-ws-card border border-ws-border shadow-ws space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-ws-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by filename or classification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-ws-sm border border-ws-border bg-ws-bg text-ws-text placeholder-ws-muted focus:outline-hidden focus:border-ws-action transition-colors"
            />
          </div>

          {/* Model filter */}
          <div className="sm:col-span-3">
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-ws-sm border border-ws-border bg-ws-bg text-ws-text focus:outline-hidden focus:border-ws-action transition-colors"
            >
              <option value="all">All Models</option>
              <option value="both">Dual Model (ResNet50 + VGG16)</option>
              <option value="resnet50">ResNet-50 Only</option>
              <option value="vgg16">VGG-16 Only</option>
            </select>
          </div>

          {/* Class filter */}
          <div className="sm:col-span-3">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-ws-sm border border-ws-border bg-ws-bg text-ws-text focus:outline-hidden focus:border-ws-action transition-colors"
            >
              <option value="all">All Categories</option>
              <option value="glioma">Glioma</option>
              <option value="meningioma">Meningioma</option>
              <option value="pituitary">Pituitary</option>
              <option value="notumor">No Tumor Detected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Records Display */}
      {records.length === 0 ? (
        /* Empty State */
        <div className="p-10 sm:p-14 rounded-ws bg-ws-card border border-ws-border shadow-ws text-center space-y-3">
          <HistoryIcon className="w-10 h-10 text-ws-muted mx-auto opacity-40" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-ws-text">No Analysis Records Stored</h3>
            <p className="text-xs text-ws-muted max-w-md mx-auto leading-relaxed">
              When you upload and analyze brain MRI scans in the <strong>MRI Analysis Workspace</strong>,
              session metadata, classification scores, and execution benchmarks are preserved here.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/analysis"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-ws-sm bg-ws-action text-white text-xs font-semibold hover:bg-ws-action-hover transition-colors shadow-ws"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Go to MRI Analysis</span>
            </Link>
          </div>
        </div>
      ) : filteredRecords.length === 0 ? (
        /* No Search Match */
        <div className="p-8 rounded-ws bg-ws-card border border-ws-border text-center space-y-2">
          <p className="text-xs text-ws-muted">
            No session records match your search or filter parameters.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setModelFilter("all");
              setClassFilter("all");
            }}
            className="text-xs text-ws-action font-semibold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Records Table */
        <div className="p-4 sm:p-5 rounded-ws bg-ws-card border border-ws-border shadow-ws space-y-4">
          <div className="flex items-center justify-between text-xs text-ws-muted">
            <span>
              Showing <strong>{filteredRecords.length}</strong> of {records.length} total records
            </span>
            <span className="font-mono text-[11px]">Storage: Local Browser Cache</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-ws-border text-[11px] font-mono text-ws-muted uppercase">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Filename</th>
                  <th className="py-2.5 px-3">Dimensions / Size</th>
                  <th className="py-2.5 px-3">ResNet-50</th>
                  <th className="py-2.5 px-3">VGG-16</th>
                  <th className="py-2.5 px-3">Consensus</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ws-border font-mono text-[11px]">
                {filteredRecords.map((rec) => {
                  const res = rec.results["resnet50"];
                  const vgg = rec.results["vgg16"];
                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-ws-hover transition-colors cursor-pointer"
                      onClick={() => setSelectedRecord(rec)}
                    >
                      <td className="py-2.5 px-3 text-ws-muted">
                        {new Date(rec.timestamp).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-ws-text truncate max-w-[150px]">
                        {rec.filename}
                      </td>
                      <td className="py-2.5 px-3 text-ws-muted">
                        {rec.image_dimensions.width}&times;{rec.image_dimensions.height} &bull;{" "}
                        {formatBytes(rec.file_size_bytes)}
                      </td>
                      <td className="py-2.5 px-3">
                        {res ? (
                          <span
                            className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold ${
                              getClassColor(res.predicted_class).bg
                            } ${getClassColor(res.predicted_class).text}`}
                          >
                            {getClassDisplayName(res.predicted_class)} (
                            {(res.confidence * 100).toFixed(0)}%)
                          </span>
                        ) : (
                          <span className="text-ws-muted">&mdash;</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {vgg ? (
                          <span
                            className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold ${
                              getClassColor(vgg.predicted_class).bg
                            } ${getClassColor(vgg.predicted_class).text}`}
                          >
                            {getClassDisplayName(vgg.predicted_class)} (
                            {(vgg.confidence * 100).toFixed(0)}%)
                          </span>
                        ) : (
                          <span className="text-ws-muted">&mdash;</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {rec.consensus_agreement !== undefined ? (
                          rec.consensus_agreement ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Convergent
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              Divergent
                            </span>
                          )
                        ) : (
                          <span className="text-ws-muted">&mdash;</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedRecord(rec)}
                            className="p-1 rounded-ws-sm text-ws-action hover:bg-ws-action/10"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec.id)}
                            className="p-1 rounded-ws-sm text-rose-500 hover:bg-rose-500/10"
                            title="Delete session record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Details Slide-out / Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-ws-card border border-ws-border rounded-ws shadow-ws-md max-w-xl w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-ws-border pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-ws-muted uppercase block">
                  Session Log &bull; {selectedRecord.id}
                </span>
                <h3 className="text-base font-bold text-ws-text">{selectedRecord.filename}</h3>
                <span className="text-xs text-ws-muted">
                  Recorded on {new Date(selectedRecord.timestamp).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-ws-sm text-ws-muted hover:text-ws-text hover:bg-ws-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-ws-sm bg-ws-bg border border-ws-border space-y-1">
                <span className="font-mono text-[10px] text-ws-muted uppercase block">Image Spec</span>
                <div>
                  {selectedRecord.image_dimensions.width} &times;{" "}
                  {selectedRecord.image_dimensions.height} px
                </div>
                <div className="text-ws-muted">{formatBytes(selectedRecord.file_size_bytes)}</div>
              </div>

              <div className="p-3 rounded-ws-sm bg-ws-bg border border-ws-border space-y-1">
                <span className="font-mono text-[10px] text-ws-muted uppercase block">Execution</span>
                <div className="uppercase font-mono">{selectedRecord.model_selection}</div>
                <div className="text-ws-muted">
                  {selectedRecord.consensus_agreement !== undefined
                    ? selectedRecord.consensus_agreement
                      ? "Convergent"
                      : "Divergent"
                    : "Single Run"}
                </div>
              </div>
            </div>

            {/* Model outputs breakdown */}
            <div className="space-y-3">
              {Object.entries(selectedRecord.results).map(([mId, res]) => (
                <div key={mId} className="p-3.5 rounded-ws-sm bg-ws-bg border border-ws-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ws-text">{res.display_name}</span>
                    <span className="font-mono text-ws-muted">{res.execution_time_ms} ms</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-ws-muted">Predicted:</span>
                    <span className="font-bold text-ws-text">
                      {getClassDisplayName(res.predicted_class)} (
                      {(res.confidence * 100).toFixed(1)}%)
                    </span>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-ws-border text-[11px] font-mono">
                    {Object.entries(res.probabilities).map(([cls, p]) => (
                      <div key={cls} className="flex justify-between text-ws-muted">
                        <span>{getClassDisplayName(cls)}</span>
                        <span>{(p * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-ws-sm bg-ws-card border border-ws-border text-ws-text text-xs font-medium hover:bg-ws-hover"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
