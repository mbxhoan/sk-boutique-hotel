"use server";

import { revalidatePath } from "next/cache";

import { sendEmail } from "@/lib/supabase/email";
import {
  createReservation,
  holdRoom,
  releaseExpiredHolds,
  releaseExpiredReservations,
  submitAvailabilityRequest
} from "@/lib/supabase/workflows";
import {
  createPaymentRequestAction as submitCreatePaymentRequestAction,
  submitPaymentProofAction as submitPaymentProofActionImpl,
  verifyPaymentRequestAction as verifyPaymentRequestActionImpl
} from "@/app/actions/payments";
import { getSupabaseEmailAdminRecipient, getSupabaseEmailFromAddress } from "@/lib/supabase/env";
import { buildEmailTemplateTestEmail, type EmailTemplateTestKey } from "@/lib/email/test-presets";

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value.trim();
}

function readOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function readOptionalNumber(formData: FormData, key: string) {
  const value = formData.get(key);

  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric field: ${key}`);
  }

  return parsed;
}

function readTemplateKey(formData: FormData, key: string) {
  return readRequiredString(formData, key) as EmailTemplateTestKey;
}

function calculateNights(stayStartAt: string, stayEndAt: string) {
  const start = new Date(stayStartAt);
  const end = new Date(stayEndAt);
  const diffMs = end.getTime() - start.getTime();

  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return 1;
  }

  return Math.max(1, Math.round(diffMs / 86_400_000));
}

export async function submitAvailabilityRequestAction(formData: FormData) {
  await submitAvailabilityRequest({
    branchId: readRequiredString(formData, "branchId"),
    contactEmail: readRequiredString(formData, "contactEmail"),
    contactName: readRequiredString(formData, "contactName"),
    contactPhone: readOptionalString(formData, "contactPhone"),
    createdBy: readOptionalString(formData, "createdBy"),
    guestCount: readOptionalNumber(formData, "guestCount") ?? 1,
    marketingConsent: readOptionalString(formData, "marketingConsent") === "true",
    note: readOptionalString(formData, "note") ?? "",
    preferredLocale: (readOptionalString(formData, "preferredLocale") as "en" | "vi" | null) ?? "vi",
    roomTypeId: readRequiredString(formData, "roomTypeId"),
    source: readOptionalString(formData, "source") ?? "public_site",
    stayEndAt: readRequiredString(formData, "stayEndAt"),
    stayStartAt: readRequiredString(formData, "stayStartAt")
  });

  revalidatePath("/admin");
}

export async function createPaymentRequestAction(formData: FormData) {
  return submitCreatePaymentRequestAction(formData);
}

export async function createRoomHoldAction(formData: FormData) {
  await holdRoom({
    actorRole: readOptionalString(formData, "actorRole") ?? "staff",
    availabilityRequestId: readOptionalString(formData, "availabilityRequestId"),
    branchId: readRequiredString(formData, "branchId"),
    createdBy: readOptionalString(formData, "createdBy"),
    customerId: readOptionalString(formData, "customerId"),
    heldBy: readOptionalString(formData, "heldBy"),
    holdMinutes: readOptionalNumber(formData, "holdMinutes") ?? 30,
    notes: readOptionalString(formData, "notes") ?? "",
    roomId: readRequiredString(formData, "roomId"),
    roomTypeId: readRequiredString(formData, "roomTypeId"),
    stayEndAt: readRequiredString(formData, "stayEndAt"),
    stayStartAt: readRequiredString(formData, "stayStartAt")
  });

  revalidatePath("/admin");
}

export async function createReservationAction(formData: FormData) {
  const stayStartAt = readRequiredString(formData, "stayStartAt");
  const stayEndAt = readRequiredString(formData, "stayEndAt");
  const nights = calculateNights(stayStartAt, stayEndAt);
  const basePrice = readOptionalNumber(formData, "basePrice") ?? 0;
  const manualOverridePrice = readOptionalNumber(formData, "manualOverridePrice");
  const weekendSurcharge = readOptionalNumber(formData, "weekendSurcharge") ?? 0;
  const nightlyRate = readOptionalNumber(formData, "nightlyRate") ?? (manualOverridePrice ?? basePrice);
  const totalAmount = readOptionalNumber(formData, "totalAmount") ?? nightlyRate * nights + weekendSurcharge;

  await createReservation({
    actorRole: readOptionalString(formData, "actorRole") ?? "staff",
    availabilityRequestId: readOptionalString(formData, "availabilityRequestId"),
    basePrice,
    branchId: readRequiredString(formData, "branchId"),
    createdBy: readOptionalString(formData, "createdBy"),
    customerId: readRequiredString(formData, "customerId"),
    depositAmount: readOptionalNumber(formData, "depositAmount") ?? 0,
    guestCount: readOptionalNumber(formData, "guestCount") ?? 1,
    holdId: readOptionalString(formData, "holdId"),
    manualOverridePrice,
    nightlyRate,
    notes: readOptionalString(formData, "notes") ?? "",
    primaryRoomTypeId: readRequiredString(formData, "primaryRoomTypeId"),
    roomId: readRequiredString(formData, "roomId"),
    status: "pending_deposit",
    stayEndAt,
    stayStartAt,
    totalAmount,
    weekendSurcharge
  });

  revalidatePath("/admin");
}

export async function releaseExpiredHoldsAction(formData: FormData) {
  const asOf = readOptionalString(formData, "asOf") ?? undefined;

  await Promise.allSettled([releaseExpiredHolds({ asOf }), releaseExpiredReservations({ asOf })]);

  revalidatePath("/admin");
}

export async function submitPaymentProofAction(formData: FormData) {
  return submitPaymentProofActionImpl(formData);
}

export async function verifyPaymentRequestAction(formData: FormData) {
  return verifyPaymentRequestActionImpl(formData);
}

export async function sendEmailTestAction(formData: FormData) {
  const templateKey = readTemplateKey(formData, "templateKey");
  const recipientEmail = readOptionalString(formData, "recipientEmail") ?? getSupabaseEmailAdminRecipient();
  const email = buildEmailTemplateTestEmail(templateKey);

  try {
    await sendEmail({
      from: getSupabaseEmailFromAddress(),
      html: email.html,
      subject: email.subject,
      to: recipientEmail
    });
  } catch (error) {
    console.warn("[email-test] Failed to send test email", {
      error,
      recipientEmail,
      templateKey
    });
  }

  revalidatePath("/admin");
}
