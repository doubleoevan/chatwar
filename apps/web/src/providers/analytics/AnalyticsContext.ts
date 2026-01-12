import React from "react";
import type { ProviderModelVote } from "@chatwar/shared";

export type AnalyticsContextValue = {
  votes: ProviderModelVote[];
  isAnalyticsLoading: boolean;
  fetchVotes: () => Promise<void>;
};

export const AnalyticsContext = React.createContext<AnalyticsContextValue | null>(null);
