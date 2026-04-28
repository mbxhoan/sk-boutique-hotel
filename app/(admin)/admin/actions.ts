"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildActionResultHref, readSafeReturnTo } from "@/lib/action-result";
import { localize } from "@/lib/mock/i18n";
import { readLocaleFromFormData } from "@/lib/locale";
import { sendEmail } from "@/lib/supabase/email";
import { sendDepositRequestCustomerEmail } from "@/lib/supabase/email";
import { updateReservationLifecycle } from "@/lib/supabase/booking-lifecycle";
import { calculateDepositAmount } from "@/lib/supabase/booking-finance";
import {
  confirmAvailabilityRequest,
  createReservation,
  holdRoom,
  releaseExpiredHolds,
  releaseExpiredReservations,
  submitAvailabilityRequest,
  updateAvailabilityRequestStatus
} from "@/lib/supabase/workflows";
import {
  createPaymentRequestAction as submitCreatePaymentRequestAction,
  submitPaymentProofAction as submitPaymentProofActionImpl,
  verifyPaymentRequestAction as verifyPaymentRequestActionImpl
} from "@/app/actions/payments";
import { logAuditEvent } from "@/lib/supabase/audit";
import { listBranches } from "@/lib/supabase/queries/branches";
import { listCustomersByIds } from "@/lib/supabase/queries/customers";
import { getPaymentRequestById } from "@/lib/supabase/queries/payment-requests";
import { getReservationById } from "@/lib/supabase/queries/reservations";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";
import { getSupabaseEmailAdminRecipient, getSupabaseEmailFromAddress } from "@/lib/supabase/env";
import { buildEmailTemplateTestEmail, type EmailTemplateTestKey } from "@/lib/email/test-presets";
import { getSupabaseUser, getSupabaseUserPortalRole } from "@/lib/supabase/auth";
import { buildMemberPortalUrl, buildVietQrImageUrl, createPaymentRequest } from "@/lib/supabase/payments";

