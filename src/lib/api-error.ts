import type { ZodIssue } from "@/types/api";

const wrappers = new Set(["body", "params", "query"]);

export class ApiError extends Error {
  status: number;
  errorDetails?: unknown;

  constructor(status: number, message: string, errorDetails?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorDetails = errorDetails;
  }

  /** Zod issues from the backend, keyed by form field name. */
  get fieldErrors(): Record<string, string> {
    if (!Array.isArray(this.errorDetails)) {
      return {};
    }

    const errors: Record<string, string> = {};
    for (const issue of this.errorDetails as ZodIssue[]) {
      const path = issue.path?.filter(
        (segment) => !wrappers.has(String(segment)),
      );
      const field = path?.join(".");
      if (field && !errors[field]) {
        errors[field] = issue.message;
      }
    }
    return errors;
  }
}

export function toApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof Error) {
    return new ApiError(0, error.message, { name: error.name });
  }
  return new ApiError(0, "Something went wrong");
}

export function errorMessage(error: unknown) {
  const apiError = toApiError(error);
  if (apiError.status === 0) {
    return "Cannot reach the server. Check your connection and try again.";
  }
  return apiError.message;
}
