type ErrorWithMessage = {
  message?: unknown;
  error?: unknown;
};

export function toErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as ErrorWithMessage;
    if (typeof candidate.message === "string" && candidate.message.trim().length > 0) {
      return candidate.message;
    }
    if (typeof candidate.error === "string" && candidate.error.trim().length > 0) {
      return candidate.error;
    }
  }

  return fallback;
}

export function reportClientError(context: string, error: unknown): void {
  console.error(context, error);
}

export function getRtkErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  const msg = toErrorMessage(error, '');
  return msg || undefined;
}
