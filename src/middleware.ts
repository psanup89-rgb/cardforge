import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Supabase auth cookie without any network call
  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) =>
      cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
  );

  // Protected routes
  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/cards") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/set-password")) &&
    !hasAuthCookie
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If logged in and visiting auth pages, go to dashboard
  if ((pathname === "/login" || pathname === "/signup") && hasAuthCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|card/|present/|api/auth).*)",
  ],
};
