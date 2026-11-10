/**
 * GET /api/health?provider=mock|local|cloud
 * Calls the provider's own GET /health on the server (so URLs and keys never
 * reach the browser) and returns a HealthResult. Always 200 unless the
 * provider name is wrong; `ok: false` means the service is not usable.
 */
import { NextResponse } from "next/server";
import { getProvider, isProvider } from "@/lib/providers";
import type { ApiError } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const provider = new URL(request.url).searchParams.get("provider") ?? "mock";
  if (!isProvider(provider)) {
    return NextResponse.json<ApiError>(
      { error: { code: "bad_provider", message: `Unknown provider "${provider}". Use mock, local or cloud.` } },
      { status: 400 },
    );
  }
  return NextResponse.json(await getProvider(provider).health());
}
