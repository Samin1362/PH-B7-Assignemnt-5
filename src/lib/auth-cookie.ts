import "server-only";

import { NextResponse } from "next/server";
import { toApiError } from "@/lib/api-error";
import { serverEnv } from "@/lib/env";

const ONE_DAY = 60 * 60 * 24;

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: serverEnv.authCookieName,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_DAY,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: serverEnv.authCookieName,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

/** Re-emits an ApiError in the backend's own error envelope. */
export function errorResponse(error: unknown) {
  const apiError = toApiError(error);
  return NextResponse.json(
    {
      success: false,
      message: apiError.message,
      errorDetails: apiError.errorDetails,
    },
    { status: apiError.status || 502 },
  );
}
