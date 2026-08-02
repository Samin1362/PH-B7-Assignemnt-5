import { toNumber } from "@/lib/utils";
import type { GearItem, RentalOrder } from "@/types/api";

/** Orders that still need someone to act on them. */
const activeStatuses = ["CONFIRMED", "PAID", "PICKED_UP"];
const earnedStatuses = ["PAID", "PICKED_UP", "RETURNED"];

/**
 * `GET /provider/orders` returns whole orders, and the gear summary on each
 * item carries no `providerId` — so the provider's own share is worked out by
 * intersecting the item list with the ids from `GET /provider/gear`.
 */
export function providerStats(gear: GearItem[], orders: RentalOrder[]) {
  const own = new Set(gear.map((item) => item.id));

  let pending = 0;
  let active = 0;
  let earned = 0;

  for (const order of orders) {
    if (order.status === "PLACED") {
      pending += 1;
    }
    if (activeStatuses.includes(order.status)) {
      active += 1;
    }
    if (earnedStatuses.includes(order.status)) {
      for (const item of order.items) {
        if (own.has(item.gearItemId)) {
          earned += toNumber(item.subtotal);
        }
      }
    }
  }

  return {
    listed: gear.length,
    available: gear.filter((item) => item.isAvailable).length,
    outOfStock: gear.filter((item) => item.stock === 0).length,
    pending,
    active,
    earned,
  };
}
