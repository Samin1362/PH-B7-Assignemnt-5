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

export function daysBetween(start: string | Date, end: string | Date) {
  return Math.max(1, differenceInCalendarDays(new Date(end), new Date(start)));
}
