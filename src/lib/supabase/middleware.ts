import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: object }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — do not remove this
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Define protected route prefixes
  const studentRoutes = path.startsWith("/student");
  const tutorRoutes = path.startsWith("/tutor");
  const adminRoutes = path.startsWith("/admin");
  const authRoutes = path === "/login" || path === "/signup";
  const protectedRoutes = studentRoutes || tutorRoutes || adminRoutes;

  // Not logged in — trying to access protected route
  if (!user && protectedRoutes) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged in — trying to access login or signup
  if (user && authRoutes) {
    url.pathname = "/student/dashboard";
    return NextResponse.redirect(url);
  }

  // Trying to access admin routes — check is_admin
  if (user && adminRoutes) {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    const profile = data as { is_admin: boolean } | null;

    if (!profile?.is_admin) {
      url.pathname = "/student/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
