"""
NeuroVisionAI - Generate Failure Case Visualizations
Produces side-by-side composite images for top glioma misclassification cases:
[Original MRI | ResNet-50 Grad-CAM Overlay | VGG-16 Grad-CAM Overlay]
"""

import os
import sys
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image
import torch

PROJECT_ROOT = r"C:\Users\tinku\OneDrive\Desktop\NeuroVisionAI"
DATASET_TEST_DIR = r"C:\Users\tinku\Downloads\brain-tumor-mri-dataset\Testing"
EVAL_DIR = os.path.join(PROJECT_ROOT, "evaluation")
FAILURES_DIR = os.path.join(EVAL_DIR, "failure_cases")

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from model_loader import (
    load_resnet50_model,
    load_vgg16_model,
    get_inference_transforms,
    CLASS_TO_IDX
)
from gradcam import generate_gradcam_result

DEVICE = torch.device("cpu")

TARGET_CASES = [
    {
        "filename": "Te-gl_1.jpg",
        "title": "Case 1: Te-gl_1.jpg (True: Glioma | ResNet: Pituitary 47.6% | VGG: Meningioma 97.8%)",
        "res_target": "pituitary",
        "vgg_target": "meningioma"
    },
    {
        "filename": "Te-gl_106.jpg",
        "title": "Case 2: Te-gl_106.jpg (True: Glioma | ResNet: Meningioma 95.7% | VGG: Meningioma 59.9%)",
        "res_target": "meningioma",
        "vgg_target": "meningioma"
    },
    {
        "filename": "Te-gl_102.jpg",
        "title": "Case 3: Te-gl_102.jpg (True: Glioma | ResNet: Pituitary 38.6% | VGG: No Tumor 77.4%)",
        "res_target": "pituitary",
        "vgg_target": "notumor"
    },
    {
        "filename": "Te-gl_109.jpg",
        "title": "Case 4: Te-gl_109.jpg (True: Glioma | ResNet: Meningioma 95.4% | VGG: Meningioma 94.6%)",
        "res_target": "meningioma",
        "vgg_target": "meningioma"
    }
]

def generate_failure_figures():
    transform = get_inference_transforms()
    resnet_model, _ = load_resnet50_model(os.path.join(PROJECT_ROOT, "models", "resnet50_finetuned_best.pth"), device=DEVICE)
    vgg_model, _ = load_vgg16_model(os.path.join(PROJECT_ROOT, "models", "vgg16_best.pth"), device=DEVICE)

    for case in TARGET_CASES:
        fname = case["filename"]
        img_path = os.path.join(DATASET_TEST_DIR, "glioma", fname)
        if not os.path.exists(img_path):
            continue

        pil_img = Image.open(img_path).convert("RGB")
        tensor_in = transform(pil_img).unsqueeze(0).to(DEVICE)

        res_cam = generate_gradcam_result(
            resnet_model, "resnet50", tensor_in, pil_img,
            target_class_idx=CLASS_TO_IDX[case["res_target"]]
        )
        vgg_cam = generate_gradcam_result(
            vgg_model, "vgg16", tensor_in, pil_img,
            target_class_idx=CLASS_TO_IDX[case["vgg_target"]]
        )

        # Plot 3-panel figure
        fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(15, 5.5))

        ax1.imshow(pil_img, cmap="gray" if pil_img.mode == "L" else None)
        ax1.set_title(f"Original MRI Slice\n(Ground Truth: Glioma)", fontsize=11, weight="bold")
        ax1.axis("off")

        # Decode base64 overlays
        import base64
        import io
        res_overlay = Image.open(io.BytesIO(base64.b64decode(res_cam["overlay_base64"].split(",")[1])))
        ax2.imshow(res_overlay)
        ax2.set_title(f"ResNet-50 Attention\n(Predicted: {case['res_target'].capitalize()})", fontsize=11, weight="bold")
        ax2.axis("off")

        vgg_overlay = Image.open(io.BytesIO(base64.b64decode(vgg_cam["overlay_base64"].split(",")[1])))
        ax3.imshow(vgg_overlay)
        ax3.set_title(f"VGG-16 Attention\n(Predicted: {case['vgg_target'].capitalize()})", fontsize=11, weight="bold")
        ax3.axis("off")

        plt.suptitle(case["title"], fontsize=12, weight="bold", y=0.98)
        plt.tight_layout()
        out_path = os.path.join(FAILURES_DIR, f"failure_{fname.replace('.jpg', '')}.png")
        plt.savefig(out_path, dpi=200, bbox_inches="tight")
        plt.close()
        print(f"Saved failure analysis figure: {out_path}")

if __name__ == "__main__":
    generate_failure_figures()
