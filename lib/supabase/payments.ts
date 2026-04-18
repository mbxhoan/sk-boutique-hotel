import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { extname } from "node:path";

import type {
  BranchBankAccountRow,
  PaymentProofRow,
  PaymentRequestRow,
  PaymentRequestStatus,
  PaymentProofStatus,
  PaymentRequestUpdate,
  ReservationRow
} from "@/lib/supabase/database.types";
import { getPaymentUploadTokenSecret, hasPaymentUploadTokenSecret } from "@/lib/supabase/env";
import { logAuditEvent } from "@/lib/supabase/audit";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type CreatePaymentRequestInput = {
  amount: number;
  branchBankAccountId?: string | null;
  createdBy?: string | null;
  note?: string;
  paymentRequestStatus?: PaymentRequestStatus;
  reservationId: string;
  source?: string;
};

export type UploadPaymentProofInput = {
  note?: string;
  paymentRequestId?: string;
  paymentToken?: string;
  proofFile: File;
  uploadedByUserId?: string | null;
  uploadedVia?: string;
};

export type VerifyPaymentRequestInput = {
  actorRole?: string | null;
  actorUserId?: string | null;
  paymentRequestId: string;
  reviewNote?: string;
  status: "verified" | "rejected";
};

export type PaymentRequestWithSnapshot = PaymentRequestRow & {
  branch_bank_account: BranchBankAccountRow | null;
  reservation: ReservationRow | null;
};

function normalizeAmount(value: number) {
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}

function createSignature(payload: string) {
  const secret = getPaymentUploadTokenSecret();
  return createHmac("sha256", secret).update(payload).digest("base64url").slice(0, 24);
}

function normalizeTokenSegment(token: string) {
  const trimmed = token.trim();

  if (!trimmed.length) {
    throw new Error("Payment upload token is empty.");
  }

  return trimmed;
}

function splitPaymentToken(token: string) {
  const normalized = normalizeTokenSegment(token);
  const dotIndex = normalized.lastIndexOf(".");

  if (dotIndex <= 0 || dotIndex === normalized.length - 1) {
    throw new Error("Invalid payment upload token format.");
  }

  return {
    paymentCode: normalized.slice(0, dotIndex),
    signature: normalized.slice(dotIndex + 1)
  };
}

