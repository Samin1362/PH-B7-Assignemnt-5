import Link from "next/link";
import { GearImage } from "@/components/gear/gear-image";
import { Skeleton } from "@/components/ui/skeleton";
import { money } from "@/lib/utils";
import type { GearItem } from "@/types/api";

export function GearCard({
  gear,
  priority = false,
}: {
  gear: GearItem;
  priority?: boolean;
}) {
  const soldOut = !gear.isAvailable || gear.stock < 1;

  return (
    <Link
      href={`/gear/${gear.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <GearImage
          src={gear.images?.[0]}
          alt={gear.name}
          priority={priority}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <span
          className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            soldOut
              ? "bg-tone-neutral text-tone-neutral-foreground"
              : "bg-tone-success text-tone-success-foreground"
          }`}
        >
          {soldOut ? "Unavailable" : "Available"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {gear.category ? (
          <p className="text-xs font-medium text-primary">
            {gear.category.name}
          </p>
        ) : null}
        <h3 className="font-semibold group-hover:text-primary">{gear.name}</h3>
        <p className="text-sm text-muted-foreground">
          {gear.brand ?? "Unbranded"}
          {gear.provider ? ` · ${gear.provider.name}` : ""}
        </p>
        <p className="mt-auto pt-3 font-semibold tabular-nums">
          {money(gear.pricePerDay)}
          <span className="text-sm font-normal text-muted-foreground">
            {" "}
            / day
          </span>
        </p>
      </div>
    </Link>
  );
}

export function GearCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-4/3 rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}

export const gearGridClass =
  "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export function GearGridSkeleton({
  count = 8,
  className = gearGridClass,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <GearCardSkeleton key={index} />
      ))}
    </div>
  );
}
