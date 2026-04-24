export function getErrorMessage(error: unknown, fallback = "Operation failed.") {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (error && typeof error === "object") {
    const candidate = (error as { message?: unknown }).message;

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return fallback;
}

export function toError(error: unknown, fallback = "Operation failed.") {
  return new Error(getErrorMessage(error, fallback));
}
