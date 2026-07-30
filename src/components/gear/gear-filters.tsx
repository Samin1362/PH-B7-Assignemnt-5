"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryParams } from "@/hooks/use-query-params";
import { activeFilterCount, type GearFilters } from "@/lib/gear-filters";
import type { CategorySummary } from "@/types/api";

/** Radix Select cannot hold an empty value, so "no filter" needs a sentinel. */
const ANY = "any";

export type GearFilterOptions = {
  categories: CategorySummary[];
  brands: string[];
};

type Props = {
  filters: GearFilters;
  options: GearFilterOptions;
};

function FilterFields({ filters, options }: Props) {
  const { setParams, setParamsDebounced, resetParams } = useQueryParams();
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const activeCount = activeFilterCount(filters);

  function clearAll() {
    setMinPrice("");
    setMaxPrice("");
    resetParams();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="filter-category">Category</Label>
        <Select
          value={filters.categoryId || ANY}
          onValueChange={(value) =>
            setParams({ categoryId: value === ANY ? null : value })
          }
        >
          <SelectTrigger id="filter-category" className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All categories</SelectItem>
            {options.categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-brand">Brand</Label>
        <Select
          value={filters.brand || ANY}
          onValueChange={(value) =>
            setParams({ brand: value === ANY ? null : value })
          }
        >
          <SelectTrigger id="filter-brand" className="w-full">
            <SelectValue placeholder="All brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All brands</SelectItem>
            {options.brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-min-price">Price per day</Label>
        <div className="flex items-center gap-2">
          <Input
            id="filter-min-price"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(event) => {
              setMinPrice(event.target.value);
              setParamsDebounced({ minPrice: event.target.value }, 600);
            }}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            id="filter-max-price"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max"
            aria-label="Maximum price per day"
            value={maxPrice}
            onChange={(event) => {
              setMaxPrice(event.target.value);
              setParamsDebounced({ maxPrice: event.target.value }, 600);
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="filter-available" className="leading-snug">
          Available only
        </Label>
        <Switch
          id="filter-available"
          checked={filters.availableOnly}
          onCheckedChange={(checked) => setParams({ available: checked })}
        />
      </div>

      {activeCount > 0 ? (
        <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
          <RotateCcw />
          Clear {activeCount} filter{activeCount > 1 ? "s" : ""}
        </Button>
      ) : null}
    </div>
  );
}

export function GearFilterSidebar({ filters, options }: Props) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-5 font-semibold">Filters</h2>
        <FilterFields filters={filters} options={options} />
      </div>
    </aside>
  );
}

export function GearFilterSheet({ filters, options }: Props) {
  const [open, setOpen] = useState(false);
  const activeCount = activeFilterCount(filters);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal />
          Filters
          {activeCount > 0 ? (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground tabular-nums">
              {activeCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-8">
          <FilterFields filters={filters} options={options} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function GearFilterSidebarSkeleton() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-6 rounded-2xl border border-border bg-card p-5">
        <Skeleton className="h-5 w-20" />
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </aside>
  );
}
