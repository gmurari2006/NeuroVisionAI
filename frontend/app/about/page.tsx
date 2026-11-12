"use client";

import React from "react";
import Link from "next/link";
import { Brain, Layers, Eye, ShieldCheck, ArrowRight, Activity } from "lucide-react";
import { MedicalDisclaimer } from "../../components/MedicalDisclaimer";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
          About NeuroVisionAI
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#A7B5C9]">
          Clinical research medical workstation for brain MRI classification and explainable visual attention.
        </p>
      </div>

      {/* Main Overview Card */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-6 transition-colors">
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#17365D] dark:text-[#3B82F6]" />
            <span>Research Purpose</span>
          </h2>
          <p className="text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
            NeuroVisionAI is an academic research platform designed to investigate the application of deep convolutional neural networks to magnetic resonance imaging (MRI) of intracranial tumors. By pairing state-of-the-art residual learning with Gradient-weighted Class Activation Mapping (Grad-CAM), the workstation provides transparent spatial explainability for neural classifications.
          </p>
        </div>

        <div className="pt-4 border-t border-[#DFE7F1] dark:border-[#2B3B52] space-y-3">
          <h2 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0D9488] dark:text-[#2DD4BF]" />
            <span>Dual-Architecture Benchmarking</span>
          </h2>
          <p className="text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
            The platform benchmarks two distinct convolutional architectures trained and fine-tuned on standardized multi-class brain MRI datasets:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1">
              <div className="font-bold text-xs text-[#17365D] dark:text-[#3B82F6]">
                ResNet-50 (Residual Network)
              </div>
              <div className="text-xs text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
                50-layer deep network with identity shortcuts. Independent Test Accuracy: 91.06%, Macro-F1: 90.82%, ROC-AUC: 0.9803, Latency: 424.4 ms.
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1">
              <div className="font-bold text-xs text-[#0D9488] dark:text-[#2DD4BF]">
                VGG-16 (Sequential Convolution)
              </div>
              <div className="text-xs text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
                16-weight-layer architecture with 2-stage MLP head. Independent Test Accuracy: 91.63%, Macro-F1: 91.37%, ROC-AUC: 0.9791, Latency: 893.0 ms.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#DFE7F1] dark:border-[#2B3B52] space-y-3">
          <h2 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
            <span>Grad-CAM Visual Attention</span>
          </h2>
          <p className="text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
            To address the &quot;black box&quot; nature of deep neural networks, NeuroVisionAI computes the gradients of the target class score with respect to final convolutional feature maps. The resulting spatial heatmap highlights the specific anatomical areas of the brain MRI that contributed most strongly to the model&apos;s decision.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <span>Launch MRI Workstation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/models"
            className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline cursor-pointer"
          >
            View Model Benchmarks
          </Link>
          <Link
            href="/methodology"
            className="text-xs font-semibold text-[#0D9488] dark:text-[#2DD4BF] hover:underline cursor-pointer"
          >
            Scientific Methodology &amp; Audit
          </Link>
        </div>
      </div>

      {/* Medical Safety Notice */}
      <MedicalDisclaimer />
    </div>
  );
}
