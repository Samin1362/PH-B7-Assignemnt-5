import { PackageOpen, ServerCrash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { UrlPagination } from "@/components/dashboard/pagination";
import { PageHeader } from "@/components/layout/container";
import { OrderList, OrderListSkeleton } from "@/components/rental/order-list";
import { OrderStatusFilter } from "@/components/rental/order-status-filter";
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
import type { RentalOrder } from "@/types/api";

export const metadata: Metadata = {
  title: "My rentals — GearUp",
};

async function Orders({ filters }: { filters: OrderFilters }) {
  const result = await serverFetchSafe<RentalOrder[]>("/rentals");

  if (!result) {
    return (
      <EmptyState
        icon={ServerCrash}
        title="Rentals could not be loaded"
        description="We could not reach the GearUp service. Please try again in a moment."
      />
    );
  }

  const orders = result.data;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="No rentals yet"
        description="Once you book gear it will show up here with its status and payment."
        action={
          <Button asChild>
            <Link href="/gear">Browse gear</Link>
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
          title={`No ${filters.status ? rentalStatusMeta[filters.status].label.toLowerCase() : "matching"} rentals`}
          description="Nothing here right now. Try another status."
          action={
            <Button asChild variant="outline">
              <Link href="/dashboard/customer/orders">Show all rentals</Link>
            </Button>
          }
        />
      ) : (
        <>
          <OrderList orders={items} />
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
      <OrderListSkeleton />
    </div>
  );
}

export default async function CustomerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<OrderSearchParams>;
}) {
  const filters = parseOrderFilters(await searchParams);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My rentals"
        description="Every booking you have made, newest first."
      />

      {/* Keyed so switching status shows the skeleton, not a stale list. */}
      <Suspense key={orderFiltersKey(filters)} fallback={<OrdersSkeleton />}>
        <Orders filters={filters} />
      </Suspense>
    </div>
  );
}
