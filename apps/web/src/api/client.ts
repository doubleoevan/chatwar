import ndjsonStream from "can-ndjson-stream";
import type { ApiError } from "@chatwar/shared";
import { CACHE_HEADER, PROVIDER_API_KEY_HEADER } from "@chatwar/shared";

type ApiErrorResponse = { error: ApiError };
type ChatStreamEvent =
  | { chunk: string }
  | { done: true }
  | { error: ApiError }
  | Record<string, unknown>;

function isRecord(error: unknown): error is Record<string, unknown> {
  return typeof error === "object" && error !== null;
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
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

function toResponseError(body: unknown, response: Response): ApiError {
  if (isApiErrorResponse(body)) {
    return body.error;
  }
  if (isApiError(body)) {
    return body;
  }
  return toApiError(response);
}

function toApiError(response: Response): ApiError {
  switch (response.status) {
    case 400:
      return { code: "BAD_REQUEST", message: "Bad request" };
    case 401:
      return { code: "UNAUTHORIZED", message: "Unauthorized" };
    case 402:
      return { code: "PAYMENT_REQUIRED", message: "Billing required or quota exhausted" };
    case 403:
      return { code: "FORBIDDEN", message: "Forbidden" };
    case 404:
      return { code: "NOT_FOUND", message: "Not found" };
    case 408:
      return { code: "TIMEOUT", message: "Request timed out" };
    case 409:
      return { code: "CONFLICT", message: "Conflict" };
    case 429:
      return { code: "RATE_LIMITED", message: "Rate limited" };
    case 500:
      return { code: "INTERNAL", message: "Server error" };
    case 502:
    case 503:
    case 504:
      return { code: "UPSTREAM_UNAVAILABLE", message: "Provider temporarily unavailable" };
    default:
      return { code: "INTERNAL", message: "Unexpected server error" };
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
function toApiUrl(url: string): string {
  // already absolute (or data:, blob:, etc.) — leave it
  const isAbsoluteUrl = /^https?:\/\//i.test(url);
  if (isAbsoluteUrl) {
    return url;
  }

  // no base configured — keep relative (dev proxy / same-origin)
  if (!API_BASE_URL) {
    return url;
  }

  // join without double slashes
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${path}`;
}

export type ApiClientOptions = {
  providerApiKey?: string;
  useCache?: boolean;
  signal?: AbortSignal;
};

export async function fetchJson<T>(
  url: string,
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
    const apiUrl = toApiUrl(url);
    response = await fetch(apiUrl, {
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
    throw toResponseError(body, response);
  }

  // return the body as JSON
  if (body === null) {
    throw { code: "INTERNAL", message: "Invalid JSON response" } satisfies ApiError;
  }
  return body as T;
}

export async function streamJson(
  url: string,
  request: RequestInit = {},
  options: ApiClientOptions = {},
  {
    onChunk,
    onComplete,
    onError,
    onEventError,
  }: {
    onChunk: (chunk: string) => void;
    onComplete: () => void;
    onError: (error: ApiError) => void;
    onEventError?: (error: ApiError) => void;
  },
) {
  // set the headers
  const headers = new Headers(request.headers);
  headers.set("Content-Type", "application/json");
  if (options.providerApiKey) {
    headers.set(PROVIDER_API_KEY_HEADER, options.providerApiKey);
  }
  if (options.useCache === false) {
    headers.set(CACHE_HEADER, "no-cache");
  }

  // fetch the response
  let response: Response;
  try {
    const apiUrl = toApiUrl(url);
    response = await fetch(apiUrl, {
      ...request,
      headers,
      signal: options.signal ?? request.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      return;
    }
    onError({
      code: "INTERNAL",
      message: error instanceof Error ? error.message : "Network error",
    });
    return;
  }

  // handle http errors
  if (!response.ok) {
    const body = await toJson(response);
    const responseError = toResponseError(body, response);
    onError(responseError);
    return;
  }

  // check if the response has a body before streaming it
  if (!response.body) {
    onError({ code: "INTERNAL", message: "Missing response body" });
    return;
  }

  // stream the response as text
  const reader = ndjsonStream(response.body).getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const event = value as ChatStreamEvent;
      if (isApiErrorResponse(event)) {
        if (onEventError) {
          onEventError(event.error);
          continue;
        }
        onError(event.error);
        return;
      }
      if (isApiError(event)) {
        if (onEventError) {
          onEventError(event);
          continue;
        }
        onError(event);
        return;
      }
      if ("chunk" in event && typeof event.chunk === "string") {
        onChunk(event.chunk);
        continue;
      }
      if ("done" in event && event.done === true) {
        onComplete();
        return;
      }
    }
    onComplete();
  } catch (error) {
    if (isAbortError(error)) {
      return;
    }
    onError({
      code: "INTERNAL",
      message: error instanceof Error ? error.message : "Streaming error",
    });
  } finally {
    try {
      await reader.cancel();
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
}
