"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildActionResultHref, readSafeReturnTo } from "@/lib/action-result";
import { getSupabaseUser, getSupabaseUserPortalRole } from "@/lib/supabase/auth";
import { getErrorMessage } from "@/lib/supabase/errors";
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
  return readSafeReturnTo(readOptionalString(formData, "returnTo"));
}

function redirectWithActionResult(returnTo: string | null, kind: "error" | "success", message: string) {
  if (!returnTo) {
    return;
  }

  redirect(buildActionResultHref(returnTo, { kind, message }));
}

export async function createPaymentRequestAction(formData: FormData) {
  const user = await getSupabaseUser().catch(() => null);
  const actorRole = user ? getSupabaseUserPortalRole(user) : null;
  const returnTo = readReturnTo(formData);

  try {
    await createPaymentRequest({
      actorRole: actorRole ?? "staff",
      amount: readRequiredNumber(formData, "amount"),
      branchBankAccountId: readOptionalString(formData, "branchBankAccountId"),
      createdBy: user?.id ?? readOptionalString(formData, "createdBy"),
      note: readOptionalString(formData, "note") ?? "",
      reservationId: readRequiredString(formData, "reservationId"),
      source: readOptionalString(formData, "source") ?? "admin_console"
    });
  } catch (error) {
    redirectWithActionResult(returnTo, "error", getErrorMessage(error, "Unable to create payment request."));
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/member");
  redirectWithActionResult(returnTo, "success", "Payment request created.");
}

function readRequiredNumber(formData: FormData, key: string) {
  const value = readOptionalNumber(formData, key);

  if (value == null) {
    throw new Error(`Missing required numeric field: ${key}`);
  }

  return value;
}

export async function submitPaymentProofAction(formData: FormData) {
  const returnTo = readReturnTo(formData);

  try {
    const token = readOptionalString(formData, "paymentToken");
    const paymentRequestId = readOptionalString(formData, "paymentRequestId");
    const note = readOptionalString(formData, "note") ?? "";
    const uploadedVia = readOptionalString(formData, "uploadedVia") ?? (token ? "public_link" : "member_portal");

    const proofFileRaw = formData.get("proofFile");
    if (!(proofFileRaw instanceof File) || proofFileRaw.size <= 0) {
      throw new Error("Please select a valid payment proof file.");
    }
    const proofFile = proofFileRaw;

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
  } catch (error) {
    redirectWithActionResult(returnTo, "error", getErrorMessage(error, "Unable to upload payment proof."));
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/member");

  if (returnTo) {
    redirect(buildActionResultHref(returnTo, { kind: "success", message: "Payment proof uploaded." }));
  }
}

export async function verifyPaymentRequestAction(formData: FormData) {
  const returnTo = readReturnTo(formData);
  let status: "verified" | "rejected" | null = null;

  try {
    const user = await getSupabaseUser().catch(() => null);
    const actorRole = user ? getSupabaseUserPortalRole(user) : null;
    status = readRequiredString(formData, "status") as "verified" | "rejected";

    await verifyPaymentRequest({
      actorRole: actorRole ?? readOptionalString(formData, "actorRole") ?? "staff",
      actorUserId: user?.id ?? readOptionalString(formData, "actorUserId"),
      paymentRequestId: readRequiredString(formData, "paymentRequestId"),
      reviewNote: readOptionalString(formData, "reviewNote") ?? "",
      status
    });
  } catch (error) {
    redirectWithActionResult(
      returnTo,
      "error",
      getErrorMessage(error, status === "verified" ? "Unable to confirm deposit." : "Unable to reject payment proof.")
    );
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/member");
  redirectWithActionResult(
    returnTo,
    "success",
    status === "verified" ? "Deposit confirmed successfully." : "Payment proof rejected."
  );
}
