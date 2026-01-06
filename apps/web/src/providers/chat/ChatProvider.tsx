import React, { useCallback, useMemo, useReducer, useRef } from "react";
import type { ApiError, ProviderId } from "@chatwar/shared";
import { streamChat } from "@/api/chat";
import { ChatContext } from "@/providers/chat/ChatContext";
import { toApiError } from "@/utils/apiError";
import { toastApiError, toastVoteMessage } from "@/utils/toast";
import { PROVIDER_CONFIGURATIONS } from "@/config/provider-configurations";

export type ChatState = {
  message: string;
  providerChats: Partial<Record<ProviderId, string>>;
  respondingProviderIds: Set<ProviderId>;
  votingProviderIds: Set<ProviderId>;
  providerErrors: Partial<Record<ProviderId, ApiError>>;
};

type ChatAction =
  | { type: "SET_CHAT_MESSAGE"; message: string }
  | { type: "REMOVE_PROVIDER_CHAT"; providerId: ProviderId }
  | { type: "CLEAR_PROVIDER_CHAT"; providerId: ProviderId }
  | { type: "APPEND_CHAT_RESPONSE"; providerId: ProviderId; response: string }
  | { type: "ADD_RESPONDING_PROVIDER"; providerId: ProviderId }
  | { type: "REMOVE_RESPONDING_PROVIDER"; providerId: ProviderId }
  | { type: "ADD_VOTING_PROVIDER"; providerId: ProviderId }
  | { type: "REMOVE_VOTING_PROVIDER"; providerId: ProviderId }
  | { type: "CLEAR_VOTING_PROVIDERS" }
  | { type: "SET_PROVIDER_ERROR"; providerId: ProviderId; error: ApiError }
  | { type: "REMOVE_PROVIDER_ERROR"; providerId: ProviderId };

const initialState: ChatState = {
  message: "",
  providerChats: {},
  respondingProviderIds: new Set(),
  votingProviderIds: new Set(),
  providerErrors: {},
};

function reducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_CHAT_MESSAGE": {
      return { ...state, message: action.message };
    }

    case "REMOVE_PROVIDER_CHAT": {
      const providerChats = { ...state.providerChats };
      delete providerChats[action.providerId];
      return { ...state, providerChats };
    }

    case "CLEAR_PROVIDER_CHAT": {
      return {
        ...state,
        providerChats: { ...state.providerChats, [action.providerId]: "" },
      };
    }

    case "APPEND_CHAT_RESPONSE": {
      const chat = state.providerChats[action.providerId] ?? "";
      return {
        ...state,
        providerChats: { ...state.providerChats, [action.providerId]: chat + action.response },
      };
    }

    case "ADD_RESPONDING_PROVIDER": {
      // add to the responding providers Set
      const respondingProviderIds = new Set(state.respondingProviderIds);
      respondingProviderIds.add(action.providerId);

      // remove from the voting providers Set if the provider is now responding
      const votingProviderIds = new Set(state.votingProviderIds);
      votingProviderIds.delete(action.providerId);
      return { ...state, respondingProviderIds, votingProviderIds };
    }

    case "REMOVE_RESPONDING_PROVIDER": {
      const respondingProviderIds = new Set(state.respondingProviderIds);
      respondingProviderIds.delete(action.providerId);
      return { ...state, respondingProviderIds };
    }

    case "ADD_VOTING_PROVIDER": {
      const votingProviderIds = new Set(state.votingProviderIds);
      votingProviderIds.add(action.providerId);
      return { ...state, votingProviderIds };
    }

    case "REMOVE_VOTING_PROVIDER": {
      const votingProviderIds = new Set(state.votingProviderIds);
      votingProviderIds.delete(action.providerId);
      return { ...state, votingProviderIds };
    }

    case "CLEAR_VOTING_PROVIDERS": {
      return { ...state, votingProviderIds: new Set() };
    }

    case "SET_PROVIDER_ERROR": {
      return {
        ...state,
        providerErrors: {
          ...state.providerErrors,
          [action.providerId]: action.error,
        },
      };
    }

    case "REMOVE_PROVIDER_ERROR": {
      const providerErrors = { ...state.providerErrors };
      delete providerErrors[action.providerId];
      return { ...state, providerErrors };
    }

    default:
      return state;
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // use an instance field to abort streaming providers if necessary
  const abortControllersRef = useRef(new Map<ProviderId, AbortController>());

  const stopProviderChat = useCallback((providerId: ProviderId) => {
    const controller = abortControllersRef.current.get(providerId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(providerId);
    }
    // also remove from responding and voting providers if we manually abort
    dispatch({ type: "REMOVE_RESPONDING_PROVIDER", providerId });
    dispatch({ type: "REMOVE_VOTING_PROVIDER", providerId });
  }, []);

  const startProviderChat = useCallback(
    (args: {
      providerId: ProviderId;
      providerApiKey: string;
      modelId: string;
      message: string;
      clearChat?: boolean;
    }) => {
      // set the message to pass with the vote
      const { providerId, providerApiKey, modelId, message, clearChat = false } = args;
      dispatch({ type: "SET_CHAT_MESSAGE", message });
      dispatch({ type: "REMOVE_PROVIDER_ERROR", providerId });

      // stop any previous stream for this provider and set a new abort controller
      stopProviderChat(providerId);
      const controller = new AbortController();
      abortControllersRef.current.set(providerId, controller);

      // clear the previous chat if necessary
      if (clearChat) {
        dispatch({ type: "CLEAR_PROVIDER_CHAT", providerId });
      }

      // stream the chat
      dispatch({ type: "ADD_RESPONDING_PROVIDER", providerId });
      void streamChat({
        providerId,
        providerApiKey,
        message,
        signal: controller.signal,
        onChunk: (chunk) => {
          dispatch({ type: "APPEND_CHAT_RESPONSE", providerId, response: chunk });
        },
        onComplete: () => {
          // finished responding and ready to vote
          dispatch({ type: "REMOVE_RESPONDING_PROVIDER", providerId });
          dispatch({ type: "ADD_VOTING_PROVIDER", providerId });
          abortControllersRef.current.delete(providerId);
        },
        onError: (error) => {
          // can't vote on an incomplete response
          abortControllersRef.current.delete(providerId);
          dispatch({ type: "REMOVE_RESPONDING_PROVIDER", providerId });
          dispatch({ type: "REMOVE_VOTING_PROVIDER", providerId });

          // no need to log an error if the request was manually aborted
          if (
            controller.signal.aborted ||
            (error instanceof DOMException && error.name === "AbortError")
          ) {
            return; // no need to log or show anything if this was intentional
          }

          // save the error
          const apiError = toApiError(error, {
            code: "PROVIDER_FAILED",
            message: "Failed to stream provider response",
          });
          dispatch({ type: "SET_PROVIDER_ERROR", providerId, error: apiError });

          // show an error toast
          const provider = PROVIDER_CONFIGURATIONS[providerId];
          const { Icon } = provider;
          toastApiError(apiError, {
            providerId,
            icon: <Icon />,
            metadata: {
              endpoint: `/api/v1/providers/${providerId}/chat`,
              modelId,
              message,
            },
          });
        },
      });
    },
    [stopProviderChat],
  );

  const voteProviderChat = useCallback(
    (providerId: ProviderId, modelId: string) => {
      // TODO: post winning provider and model vote to backend
      console.log({ providerId, modelId, message: state.message });
      const provider = PROVIDER_CONFIGURATIONS[providerId];
      const message = `${provider.label} Wins!`;
      const { Icon } = provider;
      toastVoteMessage(message, <Icon />);
      dispatch({ type: "CLEAR_VOTING_PROVIDERS" });
    },
    [state.message],
  );

  const removeProviderChat = useCallback(
    (providerId: ProviderId) => {
      stopProviderChat(providerId);
      dispatch({ type: "REMOVE_PROVIDER_CHAT", providerId });
      dispatch({ type: "REMOVE_PROVIDER_ERROR", providerId });
    },
    [stopProviderChat],
  );

  // memoize context to avoid rerendering consumers
  const value = useMemo(
    () => ({
      ...state,
      startProviderChat,
      stopProviderChat,
      voteProviderChat,
      removeProviderChat,
    }),
    [state, startProviderChat, stopProviderChat, voteProviderChat, removeProviderChat],
  );
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
