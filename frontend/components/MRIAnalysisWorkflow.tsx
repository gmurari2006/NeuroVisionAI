"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import Link from "next/link";
import {
  Upload,
  Brain,
  FileImage,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  RotateCcw,
  Layers,
  ArrowRight,
  Sliders,
  Eye,
  FileText,
  Activity,
  Image as ImageIcon,
} from "lucide-react";
import { analyzeMRI } from "../lib/api";
import { AnalysisResponse, SingleModelResult } from "../lib/types";
import { formatBytes, getClassDisplayName } from "../lib/utils";
import { generatePDFReport } from "../lib/pdfReport";
import { saveHistoryRecord, AnalysisRecordResult } from "../lib/history";
import { MedicalDisclaimer } from "./MedicalDisclaimer";

const ORDERED_CLASSES = ["glioma", "meningioma", "notumor", "pituitary"];

const SAMPLE_SCANS = [
  { key: "glioma_sample.jpg", label: "Glioma", classKey: "glioma" },
  { key: "meningioma_sample.jpg", label: "Meningioma", classKey: "meningioma" },
  { key: "pituitary_sample.jpg", label: "Pituitary", classKey: "pituitary" },
  { key: "notumor_sample.jpg", label: "No Tumor", classKey: "notumor" },
];

export function MRIAnalysisWorkflow() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(null);
  const [selectedModel, setSelectedModel] = useState<"both" | "resnet50" | "vgg16">("both");
  const [activeCamModel, setActiveCamModel] = useState<"resnet50" | "vgg16">("resnet50");

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // File selection logic
  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setResult(null);

    const validExtensions = [".png", ".jpg", ".jpeg"];
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      setError("Invalid file format. Please upload a brain MRI scan in PNG, JPG, or JPEG format.");
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setError("File exceeds 15 MB limit. Please select an MRI scan under 15 MB.");
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    const img = new window.Image();
    img.onload = () => {
      setImageMeta({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
    e.target.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageMeta(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  // Quick sample loader for testing
  const handleLoadSample = async (sampleFilename: string, sampleLabel: string) => {
    try {
      setLoadingSample(sampleFilename);
      setError(null);
      const res = await fetch(`/samples/${sampleFilename}`);
      if (!res.ok) throw new Error(`Could not load ${sampleFilename}`);
      const blob = await res.blob();
      const sampleFile = new File([blob], sampleFilename, { type: "image/jpeg" });
      handleFileSelect(sampleFile);
    } catch (err) {
      setError(`Failed to load sample image: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoadingSample(null);
    }
  };

  // Run Inference Pipeline
  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select or drop a brain MRI scan first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await analyzeMRI(file, selectedModel, true);
      setResult(response);

      if (response.results["resnet50"]) {
        setActiveCamModel("resnet50");
      } else if (response.results["vgg16"]) {
        setActiveCamModel("vgg16");
      }

      // Persist to local history store
      const recordResults: Record<string, AnalysisRecordResult> = {};
      for (const [mId, mRes] of Object.entries(response.results)) {
        recordResults[mId] = {
          model_id: mId,
          display_name: mRes.display_name,
          predicted_class: mRes.predicted_class,
          confidence: mRes.confidence,
          probabilities: mRes.probabilities,
          execution_time_ms: mRes.execution_time_ms,
          has_gradcam: Boolean(mRes.gradcam?.overlay_base64),
        };
      }
      const resnet = response.results["resnet50"];
      const vgg = response.results["vgg16"];
      const agreement = resnet && vgg ? resnet.predicted_class === vgg.predicted_class : undefined;

      saveHistoryRecord({
        filename: file.name,
        file_size_bytes: file.size,
        image_dimensions: imageMeta || {
          width: response.image_metadata.width,
          height: response.image_metadata.height,
        },
        model_selection: selectedModel,
        results: recordResults,
        consensus_agreement: agreement,
      });

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Analysis request failed. Please ensure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF Report
  const handleDownloadPDF = async () => {
    if (!result) return;
    setGeneratingPdf(true);
    try {
      await generatePDFReport(result, previewUrl || undefined);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to compile PDF report. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const resnetResult: SingleModelResult | undefined = result?.results?.["resnet50"];
  const vggResult: SingleModelResult | undefined = result?.results?.["vgg16"];
  const hasBoth = Boolean(resnetResult && vggResult);
  const modelsAgree = hasBoth && resnetResult?.predicted_class === vggResult?.predicted_class;
  const activeResult = result ? result.results[activeCamModel] || resnetResult || vggResult : undefined;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Hidden file input always available */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Main Hero Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1769AA] dark:text-[#2196F3] text-xs font-bold border border-[#DCE5EF] dark:border-[#1E344D]">
          <Activity className="w-3.5 h-3.5" />
          <span>Explainable Brain MRI Analysis &bull; Research Workstation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#16324F] dark:text-[#F1F5F9] tracking-tight">
          Brain MRI Analysis & Explainability
        </h1>
        <p className="text-sm sm:text-base text-[#64748B] dark:text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          Upload a brain MRI scan to classify tumor types across ResNet-50 and VGG-16, inspect Grad-CAM spatial
          attention maps, and generate publication-grade PDF research reports.
        </p>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <span className="font-bold">System Notice:</span>
            <p className="leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 1 & 2: UPLOAD & CONFIGURATION CARD */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#132235] border border-[#DCE5EF] dark:border-[#1E344D] shadow-sm space-y-6">
        {!previewUrl ? (
          /* STATE A: DRAG & DROP UPLOAD DROPZONE */
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#DCE5EF] dark:border-[#1E344D] rounded-2xl p-8 sm:p-12 text-center cursor-pointer hover:border-[#1769AA] dark:hover:border-[#2196F3] hover:bg-[#F7F9FC] dark:hover:bg-[#1A2E46]/30 transition-all duration-200 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1769AA] dark:text-[#2196F3] flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <p className="text-base sm:text-lg font-bold text-[#16324F] dark:text-[#F1F5F9]">
                  Select your brain MRI image
                </p>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  or drag and drop your axial scan file here
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-6 py-3 rounded-xl bg-[#1769AA] hover:bg-[#125387] dark:bg-[#2196F3] dark:hover:bg-[#1E88E5] text-white text-sm font-semibold shadow-sm transition-all active:scale-98 cursor-pointer"
                >
                  Browse MRI Image
                </button>
              </div>

              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] pt-2">
                Supports PNG, JPG, or JPEG &bull; Maximum file size 15 MB
              </p>
            </div>

            {/* QUICK SAMPLE TEST BUTTONS */}
            <div className="p-4 rounded-xl bg-[#F7F9FC] dark:bg-[#0D1926] border border-[#DCE5EF] dark:border-[#1E344D] space-y-2">
              <span className="text-xs font-bold text-[#16324F] dark:text-[#F1F5F9] block">
                Quick Test Samples (Click to load an actual MRI scan):
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_SCANS.map((sample) => (
                  <button
                    key={sample.key}
                    onClick={() => handleLoadSample(sample.key, sample.label)}
                    disabled={loadingSample !== null}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#132235] border border-[#DCE5EF] dark:border-[#1E344D] hover:border-[#1769AA] dark:hover:border-[#2196F3] text-xs font-semibold text-[#16324F] dark:text-[#F1F5F9] transition-all hover:text-[#1769AA] dark:hover:text-[#2196F3] cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {loadingSample === sample.key ? "Loading..." : `${sample.label} Scan`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* STATE B: SELECTED IMAGE PREVIEW & ACTIONS */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE5EF] dark:border-[#1E344D] pb-4">
              <div className="flex items-center gap-2">
                <FileImage className="w-5 h-5 text-[#1769AA] dark:text-[#2196F3]" />
                <div>
                  <h2 className="text-base font-bold text-[#16324F] dark:text-[#F1F5F9]">
                    Selected MRI Scan
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Image loaded and prepared for deep neural inference
                  </p>
                </div>
              </div>

              {/* CHANGE & REMOVE BUTTONS */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleChangeImage}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F7F9FC] dark:bg-[#0D1926] hover:bg-[#E8EEF5] dark:hover:bg-[#1A2E46] border border-[#DCE5EF] dark:border-[#1E344D] text-xs font-semibold text-[#16324F] dark:text-[#F1F5F9] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#1769AA] dark:text-[#2196F3]" />
                  <span>Change Image</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 text-xs font-semibold text-rose-700 dark:text-rose-300 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1">
                <div className="aspect-square max-h-56 mx-auto rounded-xl bg-black border border-[#DCE5EF] dark:border-[#1E344D] flex items-center justify-center overflow-hidden shadow-sm">
                  <img
                    src={previewUrl}
                    alt="Brain MRI Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-[#F7F9FC] dark:bg-[#0D1926] border border-[#DCE5EF] dark:border-[#1E344D] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Filename:</span>
                    <span className="font-mono font-bold text-[#16324F] dark:text-[#F1F5F9]">
                      {file?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">File Size:</span>
                    <span className="font-mono text-[#16324F] dark:text-[#F1F5F9]">
                      {file ? formatBytes(file.size) : "N/A"}
                    </span>
                  </div>
                  {imageMeta && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Dimensions:</span>
                      <span className="font-mono text-[#16324F] dark:text-[#F1F5F9]">
                        {imageMeta.width} &times; {imageMeta.height} px
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Format:</span>
                    <span className="font-mono uppercase text-[#1769AA] dark:text-[#2196F3]">
                      {file?.type.replace("image/", "")} (Standardized to 224&times;224 RGB)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: MODEL SELECTION CONTROLS */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
                Select Model Architecture
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option 1: Both Models (Default) */}
                <div
                  onClick={() => !loading && setSelectedModel("both")}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedModel === "both"
                      ? "border-[#1769AA] dark:border-[#2196F3] bg-blue-50/50 dark:bg-blue-950/20 shadow-xs"
                      : "border-[#DCE5EF] dark:border-[#1E344D] bg-[#F7F9FC] dark:bg-[#0D1926] hover:border-[#1769AA]/50"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-[#16324F] dark:text-[#F1F5F9]">
                      Both Models
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-[#1769AA] dark:text-[#2196F3]">
                      Default
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    Evaluates ResNet-50 and VGG-16 concurrently with dual Grad-CAM and consensus validation.
                  </p>
                </div>

                {/* Option 2: ResNet-50 */}
                <div
                  onClick={() => !loading && setSelectedModel("resnet50")}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedModel === "resnet50"
                      ? "border-[#1769AA] dark:border-[#2196F3] bg-blue-50/50 dark:bg-blue-950/20 shadow-xs"
                      : "border-[#DCE5EF] dark:border-[#1E344D] bg-[#F7F9FC] dark:bg-[#0D1926] hover:border-[#1769AA]/50"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-[#1769AA] dark:text-[#2196F3]">
                      ResNet-50
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      424 ms Latency
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    50-layer residual architecture with identity shortcuts (23.51M params, test acc 91.06%).
                  </p>
                </div>

                {/* Option 3: VGG-16 */}
                <div
                  onClick={() => !loading && setSelectedModel("vgg16")}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedModel === "vgg16"
                      ? "border-[#159D91] dark:border-[#26A69A] bg-teal-50/50 dark:bg-teal-950/20 shadow-xs"
                      : "border-[#DCE5EF] dark:border-[#1E344D] bg-[#F7F9FC] dark:bg-[#0D1926] hover:border-[#159D91]/50"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-[#159D91] dark:text-[#26A69A]">
                      VGG-16
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      893 ms Latency
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    16-layer sequential ConvNet with 2-stage MLP head (134.27M params, test acc 91.63%).
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 3: PROMINENT ANALYZE MRI BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || !file}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-[#1769AA] hover:bg-[#125387] dark:bg-[#2196F3] dark:hover:bg-[#1E88E5] text-white text-base font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing Brain MRI (Running Deep Inferences + Grad-CAM)...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    <span>ANALYZE BRAIN MRI SCAN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STEP 4, 5 & 6: AUTOMATIC RESULTS DISPLAY */}
      {result && activeResult && (
        <div ref={resultsRef} className="space-y-6 pt-2">
          {/* Action Header: Results Summary & Download PDF Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#132235] border border-[#DCE5EF] dark:border-[#1E344D] shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1769AA] dark:text-[#2196F3]">
                Analysis Complete
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#16324F] dark:text-[#F1F5F9]">
                Inference Results & Explainability
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Evaluated: <strong>{result.image_metadata.filename}</strong> &bull; Mode:{" "}
                {hasBoth ? "Dual Model Consensus" : selectedModel.toUpperCase()}
              </p>
            </div>

            {/* DOWNLOAD PDF REPORT BUTTON */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleDownloadPDF}
                disabled={generatingPdf}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1769AA] hover:bg-[#125387] dark:bg-[#2196F3] dark:hover:bg-[#1E88E5] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-98 disabled:opacity-70 cursor-pointer"
              >
                {generatingPdf ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD PDF REPORT</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRemoveImage}
                className="px-3.5 py-3 rounded-xl bg-[#F7F9FC] dark:bg-[#0D1926] hover:bg-[#E8EEF5] dark:hover:bg-[#1A2E46] border border-[#DCE5EF] dark:border-[#1E344D] text-xs font-semibold text-[#16324F] dark:text-[#F1F5F9] transition-colors cursor-pointer"
                title="Analyze Another Scan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STEP 4: PREDICTIONS & CONSENSUS BREAKDOWN */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#132235] border border-[#DCE5EF] dark:border-[#1E344D] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCE5EF] dark:border-[#1E344D]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                    Primary Classification
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Research Inference Only
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-[#16324F] dark:text-[#F1F5F9] flex items-center gap-2">
                  <span>{getClassDisplayName(activeResult.predicted_class)}</span>
                  <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1769AA] dark:text-[#2196F3] border border-[#DCE5EF] dark:border-[#1E344D]">
                    {(activeResult.confidence * 100).toFixed(1)}% Top Score
                  </span>
                </div>
              </div>

              {hasBoth && (
                <div className="sm:text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
                    Architecture Consensus
                  </span>
                  <div
                    className={`text-xs font-semibold mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
                      modelsAgree
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40"
                    }`}
                  >
                    {modelsAgree ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    )}
                    <span>{modelsAgree ? "Models in Agreement" : "Model Discrepancy Detected"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* MODEL DISAGREEMENT NOTICE (WHEN PREDICTIONS DIFFER) */}
            {hasBoth && !modelsAgree && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-300 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Model Discrepancy Warning &mdash; Conflicting Architecture Classifications</span>
                </div>
                <p className="text-xs leading-relaxed">
                  ResNet-50 predicts <strong>{getClassDisplayName(resnetResult?.predicted_class || "")}</strong> (
                  {((resnetResult?.confidence || 0) * 100).toFixed(1)}%), while VGG-16 predicts{" "}
                  <strong>{getClassDisplayName(vggResult?.predicted_class || "")}</strong> (
                  {((vggResult?.confidence || 0) * 100).toFixed(1)}%).
                  In independent benchmarks, the two architectures disagree on approximately 6.9% of scans.
                  Please switch between the Grad-CAM heatmaps below to contrast feature attribution regions.
                  <strong> Note:</strong> Predictions represent experimental research inferences, NOT confirmed medical diagnoses.
                </p>
              </div>
            )}

            {hasBoth && modelsAgree && (
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/30 text-emerald-900 dark:text-emerald-300 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Architectural Consensus Verified</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed">
                  Both ResNet-50 and VGG-16 independently assigned their highest score to{" "}
                  <strong>{getClassDisplayName(resnetResult?.predicted_class || "")}</strong>.
                  On the independent test benchmark, consensus predictions exhibit an empirical accuracy of 95.4%.
                  (Research prototype &mdash; always confirm with board-certified clinical radiology).
                </p>
              </div>
            )}

            {/* MODEL BREAKDOWN CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resnetResult && (
                <div className="p-4 rounded-xl bg-[#F7F9FC] dark:bg-[#0D1926] border border-[#DCE5EF] dark:border-[#1E344D] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1769AA] dark:text-[#2196F3]">
                      ResNet-50 Prediction
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                      {resnetResult.execution_time_ms} ms CPU
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#16324F] dark:text-[#F1F5F9]">
                    {getClassDisplayName(resnetResult.predicted_class)}
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                    <span>Confidence: {(resnetResult.confidence * 100).toFixed(1)}%</span>
                    <span className="font-mono text-[10px]">layer4[2].conv3</span>
                  </div>
                </div>
              )}

              {vggResult && (
                <div className="p-4 rounded-xl bg-[#F7F9FC] dark:bg-[#0D1926] border border-[#DCE5EF] dark:border-[#1E344D] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#159D91] dark:text-[#26A69A]">
                      VGG-16 Prediction
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                      {vggResult.execution_time_ms} ms CPU
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#16324F] dark:text-[#F1F5F9]">
                    {getClassDisplayName(vggResult.predicted_class)}
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                    <span>Confidence: {(vggResult.confidence * 100).toFixed(1)}%</span>
                    <span className="font-mono text-[10px]">features[28]</span>
                  </div>
                </div>
              )}
            </div>

            {/* FOUR-CLASS PROBABILITY DISTRIBUTION */}
            <div className="pt-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
                Four-Class Softmax Probability Distribution
              </span>
              <div className="space-y-2.5">
                {ORDERED_CLASSES.map((clsKey) => {
                  const prob = activeResult.probabilities[clsKey] ?? 0;
                  const pct = (prob * 100).toFixed(1);
                  const isTop = clsKey === activeResult.predicted_class;

                  return (
                    <div key={clsKey} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={
                            isTop
                              ? "font-bold text-[#16324F] dark:text-[#F1F5F9]"
                              : "text-[#64748B] dark:text-[#94A3B8]"
                          }
                        >
                          {getClassDisplayName(clsKey)}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#16324F] dark:text-[#F1F5F9]">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#E8EEF5] dark:bg-[#1E344D] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isTop
                              ? "bg-[#1769AA] dark:bg-[#2196F3]"
                              : "bg-[#64748B]/30 dark:bg-[#94A3B8]/20"
                          }`}
                          style={{ width: `${Math.max(parseFloat(pct), 1)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 5: GRAD-CAM AUTOMATIC EXPLAINABILITY DISPLAY */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#132235] border border-[#DCE5EF] dark:border-[#1E344D] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#1769AA] dark:text-[#2196F3]" />
                  <h3 className="text-base font-bold text-[#16324F] dark:text-[#F1F5F9]">
                    Grad-CAM Spatial Explainability
                  </h3>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Gradient-weighted Class Activation Mapping isolating spatial features influencing classification.
                </p>
              </div>

              {hasBoth && (
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F7F9FC] dark:bg-[#0D1926] border border-[#DCE5EF] dark:border-[#1E344D] text-xs">
                  <button
                    onClick={() => setActiveCamModel("resnet50")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeCamModel === "resnet50"
                        ? "bg-[#1769AA] text-white"
                        : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#16324F]"
                    }`}
                  >
                    ResNet-50 Heatmap
                  </button>
                  <button
                    onClick={() => setActiveCamModel("vgg16")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      activeCamModel === "vgg16"
                        ? "bg-[#159D91] text-white"
                        : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#16324F]"
                    }`}
                  >
                    VGG-16 Heatmap
                  </button>
                </div>
              )}
            </div>

            {/* THREE VISUAL CARDS: ORIGINAL MRI, GRAD-CAM HEATMAP, GRAD-CAM OVERLAY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Card 1: Original MRI */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] block text-center">
                  1. Original MRI Slice
                </span>
                <div className="aspect-square rounded-xl bg-black border border-[#DCE5EF] dark:border-[#1E344D] flex items-center justify-center overflow-hidden shadow-sm">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Original Brain MRI"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-white/50">No scan</div>
                  )}
                </div>
              </div>

              {/* Card 2: Grad-CAM Heatmap */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] block text-center">
                  2. Grad-CAM Heatmap ({activeCamModel === "resnet50" ? "ResNet-50" : "VGG-16"})
                </span>
                <div className="aspect-square rounded-xl bg-black border border-[#DCE5EF] dark:border-[#1E344D] flex items-center justify-center overflow-hidden shadow-sm">
                  {activeResult.gradcam?.heatmap_base64 ? (
                    <img
                      src={activeResult.gradcam.heatmap_base64}
                      alt="Grad-CAM Heatmap"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-white/50">Unavailable</div>
                  )}
                </div>
              </div>

              {/* Card 3: Grad-CAM Overlay */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] block text-center">
                  3. Grad-CAM Overlay (Heatmap + MRI)
                </span>
                <div className="aspect-square rounded-xl bg-black border border-[#DCE5EF] dark:border-[#1E344D] flex items-center justify-center overflow-hidden shadow-sm">
                  {activeResult.gradcam?.overlay_base64 ? (
                    <img
                      src={activeResult.gradcam.overlay_base64}
                      alt="Grad-CAM Overlay"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-white/50">Unavailable</div>
                  )}
                </div>
              </div>
            </div>

            {/* Scientific XAI Note */}
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] dark:bg-[#0D1926] border border-[#DCE5EF] dark:border-[#1E344D] text-xs text-[#64748B] dark:text-[#94A3B8] space-y-1">
              <span className="font-bold text-[#16324F] dark:text-[#F1F5F9]">
                Visual Explainability Note:
              </span>
              <p className="leading-relaxed">
                Grad-CAM computes the spatial gradient of the predicted class score with respect to feature maps in{" "}
                <code>{activeCamModel === "resnet50" ? "layer4[2].conv3" : "features[28]"}</code>.
                Warm colors indicate spatial regions that positively influenced the classification decision.
                Activation maps do not represent histological biopsy borders or definitive neoplastic margins.
              </p>
            </div>
          </div>

          {/* BOTTOM ACTIONS BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#132235] border border-[#DCE5EF] dark:border-[#1E344D] shadow-sm">
            <button
              onClick={handleRemoveImage}
              className="text-xs font-semibold text-[#1769AA] dark:text-[#2196F3] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Analyze Another Brain MRI Scan</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={generatingPdf}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1769AA] hover:bg-[#125387] dark:bg-[#2196F3] dark:hover:bg-[#1E88E5] text-white text-sm font-bold shadow-sm transition-all active:scale-98 disabled:opacity-70 cursor-pointer"
            >
              {generatingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD PDF REPORT</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Persistent Academic Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
}
