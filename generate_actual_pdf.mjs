import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { jsPDF } = require("./frontend/node_modules/jspdf/dist/jspdf.node.min.js");

function getClassDisplayName(key) {
  const map = {
    glioma: "Glioma",
    meningioma: "Meningioma",
    pituitary: "Pituitary Adenoma",
    notumor: "No Tumor (Control)",
  };
  return map[key] || key;
}

async function run() {
  console.log("Loading sample inference result...");
  const rawData = fs.readFileSync("evaluation/sample_inference_result.json", "utf-8");
  const data = JSON.parse(rawData);

  console.log("Generating 2-page publication-grade PDF report...");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const resnetResult = data.results["resnet50"];
  const vggResult = data.results["vgg16"];
  const hasBoth = Boolean(resnetResult && vggResult);
  const modelsAgree = hasBoth && resnetResult?.predicted_class === vggResult?.predicted_class;

  // =========================================================================
  // PAGE 1: INDIVIDUAL SCAN ANALYSIS & EXPLAINABILITY
  // =========================================================================
  let y = 14;

  // 1. Header Banner
  doc.setFillColor(22, 50, 79); // #16324F
  doc.rect(margin, y, contentWidth, 20, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("NeuroVisionAI", margin + 6, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Clinical AI Research Platform • Brain MRI Classification & Grad-CAM XAI", margin + 6, y + 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("EXECUTIVE SCAN ANALYSIS REPORT", pageWidth - margin - 6, y + 8, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Generated: ${new Date().toISOString().replace("T", " ").substring(0, 19)} UTC`, pageWidth - margin - 6, y + 14, { align: "right" });

  y += 24;

  // 2. Scan & Session Metadata Table
  doc.setFillColor(244, 247, 251);
  doc.rect(margin, y, contentWidth, 14, "F");
  doc.setDrawColor(220, 229, 239);
  doc.rect(margin, y, contentWidth, 14, "S");

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("SCAN FILENAME", margin + 4, y + 5);
  doc.text("IMAGE RESOLUTION", margin + 65, y + 5);
  doc.text("FILE SIZE", margin + 115, y + 5);
  doc.text("ANALYSIS MODE", margin + 145, y + 5);

  doc.setTextColor(36, 52, 71);
  doc.setFont("helvetica", "bold");
  doc.text(data.image_metadata.filename.substring(0, 30), margin + 4, y + 10);
  doc.text(`${data.image_metadata.width} x ${data.image_metadata.height} px`, margin + 65, y + 10);
  doc.text(`${(data.image_metadata.size_bytes / 1024).toFixed(1)} KB`, margin + 115, y + 10);
  doc.text(hasBoth ? "Dual Model Comparison" : "Single Model", margin + 145, y + 10);

  y += 18;

  // 3. Model Classification Results & Consensus
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(22, 50, 79);
  doc.text("1. Model Predictions & Convergence Status (Research Inference)", margin, y);
  y += 4;

  const cardWidth = hasBoth ? (contentWidth - 4) / 2 : contentWidth;

  // ResNet-50 Result Box
  if (resnetResult) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 229, 239);
    doc.roundedRect(margin, y, cardWidth, 23, 2, 2, "FD");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(23, 105, 170);
    doc.text("Fine-Tuned ResNet-50 (Residual Network)", margin + 4, y + 6);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Inference Latency: ${resnetResult.execution_time_ms} ms | Target: layer4[2].conv3`, margin + 4, y + 11);

    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(36, 52, 71);
    doc.text(getClassDisplayName(resnetResult.predicted_class), margin + 4, y + 18);

    doc.setFontSize(8.5);
    doc.setTextColor(23, 105, 170);
    doc.text(`Score: ${(resnetResult.confidence * 100).toFixed(1)}%`, margin + cardWidth - 4, y + 18, { align: "right" });
  }

  // VGG-16 Result Box
  if (vggResult) {
    const vggX = hasBoth ? margin + cardWidth + 4 : margin;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 229, 239);
    doc.roundedRect(vggX, y, cardWidth, 23, 2, 2, "FD");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(21, 157, 145);
    doc.text("Fine-Tuned VGG-16 (Sequential ConvNet)", vggX + 4, y + 6);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Inference Latency: ${vggResult.execution_time_ms} ms | Target: features[28]`, vggX + 4, y + 11);

    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(36, 52, 71);
    doc.text(getClassDisplayName(vggResult.predicted_class), vggX + 4, y + 18);

    doc.setFontSize(8.5);
    doc.setTextColor(21, 157, 145);
    doc.text(`Score: ${(vggResult.confidence * 100).toFixed(1)}%`, vggX + cardWidth - 4, y + 18, { align: "right" });
  }

  y += 27;

  // Consensus Status Bar
  if (hasBoth) {
    doc.setFillColor(modelsAgree ? 240 : 255, modelsAgree ? 253 : 247, modelsAgree ? 244 : 230);
    doc.setDrawColor(modelsAgree ? 187 : 252, modelsAgree ? 247 : 211, modelsAgree ? 208 : 77);
    doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, "FD");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(modelsAgree ? 21 : 146, modelsAgree ? 128 : 64, modelsAgree ? 61 : 14);
    const consensusMsg = modelsAgree
      ? "CONVERGENT PREDICTION: ResNet-50 and VGG-16 agree on the highest softmax class. (Empirical benchmark consensus accuracy: 95.4%)."
      : "MODEL DISCREPANCY DETECTED: ResNet-50 and VGG-16 diverge. Models disagree in ~6.9% of benchmark cases. Compare Grad-CAM heatmaps.";
    doc.text(consensusMsg, margin + 4, y + 5);
    y += 12;
  }

  // 4. Softmax Probability Distribution Across 4 Categories
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(22, 50, 79);
  doc.text("2. Softmax Categorical Score Distribution Across Diagnostic Categories", margin, y);
  y += 4;

  doc.setFillColor(244, 247, 251);
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setDrawColor(220, 229, 239);
  doc.rect(margin, y, contentWidth, 6, "S");

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("DIAGNOSTIC CATEGORY", margin + 4, y + 4.2);
  doc.text("PATHOLOGICAL DESCRIPTION", margin + 45, y + 4.2);
  doc.text("RESNET-50 SCORE", margin + 125, y + 4.2);
  doc.text("VGG-16 SCORE", margin + 155, y + 4.2);
  y += 6;

  const classRows = [
    { key: "glioma", name: "Glioma", desc: "Infiltrative intra-axial glial cell neoplasm" },
    { key: "meningioma", name: "Meningioma", desc: "Extra-axial tumor arising from arachnoid cap cells" },
    { key: "pituitary", name: "Pituitary Adenoma", desc: "Sellar/suprasellar cranial base neuroendocrine tumor" },
    { key: "notumor", name: "No Tumor (Control)", desc: "Normal brain parenchyma without focal neoplastic mass" },
  ];

  doc.setFont("helvetica", "normal");
  classRows.forEach((row, i) => {
    const resScore = resnetResult?.probabilities[row.key];
    const vggScore = vggResult?.probabilities[row.key];

    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 5.5, "F");
    }
    doc.rect(margin, y, contentWidth, 5.5, "S");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(36, 52, 71);
    doc.text(row.name, margin + 4, y + 3.8);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(row.desc, margin + 45, y + 3.8);

    doc.setTextColor(23, 105, 170);
    doc.text(resScore !== undefined ? `${(resScore * 100).toFixed(1)}%` : "N/A", margin + 125, y + 3.8);

    doc.setTextColor(21, 157, 145);
    doc.text(vggScore !== undefined ? `${(vggScore * 100).toFixed(1)}%` : "N/A", margin + 155, y + 3.8);

    y += 5.5;
  });

  y += 6;

  // 5. Visual Explainability Triad
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(22, 50, 79);
  doc.text("3. Spatial Explainability Triad (Grad-CAM Visual Attention Heatmaps)", margin, y);
  y += 4;

  const imgBoxWidth = (contentWidth - 8) / 3;
  const imgBoxHeight = 52;

  // Box 1: Original MRI
  doc.setDrawColor(220, 229, 239);
  doc.rect(margin, y, imgBoxWidth, imgBoxHeight + 6, "S");
  doc.setFontSize(7.5);
  doc.setTextColor(36, 52, 71);
  doc.text("Original MRI Slice", margin + 2, y + 4.5);

  const origSrc = resnetResult?.gradcam?.original_base64 || vggResult?.gradcam?.original_base64;
  if (origSrc) {
    try {
      doc.addImage(origSrc, "PNG", margin + 1, y + 5.5, imgBoxWidth - 2, imgBoxHeight - 1);
    } catch (e) {
      doc.text("[Image Render Unavailable]", margin + 4, y + 26);
    }
  }

  // Box 2: ResNet-50 Grad-CAM
  const box2X = margin + imgBoxWidth + 4;
  doc.rect(box2X, y, imgBoxWidth, imgBoxHeight + 6, "S");
  doc.text("ResNet-50 Grad-CAM (layer4)", box2X + 2, y + 4.5);
  if (resnetResult?.gradcam?.overlay_base64) {
    try {
      doc.addImage(resnetResult.gradcam.overlay_base64, "PNG", box2X + 1, y + 5.5, imgBoxWidth - 2, imgBoxHeight - 1);
    } catch (e) {
      doc.text("[Overlay Unavailable]", box2X + 4, y + 26);
    }
  }

  // Box 3: VGG-16 Grad-CAM
  const box3X = margin + (imgBoxWidth + 4) * 2;
  doc.rect(box3X, y, imgBoxWidth, imgBoxHeight + 6, "S");
  doc.text("VGG-16 Grad-CAM (conv5)", box3X + 2, y + 4.5);
  if (vggResult?.gradcam?.overlay_base64) {
    try {
      doc.addImage(vggResult.gradcam.overlay_base64, "PNG", box3X + 1, y + 5.5, imgBoxWidth - 2, imgBoxHeight - 1);
    } catch (e) {
      doc.text("[Overlay Unavailable]", box3X + 4, y + 26);
    }
  }

  y += imgBoxHeight + 11;

  // 6. Scan-Level Explainability & Calibration Statement
  doc.setFillColor(244, 247, 251);
  doc.rect(margin, y, contentWidth, 20, "F");
  doc.setDrawColor(220, 229, 239);
  doc.rect(margin, y, contentWidth, 20, "S");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 50, 79);
  doc.text("INDIVIDUAL SCAN INTERPRETATION & CALIBRATION STATEMENT:", margin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.7);
  const noteLines = [
    "• Grad-CAM overlays display gradient attribution with respect to the predicted category to identify salient spatial regions.",
    "• Activation maps do NOT indicate histological biopsy margins, tumor cellularity, infiltration frontiers, or viable tissue borders.",
    "• Softmax percentages reflect relative model output weights over the four target categories, not true Bayesian posterior probabilities.",
    "• Refer to Page 2 for verified independent test set benchmark performance, known sensitivity bottlenecks, and scientific limitations.",
  ];
  noteLines.forEach((line, idx) => {
    doc.text(line, margin + 3, y + 8 + idx * 3.3);
  });

  // Page 1 Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("NeuroVisionAI Scientific Workstation • Scan Analysis • Page 1 of 2", margin, 290);
  doc.text("RESEARCH USE ONLY • NOT FOR CLINICAL DIAGNOSTIC USE", pageWidth - margin, 290, { align: "right" });

  // =========================================================================
  // PAGE 2: INDEPENDENT BENCHMARK, DATASET AUDIT & SCIENTIFIC LIMITATIONS
  // =========================================================================
  doc.addPage();
  y = 14;

  // 1. Page 2 Header Banner
  doc.setFillColor(22, 50, 79);
  doc.rect(margin, y, contentWidth, 16, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("NeuroVisionAI", margin + 6, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Independent Benchmark Performance (N=1,600) & Scientific Limitations", margin + 6, y + 12);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("METHODOLOGY & VALIDATION", pageWidth - margin - 6, y + 7, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text("Peer-Review Standard", pageWidth - margin - 6, y + 12, { align: "right" });

  y += 20;

  // 2. Section 1: Independent Model Benchmark Results
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(22, 50, 79);
  doc.text("1. Independent Model Benchmark Results (Held-Out Test Set N = 1,600 Scans)", margin, y);
  y += 4;

  doc.setFillColor(244, 247, 251);
  doc.rect(margin, y, contentWidth, 5.5, "F");
  doc.setDrawColor(220, 229, 239);
  doc.rect(margin, y, contentWidth, 5.5, "S");

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("BENCHMARK METRIC", margin + 4, y + 3.8);
  doc.text("RESNET-50 (50 LAYERS)", margin + 65, y + 3.8);
  doc.text("VGG-16 (16 LAYERS + MLP)", margin + 115, y + 3.8);
  doc.text("STATISTICAL COMPARISON", margin + 150, y + 3.8);
  y += 5.5;

  const benchmarkRows = [
    { metric: "Independent Test Accuracy", res: "91.06% (1,457 / 1,600)", vgg: "91.63% (1,466 / 1,600)", diff: "+0.57% (p=0.380, Not Sig.)" },
    { metric: "Macro Precision", res: "91.65%", vgg: "92.37%", diff: "+0.72%" },
    { metric: "Macro Recall", res: "91.06%", vgg: "91.63%", diff: "+0.57%" },
    { metric: "Macro F1-Score", res: "90.82%", vgg: "91.37%", diff: "+0.55%" },
    { metric: "ROC-AUC (Macro OVR)", res: "0.9803", vgg: "0.9791", diff: "ResNet-50 +0.0012" },
    { metric: "CPU Inference Latency", res: "424.4 ms", vgg: "893.0 ms", diff: "ResNet-50 2.1x faster" },
    { metric: "Trainable Parameters", res: "23.51 M", vgg: "134.27 M", diff: "ResNet-50 5.7x smaller" },
  ];

  doc.setFont("helvetica", "normal");
  benchmarkRows.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 5, "F");
    }
    doc.rect(margin, y, contentWidth, 5, "S");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(36, 52, 71);
    doc.text(row.metric, margin + 4, y + 3.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(23, 105, 170);
    doc.text(row.res, margin + 65, y + 3.5);

    doc.setTextColor(21, 157, 145);
    doc.text(row.vgg, margin + 115, y + 3.5);

    doc.setTextColor(100, 116, 139);
    doc.text(row.diff, margin + 150, y + 3.5);

    y += 5;
  });

  doc.setFontSize(6.7);
  doc.setTextColor(100, 116, 139);
  doc.text("McNemar's Paired Chi-Square Test: chi2 = 0.7711, p = 0.3799. No statistically significant difference in diagnostic accuracy between architectures.", margin, y + 3.5);
  y += 7;

  // 3. Section 2: Per-Class Sensitivity Breakdown & Glioma Recall Alert
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(22, 50, 79);
  doc.text("2. Per-Class Performance & Scientific Glioma Recall Bottleneck", margin, y);
  y += 4;

  doc.setFillColor(244, 247, 251);
  doc.rect(margin, y, contentWidth, 5, "F");
  doc.setDrawColor(220, 229, 239);
  doc.rect(margin, y, contentWidth, 5, "S");

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("CLASS (N=400 EACH)", margin + 4, y + 3.5);
  doc.text("RESNET PRECISION", margin + 50, y + 3.5);
  doc.text("RESNET RECALL", margin + 85, y + 3.5);
  doc.text("VGG PRECISION", margin + 120, y + 3.5);
  doc.text("VGG RECALL", margin + 155, y + 3.5);
  y += 5;

  const perClassData = [
    { cls: "Glioma (Neoplasm)", resP: "98.0%", resR: "74.3%", vggP: "98.3%", vggR: "72.8%" },
    { cls: "Meningioma (Extra-Axial)", resP: "85.0%", resR: "91.8%", vggP: "82.4%", vggR: "94.5%" },
    { cls: "Pituitary Adenoma", resP: "95.2%", resR: "98.5%", vggP: "97.1%", vggR: "99.5%" },
    { cls: "No Tumor (Control)", resP: "88.5%", resR: "99.8%", vggP: "91.7%", vggR: "99.8%" },
  ];

  perClassData.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 4.8, "F");
    }
    doc.rect(margin, y, contentWidth, 4.8, "S");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(36, 52, 71);
    doc.text(row.cls, margin + 4, y + 3.3);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(23, 105, 170);
    doc.text(row.resP, margin + 50, y + 3.3);
    doc.text(row.resR, margin + 85, y + 3.3);

    doc.setTextColor(21, 157, 145);
    doc.text(row.vggP, margin + 120, y + 3.3);
    doc.text(row.vggR, margin + 155, y + 3.3);

    y += 4.8;
  });

  // Glioma Bottleneck Box
  y += 2;
  doc.setFillColor(254, 242, 242);
  doc.rect(margin, y, contentWidth, 17, "F");
  doc.setDrawColor(254, 202, 202);
  doc.rect(margin, y, contentWidth, 17, "S");

  doc.setFontSize(7.2);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(159, 18, 57);
  doc.text("SCIENTIFIC WARNING: GLIOMA RECALL BOTTLENECK (72.8% - 74.3%)", margin + 3, y + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(136, 19, 55);
  const gliomaNotes = [
    "• 57.3% to 72.5% of glioma misclassifications were assigned to Meningioma due to peripheral cortical mass effect and hyperintense margins.",
    "• 23.8% to 35.0% of glioma misclassifications were assigned to No Tumor on peripheral axial cuts where subtle infiltrating margins lacked contrast.",
    "• Clinicians and researchers must exercise caution when analyzing subtle intra-axial infiltrative lesions without 3D multi-planar context.",
  ];
  gliomaNotes.forEach((line, idx) => {
    doc.text(line, margin + 3, y + 7.5 + idx * 3);
  });

  y += 20;

  // 4. Section 3: Dataset Architecture & Cryptographic Audit
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(22, 50, 79);
  doc.text("3. Dataset Architecture & Cryptographic Leakage Audit", margin, y);
  y += 4;

  doc.setFillColor(244, 247, 251);
  doc.rect(margin, y, contentWidth, 18, "F");
  doc.setDrawColor(220, 229, 239);
  doc.rect(margin, y, contentWidth, 18, "S");

  doc.setFontSize(7.2);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 50, 79);
  doc.text("7,200 TOTAL BRAIN MRI SCANS (5,600 TRAINING / 1,600 HELD-OUT TESTING):", margin + 3, y + 4.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const auditNotes = [
    "• SHA-256 duplicate audit verified 0.00% exact cross-split duplication (zero byte-identical images between train and test partitions).",
    "• Class distribution is strictly balanced: 1,400 training images and 400 testing images per category across all 4 diagnostic classes.",
    "• Patient-Level Independence Caveat: The public dataset lacks de-identified patient IDs. Patient-level independence is NOT claimed,",
    "  as multiple 2D axial slices from the same imaging examination or subject may exist across training and testing partitions.",
  ];
  auditNotes.forEach((line, idx) => {
    doc.text(line, margin + 3, y + 7.5 + idx * 2.8);
  });

  y += 21;

  // 5. Section 4: Model & Technical Limitations
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(22, 50, 79);
  doc.text("4. Model & Technical Limitations", margin, y);
  y += 4;

  doc.setFillColor(244, 247, 251);
  doc.rect(margin, y, contentWidth, 18, "F");
  doc.setDrawColor(220, 229, 239);
  doc.rect(margin, y, contentWidth, 18, "S");

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  const techLimits = [
    "• 2D Slice Processing: Evaluates isolated 2D axial slices without 3D volumetric reconstruction or sagittal/coronal cross-referencing.",
    "• Domain Shift & Scanner Variation: Generalizability across 1.5T vs 3.0T magnet strengths, varied RF coils, and vendor protocols is unverified.",
    "• Acquisition Modalities: Retrospective dataset mixes varied contrast-enhanced T1, T2, and FLAIR acquisitions without standardized DICOM metadata.",
    "• Out-of-Distribution Inputs: Models may output artificially high confidence scores for non-brain or non-MRI artifacts due to softmax saturation.",
  ];
  techLimits.forEach((line, idx) => {
    doc.text(line, margin + 3, y + 4.2 + idx * 3.2);
  });

  y += 21;

  // 6. Section 5: Mandatory Research Disclaimer
  doc.setFillColor(255, 247, 230);
  doc.rect(margin, y, contentWidth, 19, "F");
  doc.setDrawColor(252, 211, 77);
  doc.rect(margin, y, contentWidth, 19, "S");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(146, 64, 14);
  doc.text("MANDATORY MEDICAL SAFETY & REGULATORY DISCLAIMER (RESEARCH USE ONLY):", margin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  const disclaimerLines = [
    "NeuroVisionAI is an academic and educational research workstation for explainable deep learning in neuro-oncology.",
    "It is NOT cleared by the US FDA, CE-marked under EU-MDR/IVDR, or certified by any regulatory agency for clinical diagnostic use.",
    "This software must NOT be utilized to guide neurosurgical planning, determine oncological therapies, or replace licensed neuroradiologists.",
    "All analytical findings and spatial heatmaps represent experimental algorithmic inferences and do not establish confirmed medical diagnoses.",
  ];
  disclaimerLines.forEach((line, idx) => {
    doc.text(line, margin + 3, y + 8 + idx * 2.8);
  });

  // Page 2 Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("NeuroVisionAI Scientific Workstation • Benchmark & Methodology • Page 2 of 2", margin, 290);
  doc.text("ACADEMIC BENCHMARK • RESEARCH USE ONLY", pageWidth - margin, 290, { align: "right" });

  const outPath = "evaluation/NeuroVisionAI_Generated_Report.pdf";
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  fs.writeFileSync(outPath, pdfBuffer);

  const stats = fs.statSync(outPath);
  console.log(`\nSuccessfully generated PDF report: ${outPath}`);
  console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`Total Pages: ${doc.internal.getNumberOfPages()}`);
}

run().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
