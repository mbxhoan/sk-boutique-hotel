import { NextResponse } from "next/server";

type ErrorLike = {
  message?: string;
  stack?: string;
  name?: string;
};

type ApiErrorResponseOptions = {
  context: Record<string, unknown>;
  error: unknown;
  fallbackMessage: string;
  scope: string;
  status?: number;
};

function toErrorLike(error: unknown): ErrorLike {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack
    };
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as Record<string, unknown>;

    return {
      message: typeof maybeError.message === "string" ? maybeError.message : undefined,
      name: typeof maybeError.name === "string" ? maybeError.name : undefined,
      stack: typeof maybeError.stack === "string" ? maybeError.stack : undefined
    };
  }

  return {
    message: typeof error === "string" ? error : undefined
  };
}

function resolveStatus(message: string, fallbackStatus: number) {
  const normalized = message.toLowerCase();

  if (normalized.includes("unauthorized") || normalized.includes("session has expired")) {
    return 401;
  }

  if (normalized.includes("not found")) {
    return 404;
  }

  if (normalized.includes("no rooms are available") || normalized.includes("sold out")) {
    return 409;
  }

  if (
    normalized.includes("missing required") ||
    normalized.includes("invalid") ||
    normalized.includes("please enter") ||
    normalized.includes("must be") ||
    normalized.includes("cannot")
  ) {
    return 400;
  }

  return fallbackStatus;
}

export function logApiError(scope: string, error: unknown, context: Record<string, unknown>) {
  const details = toErrorLike(error);

  console.error(`[${scope}] request failed`, {
    context,
    error: details
  });
}

export function jsonApiErrorResponse({
  context,
  error,
  fallbackMessage,
  scope,
  status = 400
}: ApiErrorResponseOptions) {
  const details = toErrorLike(error);
  const rawMessage = details.message?.trim();
  const message = rawMessage ? `${fallbackMessage}: ${rawMessage}` : fallbackMessage;
  const resolvedStatus = resolveStatus(rawMessage ?? fallbackMessage, status);

  logApiError(scope, error, context);

  return NextResponse.json({ error: message }, { status: resolvedStatus });
}
