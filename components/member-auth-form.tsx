"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { appendLocaleQuery } from "@/lib/locale";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { DEFAULT_MEMBER_PASSWORD, resolveMemberAuthError } from "@/lib/member-auth";
import { localize, type LocalizedText } from "@/lib/mock/i18n";

type MemberAuthFormProps = {
  locale: "vi" | "en";
  mode: "sign-in" | "sign-up";
};

const copy = {
  common: {
    email: {
      vi: "Email",
      en: "Email"
    } satisfies LocalizedText,
    fullName: {
      vi: "Họ và tên",
      en: "Full name"
    } satisfies LocalizedText,
    password: {
      vi: "Mật khẩu",
      en: "Password"
    } satisfies LocalizedText,
    phone: {
      vi: "Số điện thoại",
      en: "Phone"
    } satisfies LocalizedText
  },
  errors: {
    bootstrap: {
      vi: "Không thể tạo hồ sơ thành viên.",
      en: "Unable to create the member profile."
    } satisfies LocalizedText,
    missingConfig: {
      vi: "Thiếu cấu hình Supabase.",
      en: "Missing Supabase configuration."
    } satisfies LocalizedText
  },
  hints: {
    password: {
      vi: "Tài khoản phase 1 dùng mật khẩu mặc định để khách có thể quay lại xem lịch sử.",
      en: "Phase 1 uses a default password so guests can return later and review history."
    } satisfies LocalizedText,
    signIn: {
      vi: `Nếu bạn đã có tài khoản, hãy dùng mật khẩu mặc định ${DEFAULT_MEMBER_PASSWORD} hoặc mật khẩu đã được cung cấp.`,
      en: `If you already have an account, use the default password ${DEFAULT_MEMBER_PASSWORD} or the password you were given.`
    } satisfies LocalizedText,
    signUp: {
      vi: `Hệ thống sẽ tạo tài khoản bằng mật khẩu mặc định ${DEFAULT_MEMBER_PASSWORD}.`,
      en: `The system will create your account with the default password ${DEFAULT_MEMBER_PASSWORD}.`
    } satisfies LocalizedText
  },
  labels: {
    createAccount: {
      vi: "Tạo tài khoản",
      en: "Create account"
    } satisfies LocalizedText,
    goToSignIn: {
      vi: "Đã có tài khoản? Đăng nhập",
      en: "Already have an account? Sign in"
    } satisfies LocalizedText,
    goToSignUp: {
      vi: "Chưa có tài khoản? Đăng ký",
      en: "Need an account? Sign up"
    } satisfies LocalizedText,
    signingIn: {
      vi: "Đang đăng nhập...",
      en: "Signing in..."
    } satisfies LocalizedText,
    signingUp: {
      vi: "Đang tạo tài khoản...",
      en: "Creating account..."
    } satisfies LocalizedText,
    submitSignIn: {
      vi: "Đăng nhập",
      en: "Sign in"
    } satisfies LocalizedText,
    submitSignUp: {
      vi: "Đăng ký và tiếp tục",
      en: "Sign up and continue"
    } satisfies LocalizedText,
    titleSignIn: {
      vi: "Đăng nhập thành viên",
      en: "Member sign in"
    } satisfies LocalizedText,
    titleSignUp: {
      vi: "Đăng ký thành viên",
      en: "Member sign up"
    } satisfies LocalizedText
  },
  prompts: {
    signIn: {
      vi: "Đăng nhập để xem lịch sử request, booking và thông báo.",
      en: "Sign in to see your requests, bookings, and notifications."
    } satisfies LocalizedText,
    signUp: {
      vi: "Tạo tài khoản nhanh để hệ thống lưu lịch sử và gửi thông báo đúng email.",
      en: "Create a quick account so the system can store your history and send notifications to the right email."
    } satisfies LocalizedText
  }
} as const;

