import "server-only";
import { env } from "./env";
import { httpHealth, httpPredict } from "./http";
import { ProviderError, type ModelProvider } from "./types";

/**
 * Cloud provider: hosted model service, `${CLOUD_MODEL_API_URL}/predict`
 * (Gradio/FastAPI on Hugging Face Spaces, or Roboflow's hosted API).
 * ROBOFLOW_API_KEY, if set, is added as `api_key` on the server only.
 */
function target() {
  if (!env.cloudModelApiUrl) {
    throw new ProviderError(
      "not_configured",
      "The cloud provider is not configured.",
      503,
      "Set CLOUD_MODEL_API_URL in web/.env.local and restart the app, or switch to the mock or local provider in Settings.",
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
  predict: async (input) => httpPredict(target(), input),
  health: async () => {
    try {
      return await httpHealth(target());
    } catch (err) {
      const e = err as ProviderError;
      return { ok: false, provider: "cloud", status: e.code, latencyMs: 0, message: `${e.message} ${e.hint ?? ""}`.trim() };
    }
  },
};
