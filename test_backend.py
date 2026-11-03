"""
NeuroVisionAI - Backend Integration & Verification Tests
Runs FastAPI TestClient against /api/health, /api/models, and /api/analyze.
"""

import sys
import os
import io
from PIL import Image

# Ensure project root is in path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.inference_service import ModelManager

def run_tests():
    print("=" * 60)
    print("NeuroVisionAI - Backend Test Suite")
    print("=" * 60)

    # Initialize model manager before running tests
    print("\n[1/4] Initializing Lifespan & Models...")
    manager = ModelManager.get_instance()
    manager.initialize()
    print("  -> Models initialized successfully.")

    client = TestClient(app)

    # 1. Health check test
    print("\n[2/4] Testing GET /api/health...")
    resp = client.get("/api/health")
    print(f"  -> Status Code: {resp.status_code}")
    data = resp.json()
    print(f"  -> Health Payload: {data}")
    assert resp.status_code == 200
    assert data["status"] == "healthy"
    assert data["models_loaded"]["resnet50"] is True
    assert data["models_loaded"]["vgg16"] is True
    print("  -> Health Check: PASSED")

    # 2. Models list test
    print("\n[3/4] Testing GET /api/models...")
    resp = client.get("/api/models")
    print(f"  -> Status Code: {resp.status_code}")
    data = resp.json()
    assert resp.status_code == 200
    assert len(data["models"]) == 2
    res_m = next(m for m in data["models"] if m["model_id"] == "resnet50")
    vgg_m = next(m for m in data["models"] if m["model_id"] == "vgg16")
    print(f"  -> ResNet-50 Best Epoch: {res_m['best_epoch']}, Val F1: {res_m['val_macro_f1']}")
    print(f"  -> ResNet-50 History Length: {len(res_m['training_history'])} epochs")
    print(f"  -> VGG-16 Best Epoch: {vgg_m['best_epoch']}, Val F1: {vgg_m['val_macro_f1']}")
    print(f"  -> VGG-16 History Length: {len(vgg_m['training_history'])} epochs")
    assert res_m["val_macro_f1"] > 0.9
    assert vgg_m["val_macro_f1"] > 0.9
    print("  -> Models Endpoint: PASSED")

    # 3. Analyze endpoint test with synthetic image
    print("\n[4/4] Testing POST /api/analyze with synthetic image...")
    # Create test image in memory
    img_byte_arr = io.BytesIO()
    test_img = Image.new("RGB", (256, 256), color=(70, 70, 80))
    test_img.save(img_byte_arr, format="JPEG")
    img_bytes = img_byte_arr.getvalue()

    files = {"file": ("test_mri_scan.jpg", img_bytes, "image/jpeg")}
    data = {"model_name": "both", "generate_cam": "true"}

    resp = client.post("/api/analyze", files=files, data=data)
    print(f"  -> Status Code: {resp.status_code}")
    assert resp.status_code == 200, f"Analyze failed: {resp.text}"
    result = resp.json()

    assert result["success"] is True
    assert "resnet50" in result["results"]
    assert "vgg16" in result["results"]

    for m_id in ["resnet50", "vgg16"]:
        m_res = result["results"][m_id]
        print(f"  -> {m_res['display_name']} Prediction: {m_res['predicted_class']} (conf: {m_res['confidence']})")
        print(f"  -> {m_res['display_name']} Execution Time: {m_res['execution_time_ms']} ms")
        assert m_res["predicted_class"] in ["glioma", "meningioma", "notumor", "pituitary"]
        assert len(m_res["probabilities"]) == 4
        assert m_res["gradcam"] is not None
        assert m_res["gradcam"]["overlay_base64"].startswith("data:image/png;base64,")

    print(f"  -> Image Metadata: {result['image_metadata']}")
    print(f"  -> Disclaimer: {result['disclaimer']}")
    print("  -> Analyze Endpoint: PASSED")

    print("\n" + "=" * 60)
    print("ALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)

