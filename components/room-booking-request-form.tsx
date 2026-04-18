"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { DEFAULT_MEMBER_PASSWORD, resolveMemberAuthError } from "@/lib/member-auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type RoomBookingRequestFormProps = {
  branchId: string;
  guestCount: number;
  locale: Locale;
  roomTypeId: string;
  stayEndAt: string;
  stayStartAt: string;
};

function localize(locale: Locale, vi: string, en: string) {
  return locale === "en" ? en : vi;
}

function resolveBookingRequestError(locale: Locale, error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("please enter your full name") || message.includes("vui lòng nhập họ tên")) {
    return localize(locale, "Vui lòng nhập họ tên.", "Please enter your full name.");
  }

  if (message.includes("please enter your email") || message.includes("vui lòng nhập email")) {
    return localize(locale, "Vui lòng nhập email.", "Please enter your email.");
  }

  if (message.includes("please enter your phone number") || message.includes("vui lòng nhập số điện thoại")) {
    return localize(locale, "Vui lòng nhập số điện thoại.", "Please enter your phone number.");
  }

  if (message.includes("missing required booking request fields")) {
    return localize(locale, "Vui lòng nhập đủ họ tên, email, số điện thoại và ngày lưu trú.", "Please enter your full name, email, phone number, and stay dates.");
  }

  if (message.includes("missing required member bootstrap fields")) {
    return localize(locale, "Không thể tạo hồ sơ thành viên.", "Unable to create the member profile.");
  }

  if (message.includes("unable to submit the booking request") || message.includes("unable to create booking request")) {
    return localize(locale, "Không thể gửi yêu cầu booking.", "Unable to submit the booking request.");
  }

  if (message.includes("unauthorized booking request")) {
    return localize(locale, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "Your session has expired. Please sign in again.");
  }

  return resolveMemberAuthError(locale, error);
}

export function RoomBookingRequestForm({
  branchId,
  guestCount,
  locale,
  roomTypeId,
  stayEndAt,
  stayStartAt
}: RoomBookingRequestFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function bootstrapMemberProfile(authUserId: string, contactName: string, contactEmail: string, contactPhone: string) {
    const response = await fetch("/api/member/bootstrap", {
      body: JSON.stringify({
        authUserId,
        email: contactEmail,
        fullName: contactName,
        phone: contactPhone,
        preferredLocale: locale,
        source: "member_portal"
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

  async function submitBookingRequest(authUserId: string, contactName: string, contactEmail: string, contactPhone: string) {
    const response = await fetch("/api/public/booking-request", {
      body: JSON.stringify({
        branchId,
        contactEmail,
        contactName,
        contactPhone,
        createdBy: authUserId,
        guestCount,
        marketingConsent,
        note,
        preferredLocale: locale,
        roomTypeId,
        source: "member_portal",
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
    setIsSubmitting(true);

    try {
      const trimmedFullName = fullName.trim();
      const trimmedEmail = email.trim();
      const trimmedPhone = phone.trim();

      if (!trimmedFullName || !trimmedEmail || !trimmedPhone) {
        throw new Error(localize(locale, "Vui lòng nhập họ tên, email và số điện thoại.", "Please enter your full name, email, and phone number."));
      }

      const supabase = createSupabaseBrowserClient();

      let authUserId: string | null = null;

      const { data: currentUserData } = await supabase.auth.getUser();
      if (currentUserData.user?.email?.toLowerCase() === trimmedEmail.toLowerCase()) {
        authUserId = currentUserData.user.id;
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: DEFAULT_MEMBER_PASSWORD
        });

        if (signInError) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: trimmedEmail,
            password: DEFAULT_MEMBER_PASSWORD,
            options: {
              data: {
                full_name: trimmedFullName,
                locale,
                phone: trimmedPhone
              }
            }
          });

          if (signUpError) {
            const message = signUpError.message.toLowerCase();

            if (message.includes("already registered") || message.includes("already exists")) {
              const { data: fallbackSignInData, error: fallbackSignInError } = await supabase.auth.signInWithPassword({
                email: trimmedEmail,
                password: DEFAULT_MEMBER_PASSWORD
              });

              if (fallbackSignInError) {
                throw fallbackSignInError;
              }

              authUserId = fallbackSignInData.user?.id ?? null;
            } else {
              throw signUpError;
            }
          } else {
            authUserId = signUpData.user?.id ?? null;
          }
        } else {
          authUserId = signInData.user?.id ?? null;
        }
      }

      if (!authUserId) {
        const { data } = await supabase.auth.getUser();
        authUserId = data.user?.id ?? null;
      }

      if (!authUserId) {
        throw new Error(localize(locale, "Không thể xác thực tài khoản.", "Unable to authenticate the account."));
      }

      await bootstrapMemberProfile(authUserId, trimmedFullName, trimmedEmail, trimmedPhone);
      await submitBookingRequest(authUserId, trimmedFullName, trimmedEmail, trimmedPhone);

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
            className="room-booking-panel__input"
            name="fullName"
            onChange={(event) => setFullName(event.target.value)}
            placeholder={localize(locale, "Nhập họ và tên", "Enter full name")}
            required
            type="text"
            value={fullName}
          />
        </label>

        <label className="room-booking-panel__field">
          <span>{localize(locale, "Email", "Email")}</span>
          <input
            autoComplete="email"
            className="room-booking-panel__input"
            inputMode="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="room-booking-panel__field">
          <span>{localize(locale, "Số điện thoại", "Phone")}</span>
          <input
            autoComplete="tel"
            className="room-booking-panel__input"
            inputMode="tel"
            name="phone"
            onChange={(event) => setPhone(event.target.value)}
            placeholder={localize(locale, "09...", "+84 ...")}
            required
            type="tel"
            value={phone}
          />
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
        <button className="button button--solid" disabled={isSubmitting} type="submit">
          {isSubmitting ? localize(locale, "Đang gửi...", "Sending...") : localize(locale, "Gửi yêu cầu & đăng nhập", "Send request & sign in")}
        </button>
      </div>

      {error ? <p className="room-booking-panel__error">{error}</p> : null}
    </form>
  );
}
