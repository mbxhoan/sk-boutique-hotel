"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildActionResultHref, readSafeReturnTo } from "@/lib/action-result";
import { getFirstContactDetailsError, normalizeContactDetails, resolveContactDetailsError, validateContactDetails } from "@/lib/contact-details";
import { localize } from "@/lib/mock/i18n";
import { readLocaleFromFormData } from "@/lib/locale";
import { getSupabaseUser, getSupabaseUserPortalRole } from "@/lib/supabase/auth";
import { memberProfileUpdateError, syncMemberProfile } from "@/lib/supabase/member-profile";
import { getCustomerByAuthUserId, getCustomerByEmail } from "@/lib/supabase/queries/customers";
import { cancelMemberBooking } from "@/lib/supabase/member-booking";
import { memberBookingCancelError, type MemberBookingKind } from "@/lib/supabase/member-booking-policy";

const copy = {
  bookingCancelled: {
    vi: "Booking đã được hủy.",
    en: "Booking cancelled."
  },
  bookingCancelFailed: {
    vi: "Không thể hủy booking.",
    en: "Unable to cancel the booking."
  },
  bookingNotCancellable: {
    vi: "Booking này đã được xác nhận hoặc không còn có thể hủy.",
    en: "This booking can no longer be cancelled."
  },
  bookingNotOwned: {
    vi: "Booking này không thuộc về member hiện tại.",
    en: "This booking does not belong to the current member."
  },
  bookingNotFound: {
    vi: "Không tìm thấy booking.",
    en: "Booking was not found."
  },
  memberProfileNoChange: {
    vi: "Thông tin member không thay đổi.",
    en: "No member profile changes were made."
  },
  memberProfileRequiredToUpdate: {
    vi: "Cần có hồ sơ member để cập nhật thông tin.",
    en: "A member profile is required to update information."
  },
  memberProfileUpdated: {
    vi: "Đã cập nhật thông tin member.",
    en: "Member information updated."
  },
  invalidBookingKind: {
    vi: "Loại booking không hợp lệ.",
    en: "Invalid booking type."
  },
  memberProfileRequired: {
    vi: "Cần có hồ sơ member để hủy booking.",
    en: "A member profile is required to cancel the booking."
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

function readReturnTo(formData: FormData) {
  return readSafeReturnTo(readOptionalString(formData, "returnTo"));
}

function redirectWithActionResult(returnTo: string | null, kind: "error" | "success", message: string) {
  if (!returnTo) {
    return;
  }

  redirect(buildActionResultHref(returnTo, { kind, message }));
}

function mapMemberProfileUpdateError(locale: "en" | "vi", error: unknown) {
  if (error instanceof Error && error.message === memberProfileUpdateError.MEMBER_PROFILE_REQUIRED) {
    return localize(locale, copy.memberProfileRequiredToUpdate);
  }

  if (error instanceof Error && error.message === memberProfileUpdateError.EMAIL_ALREADY_USED) {
    return localize(locale, {
      vi: "Email này đã được dùng bởi member khác.",
      en: "This email is already used by another member."
    });
  }

  const resolved = resolveContactDetailsError(locale, error);

  if (resolved.field) {
    return resolved.message;
  }

  return resolved.message;
}

function normalizeBookingKind(value: string): MemberBookingKind {
  if (value === "request" || value === "reservation") {
    return value;
  }

  throw new Error(memberBookingCancelError.INVALID_KIND);
}

function mapBookingCancelError(locale: "en" | "vi", errorCode: string) {
  switch (errorCode) {
    case memberBookingCancelError.MEMBER_PROFILE_REQUIRED:
      return localize(locale, copy.memberProfileRequired);
    case memberBookingCancelError.NOT_FOUND:
      return localize(locale, copy.bookingNotFound);
    case memberBookingCancelError.NOT_OWNED:
      return localize(locale, copy.bookingNotOwned);
    case memberBookingCancelError.NOT_CANCELLABLE:
      return localize(locale, copy.bookingNotCancellable);
    case memberBookingCancelError.INVALID_KIND:
      return localize(locale, copy.invalidBookingKind);
    default:
      return localize(locale, copy.bookingCancelFailed);
  }
}

export async function cancelMemberBookingAction(formData: FormData) {
  const user = await getSupabaseUser().catch(() => null);
  const actorRole = user ? getSupabaseUserPortalRole(user) : null;
  const returnTo = readReturnTo(formData);
  const locale = readLocaleFromFormData(formData);

  try {
    if (!user) {
      throw new Error(memberBookingCancelError.MEMBER_PROFILE_REQUIRED);
    }

    const customer = (await getCustomerByAuthUserId(user.id)) ?? (user.email ? await getCustomerByEmail(user.email) : null);

    if (!customer) {
      throw new Error(memberBookingCancelError.MEMBER_PROFILE_REQUIRED);
    }

    const bookingKind = normalizeBookingKind(readRequiredString(formData, "bookingKind"));
    const bookingId = readRequiredString(formData, "bookingId");

    await cancelMemberBooking({
      actorRole: actorRole ?? "member",
      actorUserId: user.id,
      bookingId,
      bookingKind,
      customerEmail: customer.email,
      customerId: customer.id,
      reason:
        locale === "en"
          ? "Cancelled by the member from the portal."
          : "Khách hàng tự hủy từ cổng thành viên."
    });
  } catch (error) {
    console.warn("[member] Failed to cancel booking", error);
    const candidateMessage = error instanceof Error ? error.message : "";
    redirectWithActionResult(returnTo, "error", mapBookingCancelError(locale, candidateMessage));
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/member");
  redirectWithActionResult(returnTo, "success", localize(locale, copy.bookingCancelled));
}

export async function updateMemberProfileAction(formData: FormData) {
  const user = await getSupabaseUser().catch(() => null);
  const actorRole = user ? getSupabaseUserPortalRole(user) : null;
  const returnTo = readReturnTo(formData);
  const locale = readLocaleFromFormData(formData);
  const preferredLocale = formData.get("preferredLocale") === "en" ? "en" : "vi";

  try {
    if (!user) {
      throw new Error(memberProfileUpdateError.MEMBER_PROFILE_REQUIRED);
    }

    const fullName = readRequiredString(formData, "fullName");
    const email = readRequiredString(formData, "email");
    const phone = readRequiredString(formData, "phone");
    const marketingConsent = formData.get("marketingConsent") === "on";
    const contactDetails = normalizeContactDetails({
      email,
      fullName,
      phone
    });
    const validation = validateContactDetails(locale, contactDetails, { phoneRequired: true });
    const validationError = getFirstContactDetailsError(validation.errors);

    if (validationError) {
      redirectWithActionResult(
        returnTo,
        "error",
        localize(locale, {
          vi: "Thông tin member không hợp lệ. Vui lòng kiểm tra email và số điện thoại.",
          en: "Your member profile is invalid. Please check the email and phone number."
        })
      );
      return;
    }

    const result = await syncMemberProfile({
      actorRole: actorRole ?? "member",
      actorUserId: user.id,
      authUserId: user.id,
      email: validation.values.email,
      fullName: validation.values.fullName,
      marketingConsent,
      phone: validation.values.phone,
      preferredLocale,
      source: "member_portal"
    });

    revalidatePath("/admin");
    revalidatePath("/admin/accounts");
    revalidatePath("/member");

    redirectWithActionResult(
      returnTo,
      "success",
      localize(locale, result.changed ? copy.memberProfileUpdated : copy.memberProfileNoChange)
    );
  } catch (error) {
    console.warn("[member] Failed to update profile", error);
    const candidateMessage = mapMemberProfileUpdateError(locale, error);
    redirectWithActionResult(returnTo, "error", candidateMessage);
    throw error;
  }
}
