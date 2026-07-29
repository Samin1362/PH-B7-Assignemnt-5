import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { toApiError } from "@/lib/api-error";

/**
 * Turns a failed request into UI feedback: backend Zod issues become inline
 * field errors, everything else becomes a toast.
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
) {
  const apiError = toApiError(error);
  const fieldErrors = apiError.fieldErrors;
  let matched = false;

  for (const field of fields) {
    const message = fieldErrors[field as string];
    if (message) {
      setError(field, { type: "server", message });
      matched = true;
    }
  }

  if (!matched) {
    toast.error(
      apiError.status === 0
        ? "Cannot reach the server. Check your connection and try again."
        : apiError.message,
    );
  }
}
