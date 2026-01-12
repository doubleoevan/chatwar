import { providerHandlers } from "./models";
import { chatHandlers } from "./chat";
import { voteHandlers } from "./votes";

export const handlers = [...providerHandlers, ...chatHandlers, ...voteHandlers];
