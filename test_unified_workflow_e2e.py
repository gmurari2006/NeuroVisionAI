import requests
import json
import os
import subprocess
import sys

BASE_URL = "http://127.0.0.1:3000"

def test_unified_workflow():
    print("==================================================")
    print("TESTING UNIFIED MRI ANALYSIS WORKFLOW (END-TO-END)")
    print("==================================================")

    test_scans = [
        ("samples/glioma_sample.jpg", "both"),
        ("samples/meningioma_sample.jpg", "resnet50"),
        ("samples/pituitary_sample.jpg", "vgg16"),
    ]

    all_passed = True

    for scan_path, model_choice in test_scans:
        print(f"\n--- Testing Scan: {scan_path} | Model: {model_choice} ---")
        if not os.path.exists(scan_path):
            print(f"File not found: {scan_path}")
            all_passed = False
            continue

        with open(scan_path, "rb") as f:
            files = {"file": (os.path.basename(scan_path), f, "image/jpeg")}
            data = {"model_name": model_choice, "generate_cam": "true"}
            r = requests.post(f"{BASE_URL}/api/analyze", files=files, data=data, timeout=35)

        if r.status_code != 200:
            print(f"FAILED with HTTP {r.status_code}: {r.text[:200]}")
            all_passed = False
            continue

        resp = r.json()
        print(f"Inference Success! Timestamp: {resp.get('timestamp')}")
        meta = resp.get("image_metadata", {})
        print(f"Image Dimensions: {meta.get('width')}x{meta.get('height')} px, {meta.get('size_bytes')} bytes")

        results = resp.get("results", {})
        if model_choice in ("both", "resnet50"):
            res = results.get("resnet50")
            if res:
                print(f"ResNet-50: Class={res['predicted_class']}, Conf={res['confidence']:.3f}, Latency={res['execution_time_ms']} ms")
                assert res.get("gradcam", {}).get("overlay_base64"), "Missing ResNet-50 Grad-CAM"
            else:
                print("Missing ResNet-50 result!")
                all_passed = False

        if model_choice in ("both", "vgg16"):
            vgg = results.get("vgg16")
            if vgg:
                print(f"VGG-16: Class={vgg['predicted_class']}, Conf={vgg['confidence']:.3f}, Latency={vgg['execution_time_ms']} ms")
                assert vgg.get("gradcam", {}).get("overlay_base64"), "Missing VGG-16 Grad-CAM"
            else:
                print("Missing VGG-16 result!")
                all_passed = False

        # Save sample output for PDF verification
        if model_choice == "both":
            with open("evaluation/sample_inference_result.json", "w") as out_f:
                json.dump(resp, out_f, indent=2)

    # Test PDF generation on the latest "both" inference
    print("\n--- Verifying PDF Report Generation ---")
    node_res = subprocess.run(["node", "generate_actual_pdf.mjs"], capture_output=True, text=True)
    print(node_res.stdout)
    if node_res.returncode != 0:
        print(f"PDF generation failed: {node_res.stderr}")
        all_passed = False
    else:
        print("PDF generated successfully.")

    # Inspect PDF pages with PyMuPDF
    print("\n--- Inspecting Rendered PDF Pages ---")
    inspect_res = subprocess.run([".\\.venv\\Scripts\\python.exe", "render_pdf_pages.py"], capture_output=True, text=True)
    if inspect_res.returncode != 0:
        print(f"PDF inspection failed: {inspect_res.stderr}")
        all_passed = False
    else:
        print("PDF 2-page render and inspection verified successfully.")

    print("\n==================================================")
    print(f"OVERALL RESULT: {'ALL PASS' if all_passed else 'SOME TESTS FAILED'}")
    print("==================================================")
    return all_passed

if __name__ == "__main__":
    success = test_unified_workflow()
    sys.exit(0 if success else 1)
