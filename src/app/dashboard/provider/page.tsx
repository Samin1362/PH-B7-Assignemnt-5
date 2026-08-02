import {
  ClipboardList,
  Package,
  PackagePlus,
  ServerCrash,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/container";
import { GearImage } from "@/components/gear/gear-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { serverFetchSafe } from "@/lib/api";
import { providerStats } from "@/lib/provider";
import { getSession } from "@/lib/session";
import { money } from "@/lib/utils";
import type { GearItem, RentalOrder } from "@/types/api";

export const metadata: Metadata = {
  title: "Provider dashboard — GearUp",
};

async function Overview() {
  const [gearResult, orderResult] = await Promise.all([
    serverFetchSafe<GearItem[]>("/provider/gear"),
    serverFetchSafe<RentalOrder[]>("/provider/orders"),
  ]);

  if (!gearResult) {
    return (
      <EmptyState
        icon={ServerCrash}
        title="Dashboard could not be loaded"
        description="We could not reach the GearUp service. Please try again in a moment."
      />
    );
  }

  const gear = gearResult.data;
  const orders = orderResult?.data ?? [];
  const stats = providerStats(gear, orders);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Gear listed"
          value={stats.listed}
          hint={`${stats.available} available${stats.outOfStock ? ` · ${stats.outOfStock} out of stock` : ""}`}
          icon={Package}
        />
        <StatCard
          label="Pending orders"
          value={stats.pending}
          hint="Waiting for you to confirm"
          icon={ClipboardList}
        />
        <StatCard
          label="Active rentals"
          value={stats.active}
          hint="Confirmed, paid or picked up"
          icon={ClipboardList}
        />
        <StatCard
          label="Earnings"
          value={money(stats.earned)}
          hint="Your items on paid rentals"
          icon={Wallet}
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold">Your gear</h2>
          {gear.length > 0 ? (
            <Link
              href="/dashboard/provider/gear"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Manage all
            </Link>
          ) : null}
        </div>

        {gear.length === 0 ? (
          <EmptyState
            icon={PackagePlus}
            title="No gear listed yet"
            description="Add your first item to start receiving rental requests."
            action={
              <Button asChild>
                <Link href="/dashboard/provider/gear/new">Add gear</Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gear.slice(0, 6).map((item) => (
              <li key={item.id}>
                <Card>
                  <CardContent className="flex items-center gap-3">
                    <div className="relative aspect-4/3 w-20 shrink-0 overflow-hidden rounded-lg border border-border">
                      <GearImage src={item.images[0]} alt={item.name} sizes="80px" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/provider/gear/${item.id}/edit`}
                        className="block truncate font-medium underline-offset-4 hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground tabular-nums">
                        {money(item.pricePerDay)} / day · {item.stock} in stock
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.isAvailable ? "Available" : "Hidden"}
                      </p>
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default async function ProviderOverviewPage() {
  const user = await getSession();

  return (
    <div className="space-y-6">
      <PageHeader
        title={user ? `Welcome back, ${user.name.split(" ")[0]}` : "Welcome back"}
        description="Your listings, orders and earnings at a glance."
        action={
          <Button asChild>
            <Link href="/dashboard/provider/gear/new">
              <PackagePlus />
              Add gear
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<OverviewSkeleton />}>
        <Overview />
      </Suspense>
    </div>
  );
}
