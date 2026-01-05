import { setupServer } from "msw/node";
import { providerHandlers } from "@/mocks/handlers/models";

export const server = setupServer(...providerHandlers);
