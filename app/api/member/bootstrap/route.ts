import { NextResponse } from "next/server";

import type { Locale } from "@/lib/locale";
import { getFirstContactDetailsError, normalizeContactDetails, validateContactDetails } from "@/lib/contact-details";
import { getSupabaseRequestUser } from "@/lib/supabase/auth";
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
  const preferredLocale = body.preferredLocale === "en" ? "en" : "vi";
  const source = typeof body.source === "string" && body.source.trim().length > 0 ? body.source.trim() : "member_portal";
  const contactDetails = normalizeContactDetails({
    email: typeof body.email === "string" ? body.email : "",
    fullName: typeof body.fullName === "string" ? body.fullName : "",
    phone: typeof body.phone === "string" ? body.phone : ""
  });
  const validation = validateContactDetails(preferredLocale, contactDetails, { phoneRequired: false });
  const validationError = getFirstContactDetailsError(validation.errors);

  if (!authUserId || validationError) {
    if (validationError) {
      throw new Error(validationError);
    }

    throw new Error("Missing required member bootstrap fields.");
  }

  return {
    authUserId,
    email: validation.values.email,
    fullName: validation.values.fullName,
    phone: validation.values.phone.length ? validation.values.phone : null,
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
    const user = await getSupabaseRequestUser(request).catch(() => null);

    if (!user || user.id !== profile.authUserId) {
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
