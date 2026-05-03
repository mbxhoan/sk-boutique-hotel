import { NextResponse } from "next/server";

import { isBookingRequestStayWindowValid } from "@/lib/booking-dates";
import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { getFirstContactDetailsError, normalizeContactDetails, validateContactDetails } from "@/lib/contact-details";
import { getSupabaseSession } from "@/lib/supabase/auth";
import { jsonApiErrorResponse } from "@/lib/server/api-error";
import { submitAvailabilityRequest } from "@/lib/supabase/workflows";

type BookingRequestBody = {
  adults?: number;
  branchId?: string;
  children?: number;
  contactEmail?: string;
  contactName?: string;
  contactPhone?: string | null;
  createdBy?: string | null;
  guestCount?: number;
  marketingConsent?: boolean;
  note?: string;
  preferredLocale?: Locale;
  quotedCurrency?: string;
  quotedNightlyRate?: number;
  quotedTotalAmount?: number;
  roomTypeId?: string;
  source?: string;
  stayEndAt?: string;
  stayStartAt?: string;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length ? trimmed : null;
}

function readNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function readBody(body: BookingRequestBody) {
  const branchId = readString(body.branchId);
  const roomTypeId = readString(body.roomTypeId);
  const stayStartAt = readString(body.stayStartAt);
  const stayEndAt = readString(body.stayEndAt);
  const preferredLocale: Locale = body.preferredLocale === "en" ? "en" : "vi";
  const createdBy = readOptionalString(body.createdBy);
  const source = readString(body.source) || "public_site";
  const note = readOptionalString(body.note) ?? "";
  const guestCount = readNumber(body.guestCount) ?? 1;
  const marketingConsent = Boolean(body.marketingConsent);
  const quotedCurrency = readString(body.quotedCurrency) || "VND";
  const quotedNightlyRate = readNumber(body.quotedNightlyRate);
  const quotedTotalAmount = readNumber(body.quotedTotalAmount);
  const contactDetails = normalizeContactDetails({
    email: readString(body.contactEmail),
    fullName: readString(body.contactName),
    phone: readOptionalString(body.contactPhone) ?? ""
  });

  const contactValidation = validateContactDetails(preferredLocale, contactDetails, { phoneRequired: true });
  const contactError = getFirstContactDetailsError(contactValidation.errors);

  if (contactError) {
    throw new Error(contactError);
  }

  if (!branchId || !roomTypeId || !stayStartAt || !stayEndAt || !createdBy) {
    throw new Error("Missing required booking request fields.");
  }

  return {
    branchId,
    contactEmail: contactValidation.values.email,
    contactName: contactValidation.values.fullName,
    contactPhone: contactValidation.values.phone,
    createdBy,
    guestCount,
    marketingConsent,
    note,
    preferredLocale,
    quotedCurrency,
    quotedNightlyRate,
    quotedTotalAmount,
    roomTypeId,
    source,
    stayEndAt,
    stayStartAt
  };
}

const stayDateCopy = {
  invalid: {
    vi: "Ngày nhận phòng không hợp lệ. Vui lòng chọn hôm nay hoặc ngày sau.",
    en: "Check-in date is invalid. Please choose today or later."
  }
} as const;

export async function POST(request: Request) {
  let body: BookingRequestBody | null = null;

  try {
    body = (await request.json()) as BookingRequestBody;
    const input = readBody(body);
    const session = await getSupabaseSession().catch(() => null);

    if (!session?.user || session.user.id !== input.createdBy) {
      return jsonApiErrorResponse({
        context: {
          branchId: input.branchId,
          createdBy: input.createdBy,
          roomTypeId: input.roomTypeId,
          source: input.source,
          stayEndAt: input.stayEndAt,
          stayStartAt: input.stayStartAt
        },
        error: new Error("Unauthorized booking request."),
        fallbackMessage: "Unable to submit booking request",
        scope: "api/public/booking-request",
        status: 401
      });
    }

    if (!isBookingRequestStayWindowValid(input.stayStartAt, input.stayEndAt)) {
      throw new Error(localize(input.preferredLocale, stayDateCopy.invalid));
    }

    const bookingRequest = await submitAvailabilityRequest(input);

    return NextResponse.json(
      {
        bookingRequest: {
          id: bookingRequest.id,
          requestCode: bookingRequest.request_code,
          status: bookingRequest.status
        }
      },
      { status: 201 }
    );
  } catch (error) {
    const input = body
      ? {
          branchId: body.branchId ?? null,
          createdBy: body.createdBy ?? null,
          roomTypeId: body.roomTypeId ?? null,
          source: body.source ?? null,
          stayEndAt: body.stayEndAt ?? null,
          stayStartAt: body.stayStartAt ?? null
        }
      : {};

    return jsonApiErrorResponse({
      context: input,
      error,
      fallbackMessage: "Unable to create booking request",
      scope: "api/public/booking-request",
      status: 400
    });
  }
}
