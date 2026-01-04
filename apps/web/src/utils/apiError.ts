import type { ApiError, ApiErrorCode } from "@chatwar/shared";

export function toApiError(
  error: unknown,
  options: {
    code?: ApiErrorCode;
    message?: string;
  } = {},
): ApiError {
  // apply default error codes
  const { code = "INTERNAL", message = "An unexpected error occurred" } = options;

  // return the error if it is already an ApiError
  if (isApiError(error)) {
    return error;
  }

  // convert a native error to an ApiError
  if (error instanceof Error) {
    return {
      code,
      message: error.message || message,
    };
  }

  // return the default error code and message
  return { code, message };
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    typeof (error as Record<string, unknown>).code === "string" &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}
