"""
Generate all publication-grade evaluation plots for NeuroVisionAI
using pre-computed evaluation metrics from test_metrics_summary.json.
"""

import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

EVAL_DIR = r"C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI\evaluation"
SUMMARY_PATH = os.path.join(EVAL_DIR, "test_metrics_summary.json")

def generate_all_plots():
    with open(SUMMARY_PATH, "r") as f:
        summary = json.load(f)

    res_metrics = summary["models"]["resnet50"]
    vgg_metrics = summary["models"]["vgg16"]
    class_names = summary["class_names"]
    classes = [c.capitalize() for c in class_names]

    # 1. ResNet-50 Confusion Matrix
    plt.figure(figsize=(6.5, 5.5))
    cm_res = np.array(res_metrics["confusion_matrix_raw"])
    sns.heatmap(
        cm_res, annot=True, fmt="d", cmap="Blues",
        xticklabels=classes, yticklabels=classes,
        cbar=False, annot_kws={"size": 13, "weight": "bold"}
    )
    plt.title(f"ResNet-50 Independent Test Confusion Matrix\n(Accuracy: {res_metrics['accuracy']*100:.2f}%, Macro F1: {res_metrics['macro_f1']*100:.2f}%)", fontsize=12, weight="bold", pad=12)
    plt.xlabel("Predicted Class", fontsize=10, weight="bold")
    plt.ylabel("Ground Truth Class", fontsize=10, weight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, "resnet50_confusion_matrix.png"), dpi=300)
    plt.close()

    # 2. VGG-16 Confusion Matrix
    plt.figure(figsize=(6.5, 5.5))
    cm_vgg = np.array(vgg_metrics["confusion_matrix_raw"])
    sns.heatmap(
        cm_vgg, annot=True, fmt="d", cmap="Greens",
        xticklabels=classes, yticklabels=classes,
        cbar=False, annot_kws={"size": 13, "weight": "bold"}
    )
    plt.title(f"VGG-16 Independent Test Confusion Matrix\n(Accuracy: {vgg_metrics['accuracy']*100:.2f}%, Macro F1: {vgg_metrics['macro_f1']*100:.2f}%)", fontsize=12, weight="bold", pad=12)
    plt.xlabel("Predicted Class", fontsize=10, weight="bold")
    plt.ylabel("Ground Truth Class", fontsize=10, weight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, "vgg16_confusion_matrix.png"), dpi=300)
    plt.close()

    # 3. Side-by-Side Normalized Comparison
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.5))
    cm_res_norm = np.array(res_metrics["confusion_matrix_normalized"]) * 100
    cm_vgg_norm = np.array(vgg_metrics["confusion_matrix_normalized"]) * 100

    sns.heatmap(
        cm_res_norm, annot=True, fmt=".1f", cmap="Blues",
        xticklabels=classes, yticklabels=classes,
        ax=ax1, cbar=False, annot_kws={"size": 11, "weight": "bold"}
    )
    ax1.set_title(f"ResNet-50 (Accuracy: {res_metrics['accuracy']*100:.2f}%, Macro F1: {res_metrics['macro_f1']*100:.2f}%)", fontsize=11, weight="bold")
    ax1.set_xlabel("Predicted Class (%)", fontsize=10, weight="bold")
    ax1.set_ylabel("Ground Truth Class", fontsize=10, weight="bold")

    sns.heatmap(
        cm_vgg_norm, annot=True, fmt=".1f", cmap="YlGnBu",
        xticklabels=classes, yticklabels=classes,
        ax=ax2, cbar=False, annot_kws={"size": 11, "weight": "bold"}
    )
    ax2.set_title(f"VGG-16 (Accuracy: {vgg_metrics['accuracy']*100:.2f}%, Macro F1: {vgg_metrics['macro_f1']*100:.2f}%)", fontsize=11, weight="bold")
    ax2.set_xlabel("Predicted Class (%)", fontsize=10, weight="bold")
    ax2.set_ylabel("Ground Truth Class", fontsize=10, weight="bold")

    plt.suptitle("NeuroVisionAI - Normalized Test Confusion Matrices Comparison (N=1,600)", fontsize=13, weight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, "comparison_confusion_matrices.png"), dpi=300, bbox_inches="tight")
    plt.close()

    # 4. Per-Class Metrics Bar Chart (Precision, Recall, F1)
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(16, 5))
    x = np.arange(len(classes))
    width = 0.35

    # F1
    f1_res = [res_metrics["per_class"][c]["f1_score"] * 100 for c in class_names]
    f1_vgg = [vgg_metrics["per_class"][c]["f1_score"] * 100 for c in class_names]
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

    # Recall
    rec_res = [res_metrics["per_class"][c]["recall_sensitivity"] * 100 for c in class_names]
    rec_vgg = [vgg_metrics["per_class"][c]["recall_sensitivity"] * 100 for c in class_names]
    ax2.bar(x - width/2, rec_res, width, label="ResNet-50", color="#1769AA")
    ax2.bar(x + width/2, rec_vgg, width, label="VGG-16", color="#159D91")
    ax2.set_title("Recall (Sensitivity) by Class", fontsize=12, weight="bold")
    ax2.set_xticks(x)
    ax2.set_xticklabels(classes, weight="bold")
    ax2.set_ylim(0, 105)
    ax2.set_ylabel("Recall (%)")
    ax2.legend()
    for i in x:
        ax2.text(i - width/2, rec_res[i] + 1.5, f"{rec_res[i]:.1f}%", ha="center", fontsize=8, weight="bold")
        ax2.text(i + width/2, rec_vgg[i] + 1.5, f"{rec_vgg[i]:.1f}%", ha="center", fontsize=8, weight="bold")

    # Precision
    prec_res = [res_metrics["per_class"][c]["precision"] * 100 for c in class_names]
    prec_vgg = [vgg_metrics["per_class"][c]["precision"] * 100 for c in class_names]
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

    plt.suptitle("NeuroVisionAI - Independent Test Per-Class Performance Breakdown", fontsize=14, weight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, "per_class_metrics_comparison.png"), dpi=300, bbox_inches="tight")
    plt.close()

    # 5. Glioma Misclassification Destination Breakdown
    fig, ax = plt.subplots(figsize=(8, 5))
    res_dest = summary["glioma_investigation"]["resnet50"]["error_destinations"]
    vgg_dest = summary["glioma_investigation"]["vgg16"]["error_destinations"]
    dest_classes = ["meningioma", "notumor", "pituitary"]
    xd = np.arange(len(dest_classes))
    w = 0.35

    ax.bar(xd - w/2, [res_dest.get(c, 0) for c in dest_classes], w, label="ResNet-50 Errors (Total: 103)", color="#1769AA")
    ax.bar(xd + w/2, [vgg_dest.get(c, 0) for c in dest_classes], w, label="VGG-16 Errors (Total: 109)", color="#159D91")
    ax.set_title("Glioma Misclassification Breakdown (Where do true gliomas get misclassified?)", fontsize=12, weight="bold")
    ax.set_xticks(xd)
    ax.set_xticklabels([f"Misclassified as\n{c.capitalize()}" for c in dest_classes], fontsize=10, weight="bold")
    ax.set_ylabel("Number of Misclassified Images (out of 400 true gliomas)")
    ax.set_ylim(0, 100)
    ax.legend()
    for i, c in enumerate(dest_classes):
        r_val = res_dest.get(c, 0)
        v_val = vgg_dest.get(c, 0)
        ax.text(i - w/2, r_val + 2, f"{r_val} ({r_val/400*100:.1f}%)", ha="center", fontsize=9, weight="bold")
        ax.text(i + w/2, v_val + 2, f"{v_val} ({v_val/400*100:.1f}%)", ha="center", fontsize=9, weight="bold")

    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, "glioma_error_destinations.png"), dpi=300)
    plt.close()

    print("All evaluation plots generated successfully in:", EVAL_DIR)

if __name__ == "__main__":
    generate_all_plots()
