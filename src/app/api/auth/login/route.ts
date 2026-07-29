import { NextResponse, type NextRequest } from "next/server";
import { serverFetch } from "@/lib/api";
import { errorResponse, setSessionCookie } from "@/lib/auth-cookie";
import type { AuthPayload } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await serverFetch<AuthPayload>("/auth/login", {
      method: "POST",
      body,
      auth: false,
    });

    const response = NextResponse.json({
      success: true,
      message: result.message,
      data: { user: result.data.user },
    });

    return setSessionCookie(response, result.data.accessToken);
  } catch (error) {
    return errorResponse(error);
  }
}
