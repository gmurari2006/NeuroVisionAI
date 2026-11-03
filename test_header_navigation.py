import requests
import re
import sys

BASE_URL = "http://127.0.0.1:3000"

def test_header_and_navigation():
    print("==================================================")
    print("TESTING HEADER NAVIGATION UPDATE")
    print("==================================================")
    
    passed = True
    
    # 1. Fetch Homepage
    r = requests.get(f"{BASE_URL}/", timeout=10)
    if r.status_code != 200:
        print(f"FAILED to fetch homepage: status {r.status_code}")
        return False
    
    html = r.text
    
    # Extract header element
    header_match = re.search(r"<header.*?</header>", html, re.DOTALL)
    if not header_match:
        print("WARNING: Could not isolate <header> tag in SSR output, analyzing full page.")
        header_text = html
    else:
        header_text = header_match.group(0)
    
    print("\n--- 1. Checking Preserved Navigation Elements in Header ---")
    kept_elements = [
        ("Home / MRI Analysis", "Home / MRI Analysis" in header_text),
        ("History", "History" in header_text),
        ("About", "About" in header_text),
        ("NeuroVisionAI Logo/Brand", "NeuroVisionAI" in header_text),
    ]
    
    for label, ok in kept_elements:
        status = "PASS" if ok else "FAIL"
        print(f" - {label}: {status}")
        if not ok:
            passed = False

    print("\n--- 2. Confirming Removed Navigation Links are ABSENT in Header ---")
    removed_elements = [
        ("Model Comparison", "Model Comparison" in header_text),
        ("Methodology", "Methodology" in header_text),
    ]
    
    for label, present in removed_elements:
        # We want present to be False!
        ok = not present
        status = "PASS (Absent)" if ok else "FAIL (Still present!)"
        print(f" - {label} removed from header: {status}")
        if not ok:
            passed = False

    print("\n--- 3. Verifying Routes Still Exist & Respond with HTTP 200 ---")
    routes_to_test = [
        ("/", "Home / MRI Analysis"),
        ("/history", "History"),
        ("/about", "About"),
        ("/models", "Model Comparison (Preserved Route)"),
        ("/methodology", "Methodology (Preserved Route)"),
    ]
    
    for route, desc in routes_to_test:
        resp = requests.get(f"{BASE_URL}{route}", timeout=10)
        ok = resp.status_code == 200
        print(f" - Route {route} ({desc}): {'PASS (200 OK)' if ok else f'FAIL (HTTP {resp.status_code})'}")
        if not ok:
            passed = False

    print("\n--- 4. Verifying Backend Health via Proxy ---")
    health_resp = requests.get(f"{BASE_URL}/api/health", timeout=10)
    health_data = health_resp.json()
    ok = health_resp.status_code == 200 and health_data.get("status") == "healthy"
    print(f" - Backend Health: {'PASS (Healthy)' if ok else 'FAIL'}")
    if not ok:
        passed = False

    print("\n==================================================")
    print(f"TEST RESULT: {'ALL PASS' if passed else 'FAILURES DETECTED'}")
    print("==================================================")
    return passed

if __name__ == "__main__":
    success = test_header_and_navigation()
    sys.exit(0 if success else 1)
