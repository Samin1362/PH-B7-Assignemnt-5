import { PackagePlus, ServerCrash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  AvailabilityToggle,
  DeleteGearButton,
} from "@/components/gear/gear-row-actions";
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
import { serverFetchSafe } from "@/lib/api";
import { money } from "@/lib/utils";
import type { GearItem } from "@/types/api";

export const metadata: Metadata = {
  title: "My gear — GearUp",
};

function Thumb({ gear }: { gear: GearItem }) {
  return (
    <div className="relative aspect-4/3 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
      <GearImage src={gear.images[0]} alt={gear.name} sizes="64px" />
    </div>
  );
}

async function ProviderGear() {
  const result = await serverFetchSafe<GearItem[]>("/provider/gear");

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
        icon={PackagePlus}
        title="No gear listed yet"
        description="List your first item and renters will be able to book it straight away."
        action={
          <Button asChild>
            <Link href="/dashboard/provider/gear/new">Add gear</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gear</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price / day</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gear.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Thumb gear={item} />
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
                  {item.category?.name ?? "Uncategorised"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(item.pricePerDay)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.stock === 0 ? (
                    <span className="text-tone-danger-foreground">0</span>
                  ) : (
                    item.stock
                  )}
                </TableCell>
                <TableCell>
                  <AvailabilityToggle gear={item} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <DeleteGearButton gear={item} />
                  </div>
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
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex gap-3">
              <Thumb gear={item} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/gear/${item.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {item.category?.name ?? "Uncategorised"} ·{" "}
                  {item.stock} in stock
                </p>
                <p className="mt-1 font-semibold tabular-nums">
                  {money(item.pricePerDay)}
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    / day
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <AvailabilityToggle gear={item} />
              <DeleteGearButton gear={item} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function GearTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default function ProviderGearPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My gear"
        description="Everything you have listed on GearUp."
        action={
          <Button asChild>
            <Link href="/dashboard/provider/gear/new">
              <PackagePlus />
              Add gear
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<GearTableSkeleton />}>
        <ProviderGear />
      </Suspense>
    </div>
  );
}
