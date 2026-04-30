import { NextResponse } from "next/server";

import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import {
  getFirstContactDetailsError,
  normalizeContactDetails,
  resolveContactDetailsError,
  validateContactDetails
} from "@/lib/contact-details";
import { getSupabaseSession, getSupabaseUser } from "@/lib/supabase/auth";
import { getCustomerByAuthUserId, getCustomerByEmail, upsertCustomerProfile } from "@/lib/supabase/queries/customers";
import { jsonApiErrorResponse } from "@/lib/server/api-error";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

type ProfilePatchBody = {
  email?: string;
  fullName?: string;
  phone?: string | null;
  preferredLocale?: Locale;
};

function readProfilePatchBody(body: ProfilePatchBody) {
  return normalizeContactDetails({
    email: typeof body.email === "string" ? body.email : "",
    fullName: typeof body.fullName === "string" ? body.fullName : "",
    phone: typeof body.phone === "string" ? body.phone : ""
  });
}

function toProfilePayload(
  authUserId: string,
  customer: { email: string; full_name: string; phone: string | null; preferred_locale: Locale }
) {
  return {
    authUserId,
    email: customer.email,
    fullName: customer.full_name,
    phone: customer.phone,
    preferredLocale: customer.preferred_locale
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

export async function PATCH(request: Request) {
  let preferredLocale: Locale = "vi";

  try {
    const session = await getSupabaseSession().catch(() => null);

    if (!session?.user) {
      return jsonApiErrorResponse({
        context: {},
        error: new Error("Unauthorized profile update."),
        fallbackMessage: "Unable to update member profile",
        scope: "api/member/profile",
        status: 401
      });
    }

    const body = (await request.json().catch(() => null)) as ProfilePatchBody | null;

    if (!body) {
      return jsonApiErrorResponse({
        context: { authUserId: session.user.id },
        error: new Error("Missing required member profile fields."),
        fallbackMessage: "Unable to update member profile",
        scope: "api/member/profile",
        status: 400
      });
    }

    preferredLocale = body.preferredLocale === "en" ? "en" : "vi";
    const profileInput = readProfilePatchBody(body);
    const validation = validateContactDetails(preferredLocale, profileInput, { phoneRequired: true });
    const validationError = getFirstContactDetailsError(validation.errors);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const duplicateCustomer = await getCustomerByEmail(validation.values.email);

    if (duplicateCustomer && duplicateCustomer.auth_user_id !== session.user.id) {
      return NextResponse.json(
        {
          error: localize(preferredLocale, {
            vi: "Email này đã được dùng bởi member khác.",
            en: "This email is already used by another member."
          })
        },
        { status: 409 }
      );
    }

    const customer = await upsertCustomerProfile({
      authUserId: session.user.id,
      email: validation.values.email,
      fullName: validation.values.fullName,
      phone: validation.values.phone,
      preferredLocale,
      source: "member_portal"
    });

    const supabase = await createSupabaseServerClient();

    await supabase.auth
      .updateUser({
        data: {
          full_name: customer.full_name,
          locale: customer.preferred_locale,
          phone: customer.phone
        }
      })
      .catch(() => null);

    return NextResponse.json({ profile: toProfilePayload(session.user.id, customer) }, { status: 200 });
  } catch (error) {
    const resolved = resolveContactDetailsError(preferredLocale, error);

    if (resolved.field) {
      const status = resolved.field === "email" && resolved.message.toLowerCase().includes("already") ? 409 : 400;
      return NextResponse.json({ error: resolved.message }, { status });
    }

    return jsonApiErrorResponse({
      context: {},
      error,
      fallbackMessage: "Unable to update member profile",
      scope: "api/member/profile",
      status: 400
    });
  }
}
