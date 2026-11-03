import { HealthStatus, ModelsResponse, AnalysisResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    return {
      status: "unreachable",
      timestamp: new Date().toISOString(),
      device: "unknown",
      models_loaded: { resnet50: false, vgg16: false },
      version: "1.0.0",
    };
  }
}

export async function fetchModels(): Promise<ModelsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/models`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch models: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function analyzeMRI(
  file: File,
  modelName: "resnet50" | "vgg16" | "both" = "both",
  generateCam: boolean = true
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model_name", modelName);
  formData.append("generate_cam", String(generateCam));

  const res = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = "Inference request failed";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.error || errorDetail;
    } catch {
      errorDetail = `HTTP Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return await res.json();
}

