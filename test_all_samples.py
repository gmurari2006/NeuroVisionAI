"""
Comprehensive verification of NeuroVisionAI inference pipeline
across all 4 real Brain MRI samples via Next.js proxy (http://localhost:3000/api/analyze).
"""

import os
import sys
import base64
import io
import requests
from PIL import Image

SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "samples")
SAMPLES = [
    "glioma_sample.jpg",
    "meningioma_sample.jpg",
    "notumor_sample.jpg",
    "pituitary_sample.jpg",
]

EXPECTED_CLASSES = {"glioma", "meningioma", "notumor", "pituitary"}
API_URL = "http://localhost:3000/api/analyze"

def verify_all_samples():
    print("=" * 70)
    print("NEUROVISIONAI - REAL MRI SAMPLES PIPELINE VERIFICATION")
    print(f"Target Endpoint (Next.js Proxy): {API_URL}")
    print("=" * 70)

    total_tests = len(SAMPLES)
    passed_tests = 0

    for idx, sample_name in enumerate(SAMPLES, 1):
        sample_path = os.path.join(SAMPLES_DIR, sample_name)
        print(f"\n[{idx}/{total_tests}] Testing Sample: {sample_name}")

        if not os.path.exists(sample_path):
            print(f"  FAILED: File not found at {sample_path}")
            continue

        with open(sample_path, "rb") as f:
            file_bytes = f.read()

        print(f"  Input File Size: {len(file_bytes)} bytes")

        # Make request via Next.js proxy
        files = {"file": (sample_name, file_bytes, "image/jpeg")}
        data = {"model_name": "both", "generate_cam": "true"}

        try:
            resp = requests.post(API_URL, files=files, data=data, timeout=45)
        except Exception as e:
            print(f"  FAILED: Request error: {e}")
            continue

        print(f"  HTTP Status Code: {resp.status_code}")
        if resp.status_code != 200:
            print(f"  FAILED: Response: {resp.text}")
            continue

        res = resp.json()

        # Check response structure
        assert res.get("success") is True, "success flag is not True"
        metadata = res.get("image_metadata", {})
        print(f"  Decoded Dimensions: {metadata.get('width')}x{metadata.get('height')}, Channels: {metadata.get('channels')}")

        results = res.get("results", {})
        assert "resnet50" in results and "vgg16" in results, "Missing one or both models in results"

        sample_passed = True
        for model_id in ["resnet50", "vgg16"]:
            m = results[model_id]
            pred = m.get("predicted_class")
            conf = m.get("confidence")
            latency = m.get("execution_time_ms")
            probs = m.get("probabilities", {})

            assert pred in EXPECTED_CLASSES, f"Invalid predicted_class: {pred}"
            assert set(probs.keys()) == EXPECTED_CLASSES, f"Missing classes in probabilities: {probs}"
            prob_sum = sum(probs.values())
            assert 0.99 <= prob_sum <= 1.01, f"Probabilities do not sum to ~1.0: {prob_sum}"

            print(f"  -> Model [{model_id.upper()}]:")
            print(f"       Prediction : {pred.upper()} ({conf*100:.2f}%) [Latency: {latency}ms]")
            prob_str = ", ".join([f"{k}: {v*100:.1f}%" for k, v in sorted(probs.items())])
            print(f"       Class Probs: {prob_str}")

            # Verify Grad-CAM
            cam = m.get("gradcam")
            assert cam is not None, f"Grad-CAM is None for {model_id}"
            overlay_b64 = cam.get("overlay_base64")
            heatmap_b64 = cam.get("heatmap_base64")
            original_b64 = cam.get("original_base64")

            assert overlay_b64 and (overlay_b64.startswith("data:image/png;base64,") or overlay_b64.startswith("data:image/jpeg;base64,")), "Invalid overlay data URI"
            assert heatmap_b64 and (heatmap_b64.startswith("data:image/png;base64,") or heatmap_b64.startswith("data:image/jpeg;base64,")), "Invalid heatmap data URI"
            assert original_b64 and (original_b64.startswith("data:image/png;base64,") or original_b64.startswith("data:image/jpeg;base64,")), "Invalid original data URI"

            # Verify base64 decodability to image
            overlay_bytes = base64.b64decode(overlay_b64.split(",", 1)[1])
            overlay_img = Image.open(io.BytesIO(overlay_bytes))
            assert overlay_img.size[0] > 0 and overlay_img.size[1] > 0, "Overlay image has zero size"

            print(f"       Grad-CAM   : OK (Overlay: {len(overlay_bytes)} bytes, {overlay_img.size[0]}x{overlay_img.size[1]} px)")

        disclaimer = res.get("disclaimer", "")
        assert "research prototype" in disclaimer.lower(), "Disclaimer missing or incorrect"

        print(f"  STATUS: PASS")
        passed_tests += 1

    print("\n" + "=" * 70)
    print(f"VERIFICATION RESULT: {passed_tests}/{total_tests} SAMPLES PASSED")
    print("=" * 70)

    if passed_tests == total_tests:
        print("ALL TESTS PASSED SUCCESSFULLY!")
        return 0
    else:
        print("SOME TESTS FAILED!")
        return 1

if __name__ == "__main__":
    sys.exit(verify_all_samples())
