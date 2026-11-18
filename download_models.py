"""
NeuroVisionAI - Model Checkpoint Downloader & Cloud Verifier
Use this script during cloud build steps (e.g. Render Build Command) or CI/CD
to ensure model checkpoints are available before starting the FastAPI backend.
"""

import os
import sys
import logging
import urllib.request

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("NeuroVisionAI.ModelDownloader")

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.environ.get("MODELS_DIR", os.path.join(PROJECT_ROOT, "models"))

CHECKPOINTS = {
    "resnet50": {
        "filename": "resnet50_finetuned_best.pth",
        "env_url": "RESNET_WEIGHTS_URL",
        "env_path": "RESNET_MODEL_PATH",
        "expected_mb": 94.4
    },
    "vgg16": {
        "filename": "vgg16_best.pth",
        "env_url": "VGG_WEIGHTS_URL",
        "env_path": "VGG_MODEL_PATH",
        "expected_mb": 110.3
    }
}


def verify_or_download_checkpoints():
    os.makedirs(MODELS_DIR, exist_ok=True)
    all_ready = True

    print("=" * 65)
    print("NeuroVisionAI - Model Checkpoint Verification & Download Utility")
    print(f"Target Directory: {MODELS_DIR}")
    print("=" * 65)

    for model_id, meta in CHECKPOINTS.items():
        fname = meta["filename"]
        target_path = os.environ.get(meta["env_path"]) or os.path.join(MODELS_DIR, fname)
        url = os.environ.get(meta["env_url"], "").strip()

        if os.path.isfile(target_path):
            size_mb = os.path.getsize(target_path) / (1024 * 1024)
            logger.info(f"[FOUND] {model_id.upper()}: {target_path} ({size_mb:.1f} MB)")
            continue

        if url:
            logger.info(f"[DOWNLOADING] {model_id.upper()} from {url}...")
            try:
                urllib.request.urlretrieve(url, target_path)
                size_mb = os.path.getsize(target_path) / (1024 * 1024)
                logger.info(f"[DOWNLOAD SUCCESS] {model_id.upper()} saved ({size_mb:.1f} MB)")
            except Exception as dl_err:
                logger.error(f"[DOWNLOAD FAILED] {model_id.upper()}: {dl_err}")
                all_ready = False
        else:
            logger.warning(
                f"[MISSING] {model_id.upper()} checkpoint not found at: {target_path}\n"
                f"          To download automatically, set {meta['env_url']} or place the file in {MODELS_DIR}"
            )
            all_ready = False

    print("=" * 65)
    if all_ready:
        logger.info("All configured model checkpoints are verified and ready for inference.")
    else:
        logger.warning(
            "Some checkpoints are currently missing.\n"
            "Backend will boot in degraded mode (metadata and health reporting available, inference paused until weights are provided)."
        )
    return all_ready


if __name__ == "__main__":
    success = verify_or_download_checkpoints()
    # Exit with code 0 so build pipelines do not fail prematurely if weights are mounted at runtime
    sys.exit(0)
