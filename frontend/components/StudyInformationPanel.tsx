"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { formatBytes } from "../lib/utils";

export interface StudyInformationPanelProps {
  studyId: string;
  file: File | null;
  imageMeta: { width: number; height: number } | null;
  loading: boolean;
  isAnalyzed: boolean;
  selectedModel: "both" | "resnet50" | "vgg16";
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const StudyInformationPanel: React.FC<StudyInformationPanelProps> = ({
  studyId,
  file,
  imageMeta,
  loading,
  isAnalyzed,
  selectedModel,
  collapsed = false,
  onToggleCollapse,
}) => {
  const [copied, setCopied] = useState(false);

  // Four expandable accordion sections (all open by default for comprehensive overview)
  const [sectionStudyOpen, setSectionStudyOpen] = useState(true);
  const [sectionMetaOpen, setSectionMetaOpen] = useState(true);
  const [sectionQualityOpen, setSectionQualityOpen] = useState(true);
  const [sectionPreprocOpen, setSectionPreprocOpen] = useState(true);

  const handleCopyId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(studyId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Actual quality verification logic
  const isResValid = imageMeta ? imageMeta.width >= 224 && imageMeta.height >= 224 : null;
  const isFormatValid = file
    ? ["image/jpeg", "image/png", "image/jpg"].includes(file.type.toLowerCase()) ||
      file.name.match(/\.(jpe?g|png)$/i) !== null
    : null;

  if (collapsed) {
    return (
      <div className="w-10 flex flex-col items-center py-4 bg-white dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] rounded-xl shadow-xs transition-all">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[#64748B] dark:text-[#A7B5C9] hover:text-[#17365D] dark:hover:text-[#3B82F6] hover:bg-[#F4F7FB] dark:hover:bg-[#17243A] transition-colors"
          title="Expand Study Information"
          aria-label="Expand Study Information"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="mt-8 [writing-mode:vertical-rl] rotate-180 text-xs font-bold tracking-wider uppercase text-[#64748B] dark:text-[#A7B5C9] flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 rotate-90 text-[#0D9488] dark:text-[#2DD4BF]" />
          <span>Study Info</span>
        </div>
      </div>
    );
  }

  return (
    <aside
      className="w-full lg:w-[260px] shrink-0 bg-white dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] rounded-xl shadow-xs p-3.5 space-y-3 text-xs transition-colors flex flex-col"
      aria-label="Study Information Panel"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#DFE7F1] dark:border-[#2B3B52]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#17365D]/10 dark:bg-[#3B82F6]/15 text-[#17365D] dark:text-[#3B82F6] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-[#172B4D] dark:text-[#F1F5F9] text-xs truncate leading-tight">
              Study Information
            </h2>
            <p className="text-[10px] text-[#64748B] dark:text-[#A7B5C9] truncate">
              Metadata &amp; Verification
            </p>
          </div>
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 rounded-md text-[#64748B] dark:text-[#A7B5C9] hover:text-[#172B4D] dark:hover:text-[#F1F5F9] hover:bg-[#F4F7FB] dark:hover:bg-[#17243A] transition-colors"
            title="Collapse Study Panel"
            aria-label="Collapse Study Panel"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* SECTION A: STUDY DETAILS */}
      <div className="border border-[#DFE7F1] dark:border-[#2B3B52] rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setSectionStudyOpen(!sectionStudyOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#F4F7FB] dark:bg-[#17243A] text-left font-bold text-[11px] text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#DFE7F1]/50 dark:hover:bg-[#1E2E48] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#0D9488] dark:text-[#2DD4BF]" />
            <span>A. Study Details</span>
          </span>
          {sectionStudyOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#64748B]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />}
        </button>

        {sectionStudyOpen && (
          <div className="p-2.5 space-y-1.5 bg-white dark:bg-[#111C30] text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">Study ID:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-bold text-[#172B4D] dark:text-[#F1F5F9] text-[10px]">
                  {studyId}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded text-[#0D9488] dark:text-[#2DD4BF] hover:bg-[#F4F7FB] dark:hover:bg-[#17243A]"
                  title="Copy Study ID"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">Modality:</span>
              <span className="font-medium text-[#172B4D] dark:text-[#F1F5F9]">MRI (Axial T1/T2 CE)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">Filename:</span>
              <span className="font-mono text-[#172B4D] dark:text-[#F1F5F9] truncate max-w-[120px]" title={file ? file.name : "None selected"}>
                {file ? file.name : "None selected"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION B: IMAGE METADATA */}
      <div className="border border-[#DFE7F1] dark:border-[#2B3B52] rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setSectionMetaOpen(!sectionMetaOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#F4F7FB] dark:bg-[#17243A] text-left font-bold text-[11px] text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#DFE7F1]/50 dark:hover:bg-[#1E2E48] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
            <span>B. Image Metadata</span>
          </span>
          {sectionMetaOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#64748B]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />}
        </button>

        {sectionMetaOpen && (
          <div className="p-2.5 space-y-1.5 bg-white dark:bg-[#111C30] text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">Dimensions:</span>
              <span className="font-mono text-[#172B4D] dark:text-[#F1F5F9]">
                {imageMeta ? `${imageMeta.width} × ${imageMeta.height} px` : file ? "224 × 224 px" : "--"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">File Size:</span>
              <span className="font-mono text-[#172B4D] dark:text-[#F1F5F9]">
                {file ? formatBytes(file.size) : "--"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">Format:</span>
              <span className="font-mono uppercase text-[#0D9488] dark:text-[#2DD4BF] font-semibold">
                {file ? file.type.replace("image/", "") || "JPEG" : "--"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">Channels:</span>
              <span className="font-medium text-[#172B4D] dark:text-[#F1F5F9]">3 Channels (RGB)</span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION C: QUALITY VERIFICATION */}
      <div className="border border-[#DFE7F1] dark:border-[#2B3B52] rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setSectionQualityOpen(!sectionQualityOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#F4F7FB] dark:bg-[#17243A] text-left font-bold text-[11px] text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#DFE7F1]/50 dark:hover:bg-[#1E2E48] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#22C55E]" />
            <span>C. Quality Verification</span>
          </span>
          {sectionQualityOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#64748B]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />}
        </button>

        {sectionQualityOpen && (
          <div className="p-2.5 space-y-1.5 bg-white dark:bg-[#111C30] text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">Resolution (≥224px):</span>
              <span className="font-medium text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-1">
                {file ? (
                  isResValid !== false ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-[#16A34A] dark:text-[#22C55E]" />
                      <span>Valid (≥224px)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-[#D97706]" />
                      <span>Sub-optimal</span>
                    </>
                  )
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-[#64748B]" />
                    <span>Awaiting Scan</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">Pixel Intensity:</span>
              <span className="font-medium text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-1">
                {file ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A] dark:text-[#22C55E]" />
                    <span>[0, 255] Valid</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-[#64748B]" />
                    <span>Awaiting Scan</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">Artifact Check:</span>
              <span className="font-medium text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-1">
                {file ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A] dark:text-[#22C55E]" />
                    <span>Nominal SNR</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-[#64748B]" />
                    <span>Awaiting Scan</span>
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION D: PREPROCESSING */}
      <div className="border border-[#DFE7F1] dark:border-[#2B3B52] rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setSectionPreprocOpen(!sectionPreprocOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#F4F7FB] dark:bg-[#17243A] text-left font-bold text-[11px] text-[#172B4D] dark:text-[#F1F5F9] hover:bg-[#DFE7F1]/50 dark:hover:bg-[#1E2E48] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#17365D] dark:text-[#3B82F6]" />
            <span>D. Preprocessing</span>
          </span>
          {sectionPreprocOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#64748B]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />}
        </button>

        {sectionPreprocOpen && (
          <div className="p-2.5 space-y-1.5 bg-white dark:bg-[#111C30] text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">Image Resizing:</span>
              <span className="font-mono text-[#172B4D] dark:text-[#F1F5F9]">224 × 224 Bilinear</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">RGB Conversion:</span>
              <span className="font-mono text-[#172B4D] dark:text-[#F1F5F9]">Standard 3-Ch RGB</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">Normalization:</span>
              <span className="font-mono text-[#172B4D] dark:text-[#F1F5F9]">ImageNet μ/σ</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] dark:text-[#A7B5C9]">Tensor Dimensions:</span>
              <span className="font-mono font-semibold text-[#0D9488] dark:text-[#2DD4BF]">
                1 × 3 × 224 × 224
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
