function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function toUpstreamError(args: {
  message: string; // e.g. "OpenAI chat failed"
  response: Response;
}): Promise<Error> {
  // extract the error message from the response body
  const { message, response } = args;
  const text = await response.text().catch(() => "");
  let errorMessage: string | undefined;
  try {
    const parsedText: unknown = JSON.parse(text);
    if (isRecord(parsedText)) {
      const parsedError = parsedText.error;
      if (isRecord(parsedError) && typeof parsedError.message === "string") {
        errorMessage = parsedError.message;
      } else if (typeof parsedText.message === "string") {
        errorMessage = parsedText.message;
      }
    }
  } catch {
    // ignore parse errors
  }

  // return an upstream error to throw
  if (errorMessage) {
    return new Error(errorMessage);
  }
  const errorText = text ? ` - ${text}` : "";
  return new Error(`${message}: ${response.status} ${response.statusText}${errorText}`);
}
