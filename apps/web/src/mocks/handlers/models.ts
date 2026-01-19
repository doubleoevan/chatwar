import { http, HttpResponse } from "msw";
import { getProviderModelsParamsSchema, PROVIDER_API_KEY_HEADER } from "@chatwar/shared";
import { PROVIDER_MODELS } from "@/mocks/data/providerModels";
import { withLatency } from "@/mocks/utils/withLatency";

export const PREFIX_BAD_KEY = "bad";

export const providerHandlers = [
  http.get("/v1/providers/:providerId/models", async ({ params, request }) =>
    withLatency(async () => {
      // throw an error for a missing providerId
      const validParams = getProviderModelsParamsSchema.safeParse(params);
      if (!validParams.success) {
        return HttpResponse.json(
          { code: "BAD_REQUEST", message: "Invalid or missing providerId" },
          { status: 400 },
        );
      }

      // throw an error for a missing apiKey
      const apiKey = request.headers.get(PROVIDER_API_KEY_HEADER)?.trim();
      if (!apiKey) {
        return HttpResponse.json(
          { code: "BAD_REQUEST", message: "Provider API Key is required" },
          { status: 400 },
        );
      }

      // throw an error for an invalid api key
      if (apiKey.startsWith(PREFIX_BAD_KEY)) {
        return HttpResponse.json(
          { code: "INVALID_API_KEY", message: "Invalid API key" },
          { status: 401 },
        );
      }

      // throw an error if models are not found
      const { providerId } = validParams.data;
      const models = PROVIDER_MODELS[providerId];
      if (!models) {
        return HttpResponse.json(
          { code: "BAD_REQUEST", message: `Unknown provider: ${providerId}` },
          { status: 400 },
        );
      }

      // return the models if valid
      return HttpResponse.json(models, { status: 200 });
    }),
  ),
];
