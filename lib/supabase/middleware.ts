import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Immediately pass through Next.js static assets and files
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map|ico)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://placeholder-supabase-url.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh user auth state safely
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    // Protect Admin Routes
    if (pathname.startsWith("/admin")) {
      const isLoginPage = pathname === "/admin/login";

      if (authErr || !user) {
        if (!isLoginPage) {
          const url = request.nextUrl.clone();
          url.pathname = "/admin/login";
          return NextResponse.redirect(url);
        }
      } else {
        // User is authenticated in Supabase Auth, verify public.admins
        let adminRecord: any = null;
        try {
          const emailQuery = user.email ? `,email.eq.${user.email}` : "";
          const { data } = await supabase
            .from("admins")
            .select("id, is_active, role")
            .or(`auth_user_id.eq.${user.id},id.eq.${user.id}${emailQuery}`)
            .maybeSingle();
          adminRecord = data;
        } catch (e) {
          console.warn("Middleware admin lookup warning:", e);
        }

        const isValidAdmin = adminRecord && adminRecord.is_active === true;

        if (isLoginPage) {
          if (isValidAdmin) {
            const url = request.nextUrl.clone();
            url.pathname = "/admin/dashboard";
            return NextResponse.redirect(url);
          }
        } else {
          if (!isValidAdmin) {
            const url = request.nextUrl.clone();
            url.pathname = "/admin/login";
            url.searchParams.set(
              "error",
              !adminRecord ? "unauthorized_admin" : "inactive_admin"
            );
            return NextResponse.redirect(url);
          }
        }
      }
    }

    // Protect User Account Routes
    const userProtectedRoutes = ["/dashboard", "/profile", "/my-registrations", "/certificates"];
    const isUserProtectedRoute = userProtectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isUserProtectedRoute && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (err) {
    console.error("Middleware updateSession exception:", err);
    return supabaseResponse;
  }
}
