import { Package, ServerCrash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminSearch, AdminSelect } from "@/components/admin/admin-filters";
import { EmptyState } from "@/components/dashboard/empty-state";
import { UrlPagination } from "@/components/dashboard/pagination";
import { GearImage } from "@/components/gear/gear-image";
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
import { toneClasses } from "@/constants/status";
import { serverFetchSafe } from "@/lib/api";
import {
  ADMIN_PAGE_SIZE,
  filtersKey,
  parseAdminGearFilters,
  type AdminSearchParams,
} from "@/lib/admin";
import { cn, money } from "@/lib/utils";
import type { Category, GearItem } from "@/types/api";

export const metadata: Metadata = {
  title: "All gear — GearUp",
};

type Filters = ReturnType<typeof parseAdminGearFilters>;

async function GearTable({ filters }: { filters: Filters }) {
  const result = await serverFetchSafe<GearItem[]>("/admin/gear", {
    query: {
      categoryId: filters.categoryId ?? undefined,
      search: filters.search ?? undefined,
      page: filters.page,
      limit: ADMIN_PAGE_SIZE,
    },
  });

  if (!result) {
    return (
      <EmptyState
        icon={ServerCrash}
        title="Gear could not be loaded"
        description="We could not reach the GearUp service. Please try again in a moment."
      />
    );
  }

  const gear = result.data;

  if (gear.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No gear matches these filters"
        description="Try a different category or search term."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/gear">Clear filters</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gear</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price / day</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Visibility</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gear.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative aspect-4/3 w-14 shrink-0 overflow-hidden rounded-lg border border-border">
                      <GearImage src={item.images[0]} alt={item.name} sizes="56px" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/gear/${item.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {item.brand ?? "Unbranded"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.provider?.name ?? "Unknown"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.category?.name ?? "Uncategorised"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(item.pricePerDay)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.stock}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      toneClasses[item.isAvailable ? "success" : "neutral"],
                    )}
                  >
                    {item.isAvailable ? "Listed" : "Hidden"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 md:hidden">
        {gear.map((item) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="relative aspect-4/3 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
              <GearImage src={item.images[0]} alt={item.name} sizes="64px" />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/gear/${item.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {item.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {item.provider?.name ?? "Unknown"} ·{" "}
                {item.category?.name ?? "Uncategorised"}
              </p>
              <p className="mt-1 text-sm tabular-nums">
                {money(item.pricePerDay)} / day · {item.stock} in stock ·{" "}
                {item.isAvailable ? "Listed" : "Hidden"}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <UrlPagination
        page={filters.page}
        limit={ADMIN_PAGE_SIZE}
        total={result.meta?.total ?? gear.length}
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

export default async function AdminGearPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const filters = parseAdminGearFilters(await searchParams);
  const categories = await serverFetchSafe<Category[]>("/categories", {
    auth: false,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="All gear"
        description="Every listing on the platform, across all providers."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AdminSearch
          placeholder="Search gear"
          defaultValue={filters.search ?? ""}
        />
        <AdminSelect
          label="All categories"
          param="categoryId"
          value={filters.categoryId}
          options={(categories?.data ?? []).map((category) => ({
            value: category.id,
            label: category.name,
          }))}
        />
      </div>

      <Suspense key={filtersKey(filters)} fallback={<TableSkeleton />}>
        <GearTable filters={filters} />
      </Suspense>
    </div>
  );
}
