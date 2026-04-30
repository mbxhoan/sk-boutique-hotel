"use client";

import { appendLocaleQuery, type Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { PortalCard } from "@/components/portal-ui";
import { PortalSubmitButton } from "@/components/portal-submit-button";
import { changeMemberPasswordAction } from "@/app/(member)/member/actions";

type MemberPasswordEditorProps = {
  locale: Locale;
};

export function MemberPasswordEditor({ locale }: MemberPasswordEditorProps) {
  const returnTo = appendLocaleQuery("/member#info", locale);

  return (
    <PortalCard className="member-password-card" tone="accent">
      <div className="member-password-card__head">
        <p className="portal-panel__eyebrow">{localize(locale, { vi: "Bảo mật", en: "Security" })}</p>
        <h3 className="member-password-card__title">{localize(locale, { vi: "Đổi mật khẩu", en: "Change password" })}</h3>
        <p className="member-password-card__copy">
          {localize(locale, {
            vi: "Đặt mật khẩu mới có ít nhất 8 ký tự để bảo vệ tài khoản của bạn.",
            en: "Set a new password with at least 8 characters to keep your account secure."
          })}
        </p>
      </div>

      <form action={changeMemberPasswordAction} className="portal-form">
        <input name="locale" type="hidden" value={locale} />
        <input name="returnTo" type="hidden" value={returnTo} />

        <label className="portal-field">
          <span className="portal-field__label">{localize(locale, { vi: "Mật khẩu hiện tại", en: "Current password" })}</span>
          <input
            autoComplete="current-password"
            className="portal-field__control"
            minLength={8}
            name="currentPassword"
            required
            type="password"
          />
        </label>

        <label className="portal-field">
          <span className="portal-field__label">{localize(locale, { vi: "Mật khẩu mới", en: "New password" })}</span>
          <input
            autoComplete="new-password"
            className="portal-field__control"
            minLength={8}
            name="newPassword"
            required
            type="password"
          />
        </label>

        <label className="portal-field">
          <span className="portal-field__label">{localize(locale, { vi: "Xác nhận mật khẩu mới", en: "Confirm new password" })}</span>
          <input
            autoComplete="new-password"
            className="portal-field__control"
            minLength={8}
            name="confirmPassword"
            required
            type="password"
          />
        </label>

        <div className="member-password-card__actions">
          <PortalSubmitButton className="button button--solid" pendingLabel={localize(locale, { vi: "Đang đổi...", en: "Updating..." })}>
            {localize(locale, { vi: "Đổi mật khẩu", en: "Update password" })}
          </PortalSubmitButton>
        </div>
      </form>
    </PortalCard>
  );
}
