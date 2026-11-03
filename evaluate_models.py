"""
NeuroVisionAI - Complete Model Evaluation and Performance Validation
Evaluates ResNet-50 and VGG-16 checkpoints on the 1,600 independent Testing MRI scans.
Produces:
- Confusion matrices (raw & normalized)
- Classification reports (Accuracy, Macro Precision, Recall, F1, Per-Class metrics, Specificity)
- Model comparison & McNemar's statistical test
- Detailed failure analysis (especially Glioma misclassifications)
- High-resolution publication plots
"""

import os
import sys
import time
import json
import numpy as np
import pandas as pd
from PIL import Image
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    roc_curve,
    auc,
    precision_recall_curve,
    average_precision_score,
    cohen_kappa_score
)

# Project paths
PROJECT_ROOT = r"C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI"
DATASET_TEST_DIR = r"C:\Users\tinku\Downloads\brain-tumor-mri-dataset\Testing"
EVAL_DIR = os.path.join(PROJECT_ROOT, "evaluation")
FAILURES_DIR = os.path.join(EVAL_DIR, "failure_cases")
os.makedirs(EVAL_DIR, exist_ok=True)
os.makedirs(FAILURES_DIR, exist_ok=True)

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from model_loader import (
    load_resnet50_model,
    load_vgg16_model,
    get_inference_transforms,
    CLASS_NAMES,
    NUM_CLASSES,
    CLASS_TO_IDX,
    IDX_TO_CLASS
)
from gradcam import generate_gradcam_result

# Device configuration
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Evaluation running on device: {DEVICE}")

# -----------------------------------------------------------------------------
# 1. Custom Dataset for Batch Loading
# -----------------------------------------------------------------------------
class MRITestDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.samples = []
        
        for cls_name in CLASS_NAMES:
            cls_folder = os.path.join(root_dir, cls_name)
            if not os.path.isdir(cls_folder):
                continue
            cls_idx = CLASS_TO_IDX[cls_name]
            files = sorted(os.listdir(cls_folder))
            for f in files:
                if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                    self.samples.append({
                        "path": os.path.join(cls_folder, f),
                        "filename": f,
                        "class_name": cls_name,
                        "class_idx": cls_idx
                    })

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        item = self.samples[idx]
        img = Image.open(item["path"]).convert("RGB")
        tensor = self.transform(img) if self.transform else img
        return tensor, item["class_idx"], item["class_name"], item["filename"], item["path"]

# -----------------------------------------------------------------------------
# 2. Model Evaluation Runner
# -----------------------------------------------------------------------------
def evaluate_single_model(model, dataloader, model_name="model"):
    print(f"\n--- Evaluating {model_name} on {len(dataloader.dataset)} test images ---")
    model.eval()
    
    all_preds = []
    all_targets = []
    all_probs = []
    all_filenames = []
    all_paths = []
    latencies = []

    with torch.no_grad():
        for batch_idx, (images, targets, class_names, filenames, paths) in enumerate(dataloader):
            images = images.to(DEVICE)
            start_t = time.perf_counter()
            logits = model(images)
            elapsed = time.perf_counter() - start_t
            latencies.append(elapsed / len(images))

            probs = torch.softmax(logits, dim=1).cpu().numpy()
            preds = probs.argmax(axis=1)

            all_preds.extend(preds)
            all_targets.extend(targets.numpy())
            all_probs.extend(probs)
            all_filenames.extend(filenames)
            all_paths.extend(paths)

            if (batch_idx + 1) % 10 == 0 or (batch_idx + 1) == len(dataloader):
                processed = min((batch_idx + 1) * dataloader.batch_size, len(dataloader.dataset))
                print(f"  Processed {processed}/{len(dataloader.dataset)} images...")

    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)
    all_probs = np.array(all_probs)
    avg_latency_ms = np.mean(latencies) * 1000

    return {
        "model_name": model_name,
        "preds": all_preds,
        "targets": all_targets,
        "probs": all_probs,
        "filenames": all_filenames,
        "paths": all_paths,
        "avg_latency_ms": avg_latency_ms
    }

