export type ApiErrorCode =
  | "BAD_REQUEST"
  | "INVALID_API_KEY"
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "PROVIDER_FAILED"
  | "TIMEOUT"
  | "INTERNAL";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  retryable?: boolean;
  details?: Record<string, unknown>;
};
