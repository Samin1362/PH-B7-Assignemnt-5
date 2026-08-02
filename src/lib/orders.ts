import { rentalStatuses, type RentalStatus } from "@/constants/status";
import { toNumber } from "@/lib/utils";
import type { RentalOrder } from "@/types/api";

export const ORDERS_PAGE_SIZE = 10;

/** Everything that still needs the customer or the provider to do something. */
export const activeStatuses: RentalStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PAID",
  "PICKED_UP",
];

export type OrderFilters = {
  status: RentalStatus | null;
  page: number;
};

export type OrderSearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseOrderFilters(params: OrderSearchParams): OrderFilters {
  const status = single(params.status);
  const page = Number(single(params.page));

  return {
    status: rentalStatuses.includes(status as RentalStatus)
      ? (status as RentalStatus)
      : null,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function orderFiltersKey({ status, page }: OrderFilters) {
  return `${status ?? "all"}|${page}`;
}

export function filterOrders(orders: RentalOrder[], status: RentalStatus | null) {
  return status ? orders.filter((order) => order.status === status) : orders;
}

/**
 * `GET /rentals` has no paging of its own, so the list is sliced here. An
 * out-of-range page is clamped to the last one instead of rendering empty.
 */
export function paginateOrders<T>(items: T[], page: number, size = ORDERS_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * size;

  return { page: current, totalPages, items: items.slice(start, start + size) };
}

export function countByStatus(orders: RentalOrder[]) {
  const counts = {} as Record<RentalStatus, number>;
  for (const status of rentalStatuses) {
    counts[status] = 0;
  }
  for (const order of orders) {
    counts[order.status] += 1;
  }
  return counts;
}

/**
 * `GET /rentals` returns every order with no meta, so the KPIs are derived
 * from that one list instead of extra count calls.
 */
export function orderStats(orders: RentalOrder[]) {
  let active = 0;
  let spent = 0;
  let dueCount = 0;
  let dueAmount = 0;

  for (const order of orders) {
    if (activeStatuses.includes(order.status)) {
      active += 1;
    }
    if (order.payment?.status === "COMPLETED") {
      spent += toNumber(order.payment.amount);
    }
    if (order.status === "CONFIRMED") {
      dueCount += 1;
      dueAmount += toNumber(order.totalPrice);
    }
  }

  return { total: orders.length, active, spent, dueCount, dueAmount };
}

export function orderRef(id: string) {
  return `#${id.slice(0, 8)}`;
}

export function orderGearLabel(order: RentalOrder) {
  const first = order.items[0]?.gearItem?.name ?? "Gear";
  const extra = order.items.length - 1;
  return extra > 0 ? `${first} +${extra} more` : first;
}
