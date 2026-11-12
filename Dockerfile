# ==============================================================================
# NeuroVisionAI - Production Backend Dockerfile
# Deployment Target: Google Cloud Run (Fully managed, CPU-optimized container)
# ==============================================================================

# Base image: Official Python 3.12 slim
FROM python:3.12-slim

# Prevent Python from writing .pyc files and enable unbuffered output for Cloud Run logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8080 \
    HOST=0.0.0.0

WORKDIR /app

# Install runtime OS dependencies:
# - curl: Required for Docker container health check and Cloud Run liveness probing
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Step 1: Install CPU-only PyTorch and Torchvision directly from PyTorch CPU wheel index
# CRITICAL FOR CLOUD RUN:
# Prevents pip from downloading ~3.5 GB of unnecessary NVIDIA CUDA/cuDNN binaries.
# Results in a lean, fast-pulling, memory-efficient container image (~700 MB).
RUN pip install --no-cache-dir \
    torch==2.5.1 \
    torchvision==0.20.1 \
    --index-url https://download.pytorch.org/whl/cpu

# Step 2: Install remaining backend dependencies from backend/requirements.txt
# (pip will recognize torch and torchvision as already satisfied)
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Step 3: Copy backend application code and shared modules
COPY backend /app/backend
COPY model_loader.py /app/model_loader.py
COPY gradcam.py /app/gradcam.py
COPY app.py /app/app.py

# Step 4: Copy validated training history CSVs (used by /api/models)
COPY training_history /app/training_history

# Step 5: Copy trained model checkpoints into the container image
# .dockerignore explicitly whitelists models/*.pth so they are accessible during build
COPY models/resnet50_finetuned_best.pth /app/models/resnet50_finetuned_best.pth
COPY models/vgg16_best.pth /app/models/vgg16_best.pth

# Container Healthcheck verifying the FastAPI engine and model loading status
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT}/api/health || exit 1

# Cloud Run injects the PORT environment variable (default: 8080)
EXPOSE 8080

# Execute Uvicorn binding to 0.0.0.0 and dynamic $PORT using exec form for signal forwarding
CMD exec uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}
