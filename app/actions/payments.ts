"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildActionResultHref, readSafeReturnTo } from "@/lib/action-result";
import { localize } from "@/lib/mock/i18n";
import { readLocaleFromFormData } from "@/lib/locale";
import { getSupabaseUser, getSupabaseUserPortalRole } from "@/lib/supabase/auth";
import { getCustomerByAuthUserId } from "@/lib/supabase/queries/customers";
import { getPaymentRequestById } from "@/lib/supabase/queries/payment-requests";
import { createPaymentRequest, uploadPaymentProof, verifyPaymentRequest } from "@/lib/supabase/payments";

const copy = {
  createPaymentRequestFailed: {
    vi: "Không thể tạo yêu cầu thanh toán.",
    en: "Unable to create payment request."
  },
  depositConfirmed: {
    vi: "Khoản cọc đã được xác nhận.",
    en: "Deposit confirmed successfully."
  },
  depositConfirmationFailed: {
    vi: "Không thể xác nhận khoản cọc.",
    en: "Unable to confirm deposit."
  },
  invalidProofFile: {
    vi: "Vui lòng chọn ảnh xác nhận thanh toán hợp lệ.",
    en: "Please select a valid payment proof file."
  },
  memberProfileRequired: {
    vi: "Cần có hồ sơ member để tải ảnh xác nhận thanh toán.",
    en: "Member profile is required to upload payment proof."
  },
  missingPaymentContext: {
    vi: "Thiếu mã thanh toán hoặc mã yêu cầu thanh toán.",
    en: "Missing payment token or payment request id."
  },
  paymentProofRejected: {
    vi: "Ảnh xác nhận thanh toán đã bị từ chối.",
    en: "Payment proof rejected."
  },
  paymentProofRejectedFailed: {
    vi: "Không thể từ chối ảnh xác nhận thanh toán.",
    en: "Unable to reject payment proof."
  },
  paymentProofUploaded: {
    vi: "Ảnh xác nhận thanh toán đã được tải lên.",
    en: "Payment proof uploaded."
  },
  paymentRequestCreated: {
    vi: "Yêu cầu thanh toán đã được tạo.",
    en: "Payment request created."
  },
  requestOwnershipMismatch: {
    vi: "Yêu cầu thanh toán không thuộc về member hiện tại.",
    en: "Payment request does not belong to the current member."
  },
  uploadPaymentProofFailed: {
    vi: "Không thể tải ảnh xác nhận thanh toán.",
    en: "Unable to upload payment proof."
  }
} as const;

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
  const locale = readLocaleFromFormData(formData);

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
    console.warn("[payments] Failed to create payment request", error);
    redirectWithActionResult(returnTo, "error", localize(locale, copy.createPaymentRequestFailed));
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/member");
  redirectWithActionResult(returnTo, "success", localize(locale, copy.paymentRequestCreated));
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
  const locale = readLocaleFromFormData(formData);
  const safeValidationMessages = new Set([
    localize(locale, copy.invalidProofFile),
    localize(locale, copy.missingPaymentContext),
    localize(locale, copy.memberProfileRequired),
    localize(locale, copy.requestOwnershipMismatch)
  ]);

  try {
    const token = readOptionalString(formData, "paymentToken");
    const paymentRequestId = readOptionalString(formData, "paymentRequestId");
    const note = readOptionalString(formData, "note") ?? "";
    const uploadedVia = readOptionalString(formData, "uploadedVia") ?? (token ? "public_link" : "member_portal");

    const proofFileRaw = formData.get("proofFile");
    if (!(proofFileRaw instanceof File) || proofFileRaw.size <= 0) {
      throw new Error(localize(locale, copy.invalidProofFile));
    }
    const proofFile = proofFileRaw;

    if (!token && !paymentRequestId) {
      throw new Error(localize(locale, copy.missingPaymentContext));
    }

    if (paymentRequestId) {
      const user = await getSupabaseUser();
      const customer = user ? await getCustomerByAuthUserId(user.id) : null;

      if (!customer) {
        throw new Error(localize(locale, copy.memberProfileRequired));
      }

      const paymentRequest = await getPaymentRequestById(paymentRequestId);

      if (!paymentRequest || paymentRequest.customer_id !== customer.id) {
        throw new Error(localize(locale, copy.requestOwnershipMismatch));
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
    console.warn("[payments] Failed to upload payment proof", error);
    const candidateMessage = error instanceof Error ? error.message : "";
    const message = safeValidationMessages.has(candidateMessage) ? candidateMessage : localize(locale, copy.uploadPaymentProofFailed);
    redirectWithActionResult(returnTo, "error", message);
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/member");

  if (returnTo) {
    redirect(buildActionResultHref(returnTo, { kind: "success", message: localize(locale, copy.paymentProofUploaded) }));
  }
}

export async function verifyPaymentRequestAction(formData: FormData) {
  const returnTo = readReturnTo(formData);
  const locale = readLocaleFromFormData(formData);
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
    console.warn("[payments] Failed to verify payment request", { error, status });
    redirectWithActionResult(
      returnTo,
      "error",
      status === "verified" ? localize(locale, copy.depositConfirmationFailed) : localize(locale, copy.paymentProofRejectedFailed)
    );
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/member");
  redirectWithActionResult(
    returnTo,
    "success",
    status === "verified" ? localize(locale, copy.depositConfirmed) : localize(locale, copy.paymentProofRejected)
  );
}
