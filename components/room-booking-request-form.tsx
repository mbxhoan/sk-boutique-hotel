"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { DEFAULT_MEMBER_PASSWORD, resolveMemberAuthError } from "@/lib/member-auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type RoomBookingRequestFormProps = {
  branchId: string;
  guestCount: number;
  locale: Locale;
  availableRooms: number;
  roomTypeId: string;
  stayEndAt: string;
  stayStartAt: string;
};

type MemberProfile = {
  authUserId: string;
  email: string;
  fullName: string;
  phone: string | null;
  preferredLocale: Locale;
};

function localize(locale: Locale, vi: string, en: string) {
  return locale === "en" ? en : vi;
}

function appendErrorDetail(locale: Locale, prefixVi: string, prefixEn: string, message: string) {
  const detail = message
    .replace(/^unable to create booking request[:\s-]*/i, "")
    .replace(/^unable to submit the booking request[:\s-]*/i, "")
    .replace(/^unable to bootstrap member profile[:\s-]*/i, "")
    .replace(/^unable to create the member profile[:\s-]*/i, "")
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

  if (message.includes("please enter your phone number") || message.includes("vui lòng nhập số điện thoại")) {
    return localize(locale, "Vui lòng nhập số điện thoại.", "Please enter your phone number.");
  }

  if (message.includes("missing required booking request fields")) {
    return localize(locale, "Vui lòng nhập đủ họ tên, email, số điện thoại và ngày lưu trú.", "Please enter your full name, email, phone number, and stay dates.");
  }

  if (message.includes("missing required member bootstrap fields")) {
    return localize(locale, "Không thể tạo hồ sơ thành viên.", "Unable to create the member profile.");
  }

  if (message.includes("no rooms are available for the selected stay window")) {
    return localize(locale, "Hết phòng trong khoảng thời gian bạn chọn.", "No rooms are available for the selected stay window.");
  }

  if (message.includes("unable to submit the booking request") || message.includes("unable to create booking request")) {
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
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMemberProfile, setIsLoadingMemberProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMemberProfile() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();

        if (!data.user) {
          if (!cancelled) {
            setIsLoadingMemberProfile(false);
          }

          return;
        }

        const response = await fetch("/api/member/profile", {
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          if (!cancelled) {
            setIsLoadingMemberProfile(false);
          }

          return;
        }

        const payload = (await response.json().catch(() => null)) as { profile?: MemberProfile | null } | null;
        const profile = payload?.profile ?? null;

        if (!cancelled && profile) {
          setMemberProfile(profile);
          setFullName(profile.fullName);
          setEmail(profile.email);
          setPhone(profile.phone ?? "");
        }
      } catch {
        // Keep the guest flow if the profile lookup fails.
      } finally {
        if (!cancelled) {
          setIsLoadingMemberProfile(false);
        }
      }
    }

    void loadMemberProfile();

    return () => {
      cancelled = true;
    };
  }, []);

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
      const trimmedFullName = (memberProfile?.fullName ?? fullName).trim();
      const trimmedEmail = (memberProfile?.email ?? email).trim();
      const trimmedPhone = (memberProfile?.phone ?? phone).trim();
      const isMemberProfileReady = Boolean(memberProfile);

      if (!isMemberProfileReady && (!trimmedFullName || !trimmedEmail || !trimmedPhone)) {
        throw new Error(localize(locale, "Vui lòng nhập họ tên, email và số điện thoại.", "Please enter your full name, email, and phone number."));
      }

      const supabase = createSupabaseBrowserClient();

      let authUserId: string | null = memberProfile?.authUserId ?? null;

      if (!authUserId) {
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
      }

      if (!authUserId) {
        const { data } = await supabase.auth.getUser();
        authUserId = data.user?.id ?? null;
      }

      if (!authUserId) {
        throw new Error(localize(locale, "Không thể xác thực tài khoản.", "Unable to authenticate the account."));
      }

      if (!isMemberProfileReady) {
        await bootstrapMemberProfile(authUserId, trimmedFullName, trimmedEmail, trimmedPhone);
      }
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
      {memberProfile ? (
        <div className="room-booking-panel__member-card">
          <div>
            <p className="room-booking-panel__eyebrow">{localize(locale, "Hồ sơ đã đăng nhập", "Signed-in profile")}</p>
            <p className="room-booking-panel__member-name">{memberProfile.fullName}</p>
            <p className="room-booking-panel__member-note">
              {localize(
                locale,
                "Hệ thống sẽ dùng hồ sơ này để gửi yêu cầu booking.",
                "The system will use this profile to send the booking request."
              )}
            </p>
          </div>
          <dl className="room-booking-panel__member-meta">
            <div>
              <dt>{localize(locale, "Email", "Email")}</dt>
              <dd>{memberProfile.email}</dd>
            </div>
            <div>
              <dt>{localize(locale, "Số điện thoại", "Phone")}</dt>
              <dd>{memberProfile.phone ?? "—"}</dd>
            </div>
          </dl>
        </div>
      ) : null}

      {!memberProfile && !isLoadingMemberProfile ? (
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
              placeholder="example@gmail.com"
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
              placeholder={localize(locale, "090...", "+84 ...")}
              required
              type="tel"
              value={phone}
            />
          </label>
        </div>
      ) : null}

      {!memberProfile && isLoadingMemberProfile ? (
        <p className="room-booking-panel__hint">{localize(locale, "Đang nhận diện hồ sơ đã đăng nhập...", "Detecting your signed-in profile...")}</p>
      ) : null}

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

      {!memberProfile ? (
        <p className="room-booking-panel__hint">
          {localize(
            locale,
            `Tài khoản sẽ được tạo hoặc đăng nhập bằng mật khẩu mặc định ${DEFAULT_MEMBER_PASSWORD}.`,
            `The account will be created or signed in with the default password ${DEFAULT_MEMBER_PASSWORD}.`
          )}
        </p>
      ) : null}

      <div className="room-booking-panel__actions">
        <button
          className="button button--solid"
          disabled={isSubmitting || isLoadingMemberProfile || availableRooms <= 0}
          type="submit"
        >
          {isSubmitting
            ? localize(locale, "Đang gửi...", "Sending...")
            : isLoadingMemberProfile
              ? localize(locale, "Đang nhận diện...", "Detecting profile...")
            : availableRooms <= 0
              ? localize(locale, "Hết phòng", "Sold out")
              : memberProfile
                ? localize(locale, "Gửi yêu cầu", "Send request")
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
