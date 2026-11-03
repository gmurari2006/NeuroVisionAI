# NeuroVisionAI

> **Scientific Research Workstation for Explainable Brain MRI Classification**  
> Benchmarking fine-tuned ResNet-50 and VGG-16 neural architectures with synchronized Grad-CAM visual attention mapping.

---

## ⚠️ Medical Safety & Regulatory Notice

> **THIS IS AN EDUCATIONAL RESEARCH PROTOTYPE, NOT A CLINICAL DIAGNOSTIC SYSTEM.**  
>
> - NeuroVisionAI is **not** cleared by the FDA, CE-marked, or certified under any medical device software directive.
> - Predictions, confidence scores, and Grad-CAM activation maps **must not** be used to diagnose, rule out, or plan therapy for intracranial neoplasms or any other medical condition.
> - Grad-CAM heatmaps highlight computational gradient attribution patterns, **not** histological tumor margins or pathological tissue boundaries.
> - Always rely on licensed neuro-radiologists and qualified medical professionals for clinical evaluations.

---

## Scientific Research Workstation Design System

The platform is built strictly according to the **Scientific Research Workstation** design direction:

### Light Theme
- **Primary background**: `#F5F7FA`
- **Main content / card background**: `#FFFFFF`
- **Sidebar background**: `#FFFFFF`
- **Primary text**: `#142B4A`
- **Secondary text**: `#64748B`
- **Primary action**: `#2864E8` (Royal Blue)
- **Secondary accent**: `#0D9488` (Teal)
- **Borders**: `#E2E8F0`

### Dark Theme
- **Primary background**: `#0B1220`
- **Main content / card background**: `#111C2E`
- **Sidebar background**: `#101A2B`
- **Primary text**: `#F1F5F9`
- **Secondary text**: `#94A3B8`
- **Primary action**: `#4D83F5` (Royal Blue)
- **Secondary accent**: `#2DD4BF` (Teal)
- **Borders**: `#26364B`

### Shell & Navigation
- **Persistent Left Sidebar (`AppSidebar`)**: Desktop persistent, collapsible, icon tooltips in collapsed mode, mobile slide-out drawer.
- **Top Header (`AppHeader`)**: Displays current page title, breadcrumb category, live backend engine indicator with latency refresh, active compute device (`CPU`/`CUDA`), verified model status, and the theme switcher.
- **Anti-Flash Theme System (`ThemeProvider` & `ThemeToggle`)**: Supports `Light`, `Dark`, and `System` default preferences. Persists across browser refreshes with zero flash on load.

---

## Workstation Page Architecture

1. **Research Dashboard (`/`)**:
   - **System Status Grid**: Live status of FastAPI backend, PyTorch compute device, ResNet-50 & VGG-16 memory residence.
   - **Model Overview Cards**: Technical architectures, verified validation metrics at peak epoch 8.
   - **Performance Overview**: Comparative accuracy, macro-F1, and loss benchmarks derived dynamically from verified training history logs.
   - **Recent Activity**: Audit logs of actual persisted inference sessions conducted on this workstation.

2. **MRI Analysis Workspace (`/analysis`)**:
   - **Scan Input**: Drag-and-drop or browse files (PNG, JPG, JPEG up to 15MB) with dimension and size inspection.
   - **Inference Configuration**: Run ResNet-50, VGG-16, or Dual-Model Comparison. Toggle Grad-CAM generation.
   - **Results & Consensus**: Per-class probability distribution bars, processing latency, and dual-model convergence analysis.
   - **Explainable AI (Grad-CAM)**: Side-by-side visualization of original MRI, blended overlay, and Jet colormap heatmap.
   - **Report Export**: Download structured JSON reports or print laboratory summaries.

3. **Model Benchmark & Performance (`/models`)**:
   - Recharts epoch convergence curves for Validation Macro-F1, Training vs Validation Accuracy, and Loss.
   - Full epoch-by-epoch historical metric table derived from actual training logs.

4. **Analysis History (`/history`)**:
   - Audit log of locally stored workstation sessions (persisted in browser `localStorage`).
   - Search by filename or predicted class; filter by model, class, or consensus agreement.
   - Export history as JSON or CSV; clear local cache.

5. **Research Methodology (`/methodology`)**:
   - In-depth documentation covering the 4 diagnostic categories, $224 \times 224$ ImageNet normalization pipeline, ResNet-50 residual bottlenecks, VGG-16 MLP classifier, softmax interpretation, Grad-CAM formulation, and scientific limitations.

