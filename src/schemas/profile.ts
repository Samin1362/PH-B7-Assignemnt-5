import { z } from "zod";

/**
 * Password is optional here — leaving both fields blank means "keep the
 * current one", so the length rule only applies once something is typed.
 */
export const profileSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    phone: z.string().trim().max(20, "Phone number is too long"),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((values) => !values.password || values.password.length >= 6, {
    message: "Password must be at least 6 characters",
    path: ["password"],
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ProfileValues = z.infer<typeof profileSchema>;
