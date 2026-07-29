import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth-cookie";

export async function POST() {
  // Best effort: the session is the cookie, so clearing it is what matters.
  await serverFetch("/auth/logout", { method: "POST" }).catch(() => null);

  const response = NextResponse.json({
    success: true,
    message: "Signed out",
    data: null,
  });

  return clearSessionCookie(response);
}
