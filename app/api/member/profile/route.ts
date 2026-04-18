import { NextResponse } from "next/server";

import type { Locale } from "@/lib/locale";
import { getSupabaseUser } from "@/lib/supabase/auth";
import { getCustomerByAuthUserId } from "@/lib/supabase/queries/customers";
import { jsonApiErrorResponse } from "@/lib/server/api-error";

function readProfileFallback(user: Awaited<ReturnType<typeof getSupabaseUser>>) {
  const metadata = (user?.user_metadata as Record<string, unknown> | null | undefined) ?? {};
  const fullName =
    typeof metadata.full_name === "string" && metadata.full_name.trim().length
      ? metadata.full_name.trim()
      : typeof user?.email === "string" && user.email.includes("@")
        ? user.email.split("@")[0]
        : "Member";

  return {
    authUserId: user?.id ?? "",
    email: user?.email ?? "",
    fullName,
    phone: typeof metadata.phone === "string" && metadata.phone.trim().length ? metadata.phone.trim() : null,
    preferredLocale: metadata.locale === "en" ? ("en" as Locale) : ("vi" as Locale)
  };
}

export async function GET() {
  try {
    const user = await getSupabaseUser();

    if (!user) {
      return jsonApiErrorResponse({
        context: {},
        error: new Error("Unauthorized."),
        fallbackMessage: "Unable to load member profile",
        scope: "api/member/profile",
        status: 401
      });
    }

    const customer = await getCustomerByAuthUserId(user.id);
    const fallbackProfile = readProfileFallback(user);

    return NextResponse.json(
      {
        profile: customer
          ? {
              authUserId: user.id,
              email: customer.email,
              fullName: customer.full_name,
              phone: customer.phone,
              preferredLocale: customer.preferred_locale
            }
          : fallbackProfile
      },
      { status: 200 }
    );
  } catch (error) {
    return jsonApiErrorResponse({
      context: {},
      error,
      fallbackMessage: "Unable to load member profile",
      scope: "api/member/profile",
      status: 400
    });
  }
}
