import type { Metadata } from "next";

import { submitPaymentProofAction } from "@/app/actions/payments";
import { PortalBadge, PortalCard, PortalSectionHeading } from "@/components/portal-ui";
import { resolveLocale } from "@/lib/locale";
import { buildVietQrImageUrl, getPaymentRequestByPublicToken } from "@/lib/supabase/payments";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: locale === "en" ? "Deposit upload" : "Tải proof chuyển khoản",
    description:
      locale === "en"
        ? "Upload your deposit proof using the secure payment link."
        : "Tải lên ảnh chuyển khoản từ link thanh toán bảo mật."
  };
}

export default async function PaymentUploadPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const paymentRequest = await getPaymentRequestByPublicToken(resolvedParams.token);

  if (!paymentRequest) {
    return (
      <div className="portal-content">
        <PortalCard tone="soft">
          <PortalSectionHeading
            description={{
              en: "The payment link is invalid or expired.",
              vi: "Link thanh toán không hợp lệ hoặc đã hết hạn."
            }}
            eyebrow={{ en: "Payment link", vi: "Payment link" }}
            locale={locale}
            title={{ en: "Link not available", vi: "Không tìm thấy link" }}
          />
        </PortalCard>
      </div>
    );
  }

  const qrImageUrl = buildVietQrImageUrl(paymentRequest);

  return (
    <div className="portal-content">
      <section className="portal-section">
        <PortalSectionHeading
          description={{
            en: "Upload your transfer proof here. Staff will verify it manually before confirmation.",
            vi: "Tải ảnh chuyển khoản tại đây. Staff sẽ verify thủ công trước khi xác nhận."
          }}
          eyebrow={{ en: "Deposit QR", vi: "Deposit QR" }}
          locale={locale}
          title={{
            en: `Payment ${paymentRequest.payment_code}`,
            vi: `Thanh toán ${paymentRequest.payment_code}`
          }}
        />

        <div className="portal-grid portal-grid--two">
          <PortalCard tone="accent">
            <p className="portal-panel__eyebrow">{locale === "en" ? "Bank details" : "Thông tin ngân hàng"}</p>
            <dl className="portal-profile-list">
              <div className="portal-profile-list__item">
                <dt className="portal-profile-list__label">{locale === "en" ? "Bank" : "Ngân hàng"}</dt>
                <dd className="portal-profile-list__value">{paymentRequest.bank_name}</dd>
              </div>
              <div className="portal-profile-list__item">
                <dt className="portal-profile-list__label">{locale === "en" ? "Account" : "Số tài khoản"}</dt>
                <dd className="portal-profile-list__value">{paymentRequest.account_number}</dd>
              </div>
              <div className="portal-profile-list__item">
                <dt className="portal-profile-list__label">{locale === "en" ? "Account name" : "Tên tài khoản"}</dt>
                <dd className="portal-profile-list__value">{paymentRequest.account_name}</dd>
              </div>
              <div className="portal-profile-list__item">
                <dt className="portal-profile-list__label">{locale === "en" ? "Amount" : "Số tiền"}</dt>
                <dd className="portal-profile-list__value">
                  {new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", { maximumFractionDigits: 0 }).format(
                    paymentRequest.amount
                  )}{" "}
                  {paymentRequest.currency}
                </dd>
              </div>
              <div className="portal-profile-list__item">
                <dt className="portal-profile-list__label">{locale === "en" ? "Transfer content" : "Nội dung chuyển khoản"}</dt>
                <dd className="portal-profile-list__value">{paymentRequest.transfer_content}</dd>
              </div>
            </dl>
            <div className="portal-qr-block">
              {/* Static image URL keeps the UI simple while remaining dynamic by amount + booking code. */}
              <img alt={paymentRequest.payment_code} className="portal-qr-block__image" src={qrImageUrl} />
            </div>
          </PortalCard>

          <PortalCard tone="default">
            <div className="portal-item-card__top">
              <p className="portal-item-card__code">{paymentRequest.payment_code}</p>
              <PortalBadge tone="soft">{paymentRequest.status}</PortalBadge>
            </div>
            <h3 className="portal-item-card__title">
              {locale === "en" ? paymentRequest.reservation_id : paymentRequest.reservation_id}
            </h3>
            <p className="portal-item-card__detail">
              {locale === "en"
                ? "Upload a clear transfer image or screenshot. The public link is tokenized and expires automatically."
                : "Tải ảnh hoặc ảnh chụp màn hình chuyển khoản rõ nét. Link công khai được tokenized và tự hết hạn."}
            </p>

            <form className="portal-form" action={submitPaymentProofAction}>
              <input name="paymentToken" type="hidden" value={resolvedParams.token} />
              <input name="returnTo" type="hidden" value={`/thanh-toan/${resolvedParams.token}`} />
              <input name="uploadedVia" type="hidden" value="public_link" />
              <label className="portal-field">
                <span className="portal-field__label">{locale === "en" ? "Proof image" : "Ảnh proof"}</span>
                <input className="portal-field__control" name="proofFile" type="file" accept="image/*,.pdf" />
              </label>
              <label className="portal-field">
                <span className="portal-field__label">{locale === "en" ? "Note" : "Ghi chú"}</span>
                <textarea className="portal-field__control" name="note" rows={4} />
              </label>
              <button className="button button--solid" type="submit">
                {locale === "en" ? "Upload proof" : "Tải proof"}
              </button>
            </form>
          </PortalCard>
        </div>
      </section>
    </div>
  );
}
