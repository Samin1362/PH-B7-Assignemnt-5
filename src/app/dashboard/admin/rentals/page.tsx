import { ClipboardList, ServerCrash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminSelect } from "@/components/admin/admin-filters";
import { EmptyState } from "@/components/dashboard/empty-state";
import { UrlPagination } from "@/components/dashboard/pagination";
import {
  PaymentStatusBadge,
  StatusBadge,
} from "@/components/dashboard/status-badge";
import { PageHeader } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { rentalStatuses, rentalStatusMeta } from "@/constants/status";
import { serverFetchSafe } from "@/lib/api";
import {
  ADMIN_PAGE_SIZE,
  filtersKey,
  parseAdminRentalFilters,
  type AdminSearchParams,
} from "@/lib/admin";
import { orderGearLabel, orderRef } from "@/lib/orders";
import { formatDate, formatRentalRange, money } from "@/lib/utils";
import type { RentalOrder } from "@/types/api";

export const metadata: Metadata = {
  title: "All rentals — GearUp",
};

type Filters = ReturnType<typeof parseAdminRentalFilters>;

async function RentalTable({ filters }: { filters: Filters }) {
  const result = await serverFetchSafe<RentalOrder[]>("/admin/rentals", {
    query: {
      status: filters.status ?? undefined,
      page: filters.page,
      limit: ADMIN_PAGE_SIZE,
    },
  });

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
        icon={ClipboardList}
        title="No rentals match this status"
        description="Try another status filter."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/rentals">Show all rentals</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Gear</TableHead>
              <TableHead>Rental period</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/50">
                <TableCell>
                  <p className="font-medium tabular-nums">
                    {orderRef(order.id)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </TableCell>
                <TableCell className="max-w-40">
                  <p className="truncate text-sm">
                    {order.customer?.name ?? "Unknown"}
                  </p>
                  {order.customer?.email ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {order.customer.email}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell className="max-w-48 truncate">
                  {orderGearLabel(order)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatRentalRange(order.startDate, order.endDate)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(order.totalPrice)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  {order.payment ? (
                    <PaymentStatusBadge status={order.payment.status} />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Not started
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {orders.map((order) => (
          <li
            key={order.id}
            className="space-y-2 rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium tabular-nums">
                {orderRef(order.id)}
              </span>
              <StatusBadge status={order.status} />
            </div>
            <p className="truncate text-sm">{orderGearLabel(order)}</p>
            <p className="text-xs text-muted-foreground">
              {order.customer?.name ?? "Unknown"} ·{" "}
              {formatRentalRange(order.startDate, order.endDate)}
            </p>
            <p className="font-semibold tabular-nums">
              {money(order.totalPrice)}
            </p>
          </li>
        ))}
      </ul>

      <UrlPagination
        page={filters.page}
        limit={ADMIN_PAGE_SIZE}
        total={result.meta?.total ?? orders.length}
      />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default async function AdminRentalsPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const filters = parseAdminRentalFilters(await searchParams);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All rentals"
        description="Every booking on the platform, newest first."
      />

      <AdminSelect
        label="All statuses"
        param="status"
        value={filters.status}
        options={rentalStatuses.map((status) => ({
          value: status,
          label: rentalStatusMeta[status].label,
        }))}
      />

      <Suspense key={filtersKey(filters)} fallback={<TableSkeleton />}>
        <RentalTable filters={filters} />
      </Suspense>
    </div>
  );
}
