"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
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
    vi: "Tài khoản seed dùng password local duy nhất cho môi trường dev.",
    en: "Seeded accounts share one temporary local password for development."
  } satisfies LocalizedText,
  password: {
    vi: "Mật khẩu",
    en: "Password"
  } satisfies LocalizedText,
  errors: {
    invalidCredentials: {
      vi: "Sai email hoặc mật khẩu. / Invalid email or password.",
      en: "Invalid email or password. / Sai email hoặc mật khẩu."
    } satisfies LocalizedText,
    missingConfig: {
      vi: "Thiếu cấu hình đăng nhập Supabase. / Missing Supabase sign-in configuration.",
      en: "Missing Supabase sign-in configuration. / Thiếu cấu hình đăng nhập Supabase."
    } satisfies LocalizedText,
    network: {
      vi: "Không thể kết nối Supabase lúc này. / Unable to reach Supabase right now.",
      en: "Unable to reach Supabase right now. / Không thể kết nối Supabase lúc này."
    } satisfies LocalizedText,
    fallback: {
      vi: "Đăng nhập không thành công. Vui lòng thử lại. / Sign-in failed. Please try again.",
      en: "Sign-in failed. Please try again. / Đăng nhập không thành công. Vui lòng thử lại."
    } satisfies LocalizedText
  },
  submit: {
    vi: "Đăng nhập",
    en: "Sign in"
  } satisfies LocalizedText,
  title: {
    vi: "Đăng nhập admin",
    en: "Admin sign in"
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

      router.replace(nextHref);
      router.refresh();
    } catch (submittedError) {
      setError(resolveSignInError(locale, submittedError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-auth-form" onSubmit={handleSubmit}>
      <p className="admin-auth-form__title">{localize(locale, copy.title)}</p>
      <div className="admin-auth-form__fields">
        <label className="admin-auth-form__field">
          <span>{localize(locale, copy.email)}</span>
          <input
            autoComplete="email"
            className="admin-auth-form__input"
            inputMode="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@skboutiquehotel.example"
            type="email"
            value={email}
          />
        </label>
        <label className="admin-auth-form__field">
          <span>{localize(locale, copy.password)}</span>
          <input
            autoComplete="current-password"
            className="admin-auth-form__input"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••••"
            type="password"
            value={password}
          />
        </label>
      </div>

      <div className="admin-auth-form__actions">
        <button className="button button--solid" disabled={isSubmitting} type="submit">
          {isSubmitting ? (locale === "en" ? "Signing in..." : "Đang đăng nhập...") : localize(locale, copy.submit)}
        </button>
      </div>

      {error ? <p className="admin-auth-form__error">{error}</p> : null}
      <p className="admin-auth-form__hint">{localize(locale, copy.helper)}</p>
    </form>
  );
}
