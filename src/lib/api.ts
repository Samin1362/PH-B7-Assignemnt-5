import "server-only";

import { cookies } from "next/headers";
import { ApiError } from "@/lib/api-error";
import { serverEnv } from "@/lib/env";
import type { ApiFailure, ApiSuccess } from "@/types/api";

export type QueryValue = string | number | boolean | undefined | null;

export function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(
    `${serverEnv.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`,
  );
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function getAuthToken() {
  const store = await cookies();
  return store.get(serverEnv.authCookieName)?.value;
}

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, QueryValue>;
  auth?: boolean;
};

/**
 * Calls the GearUp API from the server and unwraps its envelope.
 * Any non-2xx response becomes an ApiError carrying the backend's
 * `message` and `errorDetails` untouched.
 */
export async function serverFetch<T>(
  path: string,
  { body, query, auth = true, headers, ...init }: FetchOptions = {},
) {
  const token = auth ? await getAuthToken() : undefined;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      cache: init.cache ?? "no-store",
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
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

/** Same as `serverFetch` but returns `null` instead of throwing. */
export async function serverFetchSafe<T>(
  path: string,
  options: FetchOptions = {},
) {
  try {
    return await serverFetch<T>(path, options);
  } catch {
    return null;
  }
}
