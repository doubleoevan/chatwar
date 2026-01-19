import { beforeEach, describe, expect, test, vi } from "vitest";
import React, { useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";

import type { ProviderId } from "@chatwar/shared";
import { PROVIDERS } from "@chatwar/shared";

import { CredentialsProvider, useCredentials } from "@/providers/credentials";
import { getApiKey as getSavedApiKey, removeApiKey } from "@/utils/apiKeys";

import { PREFIX_BAD_KEY } from "@/mocks/handlers/models";
import { toastApiError } from "@/utils/toast";

vi.mock("@/utils/toast", () => ({
  toastApiError: vi.fn(),
}));

function TestComponent({ providerId, apiKey }: { providerId: ProviderId; apiKey: string }) {
  const { saveApiKey, providerErrors, providerModels, loadingProviderIds, getApiKey } =
    useCredentials();

  useEffect(() => {
    void saveApiKey(providerId, apiKey);
  }, [providerId, apiKey, saveApiKey]);

  return (
    <div>
      <div data-testid="is-loading">{loadingProviderIds.has(providerId) ? "true" : "false"}</div>
      <div data-testid="has-models">{providerModels[providerId] ? "yes" : "no"}</div>
      <div data-testid="error-code">{providerErrors[providerId]?.code ?? ""}</div>
      <div data-testid="saved-key">{getApiKey(providerId) ?? ""}</div>
    </div>
  );
}

function renderWithCredentials(children: React.ReactNode) {
  return render(<CredentialsProvider>{children}</CredentialsProvider>);
}

describe("CredentialsProvider with an invalid API key", () => {
  const providerId = PROVIDERS[0] as ProviderId;

  beforeEach(() => {
    vi.clearAllMocks();
    removeApiKey(providerId);
  });

  test("sets errors, does not save the API key, and shows toast", async () => {
    const badKey = `${PREFIX_BAD_KEY}-nope`;

    // verify there are no models
    renderWithCredentials(<TestComponent providerId={providerId} apiKey={badKey} />);
    await waitFor(() => expect(screen.getByTestId("is-loading").textContent).toBe("false"));
    expect(screen.getByTestId("has-models").textContent).toBe("no");

    // verify there are errors
    await waitFor(() =>
      expect(screen.getByTestId("error-code").textContent).toBe("INVALID_API_KEY"),
    );
    expect(getSavedApiKey(providerId)).toBeNull();
    expect(screen.getByTestId("saved-key").textContent).toBe("");

    // verify the toast was shown with metadata
    expect(toastApiError).toHaveBeenCalledTimes(1);
    const [apiError, options] = (toastApiError as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(apiError.code).toBe("INVALID_API_KEY");
    expect(options.providerId).toBe(providerId);
    expect(options.metadata.action).toBe("saveApiKey");
    expect(options.metadata.endpoint).toBe(`/v1/providers/${providerId}/models`);
  });
});
