import { createContext } from "react";
import { ChatState } from "@/providers/chat/ChatProvider";
import { ProviderId } from "@chatwar/shared";

export type ChatContextValue = ChatState & {
  startProviderChat: (args: {
    providerId: ProviderId;
    providerApiKey: string;
    modelId: string;
    message: string;
    clearChat?: boolean; // optionally clear the pre-existing chat
  }) => void;
  stopProviderChat: (providerId: ProviderId) => void;
  voteProviderChat: (providerId: ProviderId, modelId: string) => void;
  removeProviderChat: (providerId: ProviderId) => void;
};

export const ChatContext = createContext<ChatContextValue | null>(null);
