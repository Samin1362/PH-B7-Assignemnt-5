import { NextResponse, type NextRequest } from "next/server";
import { roleHome } from "@/constants/routes";
import { serverEnv } from "@/lib/env";
import type { UserRole } from "@/types/api";

type TokenPayload = { userId: string; role: UserRole; exp?: number };

const authPages = ["/login", "/register"];

/** Longest prefix wins, so `/dashboard/profile` stays open to every role. */
const roleGates: { prefix: string; role: UserRole }[] = [
  { prefix: "/dashboard/customer", role: "CUSTOMER" },
  { prefix: "/dashboard/provider", role: "PROVIDER" },
  { prefix: "/dashboard/admin", role: "ADMIN" },
  { prefix: "/payment", role: "CUSTOMER" },
];

/**
 * Reads the JWT payload without verifying it. The API is the real authority
 * on every request — this only decides where to route.
 */
function decodeToken(token: string): TokenPayload | null {
  const segment = token.split(".")[1];
  if (!segment) {
    return null;
  }

  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded)) as TokenPayload;
    if (!payload.role || !payload.userId) {
      return null;
    }
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function toLogin(request: NextRequest, expired: boolean) {
  const url = new URL("/login", request.url);
  url.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  if (expired) {
    url.searchParams.set("expired", "1");
  }

  const response = NextResponse.redirect(url);
  response.cookies.delete(serverEnv.authCookieName);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(serverEnv.authCookieName)?.value;
  const session = token ? decodeToken(token) : null;

  if (authPages.includes(pathname)) {
    return session
      ? NextResponse.redirect(new URL(roleHome[session.role], request.url))
      : NextResponse.next();
  }

  if (!session) {
    return toLogin(request, Boolean(token));
  }

  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(roleHome[session.role], request.url));
  }

  const gate = roleGates.find(({ prefix }) => pathname.startsWith(prefix));
  if (gate && session.role !== gate.role) {
    return NextResponse.redirect(new URL(roleHome[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/payment/:path*", "/login", "/register"],
};
