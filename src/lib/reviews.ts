import "server-only";

import { serverFetchSafe } from "@/lib/api";
import type { GearReviews, RentalOrder, Review } from "@/types/api";

export type ReviewableItem = {
  gearItemId: string;
  gearName: string;
  rentalOrderId: string;
  returnedAt: string;
};

export function reviewKey(gearItemId: string, rentalOrderId: string) {
  return `${gearItemId}|${rentalOrderId}`;
}

/** One entry per gear item in a returned rental — the reviewable set. */
export function reviewableItems(orders: RentalOrder[]): ReviewableItem[] {
  return orders
    .filter((order) => order.status === "RETURNED")
    .flatMap((order) =>
      order.items.map((item) => ({
        gearItemId: item.gearItemId,
        gearName: item.gearItem?.name ?? "Gear item",
        rentalOrderId: order.id,
        returnedAt: order.updatedAt,
      })),
    );
}

/** Splits the reviewable set into what still needs a review and what has one. */
export function splitReviews(
  items: ReviewableItem[],
  mine: Map<string, Review>,
) {
  const pending: ReviewableItem[] = [];
  const written: { item: ReviewableItem; review: Review }[] = [];

  for (const item of items) {
    const review = mine.get(reviewKey(item.gearItemId, item.rentalOrderId));
    if (review) {
      written.push({ item, review });
    } else {
      pending.push(item);
    }
  }

  return { pending, written };
}

/**
 * The API has no "my reviews" endpoint, so a customer's own reviews are
 * gathered from the public per-gear lists — one call per distinct gear item
 * in their returned rentals, run in parallel. Keyed by gear + order because
 * the same gear can be rented, and reviewed, more than once.
 */
export async function loadMyReviews(gearIds: string[], customerId: string) {
  const unique = [...new Set(gearIds)];

  const lists = await Promise.all(
    unique.map(async (gearItemId) => {
      const result = await serverFetchSafe<GearReviews>(
        `/gear/${gearItemId}/reviews`,
        { auth: false },
      );
      return result?.data?.reviews ?? [];
    }),
  );

  const mine = new Map<string, Review>();
  for (const reviews of lists) {
    for (const review of reviews) {
      if (review.customerId === customerId) {
        mine.set(reviewKey(review.gearItemId, review.rentalOrderId), review);
      }
    }
  }

  return mine;
}
