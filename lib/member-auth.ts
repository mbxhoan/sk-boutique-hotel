import type { Locale } from "@/lib/locale";
import { localize, type LocalizedText } from "@/lib/mock/i18n";

export const DEFAULT_MEMBER_PASSWORD = process.env.NEXT_PUBLIC_MEMBER_DEFAULT_PASSWORD ?? "12345678";

const copy = {
  errors: {
    emailAlreadyRegistered: {
      vi: "Email này đã có tài khoản. Vui lòng đăng nhập.",
      en: "This email already has an account. Please sign in."
    } satisfies LocalizedText,
    invalidCredentials: {
      vi: "Sai email hoặc mật khẩu.",
      en: "Invalid email or password."
    } satisfies LocalizedText,
    missingConfig: {
      vi: "Thiếu cấu hình Supabase.",
      en: "Missing Supabase configuration."
    } satisfies LocalizedText,
    network: {
      vi: "Không thể kết nối Supabase lúc này.",
      en: "Unable to reach Supabase right now."
    } satisfies LocalizedText,
    fallback: {
      vi: "Không thể hoàn tất thao tác. Vui lòng thử lại.",
      en: "Unable to complete the action. Please try again."
    } satisfies LocalizedText
  }
} as const;

export function resolveMemberAuthError(locale: Locale, error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("invalid login credentials") || message.includes("invalid email or password")) {
    return localize(locale, copy.errors.invalidCredentials);
  }

  if (message.includes("user already registered") || message.includes("already exists")) {
    return localize(locale, copy.errors.emailAlreadyRegistered);
  }

  if (message.includes("missing supabase") || message.includes("requires public url") || message.includes("publishable key")) {
    return localize(locale, copy.errors.missingConfig);
  }

  if (message.includes("fetch") || message.includes("network") || message.includes("failed to fetch")) {
    return localize(locale, copy.errors.network);
  }

  return localize(locale, copy.errors.fallback);
}
