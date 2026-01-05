import type { ApiError } from "@chatwar/shared";
import { PROVIDER_API_KEY_HEADER } from "@chatwar/shared";

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
