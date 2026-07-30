"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { GearFilterSheet } from "@/components/gear/gear-filters";
import type { GearFilterOptions } from "@/components/gear/gear-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryParams } from "@/hooks/use-query-params";
import { gearSortOptions, type GearFilters } from "@/lib/gear-filters";

export function GearToolbar({
  filters,
  options,
}: {
  filters: GearFilters;
  options: GearFilterOptions;
}) {
  const { setParams, setParamsDebounced } = useQueryParams();
  const [term, setTerm] = useState(filters.search);

  function search(value: string) {
    setTerm(value);
    setParamsDebounced({ search: value.trim() });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(event) => search(event.target.value)}
          placeholder="Search gear by name, brand or description"
          aria-label="Search gear"
          className="px-9"
        />
        {term ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Clear search"
            onClick={() => search("")}
            className="absolute top-1/2 right-1 -translate-y-1/2"
          >
            <X />
          </Button>
        ) : null}
      </div>

      <Select
        value={filters.sort}
        onValueChange={(value) => setParams({ sort: value })}
      >
        <SelectTrigger aria-label="Sort gear" className="sm:w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {gearSortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <GearFilterSheet filters={filters} options={options} />
    </div>
  );
}
