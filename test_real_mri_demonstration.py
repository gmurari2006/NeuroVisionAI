"""
NeuroVisionAI - Real MRI Inference & Explainability Test
Demonstrates real AI inference on actual brain MRI scans using the fine-tuned
ResNet-50 and VGG-16 PyTorch model checkpoints.
"""

import sys
import os
import io
import base64
from PIL import Image

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.services.inference_service import ModelManager

def run_real_mri_test():
    print("=" * 72)
    print("   NEUROVISION AI - REAL MRI INFERENCE & GRAD-CAM DEMONSTRATION TEST")
    print("=" * 72)

    manager = ModelManager.get_instance()
    manager.initialize()

    print(f"\n[Hardware] Compute Device: {manager.device}")
    print(f"[Models] ResNet-50 Loaded: {'resnet50' in manager.models}")
    print(f"[Models] VGG-16 Loaded:    {'vgg16' in manager.models}")

    samples = [
        ("glioma_sample.jpg", "glioma"),
        ("meningioma_sample.jpg", "meningioma"),
        ("notumor_sample.jpg", "notumor"),
        ("pituitary_sample.jpg", "pituitary")
    ]

    samples_dir = os.path.join(PROJECT_ROOT, "samples")

    all_passed = True

    for filename, true_label in samples:
        path = os.path.join(samples_dir, filename)
        assert os.path.isfile(path), f"Sample image missing: {path}"

        with open(path, "rb") as f:
            img_bytes = f.read()

        res = manager.analyze(
            image_bytes=img_bytes,
            filename=filename,
            content_type="image/jpeg",
            selected_model="both",
            generate_cam=True
        )

        assert res["success"] is True, "Analysis returned success=False"
        meta = res["image_metadata"]
        print(f"\n------------------------------------------------------------------------")
        print(f"Sample: {filename} (True Clinical Class: {true_label})")
        print(f"Resolution: {meta['width']}x{meta['height']} | Channels: {meta['channels']} | Size: {meta['size_bytes']} bytes")
        print(f"------------------------------------------------------------------------")

        for m_id in ["resnet50", "vgg16"]:
            m_res = res["results"][m_id]
            pred = m_res["predicted_class"]
            conf = m_res["confidence"]
            probs = m_res["probabilities"]
            prob_sum = sum(probs.values())
            lat = m_res["execution_time_ms"]
            cam = m_res["gradcam"]

            # Verify CAM overlay base64 decodes to valid image
            cam_valid = False
            if cam and "overlay_base64" in cam:
                b64_data = cam["overlay_base64"].split(",")[1]
                raw_bytes = base64.b64decode(b64_data)
                cam_img = Image.open(io.BytesIO(raw_bytes))
                cam_valid = (cam_img.size == (meta["width"], meta["height"]))

            assert prob_sum > 0.99 and prob_sum < 1.01, f"Probabilities do not sum to 1.0: {prob_sum}"
            assert cam_valid, f"Grad-CAM overlay invalid for {m_id}"

            print(f"  [{m_res['display_name']}]")
            print(f"    Predicted:    {pred.upper()} (Confidence: {conf*100:.2f}%)")
            print(f"    Latency:      {lat:.1f} ms")
            print(f"    Probabilities: Glioma={probs['glioma']:.4f}, Meningioma={probs['meningioma']:.4f}, NoTumor={probs['notumor']:.4f}, Pituitary={probs['pituitary']:.4f}")
            print(f"    Grad-CAM:     Overlay generated ({cam_img.width}x{cam_img.height} px, Base64 PNG)")

        # Evaluate consensus
        r_pred = res["results"]["resnet50"]["predicted_class"]
        v_pred = res["results"]["vgg16"]["predicted_class"]
        if r_pred == v_pred:
            print(f"  -> Model Consensus: CONVERGENT PREDICTION ({r_pred.upper()})")
        else:
            print(f"  -> Model Consensus: DISCREPANCY DETECTED (ResNet={r_pred.upper()} vs VGG={v_pred.upper()})")

    print("\n" + "=" * 72)
    print("  ALL 4 REAL MRI SAMPLES PASSED INFERENCE AND GRAD-CAM GENERATION!")
    print("=" * 72)
    return True

if __name__ == "__main__":
    success = run_real_mri_test()
    if not success:
        sys.exit(1)
