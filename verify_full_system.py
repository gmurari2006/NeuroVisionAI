import requests
import json
import os
import sys

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

def get_frontend_url():
    # Probe configured/standard ports to find where NeuroVisionAI is listening
    candidates = [os.environ.get("FRONTEND_URL"), os.environ.get("PORT"), "3001", "3000"]
    for c in candidates:
        if not c:
            continue
        url = c if c.startswith("http") else f"http://127.0.0.1:{c}"
        try:
            r = requests.get(f"{url}/api/health", timeout=5)
            if r.status_code == 200 and r.json().get("status") == "healthy":
                return url
        except Exception:
            continue
    return "http://127.0.0.1:3000"

BASE_URL = get_frontend_url()
BACKEND_URL = os.environ.get("BACKEND_URL", "http://127.0.0.1:8000")

def test_endpoints():
    results = {}
    print("==================================================")
    print("NEUROVISION AI - FULL SYSTEM VERIFICATION SUITE")
    print(f"Targeting Frontend: {BASE_URL}")
    print(f"Targeting Backend:  {BACKEND_URL}")
    print("==================================================")

    # 1. Frontend Homepage (now primary MRI Analysis experience)
    try:
        r = requests.get(f"{BASE_URL}/", timeout=30)
        status = r.status_code == 200 and "NeuroVisionAI" in r.text and "Brain MRI Analysis" in r.text
        results["Homepage (/) Primary Workflow"] = "PASS" if status else f"FAIL (status={r.status_code})"
        print(f"1. Homepage (/) Primary Workflow: {results['Homepage (/) Primary Workflow']}")
    except Exception as e:
        results["Homepage (/) Primary Workflow"] = f"FAIL ({e})"
        print(f"1. Homepage (/) Primary Workflow: FAIL ({e})")

    # 2. Model Comparison Page
    try:
        r = requests.get(f"{BASE_URL}/models", timeout=30)
        has_metrics = "91.06" in r.text and "91.63" in r.text and "1,600" in r.text
        status = r.status_code == 200 and has_metrics
        results["Model Comparison (/models)"] = "PASS" if status else f"FAIL (status={r.status_code}, has_metrics={has_metrics})"
        print(f"2. Model Comparison (/models): {results['Model Comparison (/models)']}")
    except Exception as e:
        results["Model Comparison (/models)"] = f"FAIL ({e})"
        print(f"2. Model Comparison (/models): FAIL ({e})")

    # 3. Methodology Page
    try:
        r = requests.get(f"{BASE_URL}/methodology", timeout=30)
        has_methodology = "7,200" in r.text and "0.00%" in r.text and "Patient-Level Independence" in r.text
        status = r.status_code == 200 and has_methodology
        results["Methodology (/methodology)"] = "PASS" if status else f"FAIL (status={r.status_code}, has_methodology={has_methodology})"
        print(f"3. Methodology (/methodology): {results['Methodology (/methodology)']}")
    except Exception as e:
        results["Methodology (/methodology)"] = f"FAIL ({e})"
        print(f"3. Methodology (/methodology): FAIL ({e})")

    # 4. Analysis Page (Unified Workflow Route)
    try:
        r = requests.get(f"{BASE_URL}/analysis", timeout=30)
        has_analysis = "Brain MRI" in r.text and ("Analysis" in r.text or "Analyse" in r.text)
        status = r.status_code == 200 and has_analysis
        results["Analysis Page (/analysis)"] = "PASS" if status else f"FAIL (status={r.status_code})"
        print(f"4. Analysis Page (/analysis): {results['Analysis Page (/analysis)']}")
    except Exception as e:
        results["Analysis Page (/analysis)"] = f"FAIL ({e})"
        print(f"4. Analysis Page (/analysis): FAIL ({e})")

    # 5. About Page
    try:
        r = requests.get(f"{BASE_URL}/about", timeout=30)
        status = r.status_code == 200 and "About NeuroVisionAI" in r.text
        results["About Page (/about)"] = "PASS" if status else f"FAIL (status={r.status_code})"
        print(f"5. About Page (/about): {results['About Page (/about)']}")
    except Exception as e:
        results["About Page (/about)"] = f"FAIL ({e})"
        print(f"5. About Page (/about): FAIL ({e})")

    # 6. Proxy /api/health
    try:
        r = requests.get(f"{BASE_URL}/api/health", timeout=30)
        data = r.json()
        status = r.status_code == 200 and data.get("status") == "healthy"
        results["Next.js Proxy /api/health"] = "PASS" if status else f"FAIL (status={r.status_code}, data={data})"
        print(f"6. Next.js Proxy /api/health: {results['Next.js Proxy /api/health']}")
    except Exception as e:
        results["Next.js Proxy /api/health"] = f"FAIL ({e})"
        print(f"6. Next.js Proxy /api/health: FAIL ({e})")

    # 7. Proxy /api/models
    try:
        r = requests.get(f"{BASE_URL}/api/models", timeout=30)
        data = r.json()
        models = [m.get("model_id") for m in data.get("models", [])]
        status = r.status_code == 200 and "resnet50" in models and "vgg16" in models
        results["Next.js Proxy /api/models"] = "PASS" if status else f"FAIL (status={r.status_code}, models={models})"
        print(f"7. Next.js Proxy /api/models: {results['Next.js Proxy /api/models']}")
    except Exception as e:
        results["Next.js Proxy /api/models"] = f"FAIL ({e})"
        print(f"7. Next.js Proxy /api/models: FAIL ({e})")

    # 8. Full MRI Analysis Pipeline via Next.js Proxy
    candidate_imgs = [
        os.path.join(PROJECT_DIR, "samples", "glioma_sample.jpg"),
        os.path.join(PROJECT_DIR, "samples", "meningioma_sample.jpg"),
        r"C:\Users\tinku\Downloads\brain-tumor-mri-dataset\Testing\glioma\Te-gl_0010.jpg"
    ]
    test_img = None
    for cand in candidate_imgs:
        if os.path.exists(cand):
            test_img = cand
            break

    if not test_img:
        print("No test image found.")
        return False

    print(f"\nTesting Inference on: {test_img}")
    try:
        with open(test_img, "rb") as f:
            files = {"file": (os.path.basename(test_img), f, "image/jpeg")}
            data = {"generate_cam": "true", "model_name": "both"}
            r = requests.post(f"{BASE_URL}/api/analyze", files=files, data=data, timeout=45)
        
        if r.status_code == 200:
            analysis_data = r.json()
            res_pred = analysis_data.get("results", {}).get("resnet50", {}).get("predicted_class")
            vgg_pred = analysis_data.get("results", {}).get("vgg16", {}).get("predicted_class")
            res_cam = bool(analysis_data.get("results", {}).get("resnet50", {}).get("gradcam", {}).get("overlay_base64"))
            vgg_cam = bool(analysis_data.get("results", {}).get("vgg16", {}).get("gradcam", {}).get("overlay_base64"))
            
            out_eval = os.path.join(PROJECT_DIR, "evaluation", "sample_inference_result.json")
            os.makedirs(os.path.dirname(out_eval), exist_ok=True)
            with open(out_eval, "w") as out_f:
                json.dump(analysis_data, out_f, indent=2)
            
            status = bool(res_pred and vgg_pred and res_cam and vgg_cam)
            results["Full Analysis Pipeline (/api/analyze)"] = (
                f"PASS (ResNet={res_pred}, VGG={vgg_pred}, CAMs={res_cam and vgg_cam})" if status else "FAIL (Incomplete result)"
            )
            print(f"8. Full Analysis Pipeline: {results['Full Analysis Pipeline (/api/analyze)']}")
        else:
            results["Full Analysis Pipeline (/api/analyze)"] = f"FAIL (status={r.status_code}, text={r.text[:200]})"
            print(f"8. Full Analysis Pipeline: FAIL ({r.status_code})")
    except Exception as e:
        results["Full Analysis Pipeline (/api/analyze)"] = f"FAIL ({e})"
        print(f"8. Full Analysis Pipeline: FAIL ({e})")

    print("\n==================================================")
    print("VERIFICATION SUMMARY")
    print("==================================================")
    for k, v in results.items():
        print(f" - {k}: {v}")
    
    return all(v.startswith("PASS") for v in results.values())

if __name__ == "__main__":
    success = test_endpoints()
    sys.exit(0 if success else 1)
