import { NextResponse, type NextRequest } from "next/server";
import { buildUrl, getAuthToken } from "@/lib/api";
import { serverEnv } from "@/lib/env";

type Context = { params: Promise<{ path: string[] }> };

/**
 * Paths the browser must not reach through this proxy.
 * The auth routes have dedicated handlers that keep the token in an
 * httpOnly cookie; the Stripe webhook is server-to-server only.
 */
const blocked = new Set(["auth/login", "auth/register", "payments/confirm"]);

const failure = (status: number, message: string) =>
  NextResponse.json({ success: false, message }, { status });

async function proxy(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const target = path.join("/");

  if (blocked.has(target)) {
    return failure(403, "This endpoint is not available through the proxy");
  }

  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const token = await getAuthToken();
  const hasBody = request.method !== "GET" && request.method !== "DELETE";
  const body = hasBody ? await request.text() : undefined;

  let response: Response;
  try {
    response = await fetch(buildUrl(`/${target}`, query), {
      method: request.method,
      cache: "no-store",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body || undefined,
    });
  } catch {
    return failure(503, "Cannot reach the server");
  }

  const payload = await response.json().catch(() => ({
    success: false,
    message: "Unexpected response from the server",
  }));

  const result = NextResponse.json(payload, { status: response.status });

  // A rejected token is dead — drop it so middleware sends the user to login.
  if (response.status === 401 && token) {
    result.cookies.delete(serverEnv.authCookieName);
  }

  return result;
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
