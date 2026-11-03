"""
NeuroVisionAI - API Routes
Endpoints:
- GET  /api/health
- GET  /api/models
- POST /api/analyze
"""

import os
from datetime import datetime, timezone
import logging
from typing import Optional

from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool

from backend.schemas.response_schemas import (
    HealthResponse,
    ModelsListResponse,
    AnalysisResponse,
    ErrorResponse
)
from backend.services.inference_service import ModelManager, RESEARCH_DISCLAIMER
from model_loader import CLASS_NAMES

logger = logging.getLogger("NeuroVisionAI.Routes")

router = APIRouter(prefix="/api", tags=["NeuroVisionAI"])

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/jpg"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check verifying model loading status and hardware device."""
    manager = ModelManager.get_instance()
    return HealthResponse(
        status="healthy" if manager.is_loaded else "initializing",
        timestamp=datetime.now(timezone.utc).isoformat(),
        device=str(manager.device),
        models_loaded={
            "resnet50": "resnet50" in manager.models,
            "vgg16": "vgg16" in manager.models
        },
        version="1.0.0"
    )


@router.get("/models", response_model=ModelsListResponse)
async def list_models():
    """Returns metadata and verified validation history for both models."""
    manager = ModelManager.get_instance()
    if not manager.is_loaded:
        manager.initialize()

    models_info = manager.get_models_info()
    return ModelsListResponse(
        models=models_info,
        class_labels=CLASS_NAMES,
        disclaimer=RESEARCH_DISCLAIMER
    )


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_mri(
    file: UploadFile = File(..., description="Brain MRI image (PNG, JPG, JPEG)"),
    model_name: str = Form("both", description="Model identifier: 'resnet50', 'vgg16', or 'both'"),
    generate_cam: bool = Form(True, description="Whether to generate Grad-CAM activation heatmaps")
):
    """
    Analyzes an uploaded MRI scan using selected deep learning model(s).
    Optionally computes Grad-CAM explainability heatmaps.
    Uploaded image bytes are processed strictly in-memory and discarded.
    """
    # 1. Validate file extension
    filename = file.filename or "upload.jpg"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Only PNG, JPG, and JPEG images are supported."
        )

    # 2. Read file contents and check size limit
    try:
        content = await file.read()
    except Exception as read_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error reading uploaded file: {str(read_err)}"
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)."
        )

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Uploaded file exceeds maximum allowed size of 15MB (got {len(content) / (1024*1024):.1f}MB)."
        )

    # 3. Execute analysis
    manager = ModelManager.get_instance()
    try:
        response_dict = await run_in_threadpool(
            manager.analyze,
            image_bytes=content,
            filename=filename,
            content_type=file.content_type or "image/jpeg",
            selected_model=model_name.lower(),
            generate_cam=generate_cam
        )
        return response_dict
    except ValueError as val_err:
        logger.warning(f"Validation error during MRI analysis: {val_err}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as exec_err:
        logger.error(f"Inference error during MRI analysis: {exec_err}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal inference failure: {str(exec_err)}"
        )

