import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./app/lib/supabase/types";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If Supabase env vars are missing, skip session refresh instead of
    // crashing the middleware (which would 500 every request).
    if (!supabaseUrl || !supabaseAnonKey) {
      return response;
    }

    // Imported dynamically so a load-time failure in @supabase/ssr is
    // caught here rather than crashing the whole middleware module
    // (MIDDLEWARE_INVOCATION_FAILED).
    const { createServerClient } = await import("@supabase/ssr");

    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // This refreshes a user's session in the database if needed
    await supabase.auth.getUser();
  } catch (error) {
    console.error("Middleware session refresh failed:", error);
  }

  return response;
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
