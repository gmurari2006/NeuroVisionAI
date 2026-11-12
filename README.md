# NeuroVisionAI

> **Three-Column Scientific Research Workstation for Explainable Brain MRI Classification**  
> Benchmarking fine-tuned ResNet-50 and VGG-16 neural architectures with synchronized Grad-CAM visual attention mapping and dual-page laboratory PDF reporting.

---

## ⚠️ Mandatory Medical Safety & Regulatory Notice

> **THIS IS AN EDUCATIONAL RESEARCH PROTOTYPE, NOT A CLINICAL DIAGNOSTIC SYSTEM.**  
>
> - NeuroVisionAI is **not** cleared by the US FDA, CE-marked under EU-MDR/IVDR, or certified by any regulatory agency for clinical diagnostic use.
> - Predictions, confidence scores, and Grad-CAM activation maps **must not** be used to diagnose, rule out, guide neurosurgical intervention, or plan oncological therapy for intracranial neoplasms.
> - Grad-CAM heatmaps highlight computational gradient attribution patterns within convolutional feature maps, **not** histological tumor margins, infiltration frontiers, or viable tissue boundaries.
> - Always rely on board-certified neuroradiologists and qualified medical professionals for clinical evaluations.

---

## 1. Workstation Layout Architecture

NeuroVisionAI provides a full-width **Three-Column Scientific Research Workstation** layout (maximum content width `1600px`, desktop spacing `20px`):

```
+----------------------------------------------------------------------------------------------------------+
|  Top Command Bar: MRI Analysis Workstation • Dual Neural Backbones & Grad-CAM                            |
+---------------------+--------------------------------------------------------------+---------------------+
| LEFT PANEL (250px)  | CENTRE WORKSPACE (Flexible Width, Primary Visual Focus)      | RIGHT PANEL (290px) |
|                     |                                                              |                     |
| • Study Accession ID| • MRI Image Drag-and-Drop & Browse Upload                    | • FastAPI Live Ping |
| • Scan Acquisition  | • Benchmark Reference Sample Scans (Glioma/Meningioma/etc.)  | • Hardware Device   |
|   Metadata          | • High-Resolution Scan Preview & Controls                    | • Model Checkpoints |
| • Image Quality     | • Architecture Selector: ResNet-50, VGG-16, Both (Consensus) | • ResNet-50 Metrics |
|   Verification      | • Primary Inferences & 4-Class Probability Distributions     | • VGG-16 Metrics    |
| • Preprocessing     | • Architecture Consensus & Discrepancy Detection Banners     | • Grad-CAM Legend   |
|   Pipeline Status   | • 3-Card Grad-CAM Spatial Explainability Suite               | • Session Tracker   |
| • Workflow Progress | • Publication-Grade Multi-Page PDF Report Generation         | • Validation Notice |
|   Stepper (1 - 5)   |                                                              |                     |
| [Collapsible Rail]  |                                                              | [Collapsible Rail]  |
+---------------------+--------------------------------------------------------------+---------------------+
```

### Responsive Breakpoints
- **Desktop ($\ge 1024\text{ px}$)**: Three-column layout. Both Left (`StudyInformationPanel`) and Right (`AIModelIntelligencePanel`) panels feature collapsible toggles with vertical indicator rails to expand the centre workspace.
- **Tablet ($768\text{ px} - 1023\text{ px}$)**: Two-column layout ($250\text{ px}$ Left + Flexible Centre). Right panel moves below the main workspace with an expand/collapse toggle.
- **Mobile ($< 768\text{ px}$)**: Single-column layout. Centre workspace remains the primary focus; Study Information and Model Intelligence panels are accessible via expandable accordion drawers.

---

## 2. Design System Tokens

NeuroVisionAI employs a rigorous, high-contrast scientific visual language:

### Dark Theme (Default)
- **Primary Background**: `#0B1220`
- **Card Background**: `#111C2E`
- **Card Borders**: `#26364B`
- **Primary Text**: `#F1F5F9`
- **Secondary Text**: `#94A3B8`
- **Accent**: `#2DD4BF` (Teal)

### Light Theme
- **Primary Background**: `#F5F7FA`
- **Card Background**: `#FFFFFF`
- **Card Borders**: `#E2E8F0`
- **Primary Text**: `#142B4A`
- **Secondary Text**: `#64748B`
- **Accent**: `#0D9488` (Teal)

---

## 3. Verified Model Benchmarks

Metrics derived directly from independent held-out evaluation splits ($N = 1,600$ test scans):

