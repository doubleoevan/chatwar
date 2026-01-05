import { toast } from "sonner";
import type { ApiError } from "@chatwar/shared";
import { toApiErrorToast } from "@/utils/apiErrorToast";
import { ReactNode } from "react";

export function toastApiError(
  error: ApiError,
  {
    id,
    providerId,
    icon,
    metadata = {},
  }: {
    id?: string;
    providerId?: string;
    icon?: ReactNode;
    metadata?: Record<string, unknown>;
  } = {},
) {
  // log the error
  const { title, description, debug } = toApiErrorToast(error);
  console.error("[ChatWar ApiError]", {
    code: error.code,
    message: error.message,
    metadata,
    debug,
  });

  // dedupe toasts using the same id for a provider and error code
  const toastId = id ?? `${providerId ?? "global"}:${error.code}`;

  // show the error toast
  const toastDescription = toToastDescription({ description, debug });
  toast.error(title, {
    icon,
    id: toastId,
    description: toastDescription,
  });
}

function toToastDescription({ description, debug }: { description: string; debug?: string }) {
  // show the description only in prod
  if (!import.meta.env.DEV || !debug) {
    return description;
  }

  // log the debug message and show the description and debug message in dev mode
  console.debug("[ChatWar ApiError Debug]", debug);
  return (
    <div className="space-y-1">
      <div>{description}</div>
      <div className="text-xs opacity-70 font-mono">Debug: {debug}</div>
    </div>
  );
}
