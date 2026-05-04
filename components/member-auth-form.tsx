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
      vi: "Đăng nhập để xem lịch sử booking và nhận ưu đãi.",
      en: "Sign in to see your booking history and receive offers."
    } satisfies LocalizedText,
    signUp: {
      vi: "Tạo tài khoản nhanh để nhận ưu đãi.",
      en: "Create an account quickly to receive offers."
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
  const [isRedirecting, setIsRedirecting] = useState(false);
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

  async function bootstrapMemberProfile(
    authUserId: string,
    contactName: string,
    contactEmail: string,
    contactPhone: string | null,
    accessToken: string | null
  ) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch("/api/member/bootstrap", {
      body: JSON.stringify(buildBootstrapPayload(locale, authUserId, contactEmail, contactName, contactPhone)),
      headers,
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
      let accessToken: string | null = null;

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
            accessToken = signInData.session?.access_token ?? null;
          } else {
            throw signUpError;
          }
        } else {
          authUserId = data.user?.id ?? null;
          accessToken = data.session?.access_token ?? null;
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
        accessToken = data.session?.access_token ?? null;
      }

      if (!authUserId) {
        const { data } = await supabase.auth.getUser();
        authUserId = data.user?.id ?? null;
      }

      if (!authUserId) {
        throw new Error(localize(locale, copy.errors.bootstrap));
      }

      if (!accessToken) {
        const { data: sessionData } = await supabase.auth.getSession();
        accessToken = sessionData.session?.access_token ?? null;
      }

      await bootstrapMemberProfile(
        authUserId,
        trimmedFullName || normalizeFallbackName(trimmedEmail),
        trimmedEmail,
        trimmedPhone || null,
        accessToken
      );

      setIsRedirecting(true);
      router.replace(appendLocaleQuery(nextHref, locale));
      router.refresh();
    } catch (submittedError) {
      setError(resolveMemberFormError(locale, submittedError));
      setIsSubmitting(false);
    }
  }

  const redirectingLabel = isSignUp
    ? localize(locale, { vi: "Đang vào portal thành viên", en: "Loading member portal" })
    : localize(locale, { vi: "Đang vào portal thành viên", en: "Loading member portal" });
  const isBusy = isSubmitting || isRedirecting;
  const buttonLabel = isRedirecting ? redirectingLabel : isBusy ? submitPendingLabel : submitLabel;

  return (
    <form className="member-auth-form" onSubmit={handleSubmit}>
      <p className="member-auth-form__title">{title}</p>
      <p className="member-auth-form__description">{prompt}</p>

      <div className="member-auth-form__fields">
        {isSignUp ? (
          <label className="member-auth-form__field">
            <span>{localize(locale, copy.common.fullName)}</span>
            <input
              autoComplete="name"
              className="member-auth-form__input"
              name="fullName"
              onChange={(event) => setFullName(event.target.value)}
              placeholder={locale === "en" ? "Your full name" : "Họ và tên"}
              required={isSignUp}
              type="text"
              value={fullName}
            />
          </label>
        ) : null}

        <label className="member-auth-form__field">
          <span>{localize(locale, copy.common.email)}</span>
            <input
              autoComplete="email"
              className="member-auth-form__input"
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
          <label className="member-auth-form__field">
            <span>{localize(locale, copy.common.phone)}</span>
            <input
              autoComplete="tel"
              className="member-auth-form__input"
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
          <label className="member-auth-form__field">
            <span>{localize(locale, copy.common.password)}</span>
            <input
              autoComplete="current-password"
              className="member-auth-form__input"
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

      <div className="member-auth-form__actions member-auth-form__actions--primary">
        <button
          className="button button--solid member-auth-form__submit auth-submit-button"
          data-busy={isBusy ? "true" : undefined}
          disabled={isBusy}
          type="submit"
        >
          {isBusy ? <span className="auth-submit-button__spinner" aria-hidden="true" /> : null}
          <span className="auth-submit-button__label">{buttonLabel}</span>
        </button>
      </div>

      {error ? <p className="member-auth-form__error">{error}</p> : null}

      <p className="member-auth-form__hint">{hint}</p>

      <div className="member-auth-form__actions member-auth-form__actions--secondary">
        <Link className="member-auth-form__link" href={alternateHref}>
          {alternateLabel}
        </Link>
      </div>

      {isRedirecting ? (
        <div className="auth-loading-overlay" role="status" aria-live="polite">
          <div className="auth-loading-overlay__card">
            <span className="auth-loading-overlay__spinner" aria-hidden="true" />
            <p className="auth-loading-overlay__title">{redirectingLabel}…</p>
            <p className="auth-loading-overlay__copy">
              {locale === "en" ? "Setting up your member dashboard." : "Đang chuẩn bị bảng điều khiển thành viên."}
            </p>
          </div>
        </div>
      ) : null}
    </form>
  );
}
