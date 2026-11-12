"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
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
  Eye,
  Activity,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Layers,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { analyzeMRI } from "../lib/api";
import { AnalysisResponse, SingleModelResult } from "../lib/types";
import { formatBytes, getClassDisplayName } from "../lib/utils";
import { generatePDFReport } from "../lib/pdfReport";
import { saveHistoryRecord, AnalysisRecordResult } from "../lib/history";
import { MedicalDisclaimer } from "./MedicalDisclaimer";
import { StudyInformationPanel } from "./StudyInformationPanel";
import { AIModelIntelligencePanel } from "./AIModelIntelligencePanel";

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
  const [studyId, setStudyId] = useState<string>("ST-202611-AX89");
  const [selectedModel, setSelectedModel] = useState<"both" | "resnet50" | "vgg16">("both");
  const [activeCamModel, setActiveCamModel] = useState<"resnet50" | "vgg16">("resnet50");

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [lastAnalysisTimestamp, setLastAnalysisTimestamp] = useState<string | null>(null);
  const [copiedStudyId, setCopiedStudyId] = useState<boolean>(false);

  // Responsive panel collapse states for Desktop
  const [leftCollapsed, setLeftCollapsed] = useState<boolean>(false);
  const [rightCollapsed, setRightCollapsed] = useState<boolean>(false);

  // Mobile and Tablet accordion states
  const [mobileStudyOpen, setMobileStudyOpen] = useState<boolean>(false);
  const [mobileModelOpen, setMobileModelOpen] = useState<boolean>(false);
  const [tabletModelOpen, setTabletModelOpen] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Copy Study ID handler
  const handleCopyStudyId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(studyId);
      setCopiedStudyId(true);
      setTimeout(() => setCopiedStudyId(false), 2000);
    }
  };

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
    // Generate systematic study accession id based on scan
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    setStudyId(`ST-202611-AX${randSuffix}`);

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
      setLastAnalysisTimestamp(new Date().toLocaleTimeString());

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

  // Analysis status label
  const currentStatus = loading
    ? "Processing Deep Inference..."
    : result
    ? "Analysis Complete"
    : file
    ? "Scan Ready for Inference"
    : "Awaiting Scan Ingestion";

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* ACADEMIC DEMONSTRATION BRIEFING CARD */}
      <div className="rounded-xl border border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/70 via-white to-teal-50/70 dark:from-[#111C30] dark:via-[#17243A] dark:to-[#111C30] p-4 shadow-xs transition-colors space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#DFE7F1] dark:border-[#2B3B52]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#2563EB] text-white">
              Academic Demonstration
            </span>
            <span className="font-bold text-xs sm:text-sm text-[#172B4D] dark:text-[#F1F5F9]">
              NeuroVisionAI: Brain MRI Classification & Interpretability
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
            ResNet-50 + VGG-16 Active (Local PyTorch)
          </span>
        </div>

        <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
          This system performs comparative dual-architecture inference on Axial T1-CE brain MRI scans to classify tumor pathology across 4 categories: <strong>Glioma</strong>, <strong>Meningioma</strong>, <strong>Pituitary Tumor</strong>, and <strong>No Tumor</strong>. Visual explainability is generated via <strong>Grad-CAM</strong> (Gradient-weighted Class Activation Mapping) on the final convolutional layers.
        </p>

        {/* Academic Disclaimer Callout */}
        <div className="flex items-center gap-2 text-[11px] text-[#B45309] dark:text-amber-200 bg-[#FFFBEB] dark:bg-amber-950/30 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/40">
          <span className="font-bold shrink-0">Academic Notice:</span>
          <span>For academic and research demonstration only. Not intended for clinical diagnosis.</span>
        </div>
      </div>

      {/* LEVEL 1: COMPACT STUDY TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs transition-colors">
        {/* Study Identifier and Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
              <span>MRI Analysis Workstation</span>
            </span>
          </div>

          <div className="h-4 w-px bg-[#DFE7F1] dark:bg-[#2B3B52] hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748B] dark:text-[#A7B5C9] uppercase tracking-wider">
              Study ID:
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F4F7FB] dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52]">
              <span className="font-mono font-bold text-xs text-[#172B4D] dark:text-[#F1F5F9]">
                {studyId}
              </span>
              <button
                type="button"
                onClick={handleCopyStudyId}
                className="p-0.5 rounded text-[#0D9488] dark:text-[#2DD4BF] hover:bg-white dark:hover:bg-[#1E2E48]"
                title="Copy Study ID"
              >
                {copiedStudyId ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="h-4 w-px bg-[#DFE7F1] dark:bg-[#2B3B52] hidden sm:block" />

          {/* Current Analysis Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748B] dark:text-[#A7B5C9] uppercase tracking-wider">
              Status:
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                loading
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40"
                  : result
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                  : file
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  loading
                    ? "bg-amber-500 animate-pulse"
                    : result
                    ? "bg-[#16A34A]"
                    : file
                    ? "bg-[#2563EB]"
                    : "bg-slate-400"
                }`}
              />
              <span>{currentStatus}</span>
            </span>
          </div>
        </div>

        {/* Panel Collapse / Expand Controls on Desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              leftCollapsed
                ? "bg-[#17365D]/10 text-[#17365D] border-[#17365D]/20 dark:bg-[#3B82F6]/15 dark:text-[#3B82F6] dark:border-[#3B82F6]/30"
                : "bg-[#F4F7FB] dark:bg-[#17243A] text-[#64748B] dark:text-[#A7B5C9] border-[#DFE7F1] dark:border-[#2B3B52] hover:text-[#172B4D] dark:hover:text-[#F1F5F9]"
            }`}
            title="Toggle Left Study Information Panel"
          >
            {leftCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
            <span>Study Panel</span>
          </button>

          <button
            type="button"
            onClick={() => setRightCollapsed(!rightCollapsed)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              rightCollapsed
                ? "bg-[#17365D]/10 text-[#17365D] border-[#17365D]/20 dark:bg-[#3B82F6]/15 dark:text-[#3B82F6] dark:border-[#3B82F6]/30"
                : "bg-[#F4F7FB] dark:bg-[#17243A] text-[#64748B] dark:text-[#A7B5C9] border-[#DFE7F1] dark:border-[#2B3B52] hover:text-[#172B4D] dark:hover:text-[#F1F5F9]"
            }`}
            title="Toggle Right AI Model Intelligence Panel"
          >
            {rightCollapsed ? <PanelRightOpen className="w-3.5 h-3.5" /> : <PanelRightClose className="w-3.5 h-3.5" />}
            <span>AI Panel</span>
          </button>
        </div>
      </div>

      {/* Mobile Accordion Toggles (< 768px) */}
      <div className="md:hidden grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMobileStudyOpen(!mobileStudyOpen)}
          className="px-3 py-2 rounded-lg bg-white dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center justify-between shadow-xs"
        >
          <span>Study Info</span>
          {mobileStudyOpen ? <ChevronUp className="w-4 h-4 text-[#0D9488]" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => setMobileModelOpen(!mobileModelOpen)}
          className="px-3 py-2 rounded-lg bg-white dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center justify-between shadow-xs"
        >
          <span>AI Intelligence</span>
          {mobileModelOpen ? <ChevronUp className="w-4 h-4 text-[#0D9488]" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer Sections (< 768px) */}
      {mobileStudyOpen && (
        <div className="md:hidden">
          <StudyInformationPanel
            studyId={studyId}
            file={file}
            imageMeta={imageMeta}
            loading={loading}
            isAnalyzed={Boolean(result)}
            selectedModel={selectedModel}
          />
        </div>
      )}

      {mobileModelOpen && (
        <div className="md:hidden">
          <AIModelIntelligencePanel
            selectedModel={selectedModel}
            activeCamModel={activeCamModel}
            loading={loading}
            isAnalyzed={Boolean(result)}
            lastAnalysisTimestamp={lastAnalysisTimestamp}
          />
        </div>
      )}

      {/* LEVEL 2: THREE-COLUMN WORKSTATION LAYOUT
          - Desktop (lg: >= 1024px): Three columns (Left: ~260px, Centre: ~65-70% flex-1, Right: ~280px)
          - Tablet (md: 768px - 1023px): Two columns (Left: ~260px, Centre: flex-1; Right panel below)
          - Mobile (< 768px): Single column
      */}
      <div className="flex flex-col md:flex-row gap-5 items-start w-full">
        {/* COLUMN 1: LEFT STUDY INFORMATION SIDEBAR (~260px) */}
        <div className="hidden md:block shrink-0">
          <StudyInformationPanel
            studyId={studyId}
            file={file}
            imageMeta={imageMeta}
            loading={loading}
            isAnalyzed={Boolean(result)}
            selectedModel={selectedModel}
            collapsed={leftCollapsed}
            onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
          />
        </div>

        {/* COLUMN 2: CENTRE MRI ANALYSIS WORKSPACE (PRIMARY FOCUS: 65-70% WIDTH) */}
        <section className="flex-1 min-w-0 w-full space-y-5" aria-label="MRI Analysis Primary Workspace">
          {/* Error Alert Notice */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#DC2626] dark:text-[#F87171] shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="font-bold">System Notice:</span>
                <p className="leading-relaxed">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-700 cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* A & B: MRI UPLOAD AREA / SELECTED MRI VIEW */}
          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-5 transition-colors">
            {!previewUrl ? (
              /* A. CLEAN UPLOAD AREA */
              <div className="space-y-4">
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#DFE7F1] dark:border-[#2B3B52] rounded-xl p-8 sm:p-10 text-center cursor-pointer hover:border-[#2563EB] dark:hover:border-[#3B82F6] hover:bg-[#F4F7FB] dark:hover:bg-[#1E2E48]/50 transition-all duration-200 space-y-3.5"
                >
                  <div className="w-14 h-14 rounded-full bg-[#2563EB]/10 dark:bg-[#3B82F6]/15 text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center mx-auto shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-base sm:text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                      Select or drop your brain MRI scan
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
                      Supported formats: PNG, JPG, JPEG &bull; Axial T1-CE recommended &bull; Maximum file size 15 MB
                    </p>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-6 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-98 cursor-pointer"
                    >
                      Browse MRI Image
                    </button>
                  </div>
                </div>

                {/* BENCHMARK REFERENCE SAMPLES */}
                <div className="p-3.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0D9488] dark:text-[#2DD4BF]" />
                      <span>Benchmark Test Reference Scans</span>
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#A7B5C9]">
                      Quick test samples from independent evaluation set
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SAMPLE_SCANS.map((sample) => (
                      <button
                        type="button"
                        key={sample.key}
                        onClick={() => handleLoadSample(sample.key, sample.label)}
                        disabled={loadingSample !== null}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] hover:border-[#2563EB] dark:hover:border-[#3B82F6] text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] transition-all hover:text-[#2563EB] dark:hover:text-[#3B82F6] cursor-pointer shadow-xs disabled:opacity-50 text-center"
                      >
                        {loadingSample === sample.key ? "Loading..." : `${sample.label} Scan`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* B. SELECTED MRI IMAGE PREVIEW */
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFE7F1] dark:border-[#2B3B52] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/15 text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center shrink-0">
                      <FileImage className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                        Selected MRI Scan
                      </h2>
                      <p className="text-[11px] text-[#64748B] dark:text-[#A7B5C9]">
                        Scan prepared and verified for deep neural inference
                      </p>
                    </div>
                  </div>

                  {/* CHANGE & REMOVE ACTIONS */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleChangeImage}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] hover:bg-[#DFE7F1] dark:hover:bg-[#1E2E48] border border-[#DFE7F1] dark:border-[#2B3B52] text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                      <span>Change Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 text-xs font-semibold text-[#DC2626] dark:text-[#F87171] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* PREVIEW CONTAINER KEEPING PROPORTIONS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
                  <div className="sm:col-span-1">
                    <div className="aspect-square max-h-56 mx-auto rounded-xl bg-black border border-[#DFE7F1] dark:border-[#2B3B52] flex items-center justify-center overflow-hidden shadow-xs">
                      <img
                        src={previewUrl}
                        alt="Brain MRI Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-2 text-xs">
                    <div className="p-3.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B] dark:text-[#A7B5C9]">Filename:</span>
                        <span className="font-mono font-bold text-[#172B4D] dark:text-[#F1F5F9] truncate max-w-[200px]">
                          {file?.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B] dark:text-[#A7B5C9]">File Size:</span>
                        <span className="font-mono text-[#172B4D] dark:text-[#F1F5F9]">
                          {file ? formatBytes(file.size) : "N/A"}
                        </span>
                      </div>
                      {imageMeta && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748B] dark:text-[#A7B5C9]">Dimensions:</span>
                          <span className="font-mono text-[#172B4D] dark:text-[#F1F5F9]">
                            {imageMeta.width} &times; {imageMeta.height} px
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B] dark:text-[#A7B5C9]">Input Format:</span>
                        <span className="font-mono uppercase font-bold text-[#0D9488] dark:text-[#2DD4BF]">
                          {file?.type.replace("image/", "")} &bull; Normalized 224&times;224 RGB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* C. MODEL SELECTION CARDS */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] block">
                    Model Selection
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Option 1: Dual Model Comparison (Default) */}
                    <div
                      onClick={() => !loading && setSelectedModel("both")}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedModel === "both"
                          ? "border-[#2563EB] dark:border-[#3B82F6] bg-[#2563EB]/5 dark:bg-[#3B82F6]/10 shadow-xs ring-1 ring-[#2563EB] dark:ring-[#3B82F6]"
                          : "border-[#DFE7F1] dark:border-[#2B3B52] bg-[#F4F7FB] dark:bg-[#111C30] hover:border-[#2563EB]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                          Dual Model Comparison
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0D9488]/15 dark:bg-[#2DD4BF]/20 text-[#0D9488] dark:text-[#2DD4BF]">
                          Consensus
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
                        Evaluates ResNet-50 and VGG-16 concurrently with dual Grad-CAM attention and agreement validation.
                      </p>
                    </div>

                    {/* Option 2: ResNet-50 */}
                    <div
                      onClick={() => !loading && setSelectedModel("resnet50")}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedModel === "resnet50"
                          ? "border-[#2563EB] dark:border-[#3B82F6] bg-[#2563EB]/5 dark:bg-[#3B82F6]/10 shadow-xs ring-1 ring-[#2563EB] dark:ring-[#3B82F6]"
                          : "border-[#DFE7F1] dark:border-[#2B3B52] bg-[#F4F7FB] dark:bg-[#111C30] hover:border-[#2563EB]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-bold text-[#17365D] dark:text-[#3B82F6]">
                          ResNet-50
                        </span>
                        <span className="text-[10px] font-mono text-[#64748B] dark:text-[#A7B5C9]">
                          424 ms
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
                        50-layer deep residual architecture (23.51M params, test acc 91.06%, macro F1 90.82%).
                      </p>
                    </div>

                    {/* Option 3: VGG-16 */}
                    <div
                      onClick={() => !loading && setSelectedModel("vgg16")}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedModel === "vgg16"
                          ? "border-[#2563EB] dark:border-[#3B82F6] bg-[#2563EB]/5 dark:bg-[#3B82F6]/10 shadow-xs ring-1 ring-[#2563EB] dark:ring-[#3B82F6]"
                          : "border-[#DFE7F1] dark:border-[#2B3B52] bg-[#F4F7FB] dark:bg-[#111C30] hover:border-[#2563EB]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-bold text-[#0D9488] dark:text-[#2DD4BF]">
                          VGG-16
                        </span>
                        <span className="text-[10px] font-mono text-[#64748B] dark:text-[#A7B5C9]">
                          893 ms
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
                        16-layer sequential ConvNet (134.27M params, test acc 91.63%, macro F1 91.37%).
                      </p>
                    </div>
                  </div>
                </div>

                {/* D. PROMINENT ANALYSIS ACTION BUTTON */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={loading || !file}
                    className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white text-sm sm:text-base font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Analyzing MRI Scan (Running Neural Inferences + Grad-CAM)...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        <span>ANALYZE MRI SCAN</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* E, F & G: RESULTS, EXPLAINABILITY & REPORT GENERATION */}
          {result && activeResult && (
            <div ref={resultsRef} className="space-y-5 pt-1">
              {/* Results Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0D9488] dark:text-[#2DD4BF]">
                    Analysis Complete
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] dark:text-[#F1F5F9]">
                    Inference Results &amp; Explainability
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
                    Scan: <strong>{result.image_metadata.filename}</strong> &bull; Mode:{" "}
                    {hasBoth ? "Dual Model Consensus" : selectedModel.toUpperCase()}
                  </p>
                </div>

                {/* G. DOWNLOAD RESEARCH PDF BUTTON */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={generatingPdf}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all active:scale-98 disabled:opacity-70 cursor-pointer"
                  >
                    {generatingPdf ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>DOWNLOAD RESEARCH PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-2.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] hover:bg-[#DFE7F1] dark:hover:bg-[#1E2E48] border border-[#DFE7F1] dark:border-[#2B3B52] text-xs font-semibold text-[#172B4D] dark:text-[#F1F5F9] transition-colors cursor-pointer"
                    title="Analyze Another Scan"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* E. RESULTS HIERARCHY */}
              <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#DFE7F1] dark:border-[#2B3B52]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9]">
                        Predicted Classification
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-[#D97706] dark:text-[#FBBF24] border border-amber-500/20">
                        Research Inference Only
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
                      <span>{getClassDisplayName(activeResult.predicted_class)}</span>
                      <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] dark:bg-[#2DD4BF]/15 dark:text-[#2DD4BF] border border-[#0D9488]/20 dark:border-[#2DD4BF]/20">
                        {(activeResult.confidence * 100).toFixed(1)}% Confidence
                      </span>
                    </div>
                  </div>

                  {hasBoth && (
                    <div className="sm:text-right">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] block">
                        Architecture Consensus
                      </span>
                      <div
                        className={`text-xs font-semibold mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
                          modelsAgree
                            ? "bg-emerald-50 text-[#16A34A] dark:bg-emerald-950/40 dark:text-[#22C55E] border border-emerald-200 dark:border-emerald-800/40"
                            : "bg-amber-50 text-[#D97706] dark:bg-amber-950/40 dark:text-[#FBBF24] border border-amber-200 dark:border-amber-800/40"
                        }`}
                      >
                        {modelsAgree ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#22C55E]" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] dark:text-[#FBBF24]" />
                        )}
                        <span>{modelsAgree ? "Models in Agreement" : "Model Discrepancy Detected"}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* MODEL DISAGREEMENT NOTICE (WHEN PREDICTIONS DIFFER) */}
                {hasBoth && !modelsAgree && (
                  <div className="p-4 rounded-xl bg-[#FFFBEB] dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[#B45309] dark:text-amber-300 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24] shrink-0" />
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
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-[#22C55E] shrink-0" />
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

                {/* MODEL BREAKDOWN COMPACT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resnetResult && (
                    <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#17365D] dark:text-[#3B82F6]">
                          ResNet-50 Prediction
                        </span>
                        <span className="text-[11px] font-mono text-[#64748B] dark:text-[#A7B5C9]">
                          {resnetResult.execution_time_ms} ms CPU
                        </span>
                      </div>
                      <div className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                        {getClassDisplayName(resnetResult.predicted_class)}
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-[#A7B5C9] flex items-center justify-between">
                        <span>Confidence: {(resnetResult.confidence * 100).toFixed(1)}%</span>
                        <span className="font-mono text-[10px]">layer4[2].conv3</span>
                      </div>
                    </div>
                  )}

                  {vggResult && (
                    <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0D9488] dark:text-[#2DD4BF]">
                          VGG-16 Prediction
                        </span>
                        <span className="text-[11px] font-mono text-[#64748B] dark:text-[#A7B5C9]">
                          {vggResult.execution_time_ms} ms CPU
                        </span>
                      </div>
                      <div className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                        {getClassDisplayName(vggResult.predicted_class)}
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-[#A7B5C9] flex items-center justify-between">
                        <span>Confidence: {(vggResult.confidence * 100).toFixed(1)}%</span>
                        <span className="font-mono text-[10px]">features[28]</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* FOUR-CLASS PROBABILITY DISTRIBUTION */}
                <div className="pt-2 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] block">
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
                                  ? "font-bold text-[#172B4D] dark:text-[#F1F5F9]"
                                  : "text-[#64748B] dark:text-[#A7B5C9]"
                              }
                            >
                              {getClassDisplayName(clsKey)}
                            </span>
                            <span className="font-mono text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                              {pct}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#DFE7F1] dark:border-[#2B3B52] dark:bg-[#1E2E48] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isTop
                                  ? "bg-[#2563EB] dark:bg-[#3B82F6]"
                                  : "bg-[#64748B]/30 dark:bg-[#A7B5C9]/20"
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

              {/* F. GRAD-CAM EXPLAINABILITY VISUALIZATION */}
              <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#0D9488] dark:text-[#2DD4BF]" />
                      <h3 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                        Grad-CAM Spatial Explainability
                      </h3>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#A7B5C9]">
                      Gradient-weighted Class Activation Mapping isolating spatial features influencing classification.
                    </p>
                  </div>

                  {hasBoth && (
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveCamModel("resnet50")}
                        className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                          activeCamModel === "resnet50"
                            ? "bg-[#17365D] text-white dark:bg-[#3B82F6]"
                            : "text-[#64748B] dark:text-[#A7B5C9] hover:text-[#172B4D] dark:hover:text-[#F1F5F9]"
                        }`}
                      >
                        ResNet-50 Heatmap
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCamModel("vgg16")}
                        className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                          activeCamModel === "vgg16"
                            ? "bg-[#0D9488] text-white dark:bg-[#2DD4BF] dark:text-[#0F172A]"
                            : "text-[#64748B] dark:text-[#A7B5C9] hover:text-[#172B4D] dark:hover:text-[#F1F5F9]"
                        }`}
                      >
                        VGG-16 Heatmap
                      </button>
                    </div>
                  )}
                </div>

                {/* THREE ALIGNED VISUAL CARDS (1:1 ASPECT RATIO) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {/* 1. Original MRI */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#64748B] dark:text-[#A7B5C9] block text-center">
                      1. Original MRI Slice
                    </span>
                    <div className="aspect-square rounded-xl bg-black border border-[#DFE7F1] dark:border-[#2B3B52] flex items-center justify-center overflow-hidden shadow-xs">
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

                  {/* 2. Grad-CAM Heatmap (Original JET Color Scale Preserved) */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#64748B] dark:text-[#A7B5C9] block text-center">
                      2. Grad-CAM Heatmap ({activeCamModel === "resnet50" ? "ResNet-50" : "VGG-16"})
                    </span>
                    <div className="aspect-square rounded-xl bg-black border border-[#DFE7F1] dark:border-[#2B3B52] flex items-center justify-center overflow-hidden shadow-xs">
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

                  {/* 3. Grad-CAM Overlay */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#64748B] dark:text-[#A7B5C9] block text-center">
                      3. Grad-CAM Overlay (Heatmap + MRI)
                    </span>
                    <div className="aspect-square rounded-xl bg-black border border-[#DFE7F1] dark:border-[#2B3B52] flex items-center justify-center overflow-hidden shadow-xs">
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

                {/* Explainability Note */}
                <div className="p-3.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] text-xs text-[#64748B] dark:text-[#A7B5C9] space-y-1">
                  <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                    Spatial Explainability Notice:
                  </span>
                  <p className="leading-relaxed">
                    Grad-CAM isolates spatial gradients of the predicted class score with respect to feature maps in{" "}
                    <code>{activeCamModel === "resnet50" ? "layer4[2].conv3" : "features[28]"}</code>.
                    Warm colors highlight features that positively influenced the classification decision.
                    Activation maps do not represent histological tumor borders or resection margins.
                  </p>
                </div>
              </div>

              {/* BOTTOM ACTION BAR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs font-semibold text-[#0D9488] dark:text-[#2DD4BF] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Analyze Another Brain MRI Scan</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={generatingPdf}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white text-sm font-bold shadow-xs transition-all active:scale-98 disabled:opacity-70 cursor-pointer"
                >
                  {generatingPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>DOWNLOAD RESEARCH PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TABLET ONLY: Right Panel placed below the main workspace (768px - 1023px) */}
          <div className="hidden md:block lg:hidden pt-2 border-t border-[#DFE7F1] dark:border-[#2B3B52]">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-[#172B4D] dark:text-[#F1F5F9] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#0D9488] dark:text-[#2DD4BF]" />
                <span>AI Model Intelligence</span>
              </span>
              <button
                type="button"
                onClick={() => setTabletModelOpen(!tabletModelOpen)}
                className="text-xs font-semibold text-[#0D9488] dark:text-[#2DD4BF] hover:underline"
              >
                {tabletModelOpen ? "Collapse Model Intelligence" : "Expand Model Intelligence"}
              </button>
            </div>
            {tabletModelOpen && (
              <AIModelIntelligencePanel
                selectedModel={selectedModel}
                activeCamModel={activeCamModel}
                loading={loading}
                isAnalyzed={Boolean(result)}
                lastAnalysisTimestamp={lastAnalysisTimestamp}
              />
            )}
          </div>

          {/* Academic Medical Disclaimer */}
          <MedicalDisclaimer />
        </section>

        {/* COLUMN 3: RIGHT AI MODEL INTELLIGENCE SIDEBAR (~280px on Desktop lg: >= 1024px) */}
        <div className="hidden lg:block shrink-0">
          <AIModelIntelligencePanel
            selectedModel={selectedModel}
            activeCamModel={activeCamModel}
            loading={loading}
            isAnalyzed={Boolean(result)}
            lastAnalysisTimestamp={lastAnalysisTimestamp}
            collapsed={rightCollapsed}
            onToggleCollapse={() => setRightCollapsed(!rightCollapsed)}
          />
        </div>
      </div>
    </div>
  );
}
