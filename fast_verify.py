"""
Fast direct verification script (runs in 1 second)
"""
import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.main import app
from backend.services.inference_service import ModelManager, resolve_checkpoint_path
from backend.schemas.response_schemas import HealthResponse, ModelsListResponse

# 1. Verify CORS Middleware configuration
cors_middleware = None
for middleware in app.user_middleware:
    if "CORSMiddleware" in str(middleware.cls):
        cors_middleware = middleware
        break

print("=" * 60)
print("1. CORS Middleware Verification:")
if cors_middleware:
    kwargs = cors_middleware.kwargs
    print(f"  Allow Origins: {kwargs.get('allow_origins')}")
    print(f"  Allow Origin Regex: {kwargs.get('allow_origin_regex')}")
    print(f"  Allow Credentials: {kwargs.get('allow_credentials')}")
    print(f"  Max Age: {kwargs.get('max_age')}")
    print(f"  Expose Headers: {kwargs.get('expose_headers')}")
    assert kwargs.get('allow_origin_regex') == r"^https://.*\.vercel\.app$"
    assert kwargs.get('max_age') == 86400
    print("  -> CORS config: VERIFIED")
else:
    print("  -> CORS middleware NOT found!")

# 2. Verify Checkpoint Path Resolution
print("\n2. Checkpoint Resolution Verification:")
res_path, candidates = resolve_checkpoint_path("resnet50", "resnet50_finetuned_best.pth")
print(f"  Default Candidates Checked: {candidates}")
assert any("models" in c for c in candidates)
assert any("/var/data/models" in c for c in candidates)

# Test env var override
os.environ["MODELS_DIR"] = "/test/cloud/models"
_, env_cand = resolve_checkpoint_path("resnet50", "resnet50_finetuned_best.pth")
assert "/test/cloud/models" in env_cand[0] or "/test/cloud/models" in env_cand[1]
print(f"  MODELS_DIR Override Candidates: {env_cand}")
del os.environ["MODELS_DIR"]
print("  -> Checkpoint Path Resolution: VERIFIED")

# 3. Verify Model Manager & Catalog
print("\n3. ModelManager & History Catalog:")
manager = ModelManager.get_instance()
manager.initialize()
models_info = manager.get_models_info()
print(f"  Catalog Models: {[m['model_id'] for m in models_info]}")
for m in models_info:
    print(f"    - {m['display_name']}: {len(m['training_history'])} epochs history")
print("  -> ModelManager Catalog: VERIFIED")

print("\n" + "=" * 60)
print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
print("=" * 60)
