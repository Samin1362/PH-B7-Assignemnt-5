import { z } from "zod";

/** Mirrors `createGearSchema` on the API, plus the URL check Zod does here. */
export const gearFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  categoryId: z.uuid("Choose a category"),
  brand: z.string().trim().max(80, "Brand is too long"),
  description: z.string().trim().max(2000, "Description is too long"),
  pricePerDay: z
    .number({ error: "Enter a price" })
    .positive("Price per day must be greater than 0"),
  stock: z
    .number({ error: "Enter a stock count" })
    .int("Stock must be a whole number")
    .nonnegative("Stock cannot be negative"),
  images: z.array(
    z.object({
      url: z.union([z.literal(""), z.url("Enter a valid image URL")]),
    }),
  ),
  isAvailable: z.boolean(),
});

export type GearFormValues = z.infer<typeof gearFormSchema>;
