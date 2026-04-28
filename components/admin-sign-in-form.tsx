"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { appendLocaleQuery } from "@/lib/locale";
import { localize, type LocalizedText } from "@/lib/mock/i18n";

type AdminSignInFormProps = {
  locale: "vi" | "en";
};

const copy = {
  description: {
    vi: "Dùng tài khoản được seed trong Supabase để vào portal admin nội bộ.",
    en: "Use one of the seeded Supabase accounts to access the internal admin portal."
  } satisfies LocalizedText,
  email: {
    vi: "Email",
    en: "Email"
  } satisfies LocalizedText,
  helper: {
    vi: "Mật khẩu: SkbhAdmin2026!",
    en: "Password: SkbhAdmin2026!"
  } satisfies LocalizedText,
  password: {
    vi: "Mật khẩu",
    en: "Password"
  } satisfies LocalizedText,
  errors: {
    invalidCredentials: {
      vi: "Sai email hoặc mật khẩu.",
      en: "Invalid email or password."
    } satisfies LocalizedText,
    missingConfig: {
      vi: "Thiếu cấu hình đăng nhập hệ thống.",
      en: "Missing sign-in configuration."
    } satisfies LocalizedText,
    network: {
      vi: "Không thể kết nối máy chủ lúc này.",
      en: "Unable to reach server right now."
    } satisfies LocalizedText,
    fallback: {
      vi: "Đăng nhập không thành công. Vui lòng thử lại.",
      en: "Sign-in failed. Please try again."
    } satisfies LocalizedText
  },
  signingIn: {
    vi: "Đang đăng nhập",
    en: "Signing in"
  } satisfies LocalizedText,
  redirecting: {
    vi: "Đang chuyển vào admin portal",
    en: "Loading admin portal"
  } satisfies LocalizedText,
  submit: {
    vi: "Đăng nhập",
    en: "Sign in"
  } satisfies LocalizedText,
  prompt: {
    vi: "Đăng nhập admin",
    en: "Admin sign in"
  } satisfies LocalizedText,
  title: {
    vi: "Truy cập admin portal",
    en: "Access the admin portal"
  } satisfies LocalizedText
} as const;

function resolveSignInError(locale: "vi" | "en", error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("invalid login credentials") || message.includes("invalid email or password")) {
    return localize(locale, copy.errors.invalidCredentials);
  }

  if (message.includes("missing supabase") || message.includes("requires public url") || message.includes("publishable key")) {
    return localize(locale, copy.errors.missingConfig);
  }

  if (message.includes("fetch") || message.includes("network") || message.includes("failed to fetch")) {
    return localize(locale, copy.errors.network);
  }

  return localize(locale, copy.errors.fallback);
}

export function AdminSignInForm({ locale }: AdminSignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextHrefCandidate = searchParams.get("next");
  const nextHref = nextHrefCandidate?.startsWith("/") ? nextHrefCandidate : "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw authError;
      }

      setIsRedirecting(true);
      router.replace(appendLocaleQuery(nextHref, locale));
      router.refresh();
    } catch (submittedError) {
      setError(resolveSignInError(locale, submittedError));
      setIsSubmitting(false);
    }
  }

  const isBusy = isSubmitting || isRedirecting;
  const submitLabel = isRedirecting
    ? localize(locale, copy.redirecting)
    : isSubmitting
      ? localize(locale, copy.signingIn)
      : localize(locale, copy.submit);

  return (
    <>
      <form className="member-auth-form" onSubmit={handleSubmit}>
        <p className="member-auth-form__title">{localize(locale, copy.title)}</p>
        <p className="member-auth-form__description">{localize(locale, copy.description)}</p>

        <div className="member-auth-form__fields">
          <label className="member-auth-form__field">
            <span>{localize(locale, copy.email)}</span>
            <input
              autoComplete="email"
              className="member-auth-form__input"
              inputMode="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@skboutiquehotel.example"
              required
              type="email"
              value={email}
            />
          </label>
          <label className="member-auth-form__field">
            <span>{localize(locale, copy.password)}</span>
            <input
              autoComplete="current-password"
              className="member-auth-form__input"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••••"
              required
              type="password"
              value={password}
            />
          </label>
        </div>

        <div className="member-auth-form__actions member-auth-form__actions--primary">
          <button
            className="button button--solid member-auth-form__submit auth-submit-button"
            data-busy={isBusy ? "true" : undefined}
            disabled={isBusy}
            type="submit"
          >
            {isBusy ? <span className="auth-submit-button__spinner" aria-hidden="true" /> : null}
            <span className="auth-submit-button__label">{submitLabel}</span>
          </button>
        </div>

        {error ? <p className="member-auth-form__error">{error}</p> : null}
        <p className="member-auth-form__hint">{localize(locale, copy.helper)}</p>
      </form>

      {isRedirecting ? <AuthLoadingOverlay locale={locale} message={localize(locale, copy.redirecting)} /> : null}
    </>
  );
}

function AuthLoadingOverlay({ locale, message }: { locale: "vi" | "en"; message: string }) {
  return (
    <div className="auth-loading-overlay" role="status" aria-live="polite">
      <div className="auth-loading-overlay__card">
        <span className="auth-loading-overlay__spinner" aria-hidden="true" />
        <p className="auth-loading-overlay__title">{message}…</p>
        <p className="auth-loading-overlay__copy">
          {locale === "en" ? "Setting up your secure session." : "Đang chuẩn bị phiên đăng nhập của bạn."}
        </p>
      </div>
    </div>
  );
}
