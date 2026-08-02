import { z } from "zod";

/** Mirrors `createReviewSchema` on the API: 1–5 stars, comment optional. */
export const reviewSchema = z.object({
  rating: z
    .number({ error: "Pick a rating" })
    .int()
    .min(1, "Pick a rating")
    .max(5, "Pick a rating"),
  comment: z
    .string()
    .trim()
    .max(1000, "Keep your review under 1000 characters"),
});

export type ReviewValues = z.infer<typeof reviewSchema>;
