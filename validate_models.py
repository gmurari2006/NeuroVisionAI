"""
NeuroVisionAI - Model Validation Script
Safely verifies checkpoint integrity, architectural compatibility, and forward-pass output dimensions.
Does not modify any checkpoints. Does not claim classification accuracy based on synthetic data.
"""

import os
import sys
import torch

try:
    from model_loader import (
        load_resnet50_model,
        load_vgg16_model,
        predict_probabilities,
        CLASS_NAMES,
        NUM_CLASSES,
        INPUT_IMAGE_SIZE,
    )
except ImportError as err:
    print(f"Error importing model_loader: {err}")
    sys.exit(1)


def validate():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    resnet_path = os.path.join(base_dir, "models", "resnet50_finetuned_best.pth")
    vgg_path = os.path.join(base_dir, "models", "vgg16_best.pth")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("=" * 60)
    print("NeuroVisionAI - Architecture & Checkpoint Validation")
    print(f"Target Device: {device}")
    print(f"Verified Classes ({NUM_CLASSES}): {CLASS_NAMES}")
    print(f"Established Input Resolution: {INPUT_IMAGE_SIZE}")
    print("=" * 60)

    # -------------------------------------------------------------
    # 1. Validate ResNet-50
    # -------------------------------------------------------------
    print("\n[1/2] Validating ResNet-50 Checkpoint...")
    print(f"Path: {resnet_path}")
    if not os.path.exists(resnet_path):
        print(f"FAILED: Checkpoint file does not exist: {resnet_path}")
        return False

    try:
        resnet_model, resnet_meta = load_resnet50_model(resnet_path, device=device)
        print("  -> Checkpoint loaded successfully with strict=True.")
        print(f"  -> Extracted Metadata: {resnet_meta}")

        # Synthetic forward pass
        synthetic_input = torch.randn(1, 3, *INPUT_IMAGE_SIZE, device=device)
        with torch.no_grad():
            output_logits = resnet_model(synthetic_input)
            output_probs = torch.softmax(output_logits, dim=1)

        print(f"  -> Synthetic Input Shape:  {list(synthetic_input.shape)}")
        print(f"  -> Output Logits Shape:   {list(output_logits.shape)}")
        print(f"  -> Output Probs Shape:    {list(output_probs.shape)}")
        assert output_logits.shape == (1, 4), f"Unexpected shape {output_logits.shape}"
        print("  -> ResNet-50 Architecture Verification: PASSED")
    except Exception as err:
        print(f"  -> ResNet-50 Verification FAILED: {err}")
        return False

    # -------------------------------------------------------------
    # 2. Validate VGG-16
    # -------------------------------------------------------------
    print("\n[2/2] Validating VGG-16 Checkpoint...")
    print(f"Path: {vgg_path}")
    if not os.path.exists(vgg_path):
        print(f"FAILED: Checkpoint file does not exist: {vgg_path}")
        return False

    try:
        vgg_model, vgg_meta = load_vgg16_model(vgg_path, device=device)
        print("  -> Checkpoint loaded successfully with strict=True.")
        print(f"  -> Extracted Metadata: {vgg_meta}")

        # Synthetic forward pass
        synthetic_input = torch.randn(1, 3, *INPUT_IMAGE_SIZE, device=device)
        with torch.no_grad():
            output_logits = vgg_model(synthetic_input)
            output_probs = torch.softmax(output_logits, dim=1)

        print(f"  -> Synthetic Input Shape:  {list(synthetic_input.shape)}")
        print(f"  -> Output Logits Shape:   {list(output_logits.shape)}")
        print(f"  -> Output Probs Shape:    {list(output_probs.shape)}")
        assert output_logits.shape == (1, 4), f"Unexpected shape {output_logits.shape}"
        print("  -> VGG-16 Architecture Verification: PASSED")
    except Exception as err:
        print(f"  -> VGG-16 Verification FAILED: {err}")
        return False

    print("\n" + "=" * 60)
    print("NOTE ON SYNTHETIC VALIDATION:")
    print("Synthetic random tensors are used solely to verify tensor dimensions,")
    print("layer connectivity, and forward-pass numerical integrity.")
    print("Synthetic forward passes do NOT represent model diagnostic performance.")
    print("Original checkpoints were opened read-only and remain unmodified.")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = validate()
    sys.exit(0 if success else 1)

