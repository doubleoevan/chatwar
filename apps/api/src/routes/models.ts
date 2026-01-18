import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  apiErrorSchema,
  GetProviderModelsParams,
  getProviderModelsParamsSchema,
  PROVIDER_API_KEY_HEADER,
  providerModelsSchema,
} from "@chatwar/shared";

import { getProviderModels } from "../services/models";

export const modelsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/v1/providers/:providerId/models",
    {
      schema: {
        tags: ["Models"],
        summary: "Get models for a provider",
        description: "Returns the models supported by the provider.",
        params: getProviderModelsParamsSchema,
        response: {
          200: providerModelsSchema,
          400: apiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      // validate the API key header
      const apiKey = request.headers[PROVIDER_API_KEY_HEADER] as string | undefined;
      if (!apiKey) {
        return reply.status(400).send({
          code: "INVALID_API_KEY",
          message: `Missing required header: ${PROVIDER_API_KEY_HEADER}`,
        });
      }

      // return the provider models
      const { providerId } = request.params as GetProviderModelsParams;
      const models = await getProviderModels({ apiKey, providerId });
      return reply.status(200).send(models);
    },
  );
};
