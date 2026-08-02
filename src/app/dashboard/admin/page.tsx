import {
  ClipboardList,
  Package,
  ServerCrash,
  Store,
  UserX,
  Users,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/container";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { serverFetchSafe } from "@/lib/api";
import { orderGearLabel, orderRef } from "@/lib/orders";
import { formatDate, money, toNumber } from "@/lib/utils";
import type { GearItem, RentalOrder, User } from "@/types/api";

export const metadata: Metadata = {
  title: "Admin dashboard — GearUp",
};

/** No `/admin/stats` endpoint exists, so counts come from `meta.total`. */
function countOf(result: { meta?: { total: number } } | null) {
  return result?.meta?.total ?? 0;
}

const REVENUE_SAMPLE = 100;
const earnedStatuses = ["PAID", "PICKED_UP", "RETURNED"] as const;

async function Overview() {
  const [users, providers, customers, suspended, gear, rentals, recent, ...paid] =
    await Promise.all([
      serverFetchSafe<User[]>("/admin/users", { query: { limit: 1 } }),
      serverFetchSafe<User[]>("/admin/users", {
        query: { role: "PROVIDER", limit: 1 },
      }),
      serverFetchSafe<User[]>("/admin/users", {
        query: { role: "CUSTOMER", limit: 1 },
      }),
      serverFetchSafe<User[]>("/admin/users", {
        query: { status: "SUSPENDED", limit: 1 },
      }),
      serverFetchSafe<GearItem[]>("/admin/gear", { query: { limit: 1 } }),
      serverFetchSafe<RentalOrder[]>("/admin/rentals", { query: { limit: 1 } }),
      serverFetchSafe<RentalOrder[]>("/admin/rentals", { query: { limit: 5 } }),
      ...earnedStatuses.map((status) =>
        serverFetchSafe<RentalOrder[]>("/admin/rentals", {
          query: { status, limit: REVENUE_SAMPLE },
        }),
      ),
    ]);

  if (!users) {
    return (
      <EmptyState
        icon={ServerCrash}
        title="Dashboard could not be loaded"
        description="We could not reach the GearUp service. Please try again in a moment."
      />
    );
  }

  const revenue = paid.reduce(
    (sum, result) =>
      sum +
      (result?.data ?? []).reduce(
        (orderSum, order) => orderSum + toNumber(order.totalPrice),
        0,
      ),
    0,
  );
  // Revenue is summed from the orders themselves, so a status with more than
  // one page of results would be undercounted — say so rather than lie.
  const capped = paid.some((result) => countOf(result) > REVENUE_SAMPLE);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Users"
          value={countOf(users)}
          hint={`${countOf(customers)} customers · ${countOf(providers)} providers`}
          icon={Users}
        />
        <StatCard
          label="Providers"
          value={countOf(providers)}
          hint="Accounts that can list gear"
          icon={Store}
        />
        <StatCard
          label="Suspended"
          value={countOf(suspended)}
          hint="Blocked from signing in"
          icon={UserX}
        />
        <StatCard
          label="Gear listed"
          value={countOf(gear)}
          hint="Across every provider"
          icon={Package}
        />
        <StatCard
          label="Rentals"
          value={countOf(rentals)}
          hint="Bookings of any status"
          icon={ClipboardList}
        />
        <StatCard
          label="Revenue"
          value={`${capped ? "≥ " : ""}${money(revenue)}`}
          hint="Paid, picked up and returned rentals"
          icon={Wallet}
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold">Latest rentals</h2>
          <Link
            href="/dashboard/admin/rentals"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>

        {(recent?.data ?? []).length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No rentals yet"
            description="Bookings will appear here as soon as customers start renting."
          />
        ) : (
          <ul className="space-y-3">
            {(recent?.data ?? []).map((order) => (
              <li key={order.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium tabular-nums">
                        {orderRef(order.id)}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {order.customer?.name ?? "Unknown"} ·{" "}
                        {orderGearLabel(order)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold tabular-nums">
                        {money(order.totalPrice)}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="Users, listings and bookings across the whole of GearUp."
      />

      <Suspense fallback={<OverviewSkeleton />}>
        <Overview />
      </Suspense>
    </div>
  );
}
