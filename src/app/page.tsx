import { CalendarDays, PackageOpen, Tent } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { rentalStatuses } from "@/constants/status";
import { money } from "@/lib/utils";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-12 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <section className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-primary">GearUp</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
            Rent sports &amp; outdoor gear instantly
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Browse gear from trusted local providers, pick your dates, and pay
            securely.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg">Browse gear</Button>
            <Button size="lg" variant="outline">
              Become a provider
            </Button>
            <Input className="max-w-56" placeholder="Search gear…" />
          </div>
        </div>
        <ThemeToggle />
      </section>

      <section className="flex flex-wrap gap-2">
        {rentalStatuses.map((status) => (
          <StatusBadge key={status} status={status} />
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active rentals" value={4} icon={Tent} />
        <StatCard label="Total spent" value={money(482.5)} icon={CalendarDays} />
        <StatCard
          label="Awaiting payment"
          value={1}
          hint="Confirmed orders"
          icon={PackageOpen}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Camping tent", "Mountain bike", "Kayak"].map((name, index) => (
          <Card
            key={name}
            className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <CardHeader>
              <CardTitle>{name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                Available from trusted providers
              </p>
              <p className="font-semibold tabular-nums text-primary">
                {money(24.5 * (index + 1))}
                <span className="text-muted-foreground"> / day</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <EmptyState
          title="No rentals yet"
          description="Once you rent gear, your orders show up here."
          action={<Button>Browse gear</Button>}
        />
        <Card>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
