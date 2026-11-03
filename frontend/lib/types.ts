export interface HealthStatus {
  status: string;
  timestamp: string;
  device: string;
  models_loaded: {
    resnet50: boolean;
    vgg16: boolean;
  };
  version: string;
}

export interface EpochMetric {
  epoch: number;
  train_loss: number;
  train_accuracy: number;
  val_loss: number;
  val_accuracy: number;
  val_macro_f1: number;
}

export interface ModelMetadata {
  model_id: string;
  display_name: string;
  architecture: string;
  best_epoch: number;
  val_macro_f1: number;
  val_accuracy: number;
  val_loss: number;
  input_resolution: [number, number];
  class_labels: string[];
  training_history: EpochMetric[];
}

export interface ModelsResponse {
  models: ModelMetadata[];
  class_labels: string[];
  disclaimer: string;
}

export interface GradCAMData {
  overlay_base64: string;
  heatmap_base64: string;
  original_base64: string;
  target_class_idx: number;
  target_class_name: string;
  disclaimer: string;
}

export interface SingleModelResult {
  model_id: string;
  display_name: string;
  predicted_class: "glioma" | "meningioma" | "notumor" | "pituitary" | string;
  confidence: number;
  probabilities: Record<string, number>;
  gradcam?: GradCAMData | null;
  execution_time_ms: number;
}

export interface ImageMetadata {
  filename: string;
  content_type: string;
  width: number;
  height: number;
  channels: number;
  size_bytes: number;
}

export interface AnalysisResponse {
  success: boolean;
  timestamp: string;
  image_metadata: ImageMetadata;
  results: Record<string, SingleModelResult>;
  disclaimer: string;
}

