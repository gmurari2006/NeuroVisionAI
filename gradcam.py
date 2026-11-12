"""
NeuroVisionAI - Grad-CAM Explainability Module
Generates Class Activation Maps (Grad-CAM) for ResNet-50 and VGG-16.

IMPORTANT RESEARCH NOTICE:
Highlighted regions show model feature activation patterns and attention focus.
They DO NOT represent clinically confirmed tumor boundaries, margins, or tissue pathology.
"""

import io
import base64
import logging
from typing import Tuple, Optional, Union, Dict, Any

import torch
import torch.nn as nn
import numpy as np
from PIL import Image

try:
    import cv2  # type: ignore
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

logger = logging.getLogger("NeuroVisionAI.GradCAM")


def get_target_convolutional_layer(model: nn.Module, model_type: str) -> nn.Module:
    """
    Identifies the appropriate final convolutional layer for Grad-CAM.
    - ResNet-50: model.layer4[-1].conv3 or model.layer4[-1]
    - VGG-16: model.features[28] (final conv layer before final maxpool)
    """
    model_name = model_type.lower()
    if "resnet" in model_name:
        if hasattr(model, "layer4"):
            last_block = model.layer4[-1]
            if hasattr(last_block, "conv3"):
                return last_block.conv3
            return last_block
        raise AttributeError("ResNet model does not have layer4 attribute.")
    elif "vgg" in model_name:
        if hasattr(model, "features"):
            # features[28] is the last Conv2d layer in VGG16 (index 28 conv, 29 relu, 30 maxpool)
            return model.features[28]
        raise AttributeError("VGG model does not have features attribute.")
    else:
        raise ValueError(f"Unsupported model architecture: {model_type}")


class GradCAM:
    """
    Grad-CAM implementation with robust hook handling and resource cleanup.
    """
    def __init__(self, model: nn.Module, target_layer: nn.Module):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self.hooks = []
        self._register_hooks()

    def _register_hooks(self):
        # Disable inplace on all ReLU modules so backward hook tensors are not modified in-place
        for m in self.model.modules():
            if isinstance(m, nn.ReLU):
                m.inplace = False

        def forward_hook(module, input, output):
            self.activations = output.detach().clone()

        def backward_hook(module, grad_input, grad_output):
            # grad_output[0] is the gradient w.r.t layer output
            self.gradients = grad_output[0].detach().clone()

        h1 = self.target_layer.register_forward_hook(forward_hook)
        h2 = self.target_layer.register_full_backward_hook(backward_hook)
        self.hooks = [h1, h2]

    def remove_hooks(self):
        for h in self.hooks:
            h.remove()
        self.hooks = []

    def generate_heatmap(
        self,
        input_tensor: torch.Tensor,
        target_class_idx: Optional[int] = None
    ) -> Tuple[np.ndarray, int, float]:
        """
        Calculates raw 2D normalized Grad-CAM heatmap [0, 1].
        Requires gradient calculation (DO NOT run under torch.no_grad).
        """
        self.model.eval()
        self.model.zero_grad()

        # Forward pass with gradients enabled for backward hook
        logits = self.model(input_tensor)
        probs = torch.softmax(logits, dim=1).squeeze(0)

        if target_class_idx is None:
            target_class_idx = int(torch.argmax(probs).item())

        confidence = float(probs[target_class_idx].item())

        # Backward pass for the target class score
        target_score = logits[0, target_class_idx]
        target_score.backward(retain_graph=False)

        if self.gradients is None or self.activations is None:
            raise RuntimeError("Grad-CAM hooks failed to capture gradients or activations.")

        # Global average pooling over gradients -> channel weights alpha_k
        # gradients: [1, C, H, W], activations: [1, C, H, W]
        weights = torch.mean(self.gradients, dim=(2, 3), keepdim=True)  # [1, C, 1, 1]

        # Weighted combination of activation maps
        cam = torch.sum(weights * self.activations, dim=1).squeeze(0)   # [H, W]

        # Apply ReLU (focus only on features that have a positive influence)
        cam = torch.clamp(cam, min=0)

        cam_np = cam.cpu().numpy()

        # Normalize to [0, 1]
        cam_min, cam_max = cam_np.min(), cam_np.max()
        if cam_max - cam_min > 1e-8:
            heatmap = (cam_np - cam_min) / (cam_max - cam_min)
        else:
            heatmap = np.zeros_like(cam_np)

        return heatmap, target_class_idx, confidence

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.remove_hooks()


