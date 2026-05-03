"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { isBookingRequestStayWindowValid } from "@/lib/booking-dates";
import {
  getContactDetailFieldError,
  getFirstContactDetailsError,
  resolveContactDetailsError,
  validateContactDetails,
  type ContactDetailsDraft,
  type ContactDetailsErrors
} from "@/lib/contact-details";
import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { DEFAULT_MEMBER_PASSWORD, resolveMemberAuthError } from "@/lib/member-auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type RoomBookingRequestFormProps = {
  branchId: string;
  guestCount: number;
  locale: Locale;
  availableRooms: number;
  quotedCurrency?: string;
  quotedNightlyRate?: number | null;
  quotedTotalAmount?: number | null;
  roomTypeId: string;
  stayEndAt: string;
  stayStartAt: string;
};

function localize(locale: Locale, vi: string, en: string) {
  return locale === "en" ? en : vi;
}

function appendErrorDetail(locale: Locale, prefixVi: string, prefixEn: string, message: string) {
  const detail = message
    .replace(/^unable to create booking request[:\s-]*/i, "")
    .replace(/^unable to submit(?: the)? booking request[:\s-]*/i, "")
    .replace(/^unable to bootstrap member profile[:\s-]*/i, "")
    .replace(/^unable to create the member profile[:\s-]*/i, "")
    .replace(/^unable to update member profile[:\s-]*/i, "")
    .trim();

  if (!detail) {
    return localize(locale, prefixVi, prefixEn);
  }

  return localize(locale, `${prefixVi}: ${detail}`, `${prefixEn}: ${detail}`);
}

function resolveBookingRequestError(locale: Locale, error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("please enter your full name") || message.includes("vui lòng nhập họ tên")) {
    return localize(locale, "Vui lòng nhập họ tên.", "Please enter your full name.");
  }

  if (message.includes("please enter your email") || message.includes("vui lòng nhập email")) {
    return localize(locale, "Vui lòng nhập email.", "Please enter your email.");
  }

  if (
    message.includes("email chưa đúng định dạng") ||
    message.includes("invalid email") ||
    message.includes("please enter a valid email address") ||
    message.includes("email is already in use") ||
    message.includes("email already exists") ||
    message.includes("already used by another member") ||
    message.includes("duplicate key value") ||
    message.includes("already registered") ||
    message.includes("already exists")
  ) {
    return resolveContactDetailsError(locale, error).message;
  }

  if (message.includes("please enter your phone number") || message.includes("vui lòng nhập số điện thoại")) {
    return localize(locale, "Vui lòng nhập số điện thoại.", "Please enter your phone number.");
  }

  if (
    message.includes("số điện thoại chưa đúng định dạng") ||
    message.includes("invalid phone") ||
    message.includes("please enter a valid phone number")
  ) {
    return resolveContactDetailsError(locale, error).message;
  }

  if (message.includes("missing required booking request fields")) {
    return localize(locale, "Vui lòng nhập đủ họ tên, email, số điện thoại và ngày lưu trú.", "Please enter your full name, email, phone number, and stay dates.");
  }

  if (
    message.includes("check-in date is invalid") ||
    message.includes("ngày nhận phòng không hợp lệ") ||
    message.includes("stay date is invalid")
  ) {
    return localize(locale, "Ngày nhận phòng không hợp lệ. Vui lòng chọn hôm nay hoặc ngày sau.", "Check-in date is invalid. Please choose today or later.");
  }

  if (message.includes("missing required member bootstrap fields")) {
    return localize(locale, "Không thể tạo hồ sơ thành viên.", "Unable to create the member profile.");
  }

  if (message.includes("no rooms are available for the selected stay window")) {
    return localize(locale, "Hết phòng trong khoảng thời gian bạn chọn.", "No rooms are available for the selected stay window.");
  }

  if (
    message.includes("unable to submit booking request") ||
    message.includes("unable to submit the booking request") ||
    message.includes("unable to create booking request")
  ) {
    return appendErrorDetail(locale, "Không thể gửi yêu cầu booking", "Unable to submit the booking request", error instanceof Error ? error.message : "");
  }

  if (message.includes("unable to bootstrap member profile") || message.includes("unable to create the member profile")) {
    return appendErrorDetail(locale, "Không thể tạo hồ sơ thành viên", "Unable to create the member profile", error instanceof Error ? error.message : "");
  }

  if (message.includes("unauthorized booking request")) {
    return localize(locale, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "Your session has expired. Please sign in again.");
  }

  return resolveMemberAuthError(locale, error);
}

