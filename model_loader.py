"""
NeuroVisionAI - Model Loader & Inference Module
Brain MRI Tumor Classification Research Application

Supported architectures:
- ResNet-50 (Fine-tuned, fc: Linear(2048, 4))
- VGG-16 (Custom classifier: Linear(25088, 512) -> ReLU -> Dropout(0.5) -> Linear(512, 4))

Target classes (verified from checkpoint metadata):
- 0: glioma
- 1: meningioma
- 2: notumor
- 3: pituitary
"""

import os
import logging
from typing import Dict, Tuple, Optional, Union, List

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NeuroVisionAI.ModelLoader")

# -------------------------------------------------------------------------
# Class Mapping & Metadata (Verified from checkpoint metadata)
# -------------------------------------------------------------------------
CLASS_NAMES: List[str] = ["glioma", "meningioma", "notumor", "pituitary"]
NUM_CLASSES: int = len(CLASS_NAMES)
CLASS_TO_IDX: Dict[str, int] = {name: idx for idx, name in enumerate(CLASS_NAMES)}
IDX_TO_CLASS: Dict[int, str] = {idx: name for idx, name in enumerate(CLASS_NAMES)}

# Default image dimensions established by VGG-16 (25088 input features -> 512*7*7 => 224x224)
INPUT_IMAGE_SIZE: Tuple[int, int] = (224, 224)

# Standard ImageNet normalization parameters
NORM_MEAN = [0.485, 0.456, 0.406]
NORM_STD = [0.229, 0.224, 0.225]


# -------------------------------------------------------------------------
# Model Architecture Builders
# -------------------------------------------------------------------------
def build_resnet50(num_classes: int = NUM_CLASSES) -> nn.Module:
    """
    Construct ResNet-50 architecture matching the trained checkpoint.
    Standard torchvision ResNet-50 with fc layer replaced by Linear(2048, num_classes).
    """
    model = models.resnet50(weights=None)
    in_features = model.fc.in_features  # 2048
    model.fc = nn.Linear(in_features, num_classes)
    return model


def build_vgg16(num_classes: int = NUM_CLASSES) -> nn.Module:
    """
    Construct VGG-16 architecture matching the trained checkpoint.
    Features: Standard VGG-16 convolutional backbone (30 parameter tensors).
    Classifier: Custom 2-stage MLP:
      (0): Linear(in_features=25088, out_features=512, bias=True)
      (1): ReLU(inplace=True)
      (2): Dropout(p=0.5, inplace=False)
      (3): Linear(in_features=512, out_features=num_classes, bias=True)
    """
    model = models.vgg16(weights=None)
    model.classifier = nn.Sequential(
        nn.Linear(25088, 512),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.5),
        nn.Linear(512, num_classes)
    )
    return model


# -------------------------------------------------------------------------
# Checkpoint Loader
# -------------------------------------------------------------------------
def load_checkpoint_weights(
    model: nn.Module,
    checkpoint_path: str,
    device: torch.device = torch.device("cpu"),
    strict: bool = True
) -> Dict:
    """
    Safely load model weights and extract metadata from checkpoint.
    Supports both direct state_dicts and nested checkpoint dictionaries.
    """
    if not os.path.isfile(checkpoint_path):
        raise FileNotFoundError(f"Checkpoint not found at: {checkpoint_path}")

    # Use safe weights loading where supported
    try:
        checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=True)
    except Exception as err:
        logger.warning(
            f"weights_only=True failed ({err}), falling back to standard torch.load"
        )
        checkpoint = torch.load(checkpoint_path, map_location=device)

    metadata = {}
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
        metadata = {
            "epoch": checkpoint.get("epoch"),
            "val_macro_f1": checkpoint.get("val_macro_f1"),
            "class_names": checkpoint.get("class_names", CLASS_NAMES)
        }
    elif isinstance(checkpoint, dict):
        state_dict = checkpoint
    else:
        raise ValueError(f"Unrecognized checkpoint format in: {checkpoint_path}")

    # Load weights with strict validation
    load_result = model.load_state_dict(state_dict, strict=strict)
    logger.info(f"Loaded weights from {os.path.basename(checkpoint_path)}: {load_result}")

    model.to(device)
    model.eval()
    return metadata


def load_resnet50_model(
    checkpoint_path: str = "models/resnet50_finetuned_best.pth",
    device: Union[str, torch.device] = "cpu"
) -> Tuple[nn.Module, Dict]:
    """Build and load the fine-tuned ResNet-50 model."""
    dev = torch.device(device)
    model = build_resnet50(num_classes=NUM_CLASSES)
    metadata = load_checkpoint_weights(model, checkpoint_path, device=dev, strict=True)
    return model, metadata


def load_vgg16_model(
    checkpoint_path: str = "models/vgg16_best.pth",
    device: Union[str, torch.device] = "cpu"
) -> Tuple[nn.Module, Dict]:
    """Build and load the fine-tuned VGG-16 model."""
    dev = torch.device(device)
    model = build_vgg16(num_classes=NUM_CLASSES)
    metadata = load_checkpoint_weights(model, checkpoint_path, device=dev, strict=True)
    return model, metadata


# -------------------------------------------------------------------------
# Image Preprocessing Pipeline
# -------------------------------------------------------------------------
def get_inference_transforms() -> transforms.Compose:
    """
    Standard inference transformations matching the model training requirements.
    - Resize to 224x224 (required by VGG16 flattened classifier dimensionality)
    - Convert to Tensor [0.0, 1.0]
    - Normalize using ImageNet mean & standard deviation
    """
    return transforms.Compose([
        transforms.Resize(INPUT_IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(mean=NORM_MEAN, std=NORM_STD)
    ])


def preprocess_image(
    image: Union[str, Image.Image],
    device: Union[str, torch.device] = "cpu"
) -> torch.Tensor:
    """
    Preprocess an input image (file path or PIL Image) for model inference.
    Ensures 3-channel RGB representation (MRI scans often arrive as single-channel grayscale).
    Returns a 4D batch tensor: [1, 3, 224, 224].
    """
    if isinstance(image, str):
        if not os.path.exists(image):
            raise FileNotFoundError(f"Image file does not exist: {image}")
        pil_img = Image.open(image).convert("RGB")
    elif isinstance(image, Image.Image):
        pil_img = image.convert("RGB")
    else:
        raise TypeError(f"Expected file path or PIL.Image.Image, got {type(image)}")

    transform = get_inference_transforms()
    tensor = transform(pil_img).unsqueeze(0)  # Shape: [1, 3, 224, 224]
    return tensor.to(torch.device(device))


# -------------------------------------------------------------------------
# Prediction Routine
# -------------------------------------------------------------------------
def predict_probabilities(
    model: nn.Module,
    input_tensor: torch.Tensor
) -> Tuple[str, float, Dict[str, float]]:
    """
    Run forward pass on a preprocessed batch tensor.
    Returns:
    - predicted_class: Name of highest scoring class
    - confidence: Confidence probability [0.0, 1.0]
    - all_probabilities: Dictionary of {class_name: probability}
    """
    model.eval()
    with torch.no_grad():
        logits = model(input_tensor)
        probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

    all_probs = {CLASS_NAMES[i]: float(probs[i]) for i in range(NUM_CLASSES)}
    top_idx = int(probs.argmax())
    predicted_class = CLASS_NAMES[top_idx]
    confidence = float(probs[top_idx])

    return predicted_class, confidence, all_probs

