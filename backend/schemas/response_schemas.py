from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    timestamp: str
    device: str
    models_loaded: Dict[str, bool]
    version: str = "1.0.0"


class EpochMetric(BaseModel):
    epoch: int
    train_loss: float
    train_accuracy: float
    val_loss: float
    val_accuracy: float
    val_macro_f1: float


class ModelInfo(BaseModel):
    model_id: str
    display_name: str
    architecture: str
    best_epoch: int
    val_macro_f1: float
    val_accuracy: float
    val_loss: float
    input_resolution: List[int]
    class_labels: List[str]
    training_history: List[EpochMetric]


class ModelsListResponse(BaseModel):
    models: List[ModelInfo]
    class_labels: List[str]
    disclaimer: str


class GradCAMVisualization(BaseModel):
    overlay_base64: str
    heatmap_base64: str
    original_base64: str
    target_class_idx: int
    target_class_name: str
    disclaimer: str


class SingleModelInference(BaseModel):
    model_id: str
    display_name: str
    predicted_class: str
    confidence: float
    probabilities: Dict[str, float]
    gradcam: Optional[GradCAMVisualization] = None
    execution_time_ms: float


class ImageMetadata(BaseModel):
    filename: str
    content_type: str
    width: int
    height: int
    channels: int
    size_bytes: int


class AnalysisResponse(BaseModel):
    success: bool
    timestamp: str
    image_metadata: ImageMetadata
    results: Dict[str, SingleModelInference]
    disclaimer: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None
    timestamp: str

