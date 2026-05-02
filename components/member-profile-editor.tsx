"use client";

import type { CustomerRow } from "@/lib/supabase/database.types";
import { appendLocaleQuery, type Locale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { PortalBadge, PortalCard } from "@/components/portal-ui";
import { PortalSubmitButton } from "@/components/portal-submit-button";
import { updateMemberProfileAction } from "@/app/(member)/member/actions";

type MemberProfileEditorProps = {
  customer: CustomerRow;
  locale: Locale;
};

export function MemberProfileEditor({ customer, locale }: MemberProfileEditorProps) {
  const returnTo = appendLocaleQuery("/member#info", locale);

  return (
    <PortalCard className="member-profile-card" tone="accent">
      <div className="portal-item-card__top">
        <div>
          {/* <p className="portal-panel__eyebrow">{localize(locale, { vi: "Thông tin", en: "Info" })}</p> */}
          {/* <h3 className="portal-item-card__title">{localize(locale, { vi: "Cập nhật thông tin", en: "Update Information" })}</h3> */}
          {/* <p className="portal-panel__note-copy">
            {localize(locale, {
              vi: "Cập nhật hồ sơ member tại đây",
              en: "Update your member profile here"
            })}
          </p> */}
        </div>

        {/* <PortalBadge tone="soft">{localize(locale, { vi: "Đã ghi log", en: "Audit tracked" })}</PortalBadge> */}
      </div>

      <form className="portal-form" action={updateMemberProfileAction}>
        <input name="locale" type="hidden" value={locale} />
        <input name="returnTo" type="hidden" value={returnTo} />

        <label className="portal-field">
          <span className="portal-field__label">{localize(locale, { vi: "Họ và tên", en: "Full name" })}</span>
          <input
            autoComplete="name"
            className="portal-field__control"
            defaultValue={customer.full_name}
            name="fullName"
            required
            type="text"
          />
        </label>

        <label className="portal-field">
          <span className="portal-field__label">{localize(locale, { vi: "Email", en: "Email" })}</span>
          <input
            autoComplete="email"
            className="portal-field__control"
            defaultValue={customer.email}
            inputMode="email"
            name="email"
            required
            type="email"
          />
        </label>

        <label className="portal-field">
          <span className="portal-field__label">{localize(locale, { vi: "Số điện thoại", en: "Phone" })}</span>
          <input
            autoComplete="tel"
            className="portal-field__control"
            defaultValue={customer.phone ?? ""}
            inputMode="tel"
            name="phone"
            required
            type="tel"
          />
        </label>

        <label className="portal-field">
          <span className="portal-field__label">{localize(locale, { vi: "Ngôn ngữ ưu tiên", en: "Preferred language" })}</span>
          <select className="portal-field__control" defaultValue={customer.preferred_locale} name="preferredLocale">
            <option value="vi">VI</option>
            <option value="en">EN</option>
          </select>
        </label>

        <label className="portal-field member-profile-card__switch">
          <span className="portal-field__label">{localize(locale, { vi: "Đồng ý marketing", en: "Marketing consent" })}</span>
          <span className="member-profile-card__switch-row">
            <input className="portal-field__checkbox" defaultChecked={customer.marketing_consent} name="marketingConsent" type="checkbox" />
            <span className="member-profile-card__switch-copy">
              {localize(locale, {
                vi: "Dùng cho cập nhật booking, ưu đãi, và các thông báo liên quan.",
                en: "Used for booking updates, offers, and related notifications."
              })}
            </span>
          </span>
        </label>

        <div className="member-profile-card__note">
          {/* <PortalBadge tone="soft">{localize(locale, { vi: "Lịch sử được lưu", en: "History kept" })}</PortalBadge> */}
          {/* <p className="member-profile-card__copy">
            {localize(locale, {
              vi: "Mọi thay đổi hồ sơ được lưu trong audit log để admin và vận hành theo dõi.",
              en: "Every profile change is stored in the audit log for admin and operations."
            })}
          </p> */}
        </div>

        <div className="member-profile-card__actions">
          <PortalSubmitButton className="button button--solid" pendingLabel={localize(locale, { vi: "Đang lưu...", en: "Saving..." })}>
            {localize(locale, { vi: "Lưu hồ sơ", en: "Save profile" })}
          </PortalSubmitButton>
        </div>
      </form>
    </PortalCard>
  );
}
