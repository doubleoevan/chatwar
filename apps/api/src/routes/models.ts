import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { GetProviderModelsParams } from "@chatwar/shared";
import { getProviderModelsParamsSchema, providerModelsSchema } from "@chatwar/shared";

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
        },
      },
    },
    async (request, reply) => {
      const { providerId } = request.params as GetProviderModelsParams;

      // Stub: empty list for now
      const response = {
        providerId,
        models: [],
        defaultModelId: "default", // required by schema for now
      };

      // Defensive validation
      const parsed = providerModelsSchema.safeParse(response);
      if (!parsed.success) {
        throw new Error(`Invalid ProviderModels: ${parsed.error.message}`);
      }

      return reply.status(200).send(parsed.data);
    },
  );
};