export function RoomBookingRequestForm({
  branchId,
  availableRooms,
  guestCount,
  locale,
  quotedCurrency = "VND",
  quotedNightlyRate = null,
  quotedTotalAmount = null,
  roomTypeId,
  stayEndAt,
  stayStartAt
}: RoomBookingRequestFormProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [profileDraft, setProfileDraft] = useState<ContactDetailsDraft>({
    email: "",
    fullName: "",
    phone: ""
  });
  const [profileFieldErrors, setProfileFieldErrors] = useState<ContactDetailsErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setProfileDraftField(field: keyof ContactDetailsDraft, value: string) {
    setProfileDraft((current) => ({
      ...current,
      [field]: value
    }));

    setError(null);

    setProfileFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validateProfileField(field: keyof ContactDetailsDraft, value: string) {
    const fieldError = getContactDetailFieldError(locale, field, value, { phoneRequired: true });

    setProfileFieldErrors((current) => {
      if (!fieldError) {
        if (!current[field]) {
          return current;
        }

        const next = { ...current };
        delete next[field];
        return next;
      }

      return {
        ...current,
        [field]: fieldError
      };
    });
  }

  async function bootstrapMemberProfile(authUserId: string, contactName: string, contactEmail: string, contactPhone: string) {
    const response = await fetch("/api/member/bootstrap", {
      body: JSON.stringify({
        authUserId,
        email: contactEmail,
        fullName: contactName,
        phone: contactPhone,
        preferredLocale: locale,
        source: "public_site"
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? localize(locale, "Không thể tạo hồ sơ thành viên.", "Unable to create the member profile."));
    }
  }

  async function submitBookingRequest(
    authUserId: string,
    contactName: string,
    contactEmail: string,
    contactPhone: string,
    requestMarketingConsent: boolean
  ) {
    const response = await fetch("/api/public/booking-request", {
      body: JSON.stringify({
        branchId,
        contactEmail,
        contactName,
        contactPhone,
        createdBy: authUserId,
        guestCount,
        marketingConsent: requestMarketingConsent,
        note,
        preferredLocale: locale,
        quotedCurrency,
        quotedNightlyRate,
        quotedTotalAmount,
        roomTypeId,
        source: "public_site",
        stayEndAt,
        stayStartAt
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? localize(locale, "Không thể gửi yêu cầu booking.", "Unable to submit the booking request."));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setProfileFieldErrors({});

    if (!isBookingRequestStayWindowValid(stayStartAt, stayEndAt)) {
      setError(localize(locale, "Ngày nhận phòng không hợp lệ. Vui lòng chọn hôm nay hoặc ngày sau.", "Check-in date is invalid. Please choose today or later."));
      return;
    }

    setIsSubmitting(true);

    try {
      const validation = validateContactDetails(locale, profileDraft, { phoneRequired: true });
      const validationError = getFirstContactDetailsError(validation.errors);

      setProfileFieldErrors(validation.errors);

      if (validationError) {
        return;
      }

      const contactDetails = validation.values;
      const supabase = createSupabaseBrowserClient();
      let authUserId: string | null = null;
      const authCredentials = {
        email: contactDetails.email,
        password: DEFAULT_MEMBER_PASSWORD
      };

      await supabase.auth.signOut({ scope: "local" }).catch(() => null);

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword(authCredentials);

      if (signInError) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          ...authCredentials,
          options: {
            data: {
              full_name: contactDetails.fullName,
              locale,
              phone: contactDetails.phone
            }
          }
        });

        if (signUpError) {
          const message = signUpError.message.toLowerCase();

          if (message.includes("already registered") || message.includes("already exists")) {
            const { data: fallbackSignInData, error: fallbackSignInError } = await supabase.auth.signInWithPassword(authCredentials);

            if (fallbackSignInError) {
              throw fallbackSignInError;
            }

            authUserId = fallbackSignInData.user?.id ?? null;
          } else {
            throw signUpError;
          }
        } else {
          authUserId = signUpData.session?.user?.id ?? null;

          if (!authUserId) {
            const { data: fallbackSignInData, error: fallbackSignInError } = await supabase.auth.signInWithPassword(authCredentials);

            if (fallbackSignInError) {
              throw fallbackSignInError;
            }

            authUserId = fallbackSignInData.user?.id ?? null;
          }
        }
      } else {
        authUserId = signInData.user?.id ?? null;
      }

      if (!authUserId) {
        throw new Error(localize(locale, "Không thể xác thực tài khoản.", "Unable to authenticate the account."));
      }

      await bootstrapMemberProfile(authUserId, contactDetails.fullName, contactDetails.email, contactDetails.phone);

      await submitBookingRequest(
        authUserId,
        contactDetails.fullName,
        contactDetails.email,
        contactDetails.phone,
        marketingConsent
      );

      router.push(appendLocaleQuery("/member", locale));
      router.refresh();
    } catch (submittedError) {
      setError(resolveBookingRequestError(locale, submittedError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="room-booking-panel__form" onSubmit={handleSubmit}>
      <div className="room-booking-panel__grid">
        <label className="room-booking-panel__field">
          <span>{localize(locale, "Họ và tên", "Full name")}</span>
          <input
            autoComplete="name"
            className={`room-booking-panel__input${profileFieldErrors.fullName ? " room-booking-panel__input--error" : ""}`}
            name="fullName"
            onBlur={(event) => validateProfileField("fullName", event.target.value)}
            onChange={(event) => setProfileDraftField("fullName", event.target.value)}
            placeholder={localize(locale, "Nhập họ và tên", "Enter full name")}
            required
            type="text"
            value={profileDraft.fullName}
            aria-invalid={Boolean(profileFieldErrors.fullName)}
          />
          {profileFieldErrors.fullName ? <p className="room-booking-panel__field-error">{profileFieldErrors.fullName}</p> : null}
        </label>

        <label className="room-booking-panel__field">
          <span>{localize(locale, "Email", "Email")}</span>
          <input
            autoComplete="email"
            className={`room-booking-panel__input${profileFieldErrors.email ? " room-booking-panel__input--error" : ""}`}
            inputMode="email"
            name="email"
            onBlur={(event) => validateProfileField("email", event.target.value)}
            onChange={(event) => setProfileDraftField("email", event.target.value)}
            placeholder="example@gmail.com"
            required
            type="email"
            value={profileDraft.email}
            aria-invalid={Boolean(profileFieldErrors.email)}
          />
          {profileFieldErrors.email ? <p className="room-booking-panel__field-error">{profileFieldErrors.email}</p> : null}
        </label>

        <label className="room-booking-panel__field">
          <span>{localize(locale, "Số điện thoại", "Phone")}</span>
          <input
            autoComplete="tel"
            className={`room-booking-panel__input${profileFieldErrors.phone ? " room-booking-panel__input--error" : ""}`}
            inputMode="tel"
            name="phone"
            onBlur={(event) => validateProfileField("phone", event.target.value)}
            onChange={(event) => setProfileDraftField("phone", event.target.value)}
            placeholder={localize(locale, "090...", "+84 ...")}
            required
            type="tel"
            value={profileDraft.phone}
            aria-invalid={Boolean(profileFieldErrors.phone)}
          />
          {profileFieldErrors.phone ? <p className="room-booking-panel__field-error">{profileFieldErrors.phone}</p> : null}
        </label>
      </div>

      <label className="room-booking-panel__field room-booking-panel__field--full">
        <span>{localize(locale, "Ghi chú", "Note")}</span>
        <textarea
          className="room-booking-panel__input room-booking-panel__input--textarea"
          name="note"
          onChange={(event) => setNote(event.target.value)}
          placeholder={localize(locale, "Yêu cầu thêm nếu có", "Any additional request")}
          rows={3}
          value={note}
        />
      </label>

      <label className="room-booking-panel__consent">
        <input checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} type="checkbox" />
        <span>
          {localize(
            locale,
            "Tôi đồng ý nhận thông tin liên quan đến booking và ưu đãi từ khách sạn.",
            "I agree to receive booking-related updates and hotel offers."
          )}
        </span>
      </label>

      <p className="room-booking-panel__hint">
        {localize(
          locale,
          `Tài khoản sẽ được tạo hoặc đăng nhập bằng mật khẩu mặc định ${DEFAULT_MEMBER_PASSWORD}.`,
          `The account will be created or signed in with the default password ${DEFAULT_MEMBER_PASSWORD}.`
        )}
      </p>

      <div className="room-booking-panel__actions">
        <button className="button button--solid" disabled={isSubmitting || availableRooms <= 0} type="submit">
          {isSubmitting
            ? localize(locale, "Đang gửi...", "Sending...")
            : availableRooms <= 0
              ? localize(locale, "Hết phòng", "Sold out")
              : localize(locale, "Gửi yêu cầu", "Send request")}
        </button>
      </div>

      {availableRooms <= 0 ? (
        <p className="room-booking-panel__error">
          {localize(
            locale,
            "Không còn phòng trống cho khoảng thời gian này. Hãy chọn ngày khác.",
            "No rooms are available for this stay window. Please choose different dates."
          )}
        </p>
      ) : null}

      {error ? <p className="room-booking-panel__error">{error}</p> : null}
    </form>
  );
}
