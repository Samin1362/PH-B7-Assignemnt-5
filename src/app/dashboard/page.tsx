import { redirect } from "next/navigation";
import { roleHome } from "@/constants/routes";
import { requireSession } from "@/lib/session";

/** Middleware already routes `/dashboard`, so this is the fallback. */
export default async function DashboardPage() {
  const user = await requireSession("/dashboard");
  redirect(roleHome[user.role]);
}
