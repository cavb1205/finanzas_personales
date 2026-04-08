import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "micaja_auth";
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60; // 90 days in seconds

/**
 * Verify the auth token against the env var.
 * Returns true if valid.
 */
export function verifyToken(token: string): boolean {
  const expected = process.env.MICAJA_AUTH_TOKEN;
  if (!expected) return false;
  return token === expected;
}

/**
 * Create a response that sets the auth cookie.
 */
export function createAuthResponse(): NextResponse {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}

/**
 * Check if a request has a valid auth cookie.
 * Use in API route handlers that require authentication.
 */
export function checkAuth(request: NextRequest): boolean {
  const cookie = request.cookies.get(COOKIE_NAME);
  return cookie?.value === "authenticated";
}

/**
 * Return an unauthorized response.
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: "No autorizado. Inicia sesión primero." },
    { status: 401 }
  );
}

/**
 * Check if the current user is authenticated (for server components / pages).
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value === "authenticated";
}
