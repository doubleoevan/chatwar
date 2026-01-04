import { http, HttpResponse } from "msw";
import type { ApiError, ProviderId } from "@chatwar/shared";
import { PROVIDER_MODELS } from "@/mocks/data/providerModels";
import { withLatency } from "@/mocks/utils/withLatency";

function errorResponse(error: ApiError, status: number) {
  return HttpResponse.json({ error }, { status });
}

export const providerHandlers = [
  http.post("/api/v1/providers/:providerId/validate-key", async ({ params, request }) =>
    withLatency(async () => {
      // throw an error for a missing providerId
      const providerId = params.providerId as ProviderId | undefined;
      if (!providerId) {
        return errorResponse({ code: "BAD_REQUEST", message: "Missing providerId" }, 400);
      }

      // throw an error for a missing apiKey
      const body = (await request.json().catch(() => null)) as { apiKey?: string } | null;
      const apiKey = body?.apiKey?.trim();
      if (!apiKey) {
        return errorResponse({ code: "BAD_REQUEST", message: "apiKey is required" }, 400);
      }

      // throw an error for an invalid api key
      if (apiKey.startsWith("bad")) {
        return errorResponse({ code: "INVALID_API_KEY", message: "Invalid API key" }, 401);
      }

      // throw an error if models are not found
      const models = PROVIDER_MODELS[providerId];
      if (!models) {
        return errorResponse(
          { code: "BAD_REQUEST", message: `Unknown provider: ${providerId}` },
          400,
        );
      }

      // return the models if valid
      return HttpResponse.json(models, { status: 200 });
    }),
  ),
];
