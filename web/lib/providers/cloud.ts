import "server-only";
import { env } from "./env";
import { httpHealth, httpPredict } from "./http";
import { ProviderError, type ModelProvider } from "./types";

/**
 * Cloud provider: hosted model service, `${CLOUD_MODEL_API_URL}/predict`
 * (Gradio/FastAPI on Hugging Face Spaces, or Roboflow's hosted API).
 * ROBOFLOW_API_KEY, if set, is added as `api_key` on the server only.
 */
export function cloudTarget() {
  if (!env.cloudModelApiUrl) {
    throw new ProviderError(
      "not_configured",
      "The cloud provider is not set up on this site yet.",
      503,
      // The setting itself (CLOUD_MODEL_API_URL) is documented in ARCHITECTURE.md section 6; a visitor only needs the way out.
      "Choose Local or Mock in Settings.",
    );
  }
  return {
    provider: "cloud" as const,
    baseUrl: env.cloudModelApiUrl,
    envName: "CLOUD_MODEL_API_URL",
    query: env.roboflowApiKey ? { api_key: env.roboflowApiKey } : undefined,
  };
}

export const cloudProvider: ModelProvider = {
  id: "cloud",
  predict: async (input) => httpPredict(cloudTarget(), input),
  health: async () => {
    try {
      return await httpHealth(cloudTarget());
    } catch (err) {
      const e = err as ProviderError;
      return { ok: false, provider: "cloud", status: e.code, latencyMs: 0, message: `${e.message} ${e.hint ?? ""}`.trim() };
    }
  },
};
