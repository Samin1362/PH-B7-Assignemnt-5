import { NextResponse, type NextRequest } from "next/server";
import { serverFetch } from "@/lib/api";
import { errorResponse, setSessionCookie } from "@/lib/auth-cookie";
import type { AuthPayload, User } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const { email, password, ...rest } = await request.json();

    const registered = await serverFetch<User>("/auth/register", {
      method: "POST",
      body: { ...rest, email, password },
      auth: false,
    });

    // The API returns a user but no token, so sign the new account straight in.
    try {
      const session = await serverFetch<AuthPayload>("/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });

      const response = NextResponse.json({
        success: true,
        message: "Account created",
        data: { user: session.data.user, signedIn: true },
      });

      return setSessionCookie(response, session.data.accessToken);
    } catch {
      return NextResponse.json({
        success: true,
        message: "Account created — please sign in",
        data: { user: registered.data, signedIn: false },
      });
    }
  } catch (error) {
    return errorResponse(error);
  }
}
