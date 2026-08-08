import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect Admin Routes
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const authCookie =
      request.cookies.get("cgs_admin_auth")?.value ||
      request.cookies.get("sb-access-token")?.value ||
      request.cookies.get("supabase-auth-token")?.value ||
      request.cookies.getAll().some((c) => c.name.includes("auth-token") || c.name.includes("sb-") || c.name.includes("admin"));

    if (!authCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // Protect User Account Routes
  const userProtectedRoutes = ["/dashboard", "/profile", "/my-registrations", "/certificates"];
  const isUserProtectedRoute = userProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isUserProtectedRoute) {
    const authCookie =
      request.cookies.get("sb-access-token")?.value ||
      request.cookies.get("supabase-auth-token")?.value ||
      request.cookies.getAll().some((c) => c.name.includes("auth-token") || c.name.includes("sb-"));

    if (!authCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