# -----------------------------------------------------------------------------
# 3. Comprehensive Metrics Calculation
# -----------------------------------------------------------------------------
def compute_detailed_metrics(eval_res):
    y_true = eval_res["targets"]
    y_pred = eval_res["preds"]
    y_prob = eval_res["probs"]
    
    # Global metrics
    acc = accuracy_score(y_true, y_pred)
    macro_prec = precision_score(y_true, y_pred, average="macro", zero_division=0)
    macro_rec = recall_score(y_true, y_pred, average="macro", zero_division=0)
    macro_f1 = f1_score(y_true, y_pred, average="macro", zero_division=0)
    weighted_f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)
    kappa = cohen_kappa_score(y_true, y_pred)
    
    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred, labels=list(range(NUM_CLASSES)))
    cm_norm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
    
    # Per-class metrics
    per_class = {}
    for i, cls_name in enumerate(CLASS_NAMES):
        tp = cm[i, i]
        fn = cm[i, :].sum() - tp
        fp = cm[:, i].sum() - tp
        tn = cm.sum() - (tp + fn + fp)
        
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0  # Sensitivity
        spec = tn / (tn + fp) if (tn + fp) > 0 else 0.0 # Specificity
        f1 = 2 * (prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
        bal_acc = (rec + spec) / 2.0
        
        # Per-class ROC AUC and Average Precision (PR AUC)
        y_true_binary = (y_true == i).astype(int)
        y_prob_cls = y_prob[:, i]
        try:
            cls_roc_auc = auc(*roc_curve(y_true_binary, y_prob_cls)[:2])
        except Exception:
            cls_roc_auc = 0.0
        try:
            cls_pr_auc = average_precision_score(y_true_binary, y_prob_cls)
        except Exception:
            cls_pr_auc = 0.0

        per_class[cls_name] = {
            "class_index": i,
            "support": int(cm[i, :].sum()),
            "true_positives": int(tp),
            "false_positives": int(fp),
            "true_negatives": int(tn),
            "false_negatives": int(fn),
            "precision": round(float(prec), 4),
            "recall_sensitivity": round(float(rec), 4),
            "specificity": round(float(spec), 4),
            "f1_score": round(float(f1), 4),
            "balanced_accuracy": round(float(bal_acc), 4),
            "roc_auc": round(float(cls_roc_auc), 4),
            "pr_auc": round(float(cls_pr_auc), 4)
        }

    # Macro ROC AUC
    macro_roc_auc = np.mean([per_class[c]["roc_auc"] for c in CLASS_NAMES])

    return {
        "model_name": eval_res["model_name"],
        "accuracy": round(float(acc), 4),
        "macro_precision": round(float(macro_prec), 4),
        "macro_recall": round(float(macro_rec), 4),
        "macro_f1": round(float(macro_f1), 4),
        "weighted_f1": round(float(weighted_f1), 4),
        "macro_roc_auc": round(float(macro_roc_auc), 4),
        "cohen_kappa": round(float(kappa), 4),
        "avg_latency_ms": round(float(eval_res["avg_latency_ms"]), 2),
        "total_test_samples": len(y_true),
        "confusion_matrix_raw": cm.tolist(),
        "confusion_matrix_normalized": np.round(cm_norm, 4).tolist(),
        "per_class": per_class
    }

# -----------------------------------------------------------------------------
# 4. Statistical McNemar's Test for Model Comparison
# -----------------------------------------------------------------------------
def mcnemar_test(y_true, preds_a, preds_b):
    correct_a = (preds_a == y_true)
    correct_b = (preds_b == y_true)
    
    # Contingency table
    # n00: both wrong, n01: A wrong, B right, n10: A right, B wrong, n11: both right
    n00 = np.sum(~correct_a & ~correct_b)
    n01 = np.sum(~correct_a & correct_b)
    n10 = np.sum(correct_a & ~correct_b)
    n11 = np.sum(correct_a & correct_b)
    
    # McNemar statistic with Edwards continuity correction
    b = n10
    c = n01
    if (b + c) > 0:
        stat = (abs(b - c) - 1.0)**2 / (b + c)
        # Using scipy chi2 survival function (p-value)
        from scipy.stats import chi2
        p_val = chi2.sf(stat, df=1)
    else:
        stat = 0.0
        p_val = 1.0

    return {
        "both_correct_n11": int(n11),
        "both_incorrect_n00": int(n00),
        "resnet_correct_vgg_incorrect_n10": int(n10),
        "vgg_correct_resnet_incorrect_n01": int(n01),
        "mcnemar_chi2_statistic": round(float(stat), 4),
        "p_value": round(float(p_val), 6),
        "is_statistically_significant": bool(p_val < 0.05)
    }

# -----------------------------------------------------------------------------
# 5. Plotting Functions
# -----------------------------------------------------------------------------
def plot_confusion_matrices(res_metrics, vgg_metrics):
    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
    
    # 1. ResNet-50 CM
    fig, ax = plt.subplots(figsize=(7, 6))
    cm = np.array(res_metrics["confusion_matrix_raw"])
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=[c.capitalize() for c in CLASS_NAMES],
        yticklabels=[c.capitalize() for c in CLASS_NAMES],
        ax=ax, cbar=False, annot_kws={"size": 13, "weight": "bold"}
    )
    ax.set_title(f"ResNet-50 Test Confusion Matrix (Acc: {res_metrics['accuracy']*100:.2f}%)", fontsize=13, weight="bold", pad=12)
    ax.set_xlabel("Predicted Class", fontsize=11, weight="bold")
    ax.set_ylabel("Ground Truth Class", fontsize=11, weight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, "resnet50_confusion_matrix.png"), dpi=300)
    plt.close()

    # 2. VGG-16 CM
    fig, ax = plt.subplots(figsize=(7, 6))
    cm = np.array(vgg_metrics["confusion_matrix_raw"])
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Greens",
        xticklabels=[c.capitalize() for c in CLASS_NAMES],
        yticklabels=[c.capitalize() for c in CLASS_NAMES],
        ax=ax, cbar=False, annot_kws={"size": 13, "weight": "bold"}
    )
    ax.set_title(f"VGG-16 Test Confusion Matrix (Acc: {vgg_metrics['accuracy']*100:.2f}%)", fontsize=13, weight="bold", pad=12)
    ax.set_xlabel("Predicted Class", fontsize=11, weight="bold")
    ax.set_ylabel("Ground Truth Class", fontsize=11, weight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, "vgg16_confusion_matrix.png"), dpi=300)
    plt.close()

    # 3. Side-by-Side Comparison CM (Normalized Percentages)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    cm_res_norm = np.array(res_metrics["confusion_matrix_normalized"]) * 100
    cm_vgg_norm = np.array(vgg_metrics["confusion_matrix_normalized"]) * 100

    sns.heatmap(
        cm_res_norm, annot=True, fmt=".1f", cmap="Blues",
        xticklabels=[c.capitalize() for c in CLASS_NAMES],
        yticklabels=[c.capitalize() for c in CLASS_NAMES],
        ax=ax1, cbar=False, annot_kws={"size": 11, "weight": "bold"}
    )
    ax1.set_title(f"ResNet-50 (Accuracy: {res_metrics['accuracy']*100:.2f}%, F1: {res_metrics['macro_f1']*100:.2f}%)", fontsize=12, weight="bold", pad=10)
    ax1.set_xlabel("Predicted Class (%)", fontsize=10, weight="bold")
    ax1.set_ylabel("Ground Truth Class", fontsize=10, weight="bold")

    sns.heatmap(
        cm_vgg_norm, annot=True, fmt=".1f", cmap="Teal",
        xticklabels=[c.capitalize() for c in CLASS_NAMES],
        yticklabels=[c.capitalize() for c in CLASS_NAMES],
        ax=ax2, cbar=False, annot_kws={"size": 11, "weight": "bold"}
    )
    ax2.set_title(f"VGG-16 (Accuracy: {vgg_metrics['accuracy']*100:.2f}%, F1: {vgg_metrics['macro_f1']*100:.2f}%)", fontsize=12, weight="bold", pad=10)
    ax2.set_xlabel("Predicted Class (%)", fontsize=10, weight="bold")
    ax2.set_ylabel("Ground Truth Class", fontsize=10, weight="bold")

    plt.suptitle("NeuroVisionAI - Normalized Test Confusion Matrices Comparison (N=1,600)", fontsize=14, weight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, "comparison_confusion_matrices.png"), dpi=300, bbox_inches="tight")
    plt.close()

