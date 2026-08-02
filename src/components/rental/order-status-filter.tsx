"use client";

import { useTransition } from "react";
import { rentalStatuses, rentalStatusMeta, type RentalStatus } from "@/constants/status";
import { useQueryParams } from "@/hooks/use-query-params";
import { cn } from "@/lib/utils";

export function OrderStatusFilter({
  counts,
  active,
  total,
}: {
  counts: Record<RentalStatus, number>;
  active: RentalStatus | null;
  total: number;
}) {
  const { setParams } = useQueryParams();
  const [pending, startTransition] = useTransition();

  const options: { value: RentalStatus | null; label: string; count: number }[] =
    [
      { value: null, label: "All", count: total },
      ...rentalStatuses.map((status) => ({
        value: status,
        label: rentalStatusMeta[status].label,
        count: counts[status],
      })),
    ];

  return (
    <div
      aria-busy={pending}
      className={cn("flex flex-wrap gap-2 transition-opacity", pending && "opacity-60")}
    >
      {options.map(({ value, label, count }) => {
        const selected = value === active;

        return (
          <button
            key={value ?? "all"}
            type="button"
            aria-pressed={selected}
            onClick={() =>
              startTransition(() => setParams({ status: value }))
            }
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {label}
            <span className="tabular-nums opacity-70">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
