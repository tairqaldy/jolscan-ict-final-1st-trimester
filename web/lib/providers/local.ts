import "server-only";
import { env } from "./env";
import { httpHealth, httpPredict } from "./http";
import type { ModelProvider } from "./types";

/** Local provider: our FastAPI service (api/) on the laptop, `${MODEL_API_URL}/predict`. */
const target = () => ({ provider: "local" as const, baseUrl: env.modelApiUrl, envName: "MODEL_API_URL" });

export const localProvider: ModelProvider = {
  id: "local",
  predict: (input) => httpPredict(target(), input),
  health: () => httpHealth(target()),
};
