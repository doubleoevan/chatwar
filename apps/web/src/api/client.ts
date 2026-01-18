import type { ApiError } from "@chatwar/shared";
import { CACHE_HEADER, PROVIDER_API_KEY_HEADER } from "@chatwar/shared";

type ApiErrorResponse = { error: ApiError };

function isRecord(error: unknown): error is Record<string, unknown> {
  return typeof error === "object" && error !== null;
}

function isApiError(error: unknown): error is ApiError {
  if (!isRecord(error)) {
    return false;
  }
  return typeof error.code === "string" && typeof error.message === "string";
}

function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  if (!isRecord(error)) {
    return false;
  }
  return "error" in error && isApiError(error.error);
}

async function toJson(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function toApiError(response: Response): ApiError {
  switch (response.status) {
    case 400:
      return { code: "BAD_REQUEST", message: "Bad request" };
    case 401:
      return { code: "UNAUTHORIZED", message: "Unauthorized" };
    case 403:
      return { code: "FORBIDDEN", message: "Forbidden" };
    case 404:
      return { code: "NOT_FOUND", message: "Not found" };
    default:
      return { code: "INTERNAL", message: "Unexpected server error" };
  }
}

export type ApiClientOptions = {
  providerApiKey?: string;
  useCache?: boolean;
  signal?: AbortSignal;
};

export async function fetchJson<T>(
  input: string,
  request: RequestInit = {},
  options: ApiClientOptions = {},
): Promise<T> {
  // set the provider api key header
  const headers = new Headers(request.headers);
  if (options.providerApiKey) {
    headers.set(PROVIDER_API_KEY_HEADER, options.providerApiKey);
  }
  if (options.useCache === false) {
    headers.set(CACHE_HEADER, "no-cache");
  }

  // fetch the response
  let response: Response;
  try {
    response = await fetch(input, {
      ...request,
      headers,
      signal: options.signal ?? request.signal,
    });
  } catch (error) {
    throw {
      code: "INTERNAL",
      message: error instanceof Error ? error.message : "Network error",
    } satisfies ApiError;
  }

  // throw an error if necessary
  const body = await toJson(response);
  if (!response.ok) {
    if (isApiErrorResponse(body)) {
      throw body.error;
    }
    if (isApiError(body)) {
      throw body;
    }
    throw toApiError(response);
  }

  // return the body as JSON
  if (body === null) {
    throw { code: "INTERNAL", message: "Invalid JSON response" } satisfies ApiError;
  }
  return body as T;
}

export async function streamJson(
  input: string,
  request: RequestInit = {},
  options: ApiClientOptions = {},
  {
    onChunk,
    onComplete,
    onError,
  }: {
    onChunk: (chunk: string) => void;
    onComplete: () => void;
    onError: (error: ApiError) => void;
  },
) {
  // set the provider api key header
  const headers = new Headers(request.headers);
  if (!headers.has("Content-Type") && request.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.providerApiKey) {
    headers.set(PROVIDER_API_KEY_HEADER, options.providerApiKey);
  }

  // fetch the response
  let response: Response;
  try {
    response = await fetch(input, {
      ...request,
      headers,
      signal: options.signal ?? request.signal,
    });
  } catch (error) {
    onError({
      code: "INTERNAL",
      message: error instanceof Error ? error.message : "Network error",
    });
    return;
  }

  // handle http errors
  if (!response.ok) {
    const body = await toJson(response);
    if (isApiErrorResponse(body)) {
      onError(body.error);
      return;
    }
    if (isApiError(body)) {
      onError(body);
      return;
    }
    onError(toApiError(response));
    return;
  }

  // handle non-streaming JSON responses gracefully
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await toJson(response);
    if (isApiErrorResponse(body)) {
      onError(body.error);
      return;
    }
    if (isApiError(body)) {
      onError(body);
      return;
    }
    if (isRecord(body)) {
      if (typeof body.message === "string") {
        onChunk(body.message);
        onComplete();
        return;
      }
      if (typeof body.text === "string") {
        onChunk(body.text);
        onComplete();
        return;
      }
    }
    onError({
      code: "INTERNAL",
      message: "Unexpected JSON response for streaming endpoint",
    });
    return;
  }

  // check if the response has a body before streaming it
  if (!response.body) {
    onError({
      code: "INTERNAL",
      message: "Missing response body",
    });
    return;
  }

  // stream the response as text
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        onChunk(chunk);
      }
    }
    const lastChunk = decoder.decode();
    if (lastChunk) {
      onChunk(lastChunk);
    }
    onComplete();
  } catch (error) {
    onError({
      code: "INTERNAL",
      message: error instanceof Error ? error.message : "Streaming error",
    });
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
}