const copy = {
  bookingCancelledSuccessfully: {
    vi: "Booking đã được hủy.",
    en: "Booking cancelled successfully."
  },
  bookingMarkedAsCompleted: {
    vi: "Booking đã được đánh dấu hoàn tất.",
    en: "Booking marked as completed."
  },
  bookingRequestRejected: {
    vi: "Yêu cầu booking đã bị từ chối.",
    en: "Booking request was rejected."
  },
  bookingRequestUpdated: {
    vi: "Yêu cầu booking đã được cập nhật.",
    en: "Booking request was updated."
  },
  bookingConfirmedAndDepositQrIssued: {
    vi: "Booking đã được xác nhận và QR cọc đã được phát hành.",
    en: "Booking confirmed and deposit QR issued."
  },
  bookingNotFound: {
    vi: "Không tìm thấy booking.",
    en: "Booking was not found."
  },
  depositEmailSentAgain: {
    vi: "Email deposit đã được gửi lại.",
    en: "Deposit email sent again."
  },
  depositQrIssuedAgain: {
    vi: "QR cọc mới đã được phát hành.",
    en: "A new deposit QR has been issued."
  },
  memberNotificationSent: {
    vi: "Thông báo cho member đã được gửi.",
    en: "Member notification sent."
  },
  paymentRequestNotFound: {
    vi: "Không tìm thấy yêu cầu thanh toán.",
    en: "Payment request was not found."
  },
  reservationNotFoundForPaymentRequest: {
    vi: "Không tìm thấy booking của yêu cầu thanh toán.",
    en: "Reservation not found for payment request."
  },
  customerProfileNotFoundForPaymentRequest: {
    vi: "Không tìm thấy hồ sơ khách cho yêu cầu thanh toán.",
    en: "Customer profile not found for payment request."
  },
  depositAmountMustBeGreaterThanZero: {
    vi: "Số tiền cọc phải lớn hơn 0.",
    en: "Deposit amount must be greater than zero."
  },
  unableToCancelBooking: {
    vi: "Không thể hủy booking.",
    en: "Unable to cancel booking."
  },
  unableToCompleteBooking: {
    vi: "Không thể hoàn tất booking.",
    en: "Unable to complete booking."
  },
  unableToConfirmBooking: {
    vi: "Không thể xác nhận booking.",
    en: "Unable to confirm booking."
  },
  unableToCreatePaymentRequest: {
    vi: "Không thể tạo yêu cầu thanh toán.",
    en: "Unable to create payment request."
  },
  unableToRegenerateDepositQr: {
    vi: "Không thể tạo lại QR cọc.",
    en: "Unable to regenerate deposit QR."
  },
  unableToResendDepositEmail: {
    vi: "Không thể gửi lại email cọc.",
    en: "Unable to resend deposit email."
  },
  unableToSendMemberNotification: {
    vi: "Không thể gửi thông báo cho member.",
    en: "Unable to send member notification."
  },
  unableToUpdateBookingRequest: {
    vi: "Không thể cập nhật yêu cầu booking.",
    en: "Unable to update booking request."
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

function redirectWithActionResult(returnTo: string | null, kind: "error" | "success", message: string) {
  if (!returnTo) {
    return;
  }

  redirect(buildActionResultHref(returnTo, { kind, message }));
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

function formatMoneyVnd(value: number) {
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Math.max(0, value))}đ`;
}

function formatDateTimeVn(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(value));
}

async function loadPaymentRequestDetail(paymentRequestId: string) {
  const paymentRequest = await getPaymentRequestById(paymentRequestId);

  if (!paymentRequest) {
    throw new Error("Payment request not found.");
  }

  const reservation = await getReservationById(paymentRequest.reservation_id);

  if (!reservation) {
    throw new Error("Reservation not found for payment request.");
  }

  const [branches, roomTypes, customers] = await Promise.all([
    listBranches(),
    listRoomTypes(),
    listCustomersByIds([paymentRequest.customer_id])
  ]);

  const branch = branches.find((item) => item.id === paymentRequest.branch_id) ?? null;
  const roomType = roomTypes.find((item) => item.id === reservation.primary_room_type_id) ?? null;
  const customer = customers[0] ?? null;

  if (!customer) {
    throw new Error("Customer profile not found for payment request.");
  }

  return {
    branch,
    customer,
    paymentRequest,
    reservation,
    roomType
  };
}

const availabilityRequestStatusOptions = ["new", "in_review", "quoted", "closed", "rejected"] as const;
type AvailabilityRequestStatusOption = (typeof availabilityRequestStatusOptions)[number];

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

export async function updateAvailabilityRequestStatusAction(formData: FormData) {
  const status = readRequiredString(formData, "status");
  const returnTo = readSafeReturnTo(readOptionalString(formData, "returnTo"));
  const locale = readLocaleFromFormData(formData);

  if (!availabilityRequestStatusOptions.includes(status as AvailabilityRequestStatusOption)) {
    throw new Error(`Unsupported availability request status: ${status}`);
  }

  const user = await getSupabaseUser().catch(() => null);
  const actorRole = user ? getSupabaseUserPortalRole(user) : null;

  try {
    await updateAvailabilityRequestStatus({
      actorRole: actorRole ?? readOptionalString(formData, "actorRole") ?? "staff",
      actorUserId: user?.id ?? readOptionalString(formData, "actorUserId"),
      availabilityRequestId: readRequiredString(formData, "availabilityRequestId"),
      note: readOptionalString(formData, "note"),
      status: status as AvailabilityRequestStatusOption
    });
  } catch (error) {
    console.warn("[admin] Failed to update booking request", error);
    redirectWithActionResult(returnTo, "error", localize(locale, copy.unableToUpdateBookingRequest));
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/member");
  redirectWithActionResult(returnTo, "success", status === "rejected" ? localize(locale, copy.bookingRequestRejected) : localize(locale, copy.bookingRequestUpdated));
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
  revalidatePath("/member");
}

export async function confirmAvailabilityRequestAction(formData: FormData) {
  const user = await getSupabaseUser().catch(() => null);
  const actorRole = user ? getSupabaseUserPortalRole(user) : null;
  const returnTo = readSafeReturnTo(readOptionalString(formData, "returnTo"));
  const locale = readLocaleFromFormData(formData);

  try {
    await confirmAvailabilityRequest({
      actorRole: actorRole ?? readOptionalString(formData, "actorRole") ?? "staff",
      actorUserId: user?.id ?? readOptionalString(formData, "actorUserId"),
      availabilityRequestId: readRequiredString(formData, "availabilityRequestId"),
      branchBankAccountId: readOptionalString(formData, "branchBankAccountId"),
      depositAmount: readOptionalNumber(formData, "depositAmount"),
      depositPercent: readOptionalNumber(formData, "depositPercent"),
      guestCount: readOptionalNumber(formData, "guestCount") ?? 1,
      notes: readOptionalString(formData, "notes") ?? "",
      roomId: readRequiredString(formData, "roomId"),
      roomTypeId: readRequiredString(formData, "roomTypeId"),
      stayEndAt: readRequiredString(formData, "stayEndAt"),
      stayStartAt: readRequiredString(formData, "stayStartAt")
    });
  } catch (error) {
    console.warn("[admin] Failed to confirm booking", error);
    redirectWithActionResult(returnTo, "error", localize(locale, copy.unableToConfirmBooking));
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/member");
  redirectWithActionResult(returnTo, "success", localize(locale, copy.bookingConfirmedAndDepositQrIssued));
}

export async function reissueDepositPaymentRequestAction(formData: FormData) {
  const user = await getSupabaseUser().catch(() => null);
  const actorRole = user ? getSupabaseUserPortalRole(user) : null;
  const returnTo = readSafeReturnTo(readOptionalString(formData, "returnTo"));
  const locale = readLocaleFromFormData(formData);
  const reservationId = readRequiredString(formData, "reservationId");
  const reservation = await getReservationById(reservationId);

  if (!reservation) {
    if (returnTo) {
      redirectWithActionResult(returnTo, "error", localize(locale, copy.bookingNotFound));
      return;
    }

    throw new Error(localize(locale, copy.bookingNotFound));
  }

  const depositAmount = calculateDepositAmount({
    depositAmount: readOptionalNumber(formData, "depositAmount"),
    depositPercent: readOptionalNumber(formData, "depositPercent"),
    totalAmount: reservation.total_amount
  });

  if (depositAmount <= 0) {
    if (returnTo) {
      redirectWithActionResult(returnTo, "error", localize(locale, copy.depositAmountMustBeGreaterThanZero));
      return;
    }

    throw new Error(localize(locale, copy.depositAmountMustBeGreaterThanZero));
  }

  try {
    const paymentRequest = await createPaymentRequest({
      actorRole: actorRole ?? readOptionalString(formData, "actorRole") ?? "staff",
      amount: depositAmount,
      branchBankAccountId: readOptionalString(formData, "branchBankAccountId"),
      createdBy: user?.id ?? readOptionalString(formData, "actorUserId"),
      note: readOptionalString(formData, "note") ?? "",
      reservationId,
      source: readOptionalString(formData, "source") ?? "admin_console"
    });

    await logAuditEvent({
      action: "payment_request.reissued",
      actorRole: actorRole ?? readOptionalString(formData, "actorRole") ?? "staff",
      actorUserId: user?.id ?? readOptionalString(formData, "actorUserId"),
      branchId: reservation.branch_id,
      customerId: reservation.customer_id,
      entityId: paymentRequest.id,
      entityType: "payment_request",
      reservationId: reservation.id,
      summary: localize(locale, {
        vi: `QR cọc đã được tạo lại cho booking ${reservation.booking_code}.`,
        en: `Deposit QR reissued for booking ${reservation.booking_code}.`
      }),
      metadata: {
        amount: paymentRequest.amount,
        branch_bank_account_id: paymentRequest.branch_bank_account_id,
        deposit_percent: readOptionalNumber(formData, "depositPercent")
      }
    });
  } catch (error) {
    console.warn("[admin] Failed to regenerate deposit QR", error);
    redirectWithActionResult(returnTo, "error", localize(locale, copy.unableToRegenerateDepositQr));
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/member");
  redirectWithActionResult(returnTo, "success", localize(locale, copy.depositQrIssuedAgain));
}

export async function updateReservationLifecycleAction(formData: FormData) {
  const user = await getSupabaseUser().catch(() => null);
  const actorRole = user ? getSupabaseUserPortalRole(user) : null;
  const status = readRequiredString(formData, "status");
  const returnTo = readSafeReturnTo(readOptionalString(formData, "returnTo"));
  const locale = readLocaleFromFormData(formData);

  if (status !== "cancelled" && status !== "completed") {
    throw new Error(`Unsupported booking lifecycle status: ${status}`);
  }

  try {
    await updateReservationLifecycle({
      actorRole: actorRole ?? readOptionalString(formData, "actorRole") ?? "staff",
      actorUserId: user?.id ?? readOptionalString(formData, "actorUserId"),
      reason: readOptionalString(formData, "reason"),
      reservationId: readRequiredString(formData, "reservationId"),
      status
    });
  } catch (error) {
    console.warn("[admin] Failed to update reservation lifecycle", { error, status });
    redirectWithActionResult(
      returnTo,
      "error",
      status === "cancelled" ? localize(locale, copy.unableToCancelBooking) : localize(locale, copy.unableToCompleteBooking)
    );
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/member");
  redirectWithActionResult(returnTo, "success", status === "cancelled" ? localize(locale, copy.bookingCancelledSuccessfully) : localize(locale, copy.bookingMarkedAsCompleted));
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

export async function resendDepositRequestEmailAction(formData: FormData) {
  const paymentRequestId = readRequiredString(formData, "paymentRequestId");
  const returnTo = readSafeReturnTo(readOptionalString(formData, "returnTo"));
  const locale = readLocaleFromFormData(formData);

  try {
    const { branch, customer, paymentRequest, reservation, roomType } = await loadPaymentRequestDetail(paymentRequestId);
    const nights = calculateNights(reservation.stay_start_at, reservation.stay_end_at);
    const depositAmount = formatMoneyVnd(paymentRequest.amount);
    const branchName = branch?.name_vi ?? branch?.name_en ?? paymentRequest.branch_id;
    const roomTypeName = roomType?.name_vi ?? roomType?.name_en ?? reservation.primary_room_type_id;
    const paymentDeadline = paymentRequest.public_upload_link_expires_at
      ? formatDateTimeVn(paymentRequest.public_upload_link_expires_at)
      : formatDateTimeVn(new Date(Date.now() + 30 * 60 * 1000).toISOString());

    await sendDepositRequestCustomerEmail({
      bookingCode: reservation.booking_code,
      bookingUrl: buildMemberPortalUrl(),
      branchName,
      checkInDate: formatDateTimeVn(reservation.stay_start_at),
      checkOutDate: formatDateTimeVn(reservation.stay_end_at),
      depositAmount,
      guestEmail: customer.email,
      guestName: customer.full_name,
      nights: String(nights),
      paymentAccountName: paymentRequest.account_name,
      paymentAccountNumber: paymentRequest.account_number,
      paymentBankName: paymentRequest.bank_name,
      paymentDeadline,
      paymentQrUrl: buildVietQrImageUrl(paymentRequest),
      paymentTransferNote: paymentRequest.transfer_content,
      roomType: roomTypeName
    });

    await logAuditEvent({
      action: "payment_request.deposit_email_resent",
      actorRole: "admin",
      branchId: paymentRequest.branch_id,
      customerId: customer.id,
      entityId: paymentRequest.id,
      entityType: "payment_request",
      reservationId: reservation.id,
      summary: localize(locale, {
        vi: `Email cọc đã được gửi lại cho ${customer.email}.`,
        en: `Deposit request email resent to ${customer.email}.`
      })
    });
  } catch (error) {
    console.warn("[admin] Failed to resend deposit email", error);
    redirectWithActionResult(returnTo, "error", localize(locale, copy.unableToResendDepositEmail));
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/member");
  redirectWithActionResult(returnTo, "success", localize(locale, copy.depositEmailSentAgain));
}

export async function notifyPaymentRequestMemberAction(formData: FormData) {
  const paymentRequestId = readRequiredString(formData, "paymentRequestId");
  const returnTo = readSafeReturnTo(readOptionalString(formData, "returnTo"));
  const locale = readLocaleFromFormData(formData);

  try {
    const { customer, paymentRequest, reservation } = await loadPaymentRequestDetail(paymentRequestId);

    await logAuditEvent({
      action: "payment_request.notification_sent",
      actorRole: "admin",
      branchId: paymentRequest.branch_id,
      customerId: customer.id,
      entityId: paymentRequest.id,
      entityType: "payment_request",
      reservationId: reservation.id,
      summary: localize(locale, {
        vi: `Đã gửi thông báo member cho yêu cầu thanh toán ${paymentRequest.payment_code}.`,
        en: `Member notification sent for payment request ${paymentRequest.payment_code}.`
      })
    });
  } catch (error) {
    console.warn("[admin] Failed to send member notification", error);
    redirectWithActionResult(returnTo, "error", localize(locale, copy.unableToSendMemberNotification));
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/member");
  redirectWithActionResult(returnTo, "success", localize(locale, copy.memberNotificationSent));
}