function verifySignature(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function buildPaymentUploadToken(paymentRequest: Pick<PaymentRequestRow, "amount" | "branch_id" | "currency" | "payment_code" | "reservation_id">) {
  if (!hasPaymentUploadTokenSecret()) {
    return null;
  }

  const payload = [
    paymentRequest.payment_code,
    paymentRequest.reservation_id,
    paymentRequest.branch_id,
    normalizeAmount(paymentRequest.amount).toFixed(2),
    paymentRequest.currency
  ].join(":");

  return `${paymentRequest.payment_code}.${createSignature(payload)}`;
}

export function buildPaymentUploadPath(paymentRequest: Pick<PaymentRequestRow, "amount" | "branch_id" | "currency" | "payment_code" | "reservation_id">) {
  const token = buildPaymentUploadToken(paymentRequest);

  return token ? `/thanh-toan/${token}` : null;
}

export function buildVietQrImageUrl(paymentRequest: {
  account_name: string;
  account_number: string;
  amount: number;
  bank_bin: string;
  currency: string;
  payment_code: string;
  transfer_content: string;
}) {
  const amount = Math.max(0, Math.round(paymentRequest.amount));
  const bank = encodeURIComponent(paymentRequest.bank_bin);
  const account = encodeURIComponent(paymentRequest.account_number);
  const transferContent = encodeURIComponent(paymentRequest.transfer_content || paymentRequest.payment_code);
  const accountName = encodeURIComponent(paymentRequest.account_name);

  return `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=${amount}&addInfo=${transferContent}&accountName=${accountName}`;
}

function buildConfirmationPdfPath(paymentCode: string) {
  return `booking-confirmations/${paymentCode}.pdf`;
}

export async function getPaymentRequestByPaymentCode(paymentCode: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("payment_requests")
    .select(
      "id, payment_code, reservation_id, branch_id, customer_id, branch_bank_account_id, bank_name, bank_bin, account_name, account_number, amount, currency, transfer_content, note, source, status, public_upload_link_expires_at, proof_uploaded_at, verified_at, rejected_at, rejected_reason, confirmation_email_sent_at, confirmation_email_to, confirmation_pdf_generated_at, confirmation_pdf_path, created_by, updated_by, created_at, updated_at"
    )
    .eq("payment_code", paymentCode)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as PaymentRequestRow | null;
}

export async function getPaymentRequestByPublicToken(token: string) {
  const { paymentCode, signature } = splitPaymentToken(token);
  const paymentRequest = await getPaymentRequestByPaymentCode(paymentCode);

  if (!paymentRequest || !hasPaymentUploadTokenSecret()) {
    return null;
  }

  if (paymentRequest.public_upload_link_expires_at && new Date(paymentRequest.public_upload_link_expires_at).getTime() < Date.now()) {
    return null;
  }

  const payload = [
    paymentRequest.payment_code,
    paymentRequest.reservation_id,
    paymentRequest.branch_id,
    normalizeAmount(paymentRequest.amount).toFixed(2),
    paymentRequest.currency
  ].join(":");
  const expectedSignature = createSignature(payload);

  if (!verifySignature(expectedSignature, signature)) {
    return null;
  }

  return paymentRequest;
}

export async function createPaymentRequest(input: CreatePaymentRequestInput) {
  const supabase = createSupabaseServiceClient();
  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .select(
      "id, booking_code, branch_id, customer_id, primary_room_type_id, stay_start_at, stay_end_at, guest_count, status, base_price, weekend_surcharge, manual_override_price, nightly_rate, total_amount, deposit_amount, expires_at, source, notes, confirmed_at, cancelled_at, completed_at, created_by, updated_by, created_at, updated_at"
    )
    .eq("id", input.reservationId)
    .maybeSingle();

  if (reservationError) {
    throw reservationError;
  }

  if (!reservation) {
    throw new Error("Reservation not found for payment request.");
  }

  const bankAccountQuery = input.branchBankAccountId
    ? supabase
        .from("branch_bank_accounts")
        .select("id, branch_id, bank_name, bank_bin, account_name, account_number, account_label, qr_provider, is_default, is_active, sort_order, created_at, updated_at")
        .eq("id", input.branchBankAccountId)
        .maybeSingle()
    : supabase
        .from("branch_bank_accounts")
        .select("id, branch_id, bank_name, bank_bin, account_name, account_number, account_label, qr_provider, is_default, is_active, sort_order, created_at, updated_at")
        .eq("branch_id", reservation.branch_id)
        .eq("is_active", true)
        .order("is_default", { ascending: false })
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();

  const { data: bankAccount, error: bankAccountError } = await bankAccountQuery;

  if (bankAccountError) {
    throw bankAccountError;
  }

  if (!bankAccount) {
    throw new Error("No active branch bank account found.");
  }

  if (bankAccount.branch_id !== reservation.branch_id) {
    throw new Error("Selected bank account does not belong to the reservation branch.");
  }

  const amount = normalizeAmount(input.amount);
  const transferContent = reservation.booking_code;
  const { data, error } = await supabase
    .from("payment_requests")
    .insert({
      account_name: bankAccount.account_name,
      account_number: bankAccount.account_number,
      amount,
      bank_bin: bankAccount.bank_bin,
      bank_name: bankAccount.bank_name,
      branch_bank_account_id: bankAccount.id,
      branch_id: reservation.branch_id,
      confirmation_email_sent_at: null,
      confirmation_email_to: null,
      confirmation_pdf_generated_at: null,
      confirmation_pdf_path: null,
      created_by: input.createdBy ?? null,
      currency: "VND",
      customer_id: reservation.customer_id,
      note: input.note ?? "",
      proof_uploaded_at: null,
      public_upload_link_expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      rejected_at: null,
      rejected_reason: "",
      reservation_id: reservation.id,
      source: input.source ?? "admin_console",
      status: input.paymentRequestStatus ?? "sent",
      transfer_content: transferContent,
      updated_by: input.createdBy ?? null,
      verified_at: null
    })
    .select(
      "id, payment_code, reservation_id, branch_id, customer_id, branch_bank_account_id, bank_name, bank_bin, account_name, account_number, amount, currency, transfer_content, note, source, status, public_upload_link_expires_at, proof_uploaded_at, verified_at, rejected_at, rejected_reason, confirmation_email_sent_at, confirmation_email_to, confirmation_pdf_generated_at, confirmation_pdf_path, created_by, updated_by, created_at, updated_at"
    )
    .single();

  if (error) {
    throw error;
  }

  await logAuditEvent({
    action: "payment_request_created",
    actorRole: input.createdBy ?? "staff",
    branchId: reservation.branch_id,
    customerId: reservation.customer_id,
    entityId: data.id,
    entityType: "payment_request",
    reservationId: reservation.id,
    summary: `Payment request ${data.payment_code} created for reservation ${reservation.booking_code}.`,
    metadata: {
      branch_bank_account_id: bankAccount.id,
      amount
    }
  });

  return data as PaymentRequestRow;
}

export async function uploadPaymentProof(input: UploadPaymentProofInput) {
  const supabase = createSupabaseServiceClient();
  let paymentRequest: PaymentRequestRow | null = null;

  if (input.paymentRequestId) {
    const { data, error } = await supabase
      .from("payment_requests")
      .select(
        "id, payment_code, reservation_id, branch_id, customer_id, branch_bank_account_id, bank_name, bank_bin, account_name, account_number, amount, currency, transfer_content, note, source, status, public_upload_link_expires_at, proof_uploaded_at, verified_at, rejected_at, rejected_reason, confirmation_email_sent_at, confirmation_email_to, confirmation_pdf_generated_at, confirmation_pdf_path, created_by, updated_by, created_at, updated_at"
      )
      .eq("id", input.paymentRequestId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    paymentRequest = data ?? null;
  } else if (input.paymentToken) {
    paymentRequest = await getPaymentRequestByPublicToken(input.paymentToken);
  }

  if (!paymentRequest) {
    throw new Error("Payment request not found.");
  }

  const fileName = input.proofFile.name || "payment-proof";
  const filePath = `${paymentRequest.payment_code}/${Date.now()}-${randomUUID()}${extname(fileName).toLowerCase()}`;
  const uploadResult = await supabase.storage.from("payment-proofs").upload(filePath, input.proofFile, {
    cacheControl: "3600",
    contentType: input.proofFile.type || "application/octet-stream",
    upsert: false
  });

  if (uploadResult.error) {
    throw uploadResult.error;
  }

  const { data: proof, error: proofError } = await supabase
    .from("payment_proofs")
    .insert({
      customer_id: paymentRequest.customer_id,
      file_bucket: "payment-proofs",
      file_name: fileName,
      file_path: filePath,
      file_size: input.proofFile.size,
      mime_type: input.proofFile.type || "application/octet-stream",
      note: input.note ?? "",
      payment_request_id: paymentRequest.id,
      review_note: "",
      reviewed_at: null,
      reviewed_by: null,
      status: "uploaded",
      uploaded_by_user_id: input.uploadedByUserId ?? null,
      uploaded_via: input.uploadedVia ?? (input.paymentToken ? "public_link" : "member_portal")
    })
    .select(
      "id, payment_request_id, customer_id, uploaded_by_user_id, file_bucket, file_path, file_name, mime_type, file_size, uploaded_via, note, status, reviewed_at, reviewed_by, review_note, created_at, updated_at"
    )
    .single();

  if (proofError) {
    throw proofError;
  }

  await logAuditEvent({
    action: "payment_proof_uploaded",
    actorRole: input.uploadedByUserId ? "member" : "guest",
    branchId: paymentRequest.branch_id,
    customerId: paymentRequest.customer_id,
    entityId: proof.id,
    entityType: "payment_proof",
    reservationId: paymentRequest.reservation_id,
    summary: `Payment proof uploaded for ${paymentRequest.payment_code}.`,
    metadata: {
      file_path: filePath,
      uploaded_via: input.uploadedVia ?? (input.paymentToken ? "public_link" : "member_portal")
    }
  });

  const { data: updatedRequest, error: requestError } = await supabase
    .from("payment_requests")
    .select(
      "id, payment_code, reservation_id, branch_id, customer_id, branch_bank_account_id, bank_name, bank_bin, account_name, account_number, amount, currency, transfer_content, note, source, status, public_upload_link_expires_at, proof_uploaded_at, verified_at, rejected_at, rejected_reason, confirmation_email_sent_at, confirmation_email_to, confirmation_pdf_generated_at, confirmation_pdf_path, created_by, updated_by, created_at, updated_at"
    )
    .eq("id", paymentRequest.id)
    .maybeSingle();

  if (requestError) {
    throw requestError;
  }

  return {
    payment_proof: proof as PaymentProofRow,
    payment_request: updatedRequest as PaymentRequestRow
  };
}

export async function verifyPaymentRequest(input: VerifyPaymentRequestInput) {
  const supabase = createSupabaseServiceClient();
  const { data: paymentRequest, error: requestError } = await supabase
    .from("payment_requests")
    .select(
      "id, payment_code, reservation_id, branch_id, customer_id, branch_bank_account_id, bank_name, bank_bin, account_name, account_number, amount, currency, transfer_content, note, source, status, public_upload_link_expires_at, proof_uploaded_at, verified_at, rejected_at, rejected_reason, confirmation_email_sent_at, confirmation_email_to, confirmation_pdf_generated_at, confirmation_pdf_path, created_by, updated_by, created_at, updated_at"
    )
    .eq("id", input.paymentRequestId)
    .maybeSingle();

  if (requestError) {
    throw requestError;
  }

  if (!paymentRequest) {
    throw new Error("Payment request not found.");
  }

  const { data: latestProof, error: proofError } = await supabase
    .from("payment_proofs")
    .select("id, status, reviewed_at, reviewed_by, review_note")
    .eq("payment_request_id", paymentRequest.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (proofError) {
    throw proofError;
  }

  const reviewedAt = new Date().toISOString();
  const confirmationPdfPath = buildConfirmationPdfPath(paymentRequest.payment_code);
  const confirmationEmailTo = paymentRequest.confirmation_email_to ?? null;

  if (latestProof) {
    const { error } = await supabase
      .from("payment_proofs")
      .update({
        review_note: input.reviewNote ?? latestProof.review_note ?? "",
        reviewed_at: reviewedAt,
        reviewed_by: input.actorUserId ?? null,
        status: input.status === "verified" ? "verified" : "rejected"
      })
      .eq("id", latestProof.id);

    if (error) {
      throw error;
    }
  }

  const nextRequestStatus: PaymentRequestStatus = input.status === "verified" ? "verified" : "rejected";
  const requestPatch: PaymentRequestUpdate = {
    confirmation_email_sent_at: input.status === "verified" ? reviewedAt : paymentRequest.confirmation_email_sent_at,
    confirmation_email_to: confirmationEmailTo,
    confirmation_pdf_generated_at: input.status === "verified" ? reviewedAt : paymentRequest.confirmation_pdf_generated_at,
    confirmation_pdf_path: input.status === "verified" ? confirmationPdfPath : paymentRequest.confirmation_pdf_path,
    rejected_at: input.status === "rejected" ? reviewedAt : paymentRequest.rejected_at,
    rejected_reason: input.status === "rejected" ? input.reviewNote ?? "" : paymentRequest.rejected_reason,
    status: nextRequestStatus,
    updated_by: input.actorRole ?? paymentRequest.updated_by,
    verified_at: input.status === "verified" ? reviewedAt : paymentRequest.verified_at
  };

  const { error: updateError } = await supabase.from("payment_requests").update(requestPatch).eq("id", paymentRequest.id);

  if (updateError) {
    throw updateError;
  }

  if (input.status === "verified") {
    const { error: reservationError } = await supabase
      .from("reservations")
      .update({
        confirmed_at: reviewedAt,
        status: "confirmed",
        updated_by: input.actorRole ?? paymentRequest.updated_by
      })
      .eq("id", paymentRequest.reservation_id);

    if (reservationError) {
      throw reservationError;
    }
  }

  await logAuditEvent({
    action: input.status === "verified" ? "payment_request_verified" : "payment_request_rejected",
    actorRole: input.actorRole ?? "staff",
    actorUserId: input.actorUserId ?? null,
    branchId: paymentRequest.branch_id,
    customerId: paymentRequest.customer_id,
    entityId: paymentRequest.id,
    entityType: "payment_request",
    reservationId: paymentRequest.reservation_id,
    summary:
      input.status === "verified"
        ? `Payment request ${paymentRequest.payment_code} verified and reservation confirmed.`
        : `Payment request ${paymentRequest.payment_code} rejected.`,
    metadata: {
      confirmation_pdf_path: input.status === "verified" ? confirmationPdfPath : null,
      review_note: input.reviewNote ?? ""
    }
  });

  return {
    payment_request: {
      ...paymentRequest,
      ...requestPatch
    } as PaymentRequestRow,
    latest_proof: latestProof
  };
}