def plot_per_class_comparison(res_metrics, vgg_metrics):
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(16, 5))
    
    classes = [c.capitalize() for c in CLASS_NAMES]
    x = np.arange(len(classes))
    width = 0.35

    # F1 Score
    f1_res = [res_metrics["per_class"][c]["f1_score"] * 100 for c in CLASS_NAMES]
    f1_vgg = [vgg_metrics["per_class"][c]["f1_score"] * 100 for c in CLASS_NAMES]
    ax1.bar(x - width/2, f1_res, width, label="ResNet-50", color="#1769AA")
    ax1.bar(x + width/2, f1_vgg, width, label="VGG-16", color="#159D91")
    ax1.set_title("F1-Score by Class", fontsize=12, weight="bold")
    ax1.set_xticks(x)
    ax1.set_xticklabels(classes, weight="bold")
    ax1.set_ylim(0, 105)
    ax1.set_ylabel("F1-Score (%)")
    ax1.legend()
    for i in x:
        ax1.text(i - width/2, f1_res[i] + 1.5, f"{f1_res[i]:.1f}%", ha="center", fontsize=8, weight="bold")
        ax1.text(i + width/2, f1_vgg[i] + 1.5, f"{f1_vgg[i]:.1f}%", ha="center", fontsize=8, weight="bold")

    # Recall / Sensitivity
    rec_res = [res_metrics["per_class"][c]["recall_sensitivity"] * 100 for c in CLASS_NAMES]
    rec_vgg = [vgg_metrics["per_class"][c]["recall_sensitivity"] * 100 for c in CLASS_NAMES]
    ax2.bar(x - width/2, rec_res, width, label="ResNet-50", color="#1769AA")
    ax2.bar(x + width/2, rec_vgg, width, label="VGG-16", color="#159D91")
    ax2.set_title("Recall / Sensitivity by Class", fontsize=12, weight="bold")
    ax2.set_xticks(x)
    ax2.set_xticklabels(classes, weight="bold")
    ax2.set_ylim(0, 105)
    ax2.set_ylabel("Recall (%)")
    ax2.legend()
    for i in x:
        ax2.text(i - width/2, rec_res[i] + 1.5, f"{rec_res[i]:.1f}%", ha="center", fontsize=8, weight="bold")
        ax2.text(i + width/2, rec_vgg[i] + 1.5, f"{rec_vgg[i]:.1f}%", ha="center", fontsize=8, weight="bold")

    # Precision
    prec_res = [res_metrics["per_class"][c]["precision"] * 100 for c in CLASS_NAMES]
    prec_vgg = [vgg_metrics["per_class"][c]["precision"] * 100 for c in CLASS_NAMES]
    ax3.bar(x - width/2, prec_res, width, label="ResNet-50", color="#1769AA")
    ax3.bar(x + width/2, prec_vgg, width, label="VGG-16", color="#159D91")
    ax3.set_title("Precision by Class", fontsize=12, weight="bold")
    ax3.set_xticks(x)
    ax3.set_xticklabels(classes, weight="bold")
    ax3.set_ylim(0, 105)
    ax3.set_ylabel("Precision (%)")
    ax3.legend()
    for i in x:
        ax3.text(i - width/2, prec_res[i] + 1.5, f"{prec_res[i]:.1f}%", ha="center", fontsize=8, weight="bold")
        ax3.text(i + width/2, prec_vgg[i] + 1.5, f"{prec_vgg[i]:.1f}%", ha="center", fontsize=8, weight="bold")

    plt.suptitle("NeuroVisionAI - Per-Class Performance Breakdown", fontsize=14, weight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, "per_class_metrics_comparison.png"), dpi=300, bbox_inches="tight")
    plt.close()

