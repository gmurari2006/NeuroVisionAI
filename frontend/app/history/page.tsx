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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs transition-colors">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
            Analysis History
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A7B5C9]">
            View, search, and export local session records of past brain MRI classification runs.
          </p>
        </div>

        {records.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={exportHistoryAsJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] text-[#172B4D] dark:text-[#F1F5F9] text-xs font-medium hover:bg-[#F4F7FB] dark:hover:bg-[#1E2E48] transition-colors shadow-xs"
              title="Export all records as JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
              <span>JSON</span>
            </button>
            <button
              type="button"
              onClick={exportHistoryAsCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] text-[#172B4D] dark:text-[#F1F5F9] text-xs font-medium hover:bg-[#F4F7FB] dark:hover:bg-[#1E2E48] transition-colors shadow-xs"
              title="Export all records as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-[#0D9488] dark:text-[#2DD4BF]" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111C30] border border-rose-300 dark:border-rose-800 text-[#DC2626] dark:text-[#F87171] text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors shadow-xs"
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
      <div className="p-4 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#64748B] dark:text-[#A7B5C9] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by filename or classification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DFE7F1] dark:border-[#2B3B52] bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#A7B5C9] focus:outline-hidden focus:border-[#2563EB] transition-colors"
            />
          </div>

          {/* Model filter */}
          <div className="sm:col-span-3">
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#DFE7F1] dark:border-[#2B3B52] bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#2563EB] transition-colors"
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
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#DFE7F1] dark:border-[#2B3B52] bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] focus:outline-hidden focus:border-[#2563EB] transition-colors"
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
        <div className="p-10 sm:p-14 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs text-center space-y-3">
          <HistoryIcon className="w-10 h-10 text-[#64748B] dark:text-[#A7B5C9] mx-auto opacity-40" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">No Analysis Records Stored</h3>
            <p className="text-xs text-[#64748B] dark:text-[#A7B5C9] max-w-md mx-auto leading-relaxed">
              When you upload and analyze brain MRI scans in the <strong>MRI Analysis Workspace</strong>,
              session metadata, classification scores, and execution benchmarks are preserved here.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/analysis"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Go to MRI Analysis</span>
            </Link>
          </div>
        </div>
      ) : filteredRecords.length === 0 ? (
        /* No Search Match */
        <div className="p-8 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] text-center space-y-2">
          <p className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
            No session records match your search or filter parameters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setModelFilter("all");
              setClassFilter("all");
            }}
            className="text-xs text-[#2563EB] dark:text-[#3B82F6] font-semibold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Records Table */
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#A7B5C9]">
            <span>
              Showing <strong>{filteredRecords.length}</strong> of {records.length} total records
            </span>
            <span className="font-mono text-[11px]">Storage: Local Browser Cache</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#DFE7F1] dark:border-[#2B3B52] text-[11px] font-mono text-[#64748B] dark:text-[#A7B5C9] uppercase">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Filename</th>
                  <th className="py-2.5 px-3">Dimensions / Size</th>
                  <th className="py-2.5 px-3">ResNet-50</th>
                  <th className="py-2.5 px-3">VGG-16</th>
                  <th className="py-2.5 px-3">Consensus</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE7F1] dark:divide-[#2B3B52] font-mono text-[11px]">
                {filteredRecords.map((rec) => {
                  const res = rec.results["resnet50"];
                  const vgg = rec.results["vgg16"];
                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-[#F4F7FB] dark:hover:bg-[#1E2E48] transition-colors cursor-pointer"
                      onClick={() => setSelectedRecord(rec)}
                    >
                      <td className="py-2.5 px-3 text-[#64748B] dark:text-[#A7B5C9]">
                        {new Date(rec.timestamp).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#172B4D] dark:text-[#F1F5F9] truncate max-w-[150px]">
                        {rec.filename}
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B] dark:text-[#A7B5C9]">
                        {rec.image_dimensions.width}&times;{rec.image_dimensions.height} &bull;{" "}
                        {formatBytes(rec.file_size_bytes)}
                      </td>
                      <td className="py-2.5 px-3">
                        {res ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              getClassColor(res.predicted_class).bg
                            } ${getClassColor(res.predicted_class).text}`}
                          >
                            {getClassDisplayName(res.predicted_class)} (
                            {(res.confidence * 100).toFixed(0)}%)
                          </span>
                        ) : (
                          <span className="text-[#64748B] dark:text-[#A7B5C9]">&mdash;</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {vgg ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              getClassColor(vgg.predicted_class).bg
                            } ${getClassColor(vgg.predicted_class).text}`}
                          >
                            {getClassDisplayName(vgg.predicted_class)} (
                            {(vgg.confidence * 100).toFixed(0)}%)
                          </span>
                        ) : (
                          <span className="text-[#64748B] dark:text-[#A7B5C9]">&mdash;</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {rec.consensus_agreement !== undefined ? (
                          rec.consensus_agreement ? (
                            <span className="text-[#16A34A] dark:text-[#22C55E] font-semibold">
                              Convergent
                            </span>
                          ) : (
                            <span className="text-[#D97706] dark:text-[#FBBF24] font-semibold">
                              Divergent
                            </span>
                          )
                        ) : (
                          <span className="text-[#64748B] dark:text-[#A7B5C9]">&mdash;</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(rec)}
                            className="p-1 rounded text-[#2563EB] dark:text-[#3B82F6] hover:bg-[#2563EB]/10"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rec.id)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-500/10"
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
          <div className="bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] rounded-xl shadow-lg max-w-xl w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#DFE7F1] dark:border-[#2B3B52] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-[#64748B] dark:text-[#A7B5C9] uppercase block">
                  Session Log &bull; {selectedRecord.id}
                </span>
                <h3 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9]">{selectedRecord.filename}</h3>
                <span className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
                  Recorded on {new Date(selectedRecord.timestamp).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-[#64748B] dark:text-[#A7B5C9] hover:text-[#172B4D] dark:hover:text-[#F1F5F9] hover:bg-[#F4F7FB] dark:hover:bg-[#1E2E48]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1">
                <span className="font-mono text-[10px] text-[#64748B] dark:text-[#A7B5C9] uppercase block">Image Spec</span>
                <div className="text-[#172B4D] dark:text-[#F1F5F9]">
                  {selectedRecord.image_dimensions.width} &times;{" "}
                  {selectedRecord.image_dimensions.height} px
                </div>
                <div className="text-[#64748B] dark:text-[#A7B5C9]">{formatBytes(selectedRecord.file_size_bytes)}</div>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1">
                <span className="font-mono text-[10px] text-[#64748B] dark:text-[#A7B5C9] uppercase block">Execution</span>
                <div className="uppercase font-mono text-[#172B4D] dark:text-[#F1F5F9]">{selectedRecord.model_selection}</div>
                <div className="text-[#64748B] dark:text-[#A7B5C9]">
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
                <div key={mId} className="p-3.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">{res.display_name}</span>
                    <span className="font-mono text-[#64748B] dark:text-[#A7B5C9]">{res.execution_time_ms} ms</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#64748B] dark:text-[#A7B5C9]">Predicted:</span>
                    <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                      {getClassDisplayName(res.predicted_class)} (
                      {(res.confidence * 100).toFixed(1)}%)
                    </span>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-[#DFE7F1] dark:border-[#2B3B52] text-[11px] font-mono">
                    {Object.entries(res.probabilities).map(([cls, p]) => (
                      <div key={cls} className="flex justify-between text-[#64748B] dark:text-[#A7B5C9]">
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
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-lg bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] text-[#172B4D] dark:text-[#F1F5F9] text-xs font-medium hover:bg-[#F4F7FB] dark:hover:bg-[#1E2E48]"
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
