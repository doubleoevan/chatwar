import { http, HttpResponse } from "msw";
import type { ApiError, ProviderId } from "@chatwar/shared";
import { PROVIDER_API_KEY_HEADER } from "@chatwar/shared";
import { PROVIDER_MODELS } from "@/mocks/data/providerModels";
import { withLatency } from "@/mocks/utils/withLatency";

export const PREFIX_BAD_KEY = "bad";

function errorResponse(error: ApiError, status: number) {
  return HttpResponse.json({ error }, { status });
}

export const providerHandlers = [
  http.get("/api/v1/providers/:providerId/models", async ({ params, request }) =>
    withLatency(async () => {
      // throw an error for a missing providerId
      const providerId = params.providerId as ProviderId | undefined;
      if (!providerId) {
        return errorResponse({ code: "BAD_REQUEST", message: "Missing providerId" }, 400);
      }

      // throw an error for a missing apiKey
      const apiKey = request.headers.get(PROVIDER_API_KEY_HEADER)?.trim();
      if (!apiKey) {
        return errorResponse({ code: "BAD_REQUEST", message: "Provider API Key is required" }, 400);
      }

      // throw an error for an invalid api key
      if (apiKey.startsWith(PREFIX_BAD_KEY)) {
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
