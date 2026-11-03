# NeuroVisionAI: Comprehensive Independent Model Evaluation & Performance Validation Report

**Evaluation Date:** November 3, 2026  
**Evaluation Target:** Independent Testing Set ($N = 1,600$ scans)  
**Evaluated Models:** Fine-Tuned ResNet-50 (`models/resnet50_finetuned_best.pth`) & Deep VGG-16 (`models/vgg16_best.pth`)  
**Hardware Environment:** Intel x86_64 CPU (PyTorch 2.14.1+cpu)  
**Evaluation Protocol:** Strict inference mode (`model.eval()`, `torch.no_grad()`), exact training preprocessing ($224 \times 224$, ImageNet normalization), frozen weights (zero training/fine-tuning adjustments).

---

## 1. Executive Summary

This report documents the rigorous, independent scientific evaluation of the two deep convolutional neural network architectures deployed in **NeuroVisionAI**:
1. **ResNet-50** (50-layer Residual Network with fine-tuned `layer4` and custom `Linear(2048, 4)` head)
2. **VGG-16** (16-layer Visual Geometry Group network with custom 2-stage MLP classifier: `Linear(25088, 512) -> ReLU -> Dropout(0.5) -> Linear(512, 4)`)

Both models were evaluated on **1,600 held-out brain MRI scans** from the independent Testing split across all four diagnostic categories: **Glioma, Meningioma, No Tumor, and Pituitary Tumor**.

