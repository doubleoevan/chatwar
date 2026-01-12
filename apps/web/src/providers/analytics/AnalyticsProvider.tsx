import React, { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { ApiError, ProviderModelVote } from "@chatwar/shared";
import { getProviderVotes } from "@/api/votes";
import { toApiError } from "@/utils/apiError";
import { toastApiError } from "@/utils/toast";
import { AnalyticsContext } from "@/providers/analytics/AnalyticsContext";

export type AnalyticsState = {
  votes: ProviderModelVote[];
  isAnalyticsLoading: boolean;
  error: ApiError | null;
};

type AnalyticsAction =
  | { type: "SET_IS_LOADING"; isAnalyticsLoading: boolean }
  | { type: "SET_VOTES"; votes: ProviderModelVote[] }
  | { type: "SET_ERROR"; error: ApiError }
  | { type: "CLEAR_ERROR" };

const initialState: AnalyticsState = {
  votes: [],
  isAnalyticsLoading: false,
  error: null,
};

function reducer(state: AnalyticsState, action: AnalyticsAction): AnalyticsState {
  switch (action.type) {
    case "SET_IS_LOADING": {
      return { ...state, isAnalyticsLoading: action.isAnalyticsLoading };
    }

    case "SET_VOTES": {
      return {
        ...state,
        votes: action.votes,
        isAnalyticsLoading: false,
        error: null,
      };
    }

    case "SET_ERROR": {
      return {
        ...state,
        isAnalyticsLoading: false,
        error: action.error,
      };
    }

    case "CLEAR_ERROR": {
      return { ...state, error: null };
    }

    default:
      return state;
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef<AbortController | null>(null);

  const fetchVotes = useCallback(async () => {
    // use an abort controller to stop the fetch if necessary
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // fetch the votes
    dispatch({ type: "CLEAR_ERROR" });
    dispatch({ type: "SET_IS_LOADING", isAnalyticsLoading: true });
    try {
      const votes = await getProviderVotes({ signal: controller.signal });
      dispatch({ type: "SET_VOTES", votes });
    } catch (error) {
      // stop the request and save the error
      if (controller.signal.aborted) {
        return;
      }

      // show an error toast
      const apiError = toApiError(error, {
        code: "PROVIDER_FAILED",
        message: "Failed to fetch provider votes",
      });
      dispatch({ type: "SET_ERROR", error: apiError });
      toastApiError(apiError, {
        metadata: {
          endpoint: "/api/v1/provider-votes",
        },
      });
    } finally {
      dispatch({ type: "SET_IS_LOADING", isAnalyticsLoading: false });
    }
  }, []);

  // initial load
  useEffect(() => {
    void fetchVotes();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchVotes]);

  // memoize context to avoid rerendering consumers
  const value = useMemo(
    () => ({
      votes: state.votes,
      isAnalyticsLoading: state.isAnalyticsLoading,
      fetchVotes,
    }),
    [state.votes, state.isAnalyticsLoading, fetchVotes],
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}
