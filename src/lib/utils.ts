import { clsx, type ClassValue } from "clsx";
import { differenceInCalendarDays, format, formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toNumber(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function money(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(toNumber(value));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatDate(value: string | Date) {
  return format(new Date(value), "dd MMM yyyy");
}

export function formatDateTime(value: string | Date) {
  return format(new Date(value), "dd MMM yyyy, h:mm a");
}

export function formatRelative(value: string | Date) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function formatDateRange(start: string | Date, end: string | Date) {
  return `${formatDate(start)} — ${formatDate(end)}`;
}

/**
 * Rental dates are calendar days stored as UTC midnight, so they must be read
 * back from the UTC parts — formatting them locally shifts the day for anyone
 * west of Greenwich.
 */
export function formatRentalDate(value: string | Date) {
  const date = new Date(value);
  return format(
    new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    "dd MMM yyyy",
  );
}

export function formatRentalRange(start: string | Date, end: string | Date) {
  return `${formatRentalDate(start)} — ${formatRentalDate(end)}`;
}

/** Sends the day the user actually picked, with no timezone shifting. */
export function toDateOnly(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function daysBetween(start: string | Date, end: string | Date) {
  return Math.max(1, differenceInCalendarDays(new Date(end), new Date(start)));
}
