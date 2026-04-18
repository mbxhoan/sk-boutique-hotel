import { NextResponse } from "next/server";

import type { Locale } from "@/lib/locale";
import { getSupabaseSession } from "@/lib/supabase/auth";
import { upsertCustomerProfile } from "@/lib/supabase/queries/customers";
import { jsonApiErrorResponse } from "@/lib/server/api-error";

type BootstrapBody = {
  authUserId?: string;
  email?: string;
  fullName?: string;
  phone?: string | null;
  preferredLocale?: Locale;
  source?: string;
};

function readBody(body: BootstrapBody) {
  const authUserId = typeof body.authUserId === "string" ? body.authUserId.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const phone = typeof body.phone === "string" && body.phone.trim().length > 0 ? body.phone.trim() : null;
  const preferredLocale = body.preferredLocale === "en" ? "en" : "vi";
  const source = typeof body.source === "string" && body.source.trim().length > 0 ? body.source.trim() : "member_portal";

  if (!authUserId || !email || !fullName) {
    throw new Error("Missing required member bootstrap fields.");
  }

  return {
    authUserId,
    email,
    fullName,
    phone,
    preferredLocale,
    source
  } satisfies {
    authUserId: string;
    email: string;
    fullName: string;
    phone: string | null;
    preferredLocale: Locale;
    source: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BootstrapBody;
    const profile = readBody(body);
    const session = await getSupabaseSession().catch(() => null);

    if (!session?.user || session.user.id !== profile.authUserId) {
      return jsonApiErrorResponse({
        context: {
          authUserId: profile.authUserId,
          email: profile.email
        },
        error: new Error("Unauthorized bootstrap request."),
        fallbackMessage: "Unable to bootstrap member profile",
        scope: "api/member/bootstrap",
        status: 401
      });
    }

    const customer = await upsertCustomerProfile({
      authUserId: profile.authUserId,
      email: profile.email,
      fullName: profile.fullName,
      phone: profile.phone,
      preferredLocale: profile.preferredLocale,
      source: profile.source
    });

    return NextResponse.json({ customer }, { status: 200 });
  } catch (error) {
    return jsonApiErrorResponse({
      context: {},
      error,
      fallbackMessage: "Unable to bootstrap member profile",
      scope: "api/member/bootstrap",
      status: 400
    });
  }
}
