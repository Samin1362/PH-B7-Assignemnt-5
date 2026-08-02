import { PackageOpen, ServerCrash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { UrlPagination } from "@/components/dashboard/pagination";
import { GearCard, GearGridSkeleton } from "@/components/gear/gear-card";
import { GearFilterSidebar } from "@/components/gear/gear-filters";
import type { GearFilterOptions } from "@/components/gear/gear-filters";
import { GearToolbar } from "@/components/gear/gear-toolbar";
import { Container, PageHeader } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { serverFetchSafe } from "@/lib/api";
import {
  GEAR_PAGE_SIZE,
  gearFiltersKey,
  parseGearFilters,
  toGearQuery,
  type GearFilters,
  type GearSearchParams,
} from "@/lib/gear-filters";
import type { Category, GearItem } from "@/types/api";

export const metadata: Metadata = {
  title: "Browse Gear — GearUp",
  description:
    "Search tents, kayaks, bikes and snowboards from trusted local providers. Filter by category, brand, price and availability.",
};

const gridClass = "grid gap-5 sm:grid-cols-2 xl:grid-cols-3";

/**
 * The API's brand filter is an exact match, so the options come from the
 * catalogue itself. `limit` is capped at 100 by the API — brands only found on
 * gear beyond that point will be missing from the list.
 */
async function loadFilterOptions(): Promise<GearFilterOptions> {
  const [categories, gear] = await Promise.all([
    serverFetchSafe<Category[]>("/categories", { auth: false }),
    serverFetchSafe<GearItem[]>("/gear", {
      query: { limit: 100 },
      auth: false,
    }),
  ]);

  const brands = [
    ...new Set(
      (gear?.data ?? [])
        .map((item) => item.brand)
        .filter((brand): brand is string => Boolean(brand)),
    ),
  ].sort();

  return {
    categories: (categories?.data ?? []).map(({ id, name }) => ({ id, name })),
    brands,
  };
}

async function GearResults({ filters }: { filters: GearFilters }) {
  const result = await serverFetchSafe<GearItem[]>("/gear", {
    query: toGearQuery(filters),
    auth: false,
  });

  if (!result) {
    return (
      <EmptyState
        icon={ServerCrash}
        title="Gear could not be loaded"
        description="We could not reach the GearUp service. Please try again in a moment."
        action={
          <Button asChild variant="outline">
            <Link href="/gear">Try again</Link>
          </Button>
        }
      />
    );
  }

  const total = result.meta?.total ?? result.data.length;

  if (result.data.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="No gear matches your filters"
        description="Try widening the price range, picking another category or clearing the search."
        action={
          <Button asChild variant="outline">
            <Link href="/gear">Clear all filters</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">{total}</span>{" "}
        {total === 1 ? "item" : "items"} available
      </p>

      <div className={gridClass}>
        {result.data.map((gear, index) => (
          <GearCard key={gear.id} gear={gear} priority={index < 3} />
        ))}
      </div>

      <UrlPagination
        page={result.meta?.page ?? filters.page}
        limit={result.meta?.limit ?? GEAR_PAGE_SIZE}
        total={total}
      />
    </div>
  );
}

export default async function GearPage({
  searchParams,
}: {
  searchParams: Promise<GearSearchParams>;
}) {
  const filters = parseGearFilters(await searchParams);
  const options = await loadFilterOptions();

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        title="Browse gear"
        description="Everything our providers have listed, ready to book by the day."
      />

      <div className="mt-8 space-y-6">
        <GearToolbar filters={filters} options={options} />

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <GearFilterSidebar filters={filters} options={options} />
          <Suspense
            key={gearFiltersKey(filters)}
            fallback={<GearGridSkeleton count={6} className={gridClass} />}
          >
            <GearResults filters={filters} />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
