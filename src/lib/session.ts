import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { getAuthToken, serverFetchSafe } from "@/lib/api";
import { roleHome } from "@/constants/routes";
import type { User, UserRole } from "@/types/api";

/**
 * The authoritative current user. Cached per request so multiple layouts
 * and pages share a single `/auth/me` call.
 */
export const getSession = cache(async (): Promise<User | null> => {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  const result = await serverFetchSafe<User>("/auth/me");
  return result?.data ?? null;
});

export async function requireSession(nextPath?: string) {
  const user = await getSession();
  if (!user) {
    const query = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/login${query}`);
  }
  return user;
}

export async function requireRole(role: UserRole, nextPath?: string) {
  const user = await requireSession(nextPath);
  if (user.role !== role) {
    redirect(roleHome[user.role]);
  }
  return user;
}
