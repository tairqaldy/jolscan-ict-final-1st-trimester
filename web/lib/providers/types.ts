import type { InferenceResult, Provider } from "@/lib/types";
import type { Sample } from "@/lib/mock/samples";

/** What every provider receives. Either an uploaded image or a bundled sample. */
export type PredictInput = {
  image?: { bytes: Uint8Array; type: string; name: string };
  sample?: Sample;
  /** Lowest confidence the model should return (model `conf`, default 0.25). */
  conf: number;
  /** Measured in the browser for uploads, so the mock can fill the contract. */
  imageWidth?: number;
  imageHeight?: number;
};

export type HealthResult = {
  ok: boolean;
  provider: Provider;
  status: string;
  model?: string;
  device?: string;
  /** Round trip of the health call, ms. */
  latencyMs: number;
  message?: string;
};

export interface ModelProvider {
  id: Provider;
  predict(input: PredictInput): Promise<InferenceResult>;
  health(): Promise<HealthResult>;
}

/** Errors the analyze route turns into clean JSON responses. */
export type ProviderErrorCode =
  | "not_configured"
  | "unreachable"
  | "timeout"
  | "bad_response"
  | "rejected"
  | "unsupported_input";

export class ProviderError extends Error {
  constructor(
    public code: ProviderErrorCode,
    message: string,
    public status: number,
    public hint?: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
