import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest, isAdminRole } from "@/lib/server/auth-jwt";

const protectedAdminRoutes = ["/admin"];
const authRoutes = ["/auth/login"];

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host === "corechella.vercel.app") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = "corechella.com";
    return NextResponse.redirect(url, 308);
  }

  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  if (pathname.startsWith("/dashboard")) {
    if (session && isAdminRole(session.role)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (pathname.startsWith("/auth/signup") || pathname.startsWith("/auth/admin/login")) {
    const loginUrl = new URL("/auth/login", request.url);
    request.nextUrl.searchParams.forEach((value, key) => {
      loginUrl.searchParams.set(key, value);
    });
    return NextResponse.redirect(loginUrl);
  }

  const isAdminRoute = protectedAdminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute) {
    if (!session || !isAdminRole(session.role)) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role === "ticket_manager" && session.permissions.length === 0) {
      return NextResponse.redirect(new URL("/auth/login?revoked=1", request.url));
    }
    if (pathname.startsWith("/admin/staff") && session.role !== "super_admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (pathname.startsWith("/admin/events/create") && session.role !== "super_admin") {
      return NextResponse.redirect(new URL("/admin/events", request.url));
    }
  }

  if (isAuthRoute && session && isAdminRole(session.role)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
