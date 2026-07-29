import type { UserRole } from "@/types/api";

export const roleHome: Record<UserRole, string> = {
  CUSTOMER: "/dashboard/customer",
  PROVIDER: "/dashboard/provider",
  ADMIN: "/dashboard/admin",
};

export const authRoutes = ["/login", "/register"];
