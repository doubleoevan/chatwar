import { beforeEach, describe, expect, test } from "vitest";
import React, { useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";

import type { ProviderId } from "@chatwar/shared";
import { PROVIDERS } from "@chatwar/shared";

import { CredentialsProvider, useCredentials } from "@/providers/credentials";
import { getApiKey as getSavedApiKey, removeApiKey } from "@/utils/apiKeys";

function TestComponent({ providerId, apiKey }: { providerId: ProviderId; apiKey: string }) {
  const { saveApiKey, providerModels, loadingProviderIds, getApiKey } = useCredentials();

  useEffect(() => {
    void saveApiKey(providerId, apiKey);
  }, [providerId, apiKey, saveApiKey]);

  return (
    <div>
      <div data-testid="is-loading">{loadingProviderIds.has(providerId) ? "true" : "false"}</div>
      <div data-testid="has-models">{providerModels[providerId] ? "yes" : "no"}</div>
      <div data-testid="saved-key">{getApiKey(providerId) ?? ""}</div>
    </div>
  );
}

function renderWithCredentials(children: React.ReactNode) {
  return render(<CredentialsProvider>{children}</CredentialsProvider>);
}

describe("CredentialsProvider with a valid API key", () => {
  const providerId = PROVIDERS[0] as ProviderId;

  beforeEach(() => {
    removeApiKey(providerId);
  });

  test("loads models and saves the API key", async () => {
    const apiKey = "valid-apiKey";
    renderWithCredentials(<TestComponent providerId={providerId} apiKey={apiKey} />);

    await waitFor(() => expect(screen.getByTestId("has-models").textContent).toBe("yes"));
    expect(screen.getByTestId("is-loading").textContent).toBe("false");
    expect(screen.getByTestId("saved-key").textContent).toBe(apiKey);
    expect(getSavedApiKey(providerId)).toBe(apiKey);
  });
});
