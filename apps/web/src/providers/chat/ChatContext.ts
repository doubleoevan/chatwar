import type { Model, ProviderId } from "@chatwar/shared";
import { createContext } from "react";
import { ChatState } from "@/providers/chat/ChatProvider";

export type ChatContextValue = ChatState & {
  selectProviderModel: (providerId: ProviderId, model: Model) => void;
  startProviderChat: (args: {
    providerId: ProviderId;
    providerApiKey: string;
    model: Model;
    message: string;
    clearChat?: boolean; // optionally clear the pre-existing chat
  }) => void;
  stopProviderChat: (providerId: ProviderId) => void;
  voteProviderChat: (args: { providerId: ProviderId; model: Model }) => void;
  removeProviderChat: (providerId: ProviderId) => void;
};

export const ChatContext = createContext<ChatContextValue | null>(null);
