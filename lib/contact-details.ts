import type { Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";

export type ContactDetailsDraft = {
  email: string;
  fullName: string;
  phone: string;
};

export type ContactDetailsField = keyof ContactDetailsDraft;

export type ContactDetailsErrors = Partial<Record<ContactDetailsField, string>>;

export type ContactDetailsValidationOptions = {
  phoneRequired?: boolean;
};

const copy = {
  errors: {
    duplicateEmail: {
      vi: "Email này đã được dùng bởi member khác.",
      en: "This email is already used by another member."
    },
    emailRequired: {
      vi: "Vui lòng nhập email.",
      en: "Please enter your email."
    },
    emailInvalid: {
      vi: "Email chưa đúng định dạng.",
      en: "Please enter a valid email address."
    },
    fallback: {
      vi: "Không thể lưu thông tin liên hệ. Vui lòng thử lại.",
      en: "Unable to save contact details. Please try again."
    },
    fullNameRequired: {
      vi: "Vui lòng nhập họ tên.",
      en: "Please enter your full name."
    },
    phoneInvalid: {
      vi: "Số điện thoại chưa đúng định dạng.",
      en: "Please enter a valid phone number."
    },
    phoneRequired: {
      vi: "Vui lòng nhập số điện thoại.",
      en: "Please enter your phone number."
    },
    unauthorized: {
      vi: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      en: "Your session has expired. Please sign in again."
    }
  }
} as const;

function normalizePhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeContactDetails(draft: ContactDetailsDraft): ContactDetailsDraft {
  return {
    email: draft.email.trim(),
    fullName: draft.fullName.trim(),
    phone: draft.phone.trim()
  };
}

export function isValidEmailAddress(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhoneNumber(phone: string) {
  const trimmed = phone.trim();

  if (!trimmed || !/^[+\d][\d\s().-]*$/.test(trimmed)) {
    return false;
  }

  const digits = normalizePhoneDigits(trimmed);

  return digits.length >= 8 && digits.length <= 15;
}

export function getContactDetailFieldError(
  locale: Locale,
  field: ContactDetailsField,
  value: string,
  options: ContactDetailsValidationOptions = {}
) {
  const trimmed = value.trim();

  if (field === "fullName") {
    return trimmed ? null : localize(locale, copy.errors.fullNameRequired);
  }

  if (field === "email") {
    if (!trimmed) {
      return localize(locale, copy.errors.emailRequired);
    }

    return isValidEmailAddress(trimmed) ? null : localize(locale, copy.errors.emailInvalid);
  }

  if (!trimmed) {
    return options.phoneRequired === false ? null : localize(locale, copy.errors.phoneRequired);
  }

  return isValidPhoneNumber(trimmed) ? null : localize(locale, copy.errors.phoneInvalid);
}

export function validateContactDetails(
  locale: Locale,
  draft: ContactDetailsDraft,
  options: ContactDetailsValidationOptions = {}
) {
  const values = normalizeContactDetails(draft);
  const errors: ContactDetailsErrors = {};

  const fullNameError = getContactDetailFieldError(locale, "fullName", values.fullName, options);
  const emailError = getContactDetailFieldError(locale, "email", values.email, options);
  const phoneError = getContactDetailFieldError(locale, "phone", values.phone, options);

  if (fullNameError) {
    errors.fullName = fullNameError;
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (phoneError) {
    errors.phone = phoneError;
  }

  return {
    errors,
    values
  };
}

export function getFirstContactDetailsError(errors: ContactDetailsErrors) {
  return errors.fullName ?? errors.email ?? errors.phone ?? null;
}

export function resolveContactDetailsError(locale: Locale, error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (
    message.includes("email is already in use") ||
    message.includes("email already exists") ||
    message.includes("already used by another member") ||
    message.includes("đã được dùng bởi member khác") ||
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("duplicate key value") ||
    message.includes("unique constraint")
  ) {
    return {
      field: "email" as const,
      message: localize(locale, copy.errors.duplicateEmail)
    };
  }

  if (message.includes("please enter your full name") || message.includes("vui lòng nhập họ tên")) {
    return {
      field: "fullName" as const,
      message: localize(locale, copy.errors.fullNameRequired)
    };
  }

  if (
    message.includes("please enter your email") ||
    message.includes("vui lòng nhập email") ||
    message.includes("invalid email") ||
    message.includes("email chưa đúng định dạng") ||
    message.includes("please enter a valid email address")
  ) {
    return {
      field: "email" as const,
      message: localize(locale, copy.errors.emailInvalid)
    };
  }

  if (
    message.includes("please enter your phone number") ||
    message.includes("vui lòng nhập số điện thoại") ||
    message.includes("invalid phone") ||
    message.includes("phone number is invalid") ||
    message.includes("please enter a valid phone number")
  ) {
    return {
      field: "phone" as const,
      message: localize(locale, copy.errors.phoneInvalid)
    };
  }

  if (message.includes("unauthorized") || message.includes("session has expired")) {
    return {
      message: localize(locale, copy.errors.unauthorized)
    };
  }

  return {
    message: localize(locale, copy.errors.fallback)
  };
}
