import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  description: z.string().trim().max(500, "Description is too long"),
});

export type CategoryValues = z.infer<typeof categorySchema>;
