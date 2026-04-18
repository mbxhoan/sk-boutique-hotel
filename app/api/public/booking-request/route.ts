import { NextResponse } from "next/server";

import type { Locale } from "@/lib/locale";
import { getSupabaseSession } from "@/lib/supabase/auth";
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
  const contactName = readString(body.contactName);
  const contactEmail = readString(body.contactEmail);
  const createdBy = readOptionalString(body.createdBy);
  const source = readString(body.source) || "member_portal";
  const note = readOptionalString(body.note) ?? "";
  const contactPhone = readOptionalString(body.contactPhone);
  const preferredLocale: Locale = body.preferredLocale === "en" ? "en" : "vi";
  const guestCount = readNumber(body.guestCount) ?? 1;
  const marketingConsent = Boolean(body.marketingConsent);

  if (!branchId || !roomTypeId || !stayStartAt || !stayEndAt || !contactName || !contactEmail || !createdBy) {
    throw new Error("Missing required booking request fields.");
  }

  return {
    branchId,
    contactEmail,
    contactName,
    contactPhone,
    createdBy,
    guestCount,
    marketingConsent,
    note,
    preferredLocale,
    roomTypeId,
    source,
    stayEndAt,
    stayStartAt
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingRequestBody;
    const input = readBody(body);
    const session = await getSupabaseSession().catch(() => null);

    if (!session?.user || session.user.id !== input.createdBy) {
      return NextResponse.json({ error: "Unauthorized booking request." }, { status: 401 });
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
    const message = error instanceof Error ? error.message : "Unable to create booking request.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
