"use client";

import { useState, type ReactNode } from "react";

import { PaymentProofFileInput } from "@/components/payment-proof-file-input";
import { PortalSubmitButton } from "@/components/portal-submit-button";
import type { Locale } from "@/lib/locale";
import type { LocalizedText } from "@/lib/mock/i18n";

type PaymentProofUploadFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  className?: string;
  helperText: LocalizedText;
  label: LocalizedText;
  locale: Locale;
  noteField?: ReactNode;
  pendingLabel: ReactNode;
  submitClassName?: string;
  submitLabel: ReactNode;
  beforeFileInput?: ReactNode;
};

export function PaymentProofUploadForm({
  action,
  beforeFileInput,
  className = "portal-form",
  helperText,
  label,
  locale,
  noteField,
  pendingLabel,
  submitClassName,
  submitLabel
}: PaymentProofUploadFormProps) {
  const [isCompressing, setIsCompressing] = useState(false);

  return (
    <form className={className} action={action} encType="multipart/form-data">
      {beforeFileInput}
      <PaymentProofFileInput helperText={helperText} label={label} locale={locale} onCompressingChange={setIsCompressing} />
      {noteField}
      <PortalSubmitButton className={submitClassName} disabled={isCompressing} pendingLabel={pendingLabel}>
        {submitLabel}
      </PortalSubmitButton>
    </form>
  );
}