function buildBootstrapPayload(locale: "vi" | "en", authUserId: string, email: string, fullName: string, phone: string | null) {
  return {
    authUserId,
    email,
    fullName,
    phone,
    preferredLocale: locale,
    source: "member_portal"
  };
}

function normalizeFallbackName(email: string) {
  const prefix = email.split("@")[0] ?? "";

  return prefix.trim().length ? prefix.trim() : email;
}

function resolveMemberFormError(locale: "vi" | "en", error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("please enter your email") || message.includes("vui lòng nhập email")) {
    return localize(locale, { vi: "Vui lòng nhập email.", en: "Please enter your email." });
  }

  if (message.includes("please enter your full name") || message.includes("vui lòng nhập họ và tên")) {
    return localize(locale, { vi: "Vui lòng nhập họ và tên.", en: "Please enter your full name." });
  }

  if (message.includes("please enter your phone number") || message.includes("vui lòng nhập số điện thoại")) {
    return localize(locale, { vi: "Vui lòng nhập số điện thoại.", en: "Please enter your phone number." });
  }

  if (message.includes("please enter your password") || message.includes("vui lòng nhập mật khẩu")) {
    return localize(locale, { vi: "Vui lòng nhập mật khẩu.", en: "Please enter your password." });
  }

  if (message.includes("missing required member bootstrap fields")) {
    return localize(locale, copy.errors.bootstrap);
  }

  if (message.includes("unauthorized bootstrap request")) {
    return localize(locale, { vi: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", en: "Your session has expired. Please sign in again." });
  }

  return resolveMemberAuthError(locale, error);
}

export function MemberAuthForm({ locale, mode }: MemberAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextHrefCandidate = searchParams.get("next");
  const nextHref = nextHrefCandidate?.startsWith("/") ? nextHrefCandidate : "/member";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(DEFAULT_MEMBER_PASSWORD);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignUp = mode === "sign-up";
  const submitLabel = isSignUp ? localize(locale, copy.labels.submitSignUp) : localize(locale, copy.labels.submitSignIn);
  const submitPendingLabel = isSignUp ? localize(locale, copy.labels.signingUp) : localize(locale, copy.labels.signingIn);
  const title = isSignUp ? localize(locale, copy.labels.titleSignUp) : localize(locale, copy.labels.titleSignIn);
  const prompt = isSignUp ? localize(locale, copy.prompts.signUp) : localize(locale, copy.prompts.signIn);
  const alternateHref = useMemo(() => {
    const alternateBase = isSignUp ? "/member/sign-in" : "/member/sign-up";
    const alternateUrl = new URL(alternateBase, "https://sk-boutique-hotel.local");

    if (nextHrefCandidate?.startsWith("/")) {
      alternateUrl.searchParams.set("next", nextHrefCandidate);
    }

    return appendLocaleQuery(`${alternateUrl.pathname}${alternateUrl.search}${alternateUrl.hash}`, locale);
  }, [isSignUp, locale, nextHrefCandidate]);
  const alternateLabel = isSignUp ? localize(locale, copy.labels.goToSignIn) : localize(locale, copy.labels.goToSignUp);
  const hint = isSignUp ? localize(locale, copy.hints.signUp) : localize(locale, copy.hints.signIn);

  async function bootstrapMemberProfile(authUserId: string, contactName: string, contactEmail: string, contactPhone: string | null) {
    const response = await fetch("/api/member/bootstrap", {
      body: JSON.stringify(buildBootstrapPayload(locale, authUserId, contactEmail, contactName, contactPhone)),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? localize(locale, copy.errors.bootstrap));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim();
      const trimmedFullName = fullName.trim();
      const trimmedPhone = phone.trim();

      if (!trimmedEmail) {
        throw new Error(localize(locale, { vi: "Vui lòng nhập email.", en: "Please enter your email." }));
      }

      if (isSignUp && !trimmedFullName) {
        throw new Error(localize(locale, { vi: "Vui lòng nhập họ và tên.", en: "Please enter your full name." }));
      }

      if (isSignUp && !trimmedPhone) {
        throw new Error(localize(locale, { vi: "Vui lòng nhập số điện thoại.", en: "Please enter your phone number." }));
      }

      if (!isSignUp && !password.trim()) {
        throw new Error(localize(locale, { vi: "Vui lòng nhập mật khẩu.", en: "Please enter your password." }));
      }

      const supabase = createSupabaseBrowserClient();

      let authUserId: string | null = null;

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
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
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: trimmedEmail,
              password: DEFAULT_MEMBER_PASSWORD
            });

            if (signInError) {
              throw signInError;
            }

            authUserId = signInData.user?.id ?? null;
          } else {
            throw signUpError;
          }
        } else {
          authUserId = data.user?.id ?? null;
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password.trim()
        });

        if (signInError) {
          throw signInError;
        }

        authUserId = data.user?.id ?? null;
      }

      if (!authUserId) {
        const { data } = await supabase.auth.getUser();
        authUserId = data.user?.id ?? null;
      }

      if (!authUserId) {
        throw new Error(localize(locale, copy.errors.bootstrap));
      }

      await bootstrapMemberProfile(authUserId, trimmedFullName || normalizeFallbackName(trimmedEmail), trimmedEmail, trimmedPhone || null);

      router.replace(appendLocaleQuery(nextHref, locale));
      router.refresh();
    } catch (submittedError) {
      setError(resolveMemberFormError(locale, submittedError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-auth-form" onSubmit={handleSubmit}>
      <p className="admin-auth-form__title">{title}</p>
      <p className="admin-auth-form__hint">{prompt}</p>

      <div className="admin-auth-form__fields">
        {isSignUp ? (
          <label className="admin-auth-form__field">
            <span>{localize(locale, copy.common.fullName)}</span>
            <input
              autoComplete="name"
              className="admin-auth-form__input"
              name="fullName"
              onChange={(event) => setFullName(event.target.value)}
              placeholder={locale === "en" ? "Your full name" : "Họ và tên"}
              required={isSignUp}
              type="text"
              value={fullName}
            />
          </label>
        ) : null}

        <label className="admin-auth-form__field">
          <span>{localize(locale, copy.common.email)}</span>
            <input
              autoComplete="email"
              className="admin-auth-form__input"
              inputMode="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder={locale === "en" ? "example@gmail.com" : "example@gmail.com"}
              required
              type="email"
              value={email}
            />
        </label>

        {isSignUp ? (
          <label className="admin-auth-form__field">
            <span>{localize(locale, copy.common.phone)}</span>
            <input
              autoComplete="tel"
              className="admin-auth-form__input"
              inputMode="tel"
              name="phone"
              onChange={(event) => setPhone(event.target.value)}
              placeholder={locale === "en" ? "+84 ..." : "090..."}
              required={isSignUp}
              type="tel"
              value={phone}
            />
          </label>
        ) : null}

        {!isSignUp ? (
          <label className="admin-auth-form__field">
            <span>{localize(locale, copy.common.password)}</span>
            <input
              autoComplete="current-password"
              className="admin-auth-form__input"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder={DEFAULT_MEMBER_PASSWORD}
              required={!isSignUp}
              type="password"
              value={password}
            />
          </label>
        ) : null}
      </div>

      <div className="admin-auth-form__actions">
        <button className="button button--solid" disabled={isSubmitting} type="submit">
          {isSubmitting ? submitPendingLabel : submitLabel}
        </button>
      </div>

      <p className="admin-auth-form__hint">{hint}</p>

      <div className="admin-auth-form__actions" style={{ justifyContent: "space-between" }}>
        <Link className="button button--text-light" href={alternateHref}>
          {alternateLabel}
        </Link>
      </div>

      {error ? <p className="admin-auth-form__error">{error}</p> : null}
    </form>
  );
}
