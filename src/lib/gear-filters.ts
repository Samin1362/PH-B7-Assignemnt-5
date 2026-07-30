export const GEAR_PAGE_SIZE = 12;

export const gearSortOptions = [
  {
    value: "newest",
    label: "Newest first",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  {
    value: "price-asc",
    label: "Price: low to high",
    sortBy: "pricePerDay",
    sortOrder: "asc",
  },
  {
    value: "price-desc",
    label: "Price: high to low",
    sortBy: "pricePerDay",
    sortOrder: "desc",
  },
  {
    value: "name-asc",
    label: "Name: A to Z",
    sortBy: "name",
    sortOrder: "asc",
  },
] as const;

export type GearSort = (typeof gearSortOptions)[number]["value"];

export const defaultGearSort: GearSort = "newest";

export type GearSearchParams = Record<string, string | string[] | undefined>;

export type GearFilters = {
  search: string;
  categoryId: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  availableOnly: boolean;
  sort: GearSort;
  page: number;
};

function single(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function price(value: string) {
  const amount = Number(value);
  return value !== "" && Number.isFinite(amount) && amount >= 0
    ? String(amount)
    : "";
}

/**
 * The API rejects unknown `sortBy`/`sortOrder` values with a 400, so every
 * filter is whitelisted here before it reaches the query string.
 */
export function parseGearFilters(params: GearSearchParams): GearFilters {
  const sort = single(params.sort);
  const page = Number(single(params.page));

  return {
    search: single(params.search),
    categoryId: single(params.categoryId),
    brand: single(params.brand),
    minPrice: price(single(params.minPrice)),
    maxPrice: price(single(params.maxPrice)),
    availableOnly: single(params.available) === "true",
    sort: gearSortOptions.some((option) => option.value === sort)
      ? (sort as GearSort)
      : defaultGearSort,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function toGearQuery(filters: GearFilters) {
  const sort =
    gearSortOptions.find((option) => option.value === filters.sort) ??
    gearSortOptions[0];

  return {
    search: filters.search || undefined,
    categoryId: filters.categoryId || undefined,
    brand: filters.brand || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    isAvailable: filters.availableOnly ? "true" : undefined,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    page: filters.page,
    limit: GEAR_PAGE_SIZE,
  };
}

export function activeFilterCount(filters: GearFilters) {
  return [
    filters.categoryId,
    filters.brand,
    filters.minPrice,
    filters.maxPrice,
    filters.availableOnly ? "yes" : "",
  ].filter(Boolean).length;
}

export function gearFiltersKey(filters: GearFilters) {
  return Object.values(filters).join("|");
}