# -----------------------------------------------------------------------------
# 6. Main Execution Pipeline
# -----------------------------------------------------------------------------
def main():
    print("=" * 70)
    print("NEUROVISIONAI - INDEPENDENT TESTING SET MODEL EVALUATION")
    print(f"Testing Directory: {DATASET_TEST_DIR}")
    print("=" * 70)

    # 1. Dataset & DataLoader
    transform = get_inference_transforms()
    dataset = MRITestDataset(DATASET_TEST_DIR, transform=transform)
    print(f"Loaded {len(dataset)} testing images across classes: {CLASS_NAMES}")
    dataloader = DataLoader(dataset, batch_size=32, shuffle=False, num_workers=0)

    # 2. Load Checkpoints
    res_path = os.path.join(PROJECT_ROOT, "models", "resnet50_finetuned_best.pth")
    vgg_path = os.path.join(PROJECT_ROOT, "models", "vgg16_best.pth")

    resnet_model, res_meta = load_resnet50_model(res_path, device=DEVICE)
    vgg_model, vgg_meta = load_vgg16_model(vgg_path, device=DEVICE)
    print("Both models loaded successfully into evaluation memory.")

    # 3. Evaluate Models
    res_res = evaluate_single_model(resnet_model, dataloader, model_name="ResNet-50")
    vgg_res = evaluate_single_model(vgg_model, dataloader, model_name="VGG-16")

    # 4. Calculate Detailed Metrics
    res_metrics = compute_detailed_metrics(res_res)
    vgg_metrics = compute_detailed_metrics(vgg_res)

    # 5. McNemar's Test
    mcnemar_res = mcnemar_test(res_res["targets"], res_res["preds"], vgg_res["preds"])

    # 6. Build Detailed Predictions DataFrame
    df_details = pd.DataFrame({
        "filename": res_res["filenames"],
        "path": res_res["paths"],
        "true_class": [CLASS_NAMES[t] for t in res_res["targets"]],
        "true_idx": res_res["targets"],
        "resnet_pred": [CLASS_NAMES[p] for p in res_res["preds"]],
        "resnet_conf": [round(float(p[idx]), 4) for p, idx in zip(res_res["probs"], res_res["preds"])],
        "resnet_correct": (res_res["preds"] == res_res["targets"]),
        "vgg_pred": [CLASS_NAMES[p] for p in vgg_res["preds"]],
        "vgg_conf": [round(float(p[idx]), 4) for p, idx in zip(vgg_res["probs"], vgg_res["preds"])],
        "vgg_correct": (vgg_res["preds"] == res_res["targets"]),
        "models_agree": (res_res["preds"] == vgg_res["preds"])
    })
    
    # Add per-class probabilities columns
    for i, cls in enumerate(CLASS_NAMES):
        df_details[f"resnet_prob_{cls}"] = [round(float(p[i]), 4) for p in res_res["probs"]]
        df_details[f"vgg_prob_{cls}"] = [round(float(p[i]), 4) for p in vgg_res["probs"]]

    detailed_csv = os.path.join(EVAL_DIR, "test_predictions_detailed.csv")
    df_details.to_csv(detailed_csv, index=False)
    print(f"\nSaved detailed prediction log: {detailed_csv} ({len(df_details)} rows)")

    # 7. Investigate Glioma Failures
    glioma_mask = df_details["true_class"] == "glioma"
    df_glioma = df_details[glioma_mask]
    res_glioma_fails = df_glioma[~df_glioma["resnet_correct"]]
    vgg_glioma_fails = df_glioma[~df_glioma["vgg_correct"]]
    both_glioma_fails = df_glioma[(~df_glioma["resnet_correct"]) & (~df_glioma["vgg_correct"])]

    print(f"\nGlioma Evaluation Breakdown (N={len(df_glioma)}):")
    print(f"  ResNet-50 Glioma Correct: {len(df_glioma) - len(res_glioma_fails)} / {len(df_glioma)} (Recall: {(len(df_glioma) - len(res_glioma_fails))/len(df_glioma)*100:.2f}%)")
    print(f"  VGG-16    Glioma Correct: {len(df_glioma) - len(vgg_glioma_fails)} / {len(df_glioma)} (Recall: {(len(df_glioma) - len(vgg_glioma_fails))/len(df_glioma)*100:.2f}%)")
    print(f"  Both Models Failed on Glioma: {len(both_glioma_fails)} samples")

    # Glioma error destinations
    res_glioma_err_dist = res_glioma_fails["resnet_pred"].value_counts().to_dict()
    vgg_glioma_err_dist = vgg_glioma_fails["vgg_pred"].value_counts().to_dict()
    print(f"  ResNet-50 Glioma Error Destinations: {res_glioma_err_dist}")
    print(f"  VGG-16    Glioma Error Destinations: {vgg_glioma_err_dist}")

    # Generate Grad-CAM for top 5 failure cases where both models failed
    failure_cam_records = []
    print("\nGenerating Grad-CAM visualizations for top dual-failure cases...")
    for idx_row, row in both_glioma_fails.head(6).iterrows():
        sample_path = row["path"]
        fname = row["filename"]
        try:
            pil_img = Image.open(sample_path).convert("RGB")
            tensor_in = transform(pil_img).unsqueeze(0).to(DEVICE)
            
            # ResNet-50 CAM
            cam_res = generate_gradcam_result(
                resnet_model, "resnet50", tensor_in, pil_img,
                target_class_idx=int(CLASS_TO_IDX[row["resnet_pred"]])
            )
            # VGG-16 CAM
            cam_vgg = generate_gradcam_result(
                vgg_model, "vgg16", tensor_in, pil_img,
                target_class_idx=int(CLASS_TO_IDX[row["vgg_pred"]])
            )
            
            failure_cam_records.append({
                "filename": fname,
                "true_class": "glioma",
                "resnet_pred": row["resnet_pred"],
                "resnet_conf": row["resnet_conf"],
                "vgg_pred": row["vgg_pred"],
                "vgg_conf": row["vgg_conf"]
            })
        except Exception as e:
            print(f"  Could not generate CAM for {fname}: {e}")

    glioma_analysis_summary = {
        "total_glioma_test_images": len(df_glioma),
        "resnet50": {
            "correct": int(len(df_glioma) - len(res_glioma_fails)),
            "failed": int(len(res_glioma_fails)),
            "recall": res_metrics["per_class"]["glioma"]["recall_sensitivity"],
            "precision": res_metrics["per_class"]["glioma"]["precision"],
            "f1_score": res_metrics["per_class"]["glioma"]["f1_score"],
            "error_destinations": res_glioma_err_dist
        },
        "vgg16": {
            "correct": int(len(df_glioma) - len(vgg_glioma_fails)),
            "failed": int(len(vgg_glioma_fails)),
            "recall": vgg_metrics["per_class"]["glioma"]["recall_sensitivity"],
            "precision": vgg_metrics["per_class"]["glioma"]["precision"],
            "f1_score": vgg_metrics["per_class"]["glioma"]["f1_score"],
            "error_destinations": vgg_glioma_err_dist
        },
        "both_models_failed_count": int(len(both_glioma_fails)),
        "analyzed_failure_samples": failure_cam_records
    }
    
    glioma_json = os.path.join(EVAL_DIR, "glioma_failure_analysis.json")
    with open(glioma_json, "w") as f:
        json.dump(glioma_analysis_summary, f, indent=2)

    # 8. Save Per-Class Comparison CSV
    rows_per_class = []
    for cls in CLASS_NAMES:
        r = res_metrics["per_class"][cls]
        v = vgg_metrics["per_class"][cls]
        rows_per_class.append({
            "class_name": cls,
            "support": r["support"],
            "resnet_precision": r["precision"],
            "resnet_recall": r["recall_sensitivity"],
            "resnet_specificity": r["specificity"],
            "resnet_f1": r["f1_score"],
            "resnet_roc_auc": r["roc_auc"],
            "vgg_precision": v["precision"],
            "vgg_recall": v["recall_sensitivity"],
            "vgg_specificity": v["specificity"],
            "vgg_f1": v["f1_score"],
            "vgg_roc_auc": v["roc_auc"],
            "f1_difference_vgg_minus_resnet": round(v["f1_score"] - r["f1_score"], 4)
        })
    df_per_class = pd.DataFrame(rows_per_class)
    per_class_csv = os.path.join(EVAL_DIR, "per_class_metrics.csv")
    df_per_class.to_csv(per_class_csv, index=False)
    print(f"Saved per-class comparison CSV: {per_class_csv}")

    # 9. Save Combined JSON Metrics Summary
    full_summary = {
        "evaluation_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "dataset_split": "Independent Testing Split",
        "dataset_path": DATASET_TEST_DIR,
        "sample_size": len(dataset),
        "class_names": CLASS_NAMES,
        "models": {
            "resnet50": res_metrics,
            "vgg16": vgg_metrics
        },
        "mcnemar_statistical_comparison": mcnemar_res,
        "consensus": {
            "models_agreement_rate": round(float(df_details["models_agree"].mean()), 4),
            "both_models_correct_rate": round(float((df_details["resnet_correct"] & df_details["vgg_correct"]).mean()), 4),
            "either_model_correct_rate": round(float((df_details["resnet_correct"] | df_details["vgg_correct"]).mean()), 4),
            "both_models_wrong_rate": round(float((~df_details["resnet_correct"] & ~df_details["vgg_correct"]).mean()), 4)
        },
        "glioma_investigation": glioma_analysis_summary
    }

    summary_json = os.path.join(EVAL_DIR, "test_metrics_summary.json")
    with open(summary_json, "w") as f:
        json.dump(full_summary, f, indent=2)
    print(f"Saved test metrics summary JSON: {summary_json}")

    # 10. Generate Publication Figures
    print("\nGenerating evaluation figures...")
    plot_confusion_matrices(res_metrics, vgg_metrics)
    plot_per_class_comparison(res_metrics, vgg_metrics)
    print(f"All evaluation plots saved to: {EVAL_DIR}")

    # 11. Print Terminal Summary
    print("\n" + "=" * 70)
    print("FINAL MODEL EVALUATION BENCHMARK ON INDEPENDENT TEST SET")
    print("=" * 70)
    print(f"{'Metric':<25} | {'ResNet-50':<15} | {'VGG-16':<15} | {'Delta (VGG - ResNet)':<20}")
    print("-" * 75)
    print(f"{'Overall Accuracy':<25} | {res_metrics['accuracy']*100:>13.2f}% | {vgg_metrics['accuracy']*100:>13.2f}% | {(vgg_metrics['accuracy']-res_metrics['accuracy'])*100:>+18.2f}%")
    print(f"{'Macro Precision':<25} | {res_metrics['macro_precision']*100:>13.2f}% | {vgg_metrics['macro_precision']*100:>13.2f}% | {(vgg_metrics['macro_precision']-res_metrics['macro_precision'])*100:>+18.2f}%")
    print(f"{'Macro Recall':<25} | {res_metrics['macro_recall']*100:>13.2f}% | {vgg_metrics['macro_recall']*100:>13.2f}% | {(vgg_metrics['macro_recall']-res_metrics['macro_recall'])*100:>+18.2f}%")
    print(f"{'Macro F1-Score':<25} | {res_metrics['macro_f1']*100:>13.2f}% | {vgg_metrics['macro_f1']*100:>13.2f}% | {(vgg_metrics['macro_f1']-res_metrics['macro_f1'])*100:>+18.2f}%")
    print(f"{'Weighted F1-Score':<25} | {res_metrics['weighted_f1']*100:>13.2f}% | {vgg_metrics['weighted_f1']*100:>13.2f}% | {(vgg_metrics['weighted_f1']-res_metrics['weighted_f1'])*100:>+18.2f}%")
    print(f"{'Cohen Kappa Score':<25} | {res_metrics['cohen_kappa']:>14.4f} | {vgg_metrics['cohen_kappa']:>14.4f} | {(vgg_metrics['cohen_kappa']-res_metrics['cohen_kappa']):>+19.4f}")
    print(f"{'Macro ROC-AUC':<25} | {res_metrics['macro_roc_auc']:>14.4f} | {vgg_metrics['macro_roc_auc']:>14.4f} | {(vgg_metrics['macro_roc_auc']-res_metrics['macro_roc_auc']):>+19.4f}")
    print(f"{'Inference Latency/Image':<25} | {res_metrics['avg_latency_ms']:>12.2f} ms | {vgg_metrics['avg_latency_ms']:>12.2f} ms | {(vgg_metrics['avg_latency_ms']-res_metrics['avg_latency_ms']):>+17.2f} ms")
    print("=" * 75)

    print("\nPER-CLASS F1-SCORE BREAKDOWN:")
    for cls in CLASS_NAMES:
        rf1 = res_metrics["per_class"][cls]["f1_score"] * 100
        vf1 = vgg_metrics["per_class"][cls]["f1_score"] * 100
        print(f"  - {cls.capitalize():<12}: ResNet-50 = {rf1:5.2f}% | VGG-16 = {vf1:5.2f}% | Delta = {vf1-rf1:+5.2f}%")

    print(f"\nMCNEMAR'S TEST STATISTICAL COMPARISON:")
    print(f"  Chi-squared Statistic: {mcnemar_res['mcnemar_chi2_statistic']}")
    print(f"  P-value              : {mcnemar_res['p_value']}")
    print(f"  Significant at p<0.05: {mcnemar_res['is_statistically_significant']}")

if __name__ == "__main__":
    main()
