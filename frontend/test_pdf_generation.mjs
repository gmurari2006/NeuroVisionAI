import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { jsPDF } from "jspdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read sample real result
async function testPdf() {
  console.log("Testing PDF report generation with jsPDF...");
  
  // Fetch real inference result from Next.js proxy
  const samplePath = path.resolve(__dirname, "../samples/glioma_sample.jpg");
  const imgBytes = fs.readFileSync(samplePath);
  const blob = new Blob([imgBytes], { type: "image/jpeg" });

  const formData = new FormData();
  formData.append("file", blob, "glioma_sample.jpg");
  formData.append("model_name", "both");
  formData.append("generate_cam", "true");

  console.log("Calling http://localhost:3000/api/analyze...");
  const res = await fetch("http://localhost:3000/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("HTTP Status:", res.status);
    console.error("Response Body:", errorBody);
    throw new Error(`Analyze failed: ${res.status} - ${errorBody}`);
  }

  const data = await res.json();
  console.log("Inference succeeded! Compiling PDF report...");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const resnetResult = data.results["resnet50"];
  const vggResult = data.results["vgg16"];
  const hasBoth = Boolean(resnetResult && vggResult);
  const modelsAgree = hasBoth && resnetResult?.predicted_class === vggResult?.predicted_class;

  // Header Banner
  doc.setFillColor(22, 50, 79);
  doc.rect(margin, y, contentWidth, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("NeuroVisionAI", margin + 6, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Clinical Research Platform - Brain MRI Classification & Grad-CAM XAI", margin + 6, y + 14);

  y += 24;

  // Metadata Table
  doc.setFillColor(244, 247, 251);
  doc.rect(margin, y, contentWidth, 14, "F");
  doc.setDrawColor(220, 229, 239);
  doc.rect(margin, y, contentWidth, 14, "S");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("SCAN FILENAME", margin + 4, y + 5);
  doc.text("IMAGE RESOLUTION", margin + 65, y + 5);
  doc.text("FILE SIZE", margin + 115, y + 5);
  doc.text("EVALUATION MODE", margin + 145, y + 5);

  doc.setTextColor(36, 52, 71);
  doc.setFont("helvetica", "bold");
  doc.text(data.image_metadata.filename.substring(0, 30), margin + 4, y + 10);
  doc.text(`${data.image_metadata.width} x ${data.image_metadata.height} px`, margin + 65, y + 10);
  doc.text(`${(data.image_metadata.size_bytes / 1024).toFixed(1)} KB`, margin + 115, y + 10);
  doc.text("Dual Model Comparison", margin + 145, y + 10);

  y += 18;

  // Explainability Visualizations
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(22, 50, 79);
  doc.text("Explainability Visualizations (Grad-CAM Spatial Activation)", margin, y);
  y += 4;

  const imgBoxWidth = (contentWidth - 8) / 3;
  const imgBoxHeight = imgBoxWidth;

  // Box 1: Original MRI
  doc.setDrawColor(220, 229, 239);
  doc.rect(margin, y, imgBoxWidth, imgBoxHeight + 6, "S");
  doc.setFontSize(7.5);
  doc.setTextColor(36, 52, 71);
  doc.text("Original MRI Slice", margin + 2, y + 4);
  const origSrc = resnetResult?.gradcam?.original_base64;
  if (origSrc) {
    doc.addImage(origSrc, "PNG", margin + 1, y + 5.5, imgBoxWidth - 2, imgBoxHeight - 1);
  }

  // Box 2: ResNet-50 Grad-CAM Overlay
  const box2X = margin + imgBoxWidth + 4;
  doc.rect(box2X, y, imgBoxWidth, imgBoxHeight + 6, "S");
  doc.text("ResNet-50 Grad-CAM Overlay", box2X + 2, y + 4);
  if (resnetResult?.gradcam?.overlay_base64) {
    doc.addImage(resnetResult.gradcam.overlay_base64, "PNG", box2X + 1, y + 5.5, imgBoxWidth - 2, imgBoxHeight - 1);
  }

  // Box 3: VGG-16 Grad-CAM Overlay
  const box3X = margin + (imgBoxWidth + 4) * 2;
  doc.rect(box3X, y, imgBoxWidth, imgBoxHeight + 6, "S");
  doc.text("VGG-16 Grad-CAM Overlay", box3X + 2, y + 4);
  if (vggResult?.gradcam?.overlay_base64) {
    doc.addImage(vggResult.gradcam.overlay_base64, "PNG", box3X + 1, y + 5.5, imgBoxWidth - 2, imgBoxHeight - 1);
  }

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const outPdfPath = path.resolve(__dirname, "../outputs/test_radiology_report.pdf");
  fs.writeFileSync(outPdfPath, pdfBuffer);

  console.log(`SUCCESS: PDF report generated successfully at ${outPdfPath} (${pdfBuffer.length} bytes)`);
}

testPdf().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