6. **Application Settings (`/settings`)**:
   - Theme preferences (Light / Dark / System).
   - System diagnostics & PyTorch environment verification.
   - Local workstation cache inspection and privacy declarations.

---

## Project Structure

```
NeuroVisionAI/
├── frontend/                     # Next.js 14 App Router, React 18, TypeScript, Tailwind CSS
│   ├── app/
│   │   ├── layout.tsx            # Global layout with ThemeProvider and WorkstationShell
│   │   ├── page.tsx              # Research Dashboard (System status, model cards, recent activity)
│   │   ├── globals.css           # Workstation CSS design tokens (Light & Dark)
│   │   ├── analysis/page.tsx     # MRI Analysis Workspace (Inference, comparison, Grad-CAM)
│   │   ├── models/page.tsx       # Model Benchmark & Performance (Recharts curves & matrix)
│   │   ├── history/page.tsx      # Analysis History (Search, filter, inspect, export JSON/CSV)
│   │   ├── methodology/page.tsx  # Research Methodology & Clinical Context documentation
│   │   ├── about/page.tsx        # Redirect wrapper to /methodology
│   │   └── settings/page.tsx     # Application Settings & System Diagnostics
│   ├── components/
│   │   ├── AppSidebar.tsx        # Persistent collapsible sidebar with mobile drawer
│   │   ├── AppHeader.tsx         # Top bar with live backend status, device badge & theme toggle
│   │   ├── WorkstationShell.tsx  # Responsive flex shell with collapsed desktop state
│   │   ├── ThemeProvider.tsx     # React Context for Light/Dark/System theme management
│   │   ├── ThemeToggle.tsx       # Accessible theme selector menu
│   │   ├── MedicalDisclaimer.tsx # Regulatory medical safety alert component
│   │   └── Footer.tsx            # Minimal workstation footer
│   ├── lib/
│   │   ├── api.ts                # Client API for /api/health, /api/models, /api/analyze
│   │   ├── types.ts              # TypeScript schemas for requests and responses
│   │   ├── history.ts            # Local workstation session persistence in localStorage
│   │   └── utils.ts              # Formatting, class colors, report download utilities
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts        # Extended with workstation color tokens & dark mode
├── backend/                      # Python FastAPI application
│   ├── main.py                   # Lifespan singleton model management & CORS configuration
│   ├── api/
│   │   └── routes.py             # /api/health, /api/models, /api/analyze endpoints
│   ├── services/
│   │   └── inference_service.py  # ModelManager singleton, memory-only image decoding
│   ├── schemas/
│   │   └── response_schemas.py   # Pydantic response models
│   └── requirements.txt
├── models/
│   ├── resnet50_finetuned_best.pth  # Fine-tuned ResNet-50 weights (90 MB)
│   └── vgg16_best.pth               # Fine-tuned VGG-16 weights (105 MB)
├── training_history/
│   ├── finetune_history.csv         # ResNet-50 verified training metrics (8 epochs)
│   └── vgg16_history.csv            # VGG-16 verified training metrics (10 epochs)
├── model_loader.py               # PyTorch model construction & strict weight loading
├── gradcam.py                    # Gradient-weighted Class Activation Mapping engine
├── validate_models.py            # Standalone architectural validation script
├── test_backend.py               # FastAPI integration & endpoint test suite
├── README.md
└── .gitignore
```

---

## Verified Model Benchmarks

Recorded directly from training logs:

| Metric | ResNet-50 (Fine-Tuned) | VGG-16 (Fine-Tuned) |
| :--- | :---: | :---: |
| **Backbone** | 50-layer Residual Network | 16-layer Sequential ConvNet |
| **Classifier Topology** | `nn.Linear(2048, 4)` | `25088 -> Linear(512) -> ReLU -> Dropout -> Linear(4)` |
| **Checkpoint Best Epoch** | **Epoch 8** | **Epoch 8** |
| **Validation Macro F1** | **95.71%** | **95.98%** |
| **Validation Accuracy** | **95.71%** | **95.98%** |
| **Validation Loss** | **0.1280** | **0.1063** |
| **Input Resolution** | 224 &times; 224 (RGB) | 224 &times; 224 (RGB) |
| **Grad-CAM Target Layer** | `layer4[2].conv3` | `features[28]` |



---

## License

This platform is released under the **MIT License** for academic and research evaluation purposes.
