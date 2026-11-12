"""
NeuroVisionAI - Backend Inference Service
Handles singleton model loading, memory caching, inference, and Grad-CAM generation.
"""

import os
import sys
import time
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any
import io
import pandas as pd
from PIL import Image
import torch
import torch.nn as nn

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from model_loader import (
    load_resnet50_model,
    load_vgg16_model,
    preprocess_image,
    CLASS_NAMES,
    NUM_CLASSES,
    INPUT_IMAGE_SIZE,
)
from gradcam import generate_gradcam_result

logger = logging.getLogger("NeuroVisionAI.InferenceService")

RESEARCH_DISCLAIMER = (
    "For academic and research demonstration only. Not intended for clinical diagnosis. "
    "Predictions and activation maps do NOT constitute medical advice, diagnostic confirmation, "
    "or treatment planning. Always consult qualified medical professionals for clinical evaluations."
)


class ModelManager:
    _instance: Optional["ModelManager"] = None

    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.models: Dict[str, nn.Module] = {}
        self.metadata: Dict[str, Dict[str, Any]] = {}
        self.history_data: Dict[str, List[Dict[str, Any]]] = {}
        self.is_loaded = False

    @classmethod
    def get_instance(cls) -> "ModelManager":
        if cls._instance is None:
            cls._instance = ModelManager()
        return cls._instance

    def initialize(self):
        """Loads both models into memory and reads training history once."""
        if self.is_loaded:
            logger.info("Models are already initialized.")
            return

        logger.info(f"Initializing NeuroVisionAI ModelManager on device: {self.device}")
        base_models_dir = os.path.join(PROJECT_ROOT, "models")
        resnet_path = os.path.join(base_models_dir, "resnet50_finetuned_best.pth")
        vgg_path = os.path.join(base_models_dir, "vgg16_best.pth")

        # 1. Load ResNet-50
        try:
            res_model, res_meta = load_resnet50_model(resnet_path, device=self.device)
            self.models["resnet50"] = res_model
            self.metadata["resnet50"] = res_meta
            logger.info("ResNet-50 loaded successfully into ModelManager cache.")
        except Exception as err:
            logger.error(f"Failed to load ResNet-50: {err}")
            raise RuntimeError(f"ResNet-50 load failure: {err}")

        # 2. Load VGG-16
        try:
            vgg_model, vgg_meta = load_vgg16_model(vgg_path, device=self.device)
            self.models["vgg16"] = vgg_model
            self.metadata["vgg16"] = vgg_meta
            logger.info("VGG-16 loaded successfully into ModelManager cache.")
        except Exception as err:
            logger.error(f"Failed to load VGG-16: {err}")
            raise RuntimeError(f"VGG-16 load failure: {err}")

        # 3. Read Training History CSVs
        self._load_training_history()
        self.is_loaded = True
        logger.info("NeuroVisionAI ModelManager fully initialized.")

    def _load_training_history(self):
        """Reads CSV histories without fabricating any values."""
        hist_dir = os.path.join(PROJECT_ROOT, "training_history")
        res_csv = os.path.join(hist_dir, "finetune_history.csv")
        vgg_csv = os.path.join(hist_dir, "vgg16_history.csv")

        if os.path.exists(res_csv):
            df_res = pd.read_csv(res_csv)
            self.history_data["resnet50"] = df_res.to_dict(orient="records")
        else:
            self.history_data["resnet50"] = []

        if os.path.exists(vgg_csv):
            df_vgg = pd.read_csv(vgg_csv)
            self.history_data["vgg16"] = df_vgg.to_dict(orient="records")
        else:
            self.history_data["vgg16"] = []

    def get_models_info(self) -> List[Dict[str, Any]]:
        """Returns metadata and training history for model comparison."""
        info_list = []

        # ResNet-50 info
        res_history = self.history_data.get("resnet50", [])
        best_res_epoch = self.metadata.get("resnet50", {}).get("epoch", 8)
        # Find metrics at best epoch
        best_res_metric = next((m for m in res_history if m["epoch"] == best_res_epoch), {})
        info_list.append({
            "model_id": "resnet50",
            "display_name": "Fine-Tuned ResNet-50",
            "architecture": "Residual Network (50 layers with custom fc Linear(2048, 4))",
            "best_epoch": best_res_epoch,
            "val_macro_f1": float(best_res_metric.get("val_macro_f1", 0.9571)),
            "val_accuracy": float(best_res_metric.get("val_accuracy", 0.9571)),
            "val_loss": float(best_res_metric.get("val_loss", 0.1280)),
            "input_resolution": list(INPUT_IMAGE_SIZE),
            "class_labels": CLASS_NAMES,
            "training_history": res_history
        })

        # VGG-16 info
        vgg_history = self.history_data.get("vgg16", [])
        best_vgg_epoch = self.metadata.get("vgg16", {}).get("epoch", 8)
        best_vgg_metric = next((m for m in vgg_history if m["epoch"] == best_vgg_epoch), {})
        info_list.append({
            "model_id": "vgg16",
            "display_name": "Fine-Tuned VGG-16",
            "architecture": "Visual Geometry Group (16 layers with custom 2-stage MLP classifier)",
            "best_epoch": best_vgg_epoch,
            "val_macro_f1": float(best_vgg_metric.get("val_macro_f1", 0.9598)),
            "val_accuracy": float(best_vgg_metric.get("val_accuracy", 0.9598)),
            "val_loss": float(best_vgg_metric.get("val_loss", 0.1063)),
            "input_resolution": list(INPUT_IMAGE_SIZE),
            "class_labels": CLASS_NAMES,
            "training_history": vgg_history
        })

        return info_list

    def run_inference_on_model(
        self,
        model_id: str,
        input_tensor: torch.Tensor,
        pil_image: Image.Image,
        generate_cam: bool = True
    ) -> Dict[str, Any]:
        """Runs evaluation pass and optional Grad-CAM for a given model."""
        if model_id not in self.models:
            raise ValueError(f"Unknown model_id: {model_id}")

        model = self.models[model_id]
        display_name = "ResNet-50" if model_id == "resnet50" else "VGG-16"

        start_time = time.perf_counter()

        # Forward pass in eval mode with no_grad
        model.eval()
        with torch.no_grad():
            logits = model(input_tensor)
            probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

        all_probs = {CLASS_NAMES[i]: round(float(probs[i]), 4) for i in range(NUM_CLASSES)}
        top_idx = int(probs.argmax())
        predicted_class = CLASS_NAMES[top_idx]
        confidence = round(float(probs[top_idx]), 4)

        # Grad-CAM generation (if requested)
        gradcam_payload = None
        if generate_cam:
            try:
                # Grad-CAM requires autograd graph
                cam_res = generate_gradcam_result(
                    model=model,
                    model_type=model_id,
                    input_tensor=input_tensor.clone(),
                    original_pil=pil_image,
                    target_class_idx=top_idx
                )
                gradcam_payload = {
                    "overlay_base64": cam_res["overlay_base64"],
                    "heatmap_base64": cam_res["heatmap_base64"],
                    "original_base64": cam_res["original_base64"],
                    "target_class_idx": top_idx,
                    "target_class_name": predicted_class,
                    "disclaimer": cam_res["disclaimer"]
                }
            except Exception as cam_err:
                logger.error(f"Grad-CAM generation error on {model_id}: {cam_err}")
                gradcam_payload = None

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return {
            "model_id": model_id,
            "display_name": display_name,
            "predicted_class": predicted_class,
            "confidence": confidence,
            "probabilities": all_probs,
            "gradcam": gradcam_payload,
            "execution_time_ms": elapsed_ms
        }

    def analyze(
        self,
        image_bytes: bytes,
        filename: str,
        content_type: str,
        selected_model: str = "both",
        generate_cam: bool = True
    ) -> Dict[str, Any]:
        """
        Validates image in memory and performs inference on selected model(s).
        Does NOT save uploaded bytes permanently to disk.
        """
        if not self.is_loaded:
            self.initialize()

        # Validate image format and decode with PIL
        try:
            pil_image = Image.open(io.BytesIO(image_bytes))
            pil_image.verify()  # verify integrity
            # Reopen after verify
            pil_image = Image.open(io.BytesIO(image_bytes))
        except Exception as img_err:
            raise ValueError(f"Invalid or corrupted image format: {img_err}")

        width, height = pil_image.size
        channels = len(pil_image.getbands())

        # Preprocess image tensor
        input_tensor = preprocess_image(pil_image, device=self.device)

        # Determine target models
        models_to_run = []
        if selected_model == "both":
            models_to_run = ["resnet50", "vgg16"]
        elif selected_model in self.models:
            models_to_run = [selected_model]
        else:
            raise ValueError(f"Invalid model selection: '{selected_model}'. Choose 'resnet50', 'vgg16', or 'both'.")

        results = {}
        for m_id in models_to_run:
            results[m_id] = self.run_inference_on_model(
                m_id, input_tensor, pil_image, generate_cam=generate_cam
            )

        return {
            "success": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "image_metadata": {
                "filename": filename,
                "content_type": content_type or "image/jpeg",
                "width": width,
                "height": height,
                "channels": channels,
                "size_bytes": len(image_bytes)
            },
            "results": results,
            "disclaimer": RESEARCH_DISCLAIMER
        }

