import { ApiError } from "@/lib/api-error";
import type { ApiFailure, ApiSuccess } from "@/types/api";

export type QueryValue = string | number | boolean | undefined | null;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
};

function withQuery(path: string, query?: Record<string, QueryValue>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const suffix = search.toString();
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/api/backend${clean}${suffix ? `?${suffix}` : ""}`;
}

/**
 * Calls the GearUp API from the browser through the Next proxy, so the
 * JWT stays in an httpOnly cookie and no request is ever cross-origin.
 */
export async function clientFetch<T>(
  path: string,
  { method = "GET", body, query, signal }: RequestOptions = {},
) {
  let response: Response;
  try {
    response = await fetch(withQuery(path, query), {
      method,
      signal,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server");
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiFailure
    | null;

  if (!response.ok || !payload || payload.success === false) {
    throw new ApiError(
      response.status,
      payload?.message ?? "Something went wrong",
      (payload as ApiFailure | null)?.errorDetails,
    );
  }

  return payload;
}

/** Unwraps to `data` for the common case where `meta` is not needed. */
export async function clientFetchData<T>(
  path: string,
  options: RequestOptions = {},
) {
  const result = await clientFetch<T>(path, options);
  return result.data;
}
