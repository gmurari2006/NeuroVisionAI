"""
NeuroVisionAI - Cloud Deployment, CORS & API Contract Verification Suite
Zero-dependency ASGI Test Runner
Tests:
1. CORS functionality for Vercel production domains, dynamic preview regex, and local dev.
2. Checkpoint path resolution and cloud environment variable robustness.
3. API contract alignment between FastAPI responses and Next.js frontend requirements.
"""

import os
import sys
import json
import asyncio
from typing import Dict, Any, Tuple

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.main import app
from backend.services.inference_service import ModelManager, resolve_checkpoint_path
from backend.schemas.response_schemas import HealthResponse, ModelsListResponse, AnalysisResponse


async def asgi_request(
    app,
    method: str,
    path: str,
    headers: Dict[str, str] = None,
    body: bytes = b""
) -> Tuple[int, Dict[str, str], bytes]:
    """Execute ASGI request against the FastAPI application without third-party test clients."""
    headers_list = [(k.lower().encode("latin1"), v.encode("latin1")) for k, v in (headers or {}).items()]
    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": method.upper(),
        "scheme": "http",
        "path": path,
        "raw_path": path.encode("ascii"),
        "query_string": b"",
        "headers": headers_list,
        "client": ("127.0.0.1", 12345),
        "server": ("127.0.0.1", 80),
    }
    response_headers = {}
    response_body = bytearray()
    status_code = [None]

    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}

    async def send(message):
        if message["type"] == "http.response.start":
            status_code[0] = message["status"]
            for k, v in message.get("headers", []):
                response_headers[k.decode("latin1").lower()] = v.decode("latin1")
        elif message["type"] == "http.response.body":
            response_body.extend(message.get("body", b""))

    await app(scope, receive, send)
    return status_code[0], response_headers, bytes(response_body)


async def test_cors_integration():
    print("\n" + "=" * 65)
    print("TEST 1: CORS Configuration for External Production Domains")
    print("=" * 65)

    origins_to_test = [
        ("https://neurovision-ai.vercel.app", True, "Vercel Production Domain"),
        ("https://neurovision-ai-git-preview-branch.vercel.app", True, "Vercel Dynamic PR / Preview Domain"),
        ("https://neurovision-preview-789.vercel.app", True, "Vercel Generic Preview Domain"),
        ("http://localhost:3000", True, "Local Next.js Dev Server (Port 3000)"),
        ("http://127.0.0.1:3001", True, "Local Next.js Dev Server (Port 3001)"),
        ("https://unauthorized-malicious-site.com", False, "Untrusted External Domain (Expected Reject)")
    ]

    for origin, should_allow, description in origins_to_test:
        headers = {
            "origin": origin,
            "access-control-request-method": "POST",
            "access-control-request-headers": "content-type"
        }
        status, res_headers, _ = await asgi_request(app, "OPTIONS", "/api/analyze", headers=headers)
        allow_origin = res_headers.get("access-control-allow-origin")

        if should_allow:
            assert allow_origin == origin, f"CORS failed for {description} ({origin}). Got: {allow_origin}"
            assert "POST" in res_headers.get("access-control-allow-methods", ""), f"POST method not allowed for {origin}"
            assert res_headers.get("access-control-max-age") == "86400", "Preflight caching header missing or incorrect"
            print(f"  [PASS] {description}: Origin '{origin}' allowed with preflight max-age 86400")
        else:
            assert allow_origin is None or allow_origin != origin, f"Security issue: Untrusted origin {origin} was accepted!"
            print(f"  [PASS] {description}: Correctly rejected")

    print("CORS verification completed successfully.")


