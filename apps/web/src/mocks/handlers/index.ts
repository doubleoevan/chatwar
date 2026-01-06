import { providerHandlers } from "./models";
import { chatHandlers } from "./chat";

export const handlers = [...providerHandlers, ...chatHandlers];
