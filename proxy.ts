import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "micaja_auth";

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/revalidate"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isAuthenticated =
    request.cookies.get(COOKIE_NAME)?.value === "authenticated";

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|icon|manifest|api/prices|api/price-history).*)",
  ],
};
