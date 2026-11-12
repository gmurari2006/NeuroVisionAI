import { HealthStatus, ModelsResponse, AnalysisResponse } from "./types";

/**
 * Resolves the base URL for API requests.
 * - In browser context: defaults to "" so requests use the same-origin Next.js rewrite proxy (/api/...)
 *   which forwards to BACKEND_INTERNAL_URL without exposing private URLs or triggering CORS preflights.
 * - If NEXT_PUBLIC_API_URL is explicitly set, direct calls to that URL are used instead.
 * - In server-side Node context (SSR / scripts): falls back to BACKEND_INTERNAL_URL or localhost.
 */
function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    // Client-side: use relative path through Next.js rewrite proxy
    return "";
  }
  // Server-side / Node.js runtime: use internal backend URL or local fallback
  return (process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
}

export async function fetchHealth(): Promise<HealthStatus> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
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
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/models`, { cache: "no-store" });
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
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model_name", modelName);
  formData.append("generate_cam", String(generateCam));

  const res = await fetch(`${baseUrl}/api/analyze`, {
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
