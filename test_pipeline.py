"""
Test analyze pipeline via both FastAPI direct (8000) and Next.js proxy (3000)
using a REAL brain MRI scan from samples/glioma_sample.jpg.
"""

import os
import sys
import requests

def test_pipeline():
    sample_path = os.path.join(os.path.dirname(__file__), "samples", "glioma_sample.jpg")
    if not os.path.exists(sample_path):
        print(f"ERROR: Sample file not found at {sample_path}")
        sys.exit(1)

    with open(sample_path, "rb") as f:
        img_bytes = f.read()

    print(f"Loaded real MRI sample: {sample_path} ({len(img_bytes)} bytes)")

    # 1. Test FastAPI directly (http://127.0.0.1:8000/api/analyze)
    print("\n--- Test 1: FastAPI Direct (http://127.0.0.1:8000/api/analyze) ---")
    try:
        files = {"file": ("glioma_sample.jpg", img_bytes, "image/jpeg")}
        data = {"model_name": "both", "generate_cam": "true"}
        resp = requests.post("http://127.0.0.1:8000/api/analyze", files=files, data=data, timeout=30)
        print(f"HTTP Status: {resp.status_code}")
        if resp.status_code == 200:
            res_json = resp.json()
            print("Success:", res_json.get("success"))
            print("Models evaluated:", list(res_json.get("results", {}).keys()))
            for m_id, m in res_json.get("results", {}).items():
                print(f"  [{m_id}] Prediction: {m.get('predicted_class')}, Confidence: {m.get('confidence')*100:.2f}%, Latency: {m.get('execution_time_ms')}ms")
                has_cam = bool(m.get("gradcam", {}).get("overlay_base64"))
                print(f"  [{m_id}] Has Grad-CAM Overlay: {has_cam}")
        else:
            print("Error response:", resp.text)
    except Exception as e:
        print("FastAPI direct request failed:", e)

    # 2. Test Next.js Proxy (http://localhost:3000/api/analyze)
    print("\n--- Test 2: Next.js Proxy (http://localhost:3000/api/analyze) ---")
    try:
        files = {"file": ("glioma_sample.jpg", img_bytes, "image/jpeg")}
        data = {"model_name": "both", "generate_cam": "true"}
        resp2 = requests.post("http://localhost:3000/api/analyze", files=files, data=data, timeout=30)
        print(f"HTTP Status: {resp2.status_code}")
        if resp2.status_code == 200:
            res_json2 = resp2.json()
            print("Success:", res_json2.get("success"))
            print("Models evaluated:", list(res_json2.get("results", {}).keys()))
            for m_id, m in res_json2.get("results", {}).items():
                print(f"  [{m_id}] Prediction: {m.get('predicted_class')}, Confidence: {m.get('confidence')*100:.2f}%, Latency: {m.get('execution_time_ms')}ms")
                has_cam = bool(m.get("gradcam", {}).get("overlay_base64"))
                print(f"  [{m_id}] Has Grad-CAM Overlay: {has_cam}")
        else:
            print("Error response:", resp2.text)
    except Exception as e:
        print("Next.js proxy request failed:", e)

if __name__ == "__main__":
    test_pipeline()
