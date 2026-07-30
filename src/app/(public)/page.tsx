import {
  ArrowRight,
  CalendarRange,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { GearCard, GearGridSkeleton } from "@/components/gear/gear-card";
import { GearSearch } from "@/components/gear/gear-search";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { serverFetchSafe } from "@/lib/api";
import type { Category, GearItem } from "@/types/api";

const steps = [
  {
    icon: CalendarRange,
    title: "Find your gear",
    body: "Search by category, brand or price, then pick the dates you need it for.",
  },
  {
    icon: ShieldCheck,
    title: "Book and pay securely",
    body: "The provider confirms your order and you pay by card through Stripe.",
  },
  {
    icon: PackageCheck,
    title: "Collect and return",
    body: "Pick the gear up, enjoy the trip, return it and leave a review.",
  },
];

const perks = [
  { icon: Truck, title: "Local providers", body: "Rent from vetted shops near you" },
  { icon: CalendarRange, title: "Daily pricing", body: "Pay only for the days you book" },
  { icon: ShieldCheck, title: "Secure checkout", body: "Card payments handled by Stripe" },
];

async function FeaturedGear() {
  const result = await serverFetchSafe<GearItem[]>("/gear", {
    query: { limit: 8, sortBy: "createdAt", sortOrder: "desc" },
    auth: false,
  });

  if (!result || result.data.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
        Gear listings are unavailable right now. Please try again shortly.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {result.data.map((gear, index) => (
        <GearCard key={gear.id} gear={gear} priority={index < 4} />
      ))}
    </div>
  );
}

async function CategoryTiles() {
  const result = await serverFetchSafe<Category[]>("/categories", {
    auth: false,
  });

  if (!result || result.data.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {result.data.map((category) => (
        <Link
          key={category.id}
          href={`/gear?categoryId=${category.id}`}
          className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <p className="font-semibold group-hover:text-primary">
            {category.name}
          </p>
          {category.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {category.description}
            </p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="space-y-2 rounded-2xl border border-border bg-card p-5"
        >
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="border-b border-border bg-linear-to-b from-primary/8 to-transparent">
        <Container className="py-16 sm:py-24">
          <p className="font-medium text-primary">Sports &amp; outdoor rentals</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl lg:text-6xl">
            Rent the gear. Skip the garage.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Tents, kayaks, snowboards and bikes from trusted local providers —
            booked by the day and paid for securely.
          </p>

          <div className="mt-8">
            <GearSearch />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/gear">
                Browse all gear
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">List your gear</Link>
            </Button>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-3">
            {perks.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Browse by category
            </h2>
            <p className="mt-1 text-muted-foreground">
              Pick a category to see what is available.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <Suspense fallback={<CategorySkeleton />}>
            <CategoryTiles />
          </Suspense>
        </div>
      </Container>

      <section className="border-y border-border bg-muted/40">
        <Container className="py-16 sm:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Newly listed gear
              </h2>
              <p className="mt-1 text-muted-foreground">
                The latest equipment added by our providers.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/gear">
                View all
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-8">
            <Suspense fallback={<GearGridSkeleton />}>
              <FeaturedGear />
            </Suspense>
          </div>
        </Container>
      </section>

      <Container id="how-it-works" className="scroll-mt-20 py-16 sm:py-20">
        <h2 className="text-2xl font-semibold sm:text-3xl">How GearUp works</h2>
        <p className="mt-1 text-muted-foreground">
          Three steps from browsing to your next trip.
        </p>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <li key={title} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <p className="mt-4 text-sm font-medium text-primary">
                Step {index + 1}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </Container>

      <Container className="pb-20">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-primary p-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Own gear that sits idle?
            </h2>
            <p className="mt-2 max-w-xl opacity-90">
              List it on GearUp, set your daily price and manage every booking
              from one dashboard.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <Link href="/register">
              Become a provider
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </Container>
    </>
  );
}
