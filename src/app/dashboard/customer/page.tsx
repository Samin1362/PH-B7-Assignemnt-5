import {
  CreditCard,
  PackageOpen,
  ServerCrash,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/container";
import { OrderList, OrderListSkeleton } from "@/components/rental/order-list";
import { Button } from "@/components/ui/button";
import { serverFetchSafe } from "@/lib/api";
import { orderStats } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { money } from "@/lib/utils";
import type { RentalOrder } from "@/types/api";

export const metadata: Metadata = {
  title: "Dashboard — GearUp",
};

async function Overview() {
  const result = await serverFetchSafe<RentalOrder[]>("/rentals");

  if (!result) {
    return (
      <EmptyState
        icon={ServerCrash}
        title="Dashboard could not be loaded"
        description="We could not reach the GearUp service. Please try again in a moment."
      />
    );
  }

  const orders = result.data;
  const stats = orderStats(orders);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Active rentals"
          value={stats.active}
          hint={`${stats.total} booking${stats.total === 1 ? "" : "s"} in total`}
          icon={ShoppingBag}
        />
        <StatCard
          label="Total spent"
          value={money(stats.spent)}
          hint="Completed payments only"
          icon={Wallet}
        />
        <StatCard
          label="Awaiting payment"
          value={money(stats.dueAmount)}
          hint={
            stats.dueCount
              ? `${stats.dueCount} confirmed order${stats.dueCount === 1 ? "" : "s"} ready to pay`
              : "Nothing due right now"
          }
          icon={CreditCard}
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold">Recent rentals</h2>
          {orders.length > 0 ? (
            <Link
              href="/dashboard/customer/orders"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="No rentals yet"
            description="Book your first piece of gear and it will appear here."
            action={
              <Button asChild>
                <Link href="/gear">Browse gear</Link>
              </Button>
            }
          />
        ) : (
          <OrderList orders={orders.slice(0, 5)} />
        )}
      </section>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <OrderListSkeleton />
    </div>
  );
}

export default async function CustomerOverviewPage() {
  const user = await getSession();

  return (
    <div className="space-y-6">
      <PageHeader
        title={user ? `Welcome back, ${user.name.split(" ")[0]}` : "Welcome back"}
        description="Your rentals, payments and gear at a glance."
        action={
          <Button asChild>
            <Link href="/gear">Browse gear</Link>
          </Button>
        }
      />

      <Suspense fallback={<OverviewSkeleton />}>
        <Overview />
      </Suspense>
    </div>
  );
}
