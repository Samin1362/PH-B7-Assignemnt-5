import { rentalStatuses, type RentalStatus } from "@/constants/status";
import type { UserRole, UserStatus } from "@/types/api";

export const ADMIN_PAGE_SIZE = 10;

export type AdminSearchParams = Record<string, string | string[] | undefined>;

const roles: UserRole[] = ["CUSTOMER", "PROVIDER", "ADMIN"];
const userStatuses: UserStatus[] = ["ACTIVE", "SUSPENDED"];

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pageOf(value: string | string[] | undefined) {
  const page = Number(single(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** Everything is whitelisted: the API 400s on an unknown enum value. */
export function parseUserFilters(params: AdminSearchParams) {
  const role = single(params.role) as UserRole | undefined;
  const status = single(params.status) as UserStatus | undefined;

  return {
    role: role && roles.includes(role) ? role : null,
    status: status && userStatuses.includes(status) ? status : null,
    search: single(params.search)?.trim() || null,
    page: pageOf(params.page),
  };
}

export function parseAdminGearFilters(params: AdminSearchParams) {
  const categoryId = single(params.categoryId);

  return {
    // A non-uuid `categoryId` is a 400, so drop anything that cannot be one.
    categoryId: categoryId && isUuid(categoryId) ? categoryId : null,
    search: single(params.search)?.trim() || null,
    page: pageOf(params.page),
  };
}

export function parseAdminRentalFilters(params: AdminSearchParams) {
  const status = single(params.status) as RentalStatus | undefined;

  return {
    status: status && rentalStatuses.includes(status) ? status : null,
    page: pageOf(params.page),
  };
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function filtersKey(filters: Record<string, unknown>) {
  return Object.values(filters).join("|");
}
