import React, { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { ApiError, ChatMessage, Model, ProviderId } from "@chatwar/shared";
import { typedEntries, typedKeys } from "@chatwar/shared";
import { streamChat } from "@/api/chat";
import { ChatContext } from "@/providers/chat/ChatContext";
import { toApiError } from "@/utils/apiError";
import { toastApiError, toastVoteMessage } from "@/utils/toast";
import { PROVIDER_CONFIGURATIONS } from "@/config/provider-configurations";
import { useCredentials } from "@/providers/credentials";
import { createProviderVote } from "@/api/votes";

export type ChatState = {
  userMessage: string;
  selectedProviderModels: Partial<Record<ProviderId, Model>>;
  providerChats: Partial<Record<ProviderId, ChatMessage[]>>;
  respondingProviderIds: Set<ProviderId>;
  votingProviderIds: Set<ProviderId>;
  providerErrors: Partial<Record<ProviderId, ApiError>>;
};

type ChatAction =
  | { type: "ADD_USER_MESSAGE"; providerId: ProviderId; message: string }
  | { type: "SET_SELECTED_PROVIDER_MODEL"; providerId: ProviderId; model: Model }
  | { type: "REMOVE_SELECTED_PROVIDER_MODEL"; providerId: ProviderId }
  | { type: "REMOVE_PROVIDER_CHAT"; providerId: ProviderId }
  | { type: "CLEAR_PROVIDER_CHAT"; providerId: ProviderId }
  | { type: "ADD_PROVIDER_MESSAGE"; providerId: ProviderId }
  | { type: "APPEND_PROVIDER_MESSAGE"; providerId: ProviderId; message: string }
  | { type: "ADD_PROVIDER_ERROR_MESSAGE"; providerId: ProviderId; message: string }
  | { type: "ADD_RESPONDING_PROVIDER"; providerId: ProviderId }
  | { type: "REMOVE_RESPONDING_PROVIDER"; providerId: ProviderId }
  | { type: "ADD_VOTING_PROVIDER"; providerId: ProviderId }
  | { type: "REMOVE_VOTING_PROVIDER"; providerId: ProviderId }
  | { type: "CLEAR_VOTING_PROVIDERS" }
  | { type: "SET_PROVIDER_ERROR"; providerId: ProviderId; error: ApiError }
  | { type: "REMOVE_PROVIDER_ERROR"; providerId: ProviderId };

const initialState: ChatState = {
  userMessage: "",
  selectedProviderModels: {},
  providerChats: {},
  respondingProviderIds: new Set(),
  votingProviderIds: new Set(),
  providerErrors: {},
};

function reducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_USER_MESSAGE": {
      const chats = state.providerChats[action.providerId] ?? [];
      return {
        ...state,
        userMessage: action.message,
        providerChats: {
          ...state.providerChats,
          [action.providerId]: [...chats, { role: "user", content: action.message }],
        },
      };
    }

    case "SET_SELECTED_PROVIDER_MODEL": {
      const selectedProviderModels = { ...state.selectedProviderModels };
      selectedProviderModels[action.providerId] = action.model;
      return { ...state, selectedProviderModels };
    }

    case "REMOVE_SELECTED_PROVIDER_MODEL": {
      const selectedProviderModels = { ...state.selectedProviderModels };
      delete selectedProviderModels[action.providerId];
      return { ...state, selectedProviderModels };
    }

    case "REMOVE_PROVIDER_CHAT": {
      const providerChats = { ...state.providerChats };
      delete providerChats[action.providerId];
      return { ...state, providerChats };
    }

    case "CLEAR_PROVIDER_CHAT": {
      return {
        ...state,
        providerChats: { ...state.providerChats, [action.providerId]: [] },
      };
    }

    case "ADD_PROVIDER_MESSAGE": {
      const chats = state.providerChats[action.providerId] ?? [];
      return {
        ...state,
        providerChats: {
          ...state.providerChats,
          [action.providerId]: [...chats, { role: "assistant", content: "" }],
        },
      };
    }

    case "APPEND_PROVIDER_MESSAGE": {
      const chats = state.providerChats[action.providerId] ?? [];
      const providerChat = chats[chats.length - 1];
      if (providerChat?.role !== "assistant") {
        return {
          ...state,
          providerChats: {
            ...state.providerChats,
            [action.providerId]: [...chats, { role: "assistant", content: action.message }],
          },
        };
      }
      return {
        ...state,
        providerChats: {
          ...state.providerChats,
          [action.providerId]: [
            ...chats.slice(0, -1),
            { ...providerChat, content: providerChat.content + action.message },
          ],
        },
      };
    }

    case "ADD_PROVIDER_ERROR_MESSAGE": {
      const providerChat = state.providerChats[action.providerId] ?? [];
      return {
        ...state,
        providerChats: {
          ...state.providerChats,
          [action.providerId]: [...providerChat, { role: "error", content: action.message }],
        },
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
  const { apiKeys, providerModels } = useCredentials();

  // initialize selected models from credentials provider defaults
  useEffect(() => {
    for (const [providerId, modelsMetadata] of typedEntries(providerModels)) {
      const defaultModelId = modelsMetadata?.defaultModelId;
      if (!defaultModelId || state.selectedProviderModels[providerId]) {
        continue;
      }
      const model = modelsMetadata.models.find((model) => model.id === defaultModelId);
      if (!model) {
        continue;
      }
      dispatch({ type: "SET_SELECTED_PROVIDER_MODEL", providerId, model });
    }

    // remove selected models from providers that do not have defaults
    for (const [providerId] of typedEntries(state.selectedProviderModels)) {
      if (!providerModels[providerId]) {
        dispatch({ type: "REMOVE_SELECTED_PROVIDER_MODEL", providerId });
      }
    }
  }, [providerModels, state.selectedProviderModels]);

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
    (options: {
      providerId: ProviderId;
      providerApiKey: string;
      model: Model;
      message: string;
      clearChat?: boolean;
    }) => {
      // stop any previous stream for this provider and set a new abort controller
      const { providerId, providerApiKey, model, message, clearChat = false } = options;
      stopProviderChat(providerId);
      const controller = new AbortController();
      abortControllersRef.current.set(providerId, controller);

      // clear the previous chat if necessary
      if (clearChat) {
        dispatch({ type: "CLEAR_PROVIDER_CHAT", providerId });
      }

      // stream the chat
      const previousChats = state.providerChats[providerId] ?? [];
      const userMessage: ChatMessage = { role: "user", content: message };
      const messages = [...previousChats, userMessage].filter(
        (chat) => !!chat.content.trim() && chat.role !== "error",
      );
      dispatch({ type: "ADD_USER_MESSAGE", message, providerId });
      dispatch({ type: "ADD_PROVIDER_MESSAGE", providerId });
      dispatch({ type: "REMOVE_PROVIDER_ERROR", providerId });
      dispatch({ type: "ADD_RESPONDING_PROVIDER", providerId });
      void streamChat({
        providerId,
        providerApiKey,
        modelId: model.id,
        messages,
        signal: controller.signal,
        onChunk: (chunk) => {
          dispatch({ type: "APPEND_PROVIDER_MESSAGE", providerId, message: chunk });
        },
        onComplete: () => {
          // finished responding and ready to vote if we have more than one provider
          dispatch({ type: "REMOVE_RESPONDING_PROVIDER", providerId });
          abortControllersRef.current.delete(providerId);
          if (typedKeys(apiKeys).length > 1) {
            dispatch({ type: "ADD_VOTING_PROVIDER", providerId });
          }
        },
        onError: (error) => {
          // can't vote on an incomplete response
          abortControllersRef.current.delete(providerId);
          dispatch({ type: "REMOVE_RESPONDING_PROVIDER", providerId });
          dispatch({ type: "REMOVE_VOTING_PROVIDER", providerId });

          // no need to log an error if the request was manually aborted
          if (controller.signal.aborted) {
            return;
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
              endpoint: `/v1/providers/${providerId}/chat`,
              modelId: model.id,
              modelLabel: model.label,
              messages,
            },
          });
        },
        onEventError: (apiError) => {
          // show the error in the chat
          dispatch({
            type: "ADD_PROVIDER_ERROR_MESSAGE",
            providerId,
            message: apiError.message,
          });

          // show an error toast
          const provider = PROVIDER_CONFIGURATIONS[providerId];
          const { Icon } = provider;
          toastApiError(apiError, {
            providerId,
            icon: <Icon />,
            metadata: {
              endpoint: `/v1/providers/${providerId}/chat`,
              modelId: model.id,
              modelLabel: model.label,
              messages,
            },
          });
        },
      });
    },
    [apiKeys, state.providerChats, stopProviderChat],
  );

  const selectProviderModel = useCallback((providerId: ProviderId, model: Model) => {
    dispatch({ type: "SET_SELECTED_PROVIDER_MODEL", providerId, model });
  }, []);

  const voteProviderChat = useCallback(
    async (options: { providerId: ProviderId; model: Model }) => {
      const { providerId, model } = options;
      try {
        // initialize the competitors
        const competitors = typedEntries(state.selectedProviderModels)
          .filter(([, model]) => model)
          .map(([competitorProviderId, model]) => ({
            providerId: competitorProviderId,
            modelId: model!.id,
            modelLabel: model!.label,
          }));

        // post the winning vote
        await createProviderVote({
          winnerProviderId: providerId,
          winnerModelId: model.id,
          winnerModelLabel: model.label,
          competitors,
          message: state.userMessage,
        });

        // show a victory toast
        const provider = PROVIDER_CONFIGURATIONS[providerId];
        const message = `${provider.label} with ${model.label} wins!`;
        const { Icon } = provider;
        toastVoteMessage(message, <Icon />);
        dispatch({ type: "CLEAR_VOTING_PROVIDERS" });
      } catch (error) {
        // save the error
        const apiError = toApiError(error, {
          code: "PROVIDER_FAILED",
          message: "Failed to post provider vote",
        });
        dispatch({ type: "SET_PROVIDER_ERROR", providerId, error: apiError });

        // show an error toast
        toastApiError(apiError, {
          providerId,
          metadata: {
            endpoint: "/v1/provider-votes",
            modelId: model.id,
            modelLabel: model.label,
          },
        });
      }
    },
    [state.userMessage, state.selectedProviderModels],
  );

  const removeProviderChat = useCallback(
    (providerId: ProviderId) => {
      stopProviderChat(providerId);
      dispatch({ type: "REMOVE_PROVIDER_CHAT", providerId });
      dispatch({ type: "REMOVE_PROVIDER_ERROR", providerId });
      dispatch({ type: "REMOVE_SELECTED_PROVIDER_MODEL", providerId });
    },
    [stopProviderChat],
  );

  // memoize context to avoid rerendering consumers
  const value = useMemo(
    () => ({
      ...state,
      selectProviderModel,
      startProviderChat,
      stopProviderChat,
      voteProviderChat,
      removeProviderChat,
    }),
    [
      state,
      selectProviderModel,
      startProviderChat,
      stopProviderChat,
      voteProviderChat,
      removeProviderChat,
    ],
  );
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
