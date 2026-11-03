"""
NeuroVisionAI - FastAPI Main Application
Platform backend providing inference and explainability services for brain MRI analysis.
"""

import os
import sys
from contextlib import asynccontextmanager
import logging
from datetime import datetime, timezone

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.services.inference_service import ModelManager, RESEARCH_DISCLAIMER
from backend.api.routes import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("NeuroVisionAI.Application")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan Context Manager.
    Pre-loads ResNet-50 and VGG-16 models into memory once at startup
    so checkpoints are never re-read on every request.
    """
    logger.info("Initializing NeuroVisionAI backend services...")
    manager = ModelManager.get_instance()
    try:
        manager.initialize()
        logger.info("NeuroVisionAI models loaded successfully at application startup.")
    except Exception as err:
        logger.error(f"Startup model initialization failed: {err}")
        # Allow startup to continue so healthcheck can report the error cleanly
    yield
    logger.info("Shutting down NeuroVisionAI backend services.")


app = FastAPI(
    title="NeuroVisionAI Backend API",
    description="Explainable Brain MRI Classification Research Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local Next.js frontend development
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "name": "NeuroVisionAI Backend API",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs",
        "disclaimer": RESEARCH_DISCLAIMER
    }


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation Error",
            "detail": exc.errors(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal Server Error",
            "detail": str(exc),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)