def apply_colormap_on_image(
    original_pil: Image.Image,
    heatmap: np.ndarray,
    alpha: float = 0.45
) -> Image.Image:
    """
    Resizes heatmap to original image dimensions and blends with colormap.
    """
    orig_rgb = np.array(original_pil.convert("RGB"))
    h, w, _ = orig_rgb.shape

    if HAS_OPENCV:
        # Resize heatmap to match image dimensions
        resized_cam = cv2.resize(heatmap, (w, h), interpolation=cv2.INTER_CUBIC)
        resized_cam = np.clip(resized_cam, 0.0, 1.0)
        
        # Convert to 8-bit heatmap
        heatmap_uint8 = np.uint8(255 * resized_cam)
        heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
    else:
        # Fallback using PIL and NumPy
        cam_pil = Image.fromarray(np.uint8(255 * heatmap)).resize((w, h), Image.Resampling.BICUBIC)
        cam_arr = np.array(cam_pil) / 255.0
        # Jet colormap approximation
        r = np.clip(1.5 - np.abs(cam_arr * 4 - 3), 0, 1)
        g = np.clip(1.5 - np.abs(cam_arr * 4 - 2), 0, 1)
        b = np.clip(1.5 - np.abs(cam_arr * 4 - 1), 0, 1)
        heatmap_colored = np.stack([r, g, b], axis=-1)
        heatmap_colored = np.uint8(255 * heatmap_colored)

    # Blend original and heatmap
    overlay = (1.0 - alpha) * orig_rgb + alpha * heatmap_colored
    overlay = np.clip(overlay, 0, 255).astype(np.uint8)

    return Image.fromarray(overlay)


def image_to_base64(img: Image.Image, format: str = "PNG") -> str:
    """Converts a PIL Image to a base64 Data URL string."""
    buffer = io.BytesIO()
    img.save(buffer, format=format)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    mime = "image/png" if format.upper() == "PNG" else "image/jpeg"
    return f"data:{mime};base64,{encoded}"


def generate_gradcam_result(
    model: nn.Module,
    model_type: str,
    input_tensor: torch.Tensor,
    original_pil: Image.Image,
    target_class_idx: Optional[int] = None
) -> Dict[str, Any]:
    """
    High-level helper:
    Executes Grad-CAM for the specified model and returns base64 images and metadata.
    Ensures hooks are safely unregistered even if an exception occurs.
    """
    target_layer = get_target_convolutional_layer(model, model_type)
    
    with GradCAM(model, target_layer) as cam_engine:
        heatmap, class_idx, conf = cam_engine.generate_heatmap(
            input_tensor, target_class_idx=target_class_idx
        )

    overlay_img = apply_colormap_on_image(original_pil, heatmap)
    
    # Also generate standalone heatmap visualization
    h, w = np.array(original_pil).shape[:2]
    if HAS_OPENCV:
        resized_cam = cv2.resize(heatmap, (w, h), interpolation=cv2.INTER_CUBIC)
        hm_colored = cv2.applyColorMap(np.uint8(255 * resized_cam), cv2.COLORMAP_JET)
        hm_colored = cv2.cvtColor(hm_colored, cv2.COLOR_BGR2RGB)
        heatmap_pil = Image.fromarray(hm_colored)
    else:
        heatmap_pil = Image.fromarray(np.uint8(255 * heatmap)).resize((w, h))

    return {
        "target_class_idx": class_idx,
        "confidence": conf,
        "overlay_base64": image_to_base64(overlay_img, format="PNG"),
        "heatmap_base64": image_to_base64(heatmap_pil, format="PNG"),
        "original_base64": image_to_base64(original_pil, format="PNG"),
        "disclaimer": (
            "For academic and research demonstration only. Not intended for clinical diagnosis. "
            "Grad-CAM visualizes model activation intensity and feature importance. "
            "It does not represent clinical tumor borders, histology, or diagnostic confirmation."
        )
    }
