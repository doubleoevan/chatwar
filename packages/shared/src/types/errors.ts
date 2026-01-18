export const API_ERROR_CODES = [
  "BAD_REQUEST",
  "INVALID_API_KEY",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "PAYMENT_REQUIRED",
  "UPSTREAM_UNAVAILABLE",
  "INVALID_MESSAGE",
  "MISSING_MODEL",
  "PROVIDER_FAILED",
  "TIMEOUT",
  "INTERNAL",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  retryable?: boolean;
  details?: Record<string, unknown>;
};