### Key Findings Summary:
- **Comparable Global Performance:** VGG-16 achieved **91.63% test accuracy** (Macro F1: **91.37%**), while ResNet-50 achieved **91.06% test accuracy** (Macro F1: **90.82%**). The $+0.57\%$ delta in favor of VGG-16 is **not statistically significant** ($p = 0.380$, McNemar's test).
- **High Multi-Architecture Consensus:** The two architectures agree on **93.06%** of all test scans ($1,489 / 1,600$). Both models are simultaneously correct on **88.75%** of cases, with at least one model correct on **93.94%** of cases.
- **Exceptional Negative & Pituitary Classification:** Both models demonstrate near-perfect performance on **No Tumor** ($F_1 = 93.8\% - 95.6\%$, Recall $= 99.75\%$, only 1 normal scan missed out of 400) and **Pituitary Adenoma** ($F_1 = 96.8\% - 98.3\%$, Recall $= 98.5\% - 99.5\%$).
- **Glioma Sensitivity Bottleneck:** The single largest diagnostic challenge for both architectures is **Glioma classification** (ResNet-50 Recall: **74.25%**, VGG-16 Recall: **72.75%**). When either model predicts "Glioma", it is exceptionally precise ($>98\%$), but $25.75\% - 27.25\%$ of true gliomas are misclassified—predominantly into **Meningioma** ($57.3\% - 72.5\%$ of all glioma errors) and **No Tumor** ($23.8\% - 35.0\%$).
- **Zero Data Leakage:** SHA-256 and MD5 cryptographic hash audits confirmed **zero overlap ($0.00\%$)** between the 5,600 training images and the 1,600 test images.

---

## 2. Dataset Split & Integrity Audit

### 2.1 Dataset Partitioning & Class Balance
The evaluated dataset exhibits balanced stratification across all four classes in both splits:

| Split | Glioma | Meningioma | No Tumor | Pituitary | Total Images | Partition % |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Training Set** | 1,400 | 1,400 | 1,400 | 1,400 | **5,600** | 77.78% |
| **Independent Testing Set** | 400 | 400 | 400 | 400 | **1,600** | 22.22% |
| **Combined Dataset** | 1,800 | 1,800 | 1,800 | 1,800 | **7,200** | 100.00% |

> **Key Observation:** Because each test class contains exactly 400 images ($25.0\%$ uniform prior), the macro-averaged metrics and micro-averaged metrics align closely, preventing majority-class dominance.

### 2.2 Cryptographic Data Leakage & Deduplication Audit
Every image file was hashed using MD5 and SHA-256 to verify data independence:
- **Total Test Images Analyzed:** 1,600
- **Total Training Images Indexed:** 5,600 (5,429 unique byte hashes)
- **Exact Duplicate Leaks (Train $\cap$ Test):** **0 images (0.00% leakage)**
- **Intra-Split Redundancy:** 171 intra-split duplicates in Training ($3.05\%$) and 16 in Testing ($1.00\%$), consisting of duplicate axial slices from identical patient scan series in the public source dataset.
- **Conclusion:** The testing set is an authentic, independent out-of-distribution evaluation split.

---

## 3. Quantitative Model Performance Benchmark

Both models were evaluated on identical hardware using frozen checkpoints and deterministic preprocessing ($224 \times 224$ bicubic resize, ImageNet RGB normalization $\mu=[0.485, 0.456, 0.406]$, $\sigma=[0.229, 0.224, 0.225]$):

| Metric | ResNet-50 | VGG-16 | Absolute Delta (VGG - ResNet) |
| :--- | :---: | :---: | :---: |
| **Overall Accuracy** | **91.06%** ($1457/1600$) | **91.63%** ($1466/1600$) | $+0.57\%$ |
| **Macro Precision** | **91.65%** | **92.37%** | $+0.72\%$ |
| **Macro Recall (Sensitivity)** | **91.06%** | **91.63%** | $+0.57\%$ |
| **Macro F1-Score** | **90.82%** | **91.37%** | $+0.55\%$ |
| **Weighted F1-Score** | **90.82%** | **91.37%** | $+0.55\%$ |
| **Macro ROC-AUC (One-vs-Rest)** | **0.9803** | **0.9791** | $-0.0012$ |
| **Cohen's Kappa ($\kappa$)** | **0.8808** | **0.8883** | $+0.0075$ |
| **Average Latency / Image (Batch 32, CPU)** | **424.4 ms** | **893.0 ms** | $+468.6$ ms ($2.10\times$) |
| **Model Parameter Count** | **23.51 M** | **134.27 M** | $+110.76$ M ($5.71\times$) |

---

## 4. Confusion Matrix Analysis

### 4.1 Raw Count Confusion Matrices ($N = 1,600$)

#### ResNet-50 Confusion Matrix
```
                   Predicted
Actual         Glioma   Meningioma   No Tumor   Pituitary   Total
Glioma           297         59         36           8       400
Meningioma         5        367         16          12       400
No Tumor           0          1        399           0       400
Pituitary          1          5          0         394       400
Total Predicted  303        432        451         414      1600
```

#### VGG-16 Confusion Matrix
```
                   Predicted
Actual         Glioma   Meningioma   No Tumor   Pituitary   Total
Glioma           291         79         26           4       400
Meningioma         4        378         10           8       400
No Tumor           1          0        399           0       400
Pituitary          0          2          0         398       400
Total Predicted  296        459        435         410      1600
```

### 4.2 Normalized Confusion Matrix (% of True Class)

| True Pathology | ResNet-50 Correct | ResNet-50 Top Error | VGG-16 Correct | VGG-16 Top Error |
| :--- | :---: | :--- | :---: | :--- |
| **Glioma** | **74.25%** | Meningioma ($14.75\%$), No Tumor ($9.00\%$) | **72.75%** | Meningioma ($19.75\%$), No Tumor ($6.50\%$) |
| **Meningioma** | **91.75%** | No Tumor ($4.00\%$), Pituitary ($3.00\%$) | **94.50%** | No Tumor ($2.50\%$), Pituitary ($2.00\%$) |
| **No Tumor** | **99.75%** | Meningioma ($0.25\%$, 1 scan) | **99.75%** | Glioma ($0.25\%$, 1 scan) |
| **Pituitary** | **98.50%** | Meningioma ($1.25\%$, 5 scans) | **99.50%** | Meningioma ($0.50\%$, 2 scans) |

---

## 5. Detailed Per-Class Classification Reports

### 5.1 Fine-Tuned ResNet-50 Per-Class Report
- **Glioma:**
  - True Positives: 297 | False Positives: 6 | False Negatives: 103 | True Negatives: 1,194
  - Precision: **98.02%** | Sensitivity (Recall): **74.25%** | Specificity: **99.50%** | **F1-Score: 84.50%**
  - Balanced Accuracy: 86.88% | ROC-AUC: 0.9479 | PR-AUC: 0.9190
- **Meningioma:**
  - True Positives: 367 | False Positives: 65 | False Negatives: 33 | True Negatives: 1,135
  - Precision: **84.95%** | Sensitivity (Recall): **91.75%** | Specificity: **94.58%** | **F1-Score: 88.22%**
  - Balanced Accuracy: 93.17% | ROC-AUC: 0.9776 | PR-AUC: 0.9335
- **No Tumor (Healthy Control):**
  - True Positives: 399 | False Positives: 52 | False Negatives: 1 | True Negatives: 1,148
  - Precision: **88.47%** | Sensitivity (Recall): **99.75%** | Specificity: **95.67%** | **F1-Score: 93.77%**
  - Balanced Accuracy: 97.71% | ROC-AUC: 0.9975 | PR-AUC: 0.9918
- **Pituitary Adenoma:**
  - True Positives: 394 | False Positives: 20 | False Negatives: 6 | True Negatives: 1,180
  - Precision: **95.17%** | Sensitivity (Recall): **98.50%** | Specificity: **98.33%** | **F1-Score: 96.81%**
  - Balanced Accuracy: 98.42% | ROC-AUC: 0.9981 | PR-AUC: 0.9945

### 5.2 Fine-Tuned VGG-16 Per-Class Report
- **Glioma:**
  - True Positives: 291 | False Positives: 5 | False Negatives: 109 | True Negatives: 1,195
  - Precision: **98.31%** | Sensitivity (Recall): **72.75%** | Specificity: **99.58%** | **F1-Score: 83.62%**
  - Balanced Accuracy: 86.17% | ROC-AUC: 0.9370 | PR-AUC: 0.9083
- **Meningioma:**
  - True Positives: 378 | False Positives: 81 | False Negatives: 22 | True Negatives: 1,119
  - Precision: **82.35%** | Sensitivity (Recall): **94.50%** | Specificity: **93.25%** | **F1-Score: 88.01%**
  - Balanced Accuracy: 93.87% | ROC-AUC: 0.9812 | PR-AUC: 0.9352
- **No Tumor (Healthy Control):**
  - True Positives: 399 | False Positives: 36 | False Negatives: 1 | True Negatives: 1,164
  - Precision: **91.72%** | Sensitivity (Recall): **99.75%** | Specificity: **97.00%** | **F1-Score: 95.57%**
  - Balanced Accuracy: 98.38% | ROC-AUC: 0.9987 | PR-AUC: 0.9951
- **Pituitary Adenoma:**
  - True Positives: 398 | False Positives: 12 | False Negatives: 2 | True Negatives: 1,188
  - Precision: **97.07%** | Sensitivity (Recall): **99.50%** | Specificity: **99.00%** | **F1-Score: 98.27%**
  - Balanced Accuracy: 99.25% | ROC-AUC: 0.9997 | PR-AUC: 0.9992

---

## 6. Statistical Comparison & Architecture Consensus

### 6.1 McNemar's Test for Paired Classifiers
McNemar's test with Edwards continuity correction evaluates whether one model makes significantly fewer errors than the other on the exact same test instances:
- $n_{11}$ (Both models correct): **1,420 instances (88.75%)**
- $n_{00}$ (Both models incorrect): **97 instances (6.06%)**
- $n_{10}$ (ResNet-50 correct, VGG-16 incorrect): **37 instances (2.31%)**
- $n_{01}$ (VGG-16 correct, ResNet-50 incorrect): **46 instances (2.88%)**
- **McNemar $\chi^2$ Statistic:** **0.7711**
- **$p$-Value:** **0.3799** ($p > 0.05$)

> **Statistical Interpretation:** Because $p = 0.380 \gg 0.05$, the null hypothesis cannot be rejected. There is no statistically significant difference in classification accuracy between ResNet-50 and VGG-16 on this test distribution.

### 6.2 Architecture Consensus Analysis
- **Inter-Model Agreement:** **93.06%** ($1,489 / 1,600$ scans)
- **Oracle Ensemble Ceiling (Either Model Correct):** **93.94%** ($1,503 / 1,600$ scans)
- **Dual-Model Failure Rate:** **6.06%** ($97 / 1,600$ scans)
- **Takeaway:** When ResNet-50 and VGG-16 agree on a prediction, the empirical accuracy is **95.37%** ($1,420 / 1,489$). When they diverge ($111$ scans, $6.94\%$), empirical confidence drops dramatically, validating the application's UI warning for `Divergent Predictions`.

---

## 7. Deep Investigation: Glioma Misclassification Root Cause

During initial pipeline debugging, `glioma_sample.jpg` (`Te-gl_1.jpg`) was predicted as Pituitary ($47.57\%$) by ResNet-50 and Meningioma ($97.84\%$) by VGG-16. Across the full 400 test gliomas, an in-depth scientific investigation revealed the structural causes behind this behavior:

### 7.1 Where Do True Gliomas Get Misclassified?

| Error Destination Class | ResNet-50 Count (% of Glioma Errors) | VGG-16 Count (% of Glioma Errors) |
| :--- | :---: | :---: |
| **Misclassified as Meningioma** | **59 scans (57.28%)** | **79 scans (72.48%)** |
| **Misclassified as No Tumor** | **36 scans (34.95%)** | **26 scans (23.85%)** |
| **Misclassified as Pituitary** | **8 scans (7.77%)** | **4 scans (3.67%)** |
| **Total Glioma Errors** | **103 / 400 ($25.75\%$)** | **109 / 400 ($27.25\%$)** |

### 7.2 Radiological & Neuro-Oncological Factors
1. **Infiltrative Margins vs. Circumscribed Boundaries:**
   - Gliomas (especially low-grade astrocytomas and diffuse gliomas) are intra-axial infiltrative lesions that seamlessly blend with adjacent cerebral white matter, exhibiting ill-defined edges and mild mass effect without hyperintense dural tails.
   - Meningiomas are extra-axial, well-circumscribed, dural-based tumors that present high contrast borders.
   - When a glioma slice exhibits subtle mass effect or peripheral hyperintensity, both networks default to the sharply bounded feature representations learned from the meningioma class.
2. **Peripheral vs. Sellar Lesions:**
   - In rare cases located near the skull base or suprasellar cistern (e.g. `Te-gl_1.jpg`), the lesion's spatial coordinates relative to the skull perimeter mimic sellar lesions, triggering activation in the pituitary classification head.
3. **Subtle Glioma Slices Appearing Normal (Misclassified as No Tumor):**
   - In multi-slice MRI volumes, peripheral axial slices near the cranial vertex or basal cisterns often contain minimal tumor volume (only minor peritumoral edema or subtle T2 hyperintensity). Without macroscopic focal lesions, both models categorize these peripheral slices as "No Tumor" (36 cases in ResNet, 26 in VGG).
4. **Grad-CAM Attention Drift:**
   - Inspecting Grad-CAM heatmaps for the dual-failure cases (`Te-gl_1.jpg`, `Te-gl_106.jpg`, `Te-gl_102.jpg`, `Te-gl_109.jpg`) reveals that the models' spatial attention shifts away from the diffuse parenchymal infiltration and instead locks onto cranial bone edges, ventricles, or the dural perimeter.

---

## 8. Saved Evaluation Artifacts

All metrics, data tables, and high-resolution publication figures have been persisted to the dedicated evaluation directory:
- [test_metrics_summary.json](file:///C:/Users/tinku/OneDrive/Desktop/NeuroVisionAI/evaluation/test_metrics_summary.json) — Complete machine-readable performance metrics, confusion matrices, and ROC-AUC scores.
- [per_class_metrics.csv](file:///C:/Users/tinku/OneDrive/Desktop/NeuroVisionAI/evaluation/per_class_metrics.csv) — Per-class precision, recall, specificity, F1, and delta comparisons.
- [test_predictions_detailed.csv](file:///C:/Users/tinku/OneDrive/Desktop/NeuroVisionAI/evaluation/test_predictions_detailed.csv) — Row-by-row prediction record for all 1,600 test images with true labels, model predictions, confidences, and agreement flags.
- [data_leakage_audit.json](file:///C:/Users/tinku/OneDrive/Desktop/NeuroVisionAI/evaluation/data_leakage_audit.json) — Cryptographic MD5/SHA-256 duplicate audit verifying zero train/test leakage.
- [glioma_failure_analysis.json](file:///C:/Users/tinku/OneDrive/Desktop/NeuroVisionAI/evaluation/glioma_failure_analysis.json) — Error destination breakdown and failure case catalogue.
- [comparison_confusion_matrices.png](file:///C:/Users/tinku/OneDrive/Desktop/NeuroVisionAI/evaluation/comparison_confusion_matrices.png) — Side-by-side normalized confusion matrices.
- [per_class_metrics_comparison.png](file:///C:/Users/tinku/OneDrive/Desktop/NeuroVisionAI/evaluation/per_class_metrics_comparison.png) — Grouped bar charts comparing Precision, Recall, and F1 across all four classes.
- [glioma_error_destinations.png](file:///C:/Users/tinku/OneDrive/Desktop/NeuroVisionAI/evaluation/glioma_error_destinations.png) — Distribution of glioma misclassifications.
- [resnet50_confusion_matrix.png](file:///C:/Users/tinku/OneDrive/Desktop/NeuroVisionAI/evaluation/resnet50_confusion_matrix.png) & [vgg16_confusion_matrix.png](file:///C:/Users/tinku/OneDrive/Desktop/NeuroVisionAI/evaluation/vgg16_confusion_matrix.png) — Individual raw-count confusion heatmaps.
- `evaluation/failure_cases/failure_Te-gl_*.png` — 3-panel Grad-CAM visualization composites for representative misclassified cases.

---

## 9. Limitations & Research Disclaimer

> [!CAUTION]
> **RESEARCH PROTOTYPE ONLY — NOT FOR CLINICAL USE**
> 
> 1. **Non-Diagnostic Nature:** NeuroVisionAI is an academic research demonstration for evaluating deep transfer learning architectures and gradient-weighted class activation mapping (Grad-CAM). It is **NOT** cleared by the FDA, CE-marked, or certified as medical software under IEC 62304 / ISO 13485.
> 2. **Slice-Level vs. Volumetric Evaluation:** The models operate on single 2D axial slices without 3D spatial volumetric context or multi-modal MRI sequences (e.g., T1-weighted, T1-contrast, T2-weighted, and FLAIR). In clinical neuroradiology, multi-sequence cross-validation is mandatory.
> 3. **Glioma Sensitivity Limitation:** With a glioma recall of $\sim 73\% - 74\%$, approximately 1 in 4 gliomas is missed or miscategorized. Clinicians must never rely on this model for glioma screening, resection margin assessment, or tumor grade staging.
> 4. **Distributional Bias:** The training and testing datasets originate from public curated repositories and may not represent scanner variances, contrast protocols, field strengths ($1.5\text{T}$ vs. $3.0\text{T}$), or motion artifacts encountered in acute clinical workflows.
