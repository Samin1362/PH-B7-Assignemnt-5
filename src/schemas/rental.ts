import { differenceInCalendarDays } from "date-fns";
import { z } from "zod";

/**
 * The API bills `ceil((endDate - startDate) / 1 day)` and rejects an end date
 * that is not after the start, so a single-day pick is invalid by design:
 * pick up on the 1st and return on the 3rd is two rental days.
 */
export const rentalSelectionSchema = z
  .object({
    startDate: z.date({ error: "Choose a pick-up date" }),
    endDate: z.date({ error: "Choose a return date" }),
    quantity: z.number().int().positive(),
  })
  .refine(
    (value) => differenceInCalendarDays(value.endDate, value.startDate) >= 1,
    {
      message: "Return must be at least one day after pick-up",
      path: ["endDate"],
    },
  );

export type RentalSelection = z.infer<typeof rentalSelectionSchema>;

export function rentalDays(start?: Date, end?: Date) {
  if (!start || !end) {
    return 0;
  }
  return Math.max(0, differenceInCalendarDays(end, start));
}