| Benchmark Metric | ResNet-50 (Fine-Tuned) | VGG-16 (Fine-Tuned) | Statistical Comparison |
| :--- | :---: | :---: | :---: |
| **Architecture** | 50-layer Residual Network | 16-layer Sequential ConvNet | -- |
| **Parameters** | 25.56 M | 138.36 M | ResNet-50 is 5.4x smaller |
| **Training Strategy** | Classifier + Layer4 fine-tuning | Frozen feature extractor | -- |
| **Validation Accuracy** | **95.71%** | **95.98%** | -- |
| **Validation Macro-F1** | **95.71%** | **95.98%** | -- |
| **Independent Test Accuracy** | **91.06%** (1,457 / 1,600) | **91.63%** (1,466 / 1,600) | $+0.57\%$ ($p=0.380$, Not Sig.) |
| **Independent Test Macro-F1** | **90.82%** | **91.37%** | $+0.55\%$ |
| **ROC-AUC (Macro OVR)** | **0.9803** | **0.9791** | ResNet-50 $+0.0012$ |
| **CPU Inference Latency** | **11.4 ms** | **24.8 ms** | ResNet-50 2.1x faster |
| **GFLOPs** | **4.12** | **15.48** | ResNet-50 3.7x lower |
| **Grad-CAM Target Layer** | `layer4[2].conv3` | `features[28]` | -- |

*McNemar's Paired Chi-Square Test:* $\chi^2 = 0.7711, p = 0.3799$. No statistically significant difference in diagnostic accuracy between architectures.

---

## 4. Installation & Environment Setup

### Prerequisites
- **Python**: 3.10+ (Tested on Python 3.14 with virtual environment)
- **Node.js**: v18+ or v20+
- **Git**

### Installation

1. Clone or navigate to the repository:
   ```powershell
   cd C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI
   ```

2. Set up Python backend environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r backend/requirements.txt
   ```

3. Set up Next.js frontend dependencies:
   ```powershell
   cd frontend
   npm install
   cd ..
   ```

---

## 4. Verified Model Benchmarks

Recorded directly from training logs:

| Metric | ResNet-50 (Fine-Tuned) | VGG-16 (Fine-Tuned) |
| :--- | :---: | :---: |
| **Backbone** | 50-layer Residual Network | 16-layer Sequential ConvNet |
| **Classifier Topology** | 
n.Linear(2048, 4) | 25088 -> Linear(512) -> ReLU -> Dropout -> Linear(4) |
| **Checkpoint Best Epoch** | **Epoch 8** | **Epoch 8** |
| **Validation Macro F1** | **95.71%** | **95.98%** |
| **Validation Accuracy** | **95.71%** | **95.98%** |
| **Validation Loss** | **0.1280** | **0.1063** |
| **Input Resolution** | 224 &times; 224 (RGB) | 224 &times; 224 (RGB) |
| **Grad-CAM Target Layer** | layer4[2].conv3 | eatures[28] |

---

## 5. Execution Commands

### 1. Launch the FastAPI Backend
```powershell
cd C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base URL: `http://127.0.0.1:8000`
- API Health Status: `http://127.0.0.1:8000/api/health`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

### 2. Launch the Next.js Frontend Workstation
```powershell
cd C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI\frontend
npm run dev
```
- Open browser at: `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).
- *Automatic Port Discovery*: The test suites and proxy configurations automatically adapt to whether the frontend is serving on port 3000 or 3001.

### 3. Build for Production
```powershell
cd C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI\frontend
npm run build
npm run start
```

---

## 6. Testing & Quality Assurance

### Run TypeScript Type Check
```powershell
cd C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI\frontend
npx tsc --noEmit
```

### Run ESLint
```powershell
cd C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI\frontend
npm run lint
```

### Run Backend Integration Tests
```powershell
cd C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI
.\.venv\Scripts\python.exe test_backend.py
```

### Run Full System Acceptance Suite
```powershell
cd C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI
.\.venv\Scripts\python.exe run_acceptance_tests.py
```

### Run Full System Verification
```powershell
cd C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI
.\.venv\Scripts\python.exe verify_full_system.py
```

### Inspect Generated PDF Reports
```powershell
cd C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI
.\.venv\Scripts\python.exe inspect_pdf_content.py
.\.venv\Scripts\python.exe render_pdf_pages.py
```

---

## 7. Known Scientific & Technical Limitations

1. **2D Slice Processing**: Evaluates isolated 2D axial slices without 3D volumetric reconstruction or sagittal/coronal cross-referencing.
2. **Patient-Level Independence Caveat**: The public dataset lacks de-identified patient IDs. While cryptographic SHA-256 duplicate auditing verified 0.00% exact byte cross-split duplication, multiple slices from the same imaging exam may exist across partitions.
3. **Glioma Sensitivity Bottleneck**: In independent benchmarks, glioma exhibits a known sensitivity/recall bottleneck ($72.8\% - 74.3\%$), with subtle intra-axial infiltrative lesions occasionally misclassified as meningioma or normal brain parenchyma.
4. **Out-of-Distribution Inputs**: Models may output artificially elevated softmax confidence scores for non-brain or corrupted artifacts due to softmax saturation.
5. **Research Prototype**: Predictions represent experimental research inferences, NOT confirmed medical diagnoses.

---

## 8. License

This platform is released under the **MIT License** for academic and research evaluation purposes.
