import { ClipboardList, ServerCrash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { UrlPagination } from "@/components/dashboard/pagination";
import { PageHeader } from "@/components/layout/container";
import { OrderStatusFilter } from "@/components/rental/order-status-filter";
import {
  ProviderOrderList,
  ProviderOrderListSkeleton,
} from "@/components/rental/provider-order-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { rentalStatusMeta } from "@/constants/status";
import { serverFetchSafe } from "@/lib/api";
import {
  countByStatus,
  filterOrders,
  orderFiltersKey,
  ORDERS_PAGE_SIZE,
  paginateOrders,
  parseOrderFilters,
  type OrderFilters,
  type OrderSearchParams,
} from "@/lib/orders";
import type { GearItem, RentalOrder } from "@/types/api";

export const metadata: Metadata = {
  title: "Orders — GearUp",
};

async function Orders({ filters }: { filters: OrderFilters }) {
  const [orderResult, gearResult] = await Promise.all([
    serverFetchSafe<RentalOrder[]>("/provider/orders"),
    serverFetchSafe<GearItem[]>("/provider/gear"),
  ]);

  if (!orderResult) {
    return (
      <EmptyState
        icon={ServerCrash}
        title="Orders could not be loaded"
        description="We could not reach the GearUp service. Please try again in a moment."
      />
    );
  }

  const orders = orderResult.data;
  // The order payload never says which lines are this provider's, so the
  // gear list is what makes "your gear" and "your share" possible.
  const own = new Set((gearResult?.data ?? []).map((gear) => gear.id));

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No orders yet"
        description="When someone books your gear the request will land here for you to confirm."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/provider/gear">Manage my gear</Link>
          </Button>
        }
      />
    );
  }

  const filtered = filterOrders(orders, filters.status);
  const { page, items } = paginateOrders(filtered, filters.page);

  return (
    <div className="space-y-6">
      <OrderStatusFilter
        counts={countByStatus(orders)}
        active={filters.status}
        total={orders.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={`No ${filters.status ? rentalStatusMeta[filters.status].label.toLowerCase() : "matching"} orders`}
          description="Nothing here right now. Try another status."
          action={
            <Button asChild variant="outline">
              <Link href="/dashboard/provider/orders">Show all orders</Link>
            </Button>
          }
        />
      ) : (
        <>
          <ProviderOrderList orders={items} own={own} />
          <UrlPagination
            page={page}
            limit={ORDERS_PAGE_SIZE}
            total={filtered.length}
          />
        </>
      )}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <ProviderOrderListSkeleton />
    </div>
  );
}

export default async function ProviderOrdersPage({
  searchParams,
}: {
  searchParams: Promise<OrderSearchParams>;
}) {
  const filters = parseOrderFilters(await searchParams);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Every booking that includes your gear, newest first."
      />

      <Suspense key={orderFiltersKey(filters)} fallback={<OrdersSkeleton />}>
        <Orders filters={filters} />
      </Suspense>
    </div>
  );
}