def test_checkpoint_path_resolution():
    print("\n" + "=" * 65)
    print("TEST 2: Model Checkpoint Path Resolution & Cloud Environment Variables")
    print("=" * 65)

    # 1. Test default search candidates
    res_path, res_candidates = resolve_checkpoint_path("resnet50", "resnet50_finetuned_best.pth")
    print(f"Default ResNet-50 search candidates ({len(res_candidates)} paths):")
    for c in res_candidates:
        print(f"  - {c}")
    assert any("models" in c for c in res_candidates), "Candidate paths must include default models directory"
    assert any("/var/data/models" in c for c in res_candidates), "Candidate paths must include Render persistent disk mount"

    # 2. Test MODELS_DIR environment variable override
    test_models_dir = os.path.join(PROJECT_ROOT, "custom_cloud_models")
    os.environ["MODELS_DIR"] = test_models_dir
    _, env_candidates = resolve_checkpoint_path("resnet50", "resnet50_finetuned_best.pth")
    assert any("custom_cloud_models" in c for c in env_candidates), "MODELS_DIR override not reflected in candidates"
    print(f"  [PASS] MODELS_DIR environment variable correctly prioritized: {test_models_dir}")
    del os.environ["MODELS_DIR"]

    # 3. Test direct RESNET_MODEL_PATH override
    test_direct_path = "/var/custom/resnet50.pth"
    os.environ["RESNET_MODEL_PATH"] = test_direct_path
    _, direct_candidates = resolve_checkpoint_path("resnet50", "resnet50_finetuned_best.pth")
    assert direct_candidates[0] == test_direct_path, "RESNET_MODEL_PATH must be first candidate"
    print(f"  [PASS] RESNET_MODEL_PATH environment variable correctly prioritized: {test_direct_path}")
    del os.environ["RESNET_MODEL_PATH"]

    print("Path resolution verification completed successfully.")


async def test_api_contracts():
    print("\n" + "=" * 65)
    print("TEST 3: API Contracts & Frontend Compatibility")
    print("=" * 65)

    # 1. Health check contract
    status_health, _, body_health = await asgi_request(app, "GET", "/api/health")
    assert status_health == 200, f"Expected 200 from /api/health, got {status_health}"
    health_data = json.loads(body_health.decode("utf-8"))
    print("Health payload:", json.dumps(health_data, indent=2))
    # Validate against HealthResponse Pydantic schema
    validated_health = HealthResponse(**health_data)
    assert validated_health.status in ["healthy", "degraded", "initializing"]
    assert "resnet50" in validated_health.models_loaded
    assert "vgg16" in validated_health.models_loaded
    print("  [PASS] /api/health satisfies HealthStatus contract")

    # 2. Models list contract
    status_models, _, body_models = await asgi_request(app, "GET", "/api/models")
    assert status_models == 200, f"Expected 200 from /api/models, got {status_models}"
    models_data = json.loads(body_models.decode("utf-8"))
    # Validate against ModelsListResponse Pydantic schema
    validated_models = ModelsListResponse(**models_data)
    assert len(validated_models.models) == 2, f"Expected 2 models in catalog, got {len(validated_models.models)}"
    assert validated_models.class_labels == ["glioma", "meningioma", "notumor", "pituitary"]
    for m in validated_models.models:
        assert m.best_epoch > 0
        assert len(m.training_history) > 0, f"Model {m.model_id} must have training history"
    print("  [PASS] /api/models satisfies ModelsResponse contract with complete training history")

    # 3. Analyze validation contract
    # Test invalid extension with multipart form data
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body_parts = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="test.txt"\r\n'
        f"Content-Type: text/plain\r\n\r\n"
        f"dummy content\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="model_name"\r\n\r\n'
        f"both\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")
    headers = {"content-type": f"multipart/form-data; boundary={boundary}"}

    status_bad, _, body_bad = await asgi_request(app, "POST", "/api/analyze", headers=headers, body=body_parts)
    assert status_bad == 400, f"Expected 400 for bad extension, got {status_bad}"
    bad_json = json.loads(body_bad.decode("utf-8"))
    assert "detail" in bad_json
    print(f"  [PASS] /api/analyze invalid file rejected cleanly with: {bad_json['detail']}")

    print("API contract verification completed successfully.")


async def main():
    await test_cors_integration()
    test_checkpoint_path_resolution()
    await test_api_contracts()
    print("\n" + "=" * 65)
    print("ALL FULL-STACK ARCHITECTURE INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)


if __name__ == "__main__":
    asyncio.run(main())
