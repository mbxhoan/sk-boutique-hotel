import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabasePublicConfig } from "@/lib/supabase/env";

export async function updateSupabaseSession(request: NextRequest) {
  if (!hasSupabasePublicConfig()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const clearSupabaseCookies = () => {
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith("sb-") || cookie.name.includes("auth-token")) {
        response.cookies.set(cookie.name, "", {
          expires: new Date(0),
          path: "/"
        });
      }
    }
  };

  try {
    const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    });

    await supabase.auth.getUser();
  } catch {
    clearSupabaseCookies();
  }

  return response;
}
