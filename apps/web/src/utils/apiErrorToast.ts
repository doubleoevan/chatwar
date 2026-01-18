import type { ApiError } from "@chatwar/shared";

export type ApiErrorToast = {
  title: string;
  description: string;
  debug?: string;
};

export function toApiErrorToast(error: ApiError): ApiErrorToast {
  const { code, message: debug } = error;
  switch (code) {
    case "INVALID_API_KEY":
      return {
        title: "Invalid API key",
        description: "Double-check the key and try again.",
        debug,
      };
    case "UNAUTHORIZED":
      return {
        title: "Unauthorized",
        description: "This key doesn’t have access for that provider.",
        debug,
      };
    case "RATE_LIMITED":
      return {
        title: "Rate limited",
        description: "Too many requests. Try again in a moment.",
        debug,
      };
    case "TIMEOUT":
      return {
        title: "Request timed out",
        description: "The provider took too long to respond.",
        debug,
      };
    default:
      return {
        title: error.message,
        description: "",
      };
  }
}
