"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  Layers,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Code,
  FileText,
  Activity,
  Scan,
  Database,
  BarChart3,
  HelpCircle,
  FileCheck2,
} from "lucide-react";
import { MedicalDisclaimer } from "../../components/MedicalDisclaimer";

export default function MethodologyPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Title & Introduction Banner */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-3 transition-colors">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#3B82F6] text-xs font-bold border border-[#DFE7F1] dark:border-[#2B3B52]">
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Scientific Documentation &bull; Peer-Review Standard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] dark:text-[#F1F5F9] tracking-tight">
          Research Methodology & Independent Evaluation Framework
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#A7B5C9] max-w-4xl leading-relaxed">
          Comprehensive technical specifications of deep convolutional neural network architectures,
          standardized preprocessing regimens, transfer learning fine-tuning protocols, cryptographic data
          leakage audits, independent held-out test benchmarks (N = 1,600 scans), and Gradient-weighted
          Class Activation Mapping (Grad-CAM) implementations for NeuroVisionAI.
        </p>
      </div>

      <MedicalDisclaimer />

      {/* Navigation Index Anchor */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7B5C9] block">
          Methodology Index
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <a href="#overview" className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] hover:text-[#2563EB] dark:hover:text-[#3B82F6] border border-[#DFE7F1] dark:border-[#2B3B52] transition-colors">
            1. Clinical Context & Scope
          </a>
          <a href="#classes" className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] hover:text-[#2563EB] dark:hover:text-[#3B82F6] border border-[#DFE7F1] dark:border-[#2B3B52] transition-colors">
            2. Diagnostic Classes
          </a>
          <a href="#dataset" className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] hover:text-[#2563EB] dark:hover:text-[#3B82F6] border border-[#DFE7F1] dark:border-[#2B3B52] transition-colors">
            3. Dataset & Leakage Audit
          </a>
          <a href="#preprocessing" className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] hover:text-[#2563EB] dark:hover:text-[#3B82F6] border border-[#DFE7F1] dark:border-[#2B3B52] transition-colors">
            4. Image Preprocessing
          </a>
          <a href="#resnet50" className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] hover:text-[#2563EB] dark:hover:text-[#3B82F6] border border-[#DFE7F1] dark:border-[#2B3B52] transition-colors">
            5. ResNet-50 Architecture
          </a>
          <a href="#vgg16" className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] hover:text-[#2563EB] dark:hover:text-[#3B82F6] border border-[#DFE7F1] dark:border-[#2B3B52] transition-colors">
            6. VGG-16 Architecture
          </a>
          <a href="#evaluation" className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] hover:text-[#2563EB] dark:hover:text-[#3B82F6] border border-[#DFE7F1] dark:border-[#2B3B52] transition-colors">
            7. Independent Test Benchmark
          </a>
          <a href="#glioma-analysis" className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] hover:text-[#2563EB] dark:hover:text-[#3B82F6] border border-[#DFE7F1] dark:border-[#2B3B52] transition-colors">
            8. Glioma Sensitivity Analysis
          </a>
          <a href="#softmax" className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] hover:text-[#2563EB] dark:hover:text-[#3B82F6] border border-[#DFE7F1] dark:border-[#2B3B52] transition-colors">
            9. Softmax Calibration
          </a>
          <a href="#gradcam" className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] hover:text-[#2563EB] dark:hover:text-[#3B82F6] border border-[#DFE7F1] dark:border-[#2B3B52] transition-colors">
            10. Grad-CAM Explainability
          </a>
          <a href="#limitations" className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] text-[#172B4D] dark:text-[#F1F5F9] hover:text-[#2563EB] dark:hover:text-[#3B82F6] border border-[#DFE7F1] dark:border-[#2B3B52] transition-colors">
            11. Scientific Limitations
          </a>
        </div>
      </div>

      {/* SECTION 1: OVERVIEW */}
      <section id="overview" className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-3">
        <h2 className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
          1. Project Overview & Clinical Context
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
          Intracranial neoplasms represent heterogeneous brain tumors exhibiting distinct cellular origins,
          infiltrative tendencies, and radiological characteristics on magnetic resonance imaging (MRI).
          NeuroVisionAI is an academic research platform created to benchmark deep convolutional neural
          networks on multi-class brain tumor classification while providing visual explainability through
          spatial gradient attribution.
        </p>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
          By comparing the spatial activation patterns of a modern residual network (ResNet-50) with
          a classic sequential feed-forward network (VGG-16), researchers can investigate how architectural
          depth, receptive field size, and skip connections influence the representation of brain tumor features.
        </p>
      </section>

      {/* SECTION 2: CLASSES */}
      <section id="classes" className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-3">
        <h2 className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
          2. Target Classification Categories
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
          The models are trained across four distinct categories using balanced retrospective brain MRI datasets:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1.5">
            <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">Class 0: Glioma</span>
            <p className="text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
              Infiltrative intra-axial neoplasms originating from supportive glial tissue (astrocytomas,
              oligodendrogliomas, and glioblastomas). Often characterized by ill-defined margins, invasive
              parenchymal spread, and surrounding vasogenic edema.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1.5">
            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">Class 1: Meningioma</span>
            <p className="text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
              Predominantly benign extra-axial tumors developing from the arachnoid cap cells of the meninges.
              Typically present with sharp demarcations, broad dural attachments, and homogeneous contrast
              enhancement.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1.5">
            <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">Class 2: Pituitary Adenoma</span>
            <p className="text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
              Benign neuroendocrine lesions located within the sella turcica at the cranial base. May expand
              superiorly into the suprasellar cistern, causing characteristic compression of the optic chiasm.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-1.5">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Class 3: No Tumor (Control)</span>
            <p className="text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
              Negative control scans showing preserved cerebral ventricles, intact hemispheric symmetry, and
              unremarkable white/gray matter differentiation without identified neoplastic lesions.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: DATASET ARCHITECTURE & AUDIT */}
      <section id="dataset" className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
          <Database className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
          3. Dataset Architecture & Cryptographic Leakage Audit
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
          The retrospective benchmark comprises <strong>7,200 total axial brain MRI scans</strong> partitioned into
          fixed training and testing splits with strictly balanced class distributions:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#DFE7F1] dark:border-[#2B3B52] text-[#64748B] dark:text-[#A7B5C9] font-mono uppercase text-[11px]">
                <th className="py-2.5 px-3">Split</th>
                <th className="py-2.5 px-3">Glioma</th>
                <th className="py-2.5 px-3">Meningioma</th>
                <th className="py-2.5 px-3">Pituitary</th>
                <th className="py-2.5 px-3">No Tumor</th>
                <th className="py-2.5 px-3">Total Images</th>
                <th className="py-2.5 px-3">Proportion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE7F1] dark:divide-[#2B3B52] font-mono text-[#172B4D] dark:text-[#F1F5F9]">
              <tr>
                <td className="py-2 px-3 font-semibold text-[#2563EB] dark:text-[#3B82F6]">Training Set</td>
                <td className="py-2 px-3">1,400</td>
                <td className="py-2 px-3">1,400</td>
                <td className="py-2 px-3">1,400</td>
                <td className="py-2 px-3">1,400</td>
                <td className="py-2 px-3 font-bold">5,600</td>
                <td className="py-2 px-3 text-[#64748B] dark:text-[#A7B5C9]">77.78%</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-[#0D9488] dark:text-[#2DD4BF]">Independent Test Set</td>
                <td className="py-2 px-3">400</td>
                <td className="py-2 px-3">400</td>
                <td className="py-2 px-3">400</td>
                <td className="py-2 px-3">400</td>
                <td className="py-2 px-3 font-bold">1,600</td>
                <td className="py-2 px-3 text-[#64748B] dark:text-[#A7B5C9]">22.22%</td>
              </tr>
              <tr className="font-bold bg-[#F4F7FB] dark:bg-[#111C30]">
                <td className="py-2.5 px-3">Combined Total</td>
                <td className="py-2.5 px-3">1,800</td>
                <td className="py-2.5 px-3">1,800</td>
                <td className="py-2.5 px-3">1,800</td>
                <td className="py-2.5 px-3">1,800</td>
                <td className="py-2.5 px-3 text-[#2563EB] dark:text-[#3B82F6]">7,200</td>
                <td className="py-2.5 px-3">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Audit findings box */}
        <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#15803D] dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Cryptographic SHA-256 Hash Duplicate Audit: 0.00% Cross-Split Leakage</span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
            Every file in both training (5,600 files) and testing (1,600 files) splits was hashed using SHA-256.
            There are <strong>zero byte-identical images</strong> between the training set and testing set,
            confirming that no direct sample memorization occurred across partitions.
          </p>
        </div>

        {/* Patient-level Independence Warning */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-2 text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Crucial Scientific Caveat: Patient-Level Independence Not Claimed</span>
          </div>
          <p className="text-xs leading-relaxed">
            While exact file duplicate leakage is verified at 0.00%, <strong>patient-level independence is NOT claimed</strong>.
            The open-source retrospective dataset does not supply de-identified patient IDs, sequence series headers,
            or DICOM tags. In multi-slice axial brain MRI examinations, consecutive 2D slices from the same individual
            may exhibit near-identical anatomical structures. Consequently, slice-level partitioning may inflate model
            confidence relative to a true hospital-wide out-of-domain patient-level evaluation.
          </p>
        </div>
      </section>

      {/* SECTION 4: PREPROCESSING */}
      <section id="preprocessing" className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-3">
        <h2 className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
          4. Image Preprocessing Pipeline
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
          Input MRI scans undergo standardized inference normalization matching the original training pipeline:
        </p>
        <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] font-mono text-xs space-y-2 text-[#172B4D] dark:text-[#F1F5F9]">
          <div>
            <span className="font-bold text-[#2563EB] dark:text-[#3B82F6]">1. Channel Harmonization:</span> All scans (grayscale
            or RGB) are converted to 3-channel RGB tensors via PIL <code>convert(&quot;RGB&quot;)</code>.
          </div>
          <div>
            <span className="font-bold text-[#2563EB] dark:text-[#3B82F6]">2. Spatial Resizing:</span> Bilinear interpolation
            scales inputs to <code>(224, 224)</code> pixels, matching the convolutional receptive field
            established during transfer learning.
          </div>
          <div>
            <span className="font-bold text-[#2563EB] dark:text-[#3B82F6]">3. Tensor Scaling:</span> Pixel intensities are mapped
            from <code>[0, 255]</code> to floating-point tensors in <code>[0.0, 1.0]</code>.
          </div>
          <div>
            <span className="font-bold text-[#2563EB] dark:text-[#3B82F6]">4. Z-Score Normalization:</span> Standardized using ImageNet
            constants:
            <br />
            <code>Mean: [0.485, 0.456, 0.406] &bull; Std: [0.229, 0.224, 0.225]</code>
          </div>
        </div>
      </section>

      {/* SECTION 5 & 6: ARCHITECTURES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ResNet-50 */}
        <section id="resnet50" className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
            <h2 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9]">5. ResNet-50 Architecture</h2>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
            Constructed with residual bottleneck blocks featuring identity shortcut connections ($F(x) + x$)
            to prevent vanishing gradients during deep backpropagation across 50 layers.
          </p>
          <div className="p-3.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] font-mono text-xs space-y-1.5 text-[#172B4D] dark:text-[#F1F5F9]">
            <div>&bull; Backbone: 50 convolutional layers</div>
            <div>&bull; Feature Dimension: 2,048 channels</div>
            <div>&bull; Total Parameters: <strong>23.51 M</strong></div>
            <div>&bull; Classifier Head: <code>nn.Linear(2048, 4)</code></div>
            <div>&bull; Best Epoch Checkpoint: Epoch 8</div>
            <div>&bull; Test Accuracy: <strong>91.06%</strong> &bull; Macro-F1: <strong>90.82%</strong></div>
            <div>&bull; Grad-CAM Target: <code>layer4[2].conv3</code></div>
            <div>&bull; Mean CPU Latency: <strong>424.4 ms</strong> (2.1x faster than VGG-16)</div>
          </div>
        </section>

        {/* VGG-16 */}
        <section id="vgg16" className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0D9488] dark:text-[#2DD4BF]" />
            <h2 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9]">6. VGG-16 Architecture</h2>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
            Utilizes sequential $3 \times 3$ convolutional filters with $2 \times 2$ max-pooling, feeding into a
            customized 2-stage multilayer perceptron (MLP) classification head.
          </p>
          <div className="p-3.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] font-mono text-xs space-y-1.5 text-[#172B4D] dark:text-[#F1F5F9]">
            <div>&bull; Backbone: 13 convolutional + 3 linear layers</div>
            <div>&bull; Flattened Features: $512 \times 7 \times 7 = 25,088$</div>
            <div>&bull; Total Parameters: <strong>134.27 M</strong></div>
            <div>
              &bull; Classifier: <code>Linear(25088, 512) &rarr; ReLU &rarr; Dropout(0.5) &rarr; Linear(512, 4)</code>
            </div>
            <div>&bull; Best Epoch Checkpoint: Epoch 8</div>
            <div>&bull; Test Accuracy: <strong>91.63%</strong> &bull; Macro-F1: <strong>91.37%</strong></div>
            <div>&bull; Grad-CAM Target: <code>features[28]</code></div>
            <div>&bull; Mean CPU Latency: <strong>893.0 ms</strong></div>
          </div>
        </section>
      </div>

      {/* SECTION 7: INDEPENDENT TEST BENCHMARK */}
      <section id="evaluation" className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
          7. Independent Testing Set Benchmark Results (N = 1,600)
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
          Both models were evaluated on the held-out independent test set of 1,600 scans (400 per class).
          Independent test results are distinct from internal validation metrics:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#DFE7F1] dark:border-[#2B3B52] text-[#64748B] dark:text-[#A7B5C9] font-mono uppercase text-[11px]">
                <th className="py-2.5 px-3">Metric</th>
                <th className="py-2.5 px-3">ResNet-50</th>
                <th className="py-2.5 px-3">VGG-16</th>
                <th className="py-2.5 px-3">Statistical Comparison</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE7F1] dark:divide-[#2B3B52] font-mono text-[#172B4D] dark:text-[#F1F5F9]">
              <tr>
                <td className="py-2 px-3 font-semibold">Test Accuracy</td>
                <td className="py-2 px-3 font-bold text-[#2563EB] dark:text-[#3B82F6]">91.06% (1,457 / 1,600)</td>
                <td className="py-2 px-3 font-bold text-[#0D9488] dark:text-[#2DD4BF]">91.63% (1,466 / 1,600)</td>
                <td className="py-2 px-3 text-[#64748B] dark:text-[#A7B5C9]">+0.57% (p = 0.380, Not Sig.)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">Macro Precision</td>
                <td className="py-2 px-3">91.65%</td>
                <td className="py-2 px-3">92.37%</td>
                <td className="py-2 px-3 text-[#64748B] dark:text-[#A7B5C9]">+0.72%</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">Macro Recall</td>
                <td className="py-2 px-3">91.06%</td>
                <td className="py-2 px-3">91.63%</td>
                <td className="py-2 px-3 text-[#64748B] dark:text-[#A7B5C9]">+0.57%</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">Macro F1-Score</td>
                <td className="py-2 px-3 font-bold">90.82%</td>
                <td className="py-2 px-3 font-bold">91.37%</td>
                <td className="py-2 px-3 text-[#64748B] dark:text-[#A7B5C9]">+0.55%</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">ROC-AUC (Macro OVR)</td>
                <td className="py-2 px-3 font-bold text-[#2563EB] dark:text-[#3B82F6]">0.9803</td>
                <td className="py-2 px-3 font-bold text-[#0D9488] dark:text-[#2DD4BF]">0.9791</td>
                <td className="py-2 px-3 text-[#64748B] dark:text-[#A7B5C9]">ResNet-50 +0.0012</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">Parameters</td>
                <td className="py-2 px-3 font-bold">23.51 M</td>
                <td className="py-2 px-3 font-bold">134.27 M</td>
                <td className="py-2 px-3 text-[#64748B] dark:text-[#A7B5C9]">ResNet-50 5.7x more compact</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">Mean CPU Latency</td>
                <td className="py-2 px-3 font-bold">424.4 ms</td>
                <td className="py-2 px-3 font-bold">893.0 ms</td>
                <td className="py-2 px-3 text-[#64748B] dark:text-[#A7B5C9]">ResNet-50 2.1x faster</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">McNemar&apos;s Paired Test</td>
                <td colSpan={3} className="py-2 px-3 text-[#64748B] dark:text-[#A7B5C9]">
                  &chi;&sup2; = 0.7711 &bull; <strong>p = 0.3799</strong> &bull; Fail to reject null hypothesis; models exhibit equivalent accuracy
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 8: GLIOMA SENSITIVITY INVESTIGATION */}
      <section id="glioma-analysis" className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9]">
            8. Scientific Investigation: Glioma Recall Bottleneck
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
          While internal validation suggested &gt;95% accuracy, independent test evaluation exposed a noticeable drop
          in <strong>Glioma sensitivity (recall 74.25% in ResNet-50, 72.75% in VGG-16)</strong>.
          Analysis of all 1,600 test cases revealed the exact error distribution:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-2">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
              1. Glioma &rarr; Meningioma Confusion (57.3% &ndash; 72.5% of errors)
            </span>
            <p className="text-xs text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
              When gliomas develop cortical mass effect or abut the dura mater, 2D convolutional filters perceive
              hyperintense margin enhancement similar to extra-axial meningiomas, confusing the infiltrative parenchymal
              glioma with encapsulated meningeal growth.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] space-y-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              2. Glioma &rarr; No Tumor Confusion (23.8% &ndash; 35.0% of errors)
            </span>
            <p className="text-xs text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
              In peripheral apical or skull base axial cuts where only faint infiltration is visible without necrotic
              cavitation, both 2D models frequently classify the slice as unremarkable parenchyma (&quot;No Tumor&quot;).
              This underscores the necessity of 3D volumetric MRI analysis in clinical settings.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 9: SOFTMAX */}
      <section id="softmax" className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-3">
        <h2 className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
          9. Softmax Score Interpretation & Calibration Limitations
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
          The output classification vector is normalized via the softmax operator:
        </p>
        <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] font-mono text-center text-xs text-[#172B4D] dark:text-[#F1F5F9]">
          <code>P(y = c | x) = exp(z_c) / &sum; [exp(z_j)] for j &isin; &#123;0, 1, 2, 3&#125;</code>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300 space-y-1.5">
          <strong>Important Calibration Note:</strong> Raw softmax outputs represent relative neural network
          activation distributions over the 4 trained classes. They do <em>not</em> represent calibrated
          Bayesian posterior probabilities or clinical diagnostic certainty. High confidence scores (&gt;99%) may occur
          even when presented with out-of-distribution imaging artifacts or non-brain inputs.
        </div>
      </section>

      {/* SECTION 10: GRAD-CAM */}
      <section id="gradcam" className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-3">
        <h2 className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9] flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
          10. Gradient-Weighted Class Activation Mapping (Grad-CAM)
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
          Grad-CAM computes the gradient of the target class logit $y^c$ with respect to feature activation
          maps $A^k$ of the final convolutional layer:
        </p>
        <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52] font-mono text-xs space-y-2 text-[#172B4D] dark:text-[#F1F5F9]">
          <div className="text-center">
            <code>&alpha;_k^c = (1 / Z) &times; &sum;_i &sum;_j (&part;y^c / &part;A_{"{i,j}"}^k)</code>
          </div>
          <div className="text-center pt-1">
            <code>L_&#123;Grad-CAM&#125;^c = ReLU(&sum;_k &alpha;_k^c A^k)</code>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
          The rectifying linear unit (ReLU) ensures the visualizer isolates spatial features that exert a positive
          influence on the target class score. The coarse heatmaps are upsampled bilinearly and blended
          using the Jet colormap ($45\%$ heatmap opacity, $55\%$ anatomical MRI slice).
        </p>
      </section>

      {/* SECTION 11: LIMITATIONS */}
      <section id="limitations" className="p-6 rounded-xl bg-white dark:bg-[#17243A] border border-[#DFE7F1] dark:border-[#2B3B52] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          11. Scientific, Methodological & Clinical Limitations
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-[#64748B] dark:text-[#A7B5C9] leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52]">
            <strong className="text-[#172B4D] dark:text-[#F1F5F9]">&bull; 2D Slice Limitation:</strong> The benchmark processes single 2D slices without
            incorporating 3D volumetric context, multi-planar cross-referencing (axial, sagittal, coronal), or longitudinal temporal tracking.
          </div>
          <div className="p-3.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52]">
            <strong className="text-[#172B4D] dark:text-[#F1F5F9]">&bull; Scanner Domain Shift:</strong> The models were evaluated on retrospective benchmark
            datasets. Generalizability to varied scanner field strengths (1.5 Tesla vs. 3.0 Tesla), differing radiofrequency
            coils, contrast-enhanced T1-weighted vs. T2/FLAIR protocols, and motion artifacts has not been verified.
          </div>
          <div className="p-3.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52]">
            <strong className="text-[#172B4D] dark:text-[#F1F5F9]">&bull; Lack of Patient-Level Metadata:</strong> Absence of subject-level identifiers prevents
            verifying that all slices of a given subject remain strictly within one partition.
          </div>
          <div className="p-3.5 rounded-xl bg-[#F4F7FB] dark:bg-[#111C30] border border-[#DFE7F1] dark:border-[#2B3B52]">
            <strong className="text-[#172B4D] dark:text-[#F1F5F9]">&bull; Non-Diagnostic Status:</strong> This platform is designed solely for computational
            research into deep visual features and attention mechanisms. It must never substitute for clinical
            radiological evaluation or histological biopsy confirmation.
          </div>
        </div>
      </section>
    </div>
  );
}
