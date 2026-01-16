import React from "react";
import type { ProviderModelVoteResponse } from "@chatwar/shared";

export type AnalyticsContextValue = {
  votes: ProviderModelVoteResponse[];
  isAnalyticsLoading: boolean;
  fetchVotes: () => Promise<void>;
};

export const AnalyticsContext = React.createContext<AnalyticsContextValue | null>(null);
