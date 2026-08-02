import "server-only";

import { cache } from "react";
import { serverFetch } from "@/lib/api";
import { toApiError } from "@/lib/api-error";
import type { RentalOrder } from "@/types/api";

export type OrderLookup =
  | { status: "ok"; order: RentalOrder }
  | { status: "missing" }
  | { status: "error" };

/**
 * A malformed id is a 400 and someone else's order is a 403, and neither
 * should confirm that the order exists — so every 4xx becomes a 404.
 * Cached per request so `generateMetadata` and the page body share one call.
 */
export const loadOrder = cache(async (id: string): Promise<OrderLookup> => {
  try {
    const result = await serverFetch<RentalOrder>(`/rentals/${id}`);
    return { status: "ok", order: result.data };
  } catch (error) {
    const { status } = toApiError(error);
    return status >= 400 && status < 500
      ? { status: "missing" }
      : { status: "error" };
  }
});
