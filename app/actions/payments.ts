"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseUser } from "@/lib/supabase/auth";
import { getCustomerByAuthUserId } from "@/lib/supabase/queries/customers";
import { getPaymentRequestById } from "@/lib/supabase/queries/payment-requests";
import { createPaymentRequest, uploadPaymentProof, verifyPaymentRequest } from "@/lib/supabase/payments";

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

function readRequiredFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size <= 0) {
    throw new Error(`Missing file field: ${key}`);
  }

  return value;
}

function readReturnTo(formData: FormData) {
  const returnTo = readOptionalString(formData, "returnTo");

  if (!returnTo) {
    return null;
  }

  return returnTo.startsWith("/") ? returnTo : null;
}

export async function createPaymentRequestAction(formData: FormData) {
  await createPaymentRequest({
    amount: readRequiredNumber(formData, "amount"),
    branchBankAccountId: readOptionalString(formData, "branchBankAccountId"),
    createdBy: readOptionalString(formData, "createdBy"),
    note: readOptionalString(formData, "note") ?? "",
    reservationId: readRequiredString(formData, "reservationId"),
    source: readOptionalString(formData, "source") ?? "admin_console"
  });

  revalidatePath("/admin");
}

function readRequiredNumber(formData: FormData, key: string) {
  const value = readOptionalNumber(formData, key);

  if (value == null) {
    throw new Error(`Missing required numeric field: ${key}`);
  }

  return value;
}

export async function submitPaymentProofAction(formData: FormData) {
  const token = readOptionalString(formData, "paymentToken");
  const paymentRequestId = readOptionalString(formData, "paymentRequestId");
  const proofFile = readRequiredFile(formData, "proofFile");
  const note = readOptionalString(formData, "note") ?? "";
  const returnTo = readReturnTo(formData);
  const uploadedVia = readOptionalString(formData, "uploadedVia") ?? (token ? "public_link" : "member_portal");

  if (!token && !paymentRequestId) {
    throw new Error("Missing payment token or payment request id.");
  }

  if (paymentRequestId) {
    const user = await getSupabaseUser();
    const customer = user ? await getCustomerByAuthUserId(user.id) : null;

    if (!customer) {
      throw new Error("Member profile is required to upload payment proof.");
    }

    const paymentRequest = await getPaymentRequestById(paymentRequestId);

    if (!paymentRequest || paymentRequest.customer_id !== customer.id) {
      throw new Error("Payment request does not belong to the current member.");
    }
  }

  await uploadPaymentProof({
    note,
    paymentRequestId: paymentRequestId ?? undefined,
    paymentToken: token ?? undefined,
    proofFile,
    uploadedVia
  });

  revalidatePath("/admin");
  revalidatePath("/member");

  if (returnTo) {
    redirect(returnTo);
  }
}

export async function verifyPaymentRequestAction(formData: FormData) {
  await verifyPaymentRequest({
    actorRole: readOptionalString(formData, "actorRole") ?? "staff",
    actorUserId: readOptionalString(formData, "actorUserId"),
    paymentRequestId: readRequiredString(formData, "paymentRequestId"),
    reviewNote: readOptionalString(formData, "reviewNote") ?? "",
    status: (readRequiredString(formData, "status") as "verified" | "rejected")
  });

  revalidatePath("/admin");
  revalidatePath("/member");
}
