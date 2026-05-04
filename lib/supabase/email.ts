import type { AvailabilityRequestRow, BranchRow, RoomTypeRow } from "@/lib/supabase/database.types";
import {
  createBookingConfirmedCustomerEmail,
  createDepositRequestCustomerEmail
} from "@/lib/email/templates";
import {
  getSupabaseEmailAdminBccRecipients,
  getSupabaseEmailAdminRecipient,
  getSupabaseEmailFromAddress,
  getSupabaseEmailFromName,
  getSupabaseEmailFunctionNames,
  hasSupabaseServiceConfig
} from "@/lib/supabase/env";
import { listBranches } from "@/lib/supabase/queries/branches";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type SendEmailInput = {
  from: string;
  bcc?: string[];
  to: string;
  subject: string;
  html: string;
};

export type SendDepositRequestEmailInput = {
  bookingCode: string;
  bookingUrl: string;
  branchName: string;
  checkInDate: string;
  checkOutDate: string;
  depositAmount: string;
  guestEmail: string;
  guestName: string;
  nights: string;
  paymentAccountName: string;
  paymentAccountNumber: string;
  paymentBankName: string;
  paymentCitadCode: string;
  paymentDeadline: string;
  paymentQrUrl: string;
  paymentTransferNote: string;
  paymentSwiftCode: string;
  roomType: string;
};

export type SendBookingConfirmedEmailInput = {
  bookingCode: string;
  bookingUrl: string;
  branchName: string;
  checkInDate: string;
  checkOutDate: string;
  guestEmail: string;
  guestName: string;
  nights: string;
  roomType: string;
  totalAmount: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatEmailDate(locale: "en" | "vi", value: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
    dateStyle: "medium",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(value));
}

function buildDateRange(locale: "en" | "vi", startAt: string, endAt: string) {
  return `${formatEmailDate(locale, startAt)} - ${formatEmailDate(locale, endAt)}`;
}

function localizedLabels(locale: "en" | "vi") {
  return locale === "en"
    ? {
        adminGreeting: "A new availability request just came in.",
        adminIntro: "Please review it and follow up manually when ready.",
        branch: "Branch",
        consent: "Marketing consent",
        customerEmail: "Customer email",
        customerGreeting: "Thanks for reaching out.",
        customerIntro: "We received your room request and will get back to you shortly.",
        guests: "Guests",
        note: "Note",
        requestCode: "Request code",
        roomType: "Room type",
        source: "Source",
        stayDates: "Stay dates",
        phone: "Phone",
        title: "SK Boutique Hotel",
        yes: "Yes",
        no: "No"
      }
    : {
        adminGreeting: "Có một availability request mới vừa được ghi nhận.",
        adminIntro: "Vui lòng kiểm tra và xử lý thủ công khi sẵn sàng.",
        branch: "Chi nhánh",
        consent: "Marketing consent",
        customerEmail: "Email khách",
        customerGreeting: "Cảm ơn bạn đã liên hệ.",
        customerIntro: "Chúng tôi đã nhận yêu cầu xem phòng và sẽ phản hồi trong thời gian sớm nhất.",
        guests: "Khách",
        note: "Ghi chú",
        requestCode: "Mã yêu cầu",
        roomType: "Hạng phòng",
        source: "Nguồn",
        stayDates: "Ngày ở",
        phone: "Điện thoại",
        title: "SK Boutique Hotel",
        yes: "Có",
        no: "Không"
      };
}

function buildHtmlEmail(
  subject: string,
  intro: string,
  details: Array<[string, string]>,
  closing: string,
  lang: string
) {
  const rows = details
    .map(
      ([label, value]) => `
        <tr>
          <td class="email-row-label" style="padding:10px 12px;border-bottom:1px solid #ece7de;color:#7a6f60;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;background:#ffffff;">${escapeHtml(label)}</td>
          <td class="email-row-value" style="padding:10px 12px;border-bottom:1px solid #ece7de;color:#10233e;font-size:14px;line-height:1.6;background:#ffffff;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="${escapeHtml(lang)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(subject)}</title>
    <style>
      :root { color-scheme: light only; supported-color-schemes: light; }
      @media (prefers-color-scheme: dark) {
        body { background:#fbf9f5 !important; color:#1a1a1a !important; }
        .email-card { background:#ffffff !important; }
        .email-title { color:#000c1e !important; }
        .email-intro, .email-closing { color:#61656f !important; }
        .email-eyebrow { color:#c5a059 !important; }
        .email-row-label { color:#7a6f60 !important; background:#ffffff !important; }
        .email-row-value { color:#10233e !important; background:#ffffff !important; }
      }
      [data-ogsc] body { background:#fbf9f5 !important; color:#1a1a1a !important; }
      [data-ogsc] .email-card { background:#ffffff !important; }
      [data-ogsc] .email-title { color:#000c1e !important; }
      [data-ogsc] .email-intro, [data-ogsc] .email-closing { color:#61656f !important; }
      [data-ogsc] .email-eyebrow { color:#c5a059 !important; }
      [data-ogsc] .email-row-label { color:#7a6f60 !important; background:#ffffff !important; }
      [data-ogsc] .email-row-value { color:#10233e !important; background:#ffffff !important; }
      [data-ogsb] body { background:#fbf9f5 !important; }
      [data-ogsb] .email-card { background:#ffffff !important; }
    </style>
  </head>
  <body bgcolor="#fbf9f5" style="margin:0;background:#fbf9f5;color:#1a1a1a;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:680px;margin:0 auto;padding:32px 20px;background:#fbf9f5;">
      <div class="email-card" style="padding:28px;border:1px solid rgba(0,12,30,0.08);border-radius:20px;background:#ffffff;box-shadow:0 20px 40px rgba(0,12,30,0.06);">
        <p class="email-eyebrow" style="margin:0 0 10px;color:#c5a059;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">${escapeHtml(subject)}</p>
        <h1 class="email-title" style="margin:0 0 12px;color:#000c1e;font-size:28px;line-height:1.1;letter-spacing:-0.03em;">${escapeHtml(subject)}</h1>
        <p class="email-intro" style="margin:0 0 20px;color:#61656f;font-size:15px;line-height:1.7;">${escapeHtml(intro)}</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;border-spacing:0;background:#ffffff;">${rows}</table>
        <p class="email-closing" style="margin:20px 0 0;color:#61656f;font-size:14px;line-height:1.7;">${escapeHtml(closing)}</p>
      </div>
    </div>
  </body>
</html>`;
}

function buildAvailabilityRequestDetails(request: AvailabilityRequestRow, locale: "en" | "vi", branch?: BranchRow | null, roomType?: RoomTypeRow | null) {
  const labels = localizedLabels(locale);
  const branchName = locale === "en" ? branch?.name_en ?? branch?.name_vi ?? request.branch_id : branch?.name_vi ?? branch?.name_en ?? request.branch_id;
  const roomTypeName = locale === "en" ? roomType?.name_en ?? roomType?.name_vi ?? request.room_type_id : roomType?.name_vi ?? roomType?.name_en ?? request.room_type_id;
  const marketingConsent = request.marketing_consent ? labels.yes : labels.no;

  return [
    [labels.requestCode, request.request_code],
    [labels.branch, branchName],
    [labels.roomType, roomTypeName],
    [labels.stayDates, buildDateRange(locale, request.stay_start_at, request.stay_end_at)],
    [labels.guests, String(request.guest_count)],
    [labels.customerEmail, request.contact_email],
    [labels.phone, request.contact_phone ?? "—"],
    [labels.consent, marketingConsent],
    [labels.source, request.source],
    [labels.note, request.note?.trim() ? request.note : "—"]
  ] as Array<[string, string]>;
}

async function buildAvailabilityRequestContext(request: AvailabilityRequestRow) {
  const [branches, roomTypes] = await Promise.all([listBranches(), listRoomTypes()]);
  const branch = branches.find((item) => item.id === request.branch_id) ?? null;
  const roomType = roomTypes.find((item) => item.id === request.room_type_id) ?? null;

  return { branch, roomType };
}

function buildFromHeader(fromAddress?: string) {
  const resolvedAddress = fromAddress?.trim() || getSupabaseEmailFromAddress().trim();
  const fromName = getSupabaseEmailFromName().trim();

  return fromName ? `${fromName} <${resolvedAddress}>` : resolvedAddress;
}

function buildBrandConfig() {
  return {
    brandLine: "Boutique Hotel",
    contactEmail: getSupabaseEmailFromAddress(),
    hotelName: getSupabaseEmailFromName()
  };
}

export async function sendEmail(input: SendEmailInput) {
  if (!hasSupabaseServiceConfig()) {
    return null;
  }

  const supabase = createSupabaseServiceClient();
  const fromHeader = input.from.includes("<") ? input.from.trim() : buildFromHeader(input.from);
  const payload = {
    from: fromHeader,
    ...(input.bcc && input.bcc.length > 0 ? { bcc: input.bcc } : {}),
    to: input.to.trim(),
    subject: input.subject.trim(),
    html: input.html.trim()
  };

  let lastError: unknown = null;

  for (const functionName of getSupabaseEmailFunctionNames()) {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    });

    if (!error) {
      return data;
    }

    lastError = error;

    if ((error as { context?: Response | null }).context?.status !== 404) {
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to invoke Supabase email function.");
}

export async function sendAvailabilityRequestEmails(request: AvailabilityRequestRow) {
  if (!hasSupabaseServiceConfig() || request.source === "admin_console") {
    return null;
  }

  const locale = request.preferred_locale === "en" ? "en" : "vi";
  const labels = localizedLabels(locale);
  const { branch, roomType } = await buildAvailabilityRequestContext(request);
  const roomTypeName =
    locale === "en"
      ? roomType?.name_en ?? roomType?.name_vi ?? request.room_type_id
      : roomType?.name_vi ?? roomType?.name_en ?? request.room_type_id;
  const branchName =
    locale === "en"
      ? branch?.name_en ?? branch?.name_vi ?? request.branch_id
      : branch?.name_vi ?? branch?.name_en ?? request.branch_id;
  const dateRange = buildDateRange(locale, request.stay_start_at, request.stay_end_at);
  const customerSubject =
    locale === "en"
      ? `SK Boutique Hotel | We received your request`
      : `SK Boutique Hotel | Chúng tôi đã nhận yêu cầu của bạn`;
  const adminSubject =
    locale === "en"
      ? `New availability request - ${request.request_code}`
      : `Yêu cầu xem phòng mới - ${request.request_code}`;
  const adminPrimaryRecipient = getSupabaseEmailAdminRecipient();
  const adminBccRecipients = getSupabaseEmailAdminBccRecipients();
  const customerIntro = labels.customerIntro;
  const adminIntro = labels.adminGreeting;
  const customerClosing =
    locale === "en"
      ? "If you need to update anything, just reply to this email."
      : "Nếu cần chỉnh sửa thông tin, bạn chỉ cần trả lời lại email này.";
  const adminClosing =
    locale === "en"
      ? "This is a manual-first flow. Please review and follow up from the admin system."
      : "Đây là luồng xử lý thủ công. Vui lòng kiểm tra và tiếp tục trong hệ thống quản trị.";
  const fromAddress = getSupabaseEmailFromAddress();

  const customerDetailRows = [
    [locale === "en" ? "Request code" : "Mã yêu cầu", request.request_code],
    [locale === "en" ? "Room type" : "Hạng phòng", roomTypeName],
    [locale === "en" ? "Branch" : "Chi nhánh", branchName],
    [locale === "en" ? "Stay dates" : "Ngày ở", dateRange],
    [locale === "en" ? "Guests" : "Khách", String(request.guest_count)],
    [locale === "en" ? "Email" : "Email", request.contact_email],
    [locale === "en" ? "Phone" : "Điện thoại", request.contact_phone ?? "—"]
  ] as Array<[string, string]>;

  const adminDetailRows = buildAvailabilityRequestDetails(request, locale, branch, roomType);

  const customerEmail = {
    from: fromAddress,
    to: request.contact_email,
    subject: customerSubject,
    html: buildHtmlEmail(customerSubject, customerIntro, customerDetailRows, customerClosing, locale)
  } satisfies SendEmailInput;

  const adminEmailPayload = {
    from: fromAddress,
    subject: adminSubject,
    html: buildHtmlEmail(adminSubject, adminIntro, adminDetailRows, adminClosing, locale)
  } satisfies Omit<SendEmailInput, "to">;

  const customerDeliveryPromise = sendEmail(customerEmail)
    .then(() => ({ status: "fulfilled" as const }))
    .catch((reason) => ({ status: "rejected" as const, reason }));
  const adminDeliveryPromise = sendEmail({
    ...adminEmailPayload,
    bcc: adminBccRecipients.length > 0 ? adminBccRecipients : undefined,
    to: adminPrimaryRecipient
  })
    .then(() => ({ status: "fulfilled" as const }))
    .catch((reason) => ({ status: "rejected" as const, reason }));

  const [customerDelivery, adminDelivery] = await Promise.all([customerDeliveryPromise, adminDeliveryPromise]);

  if (customerDelivery.status === "rejected" || adminDelivery.status === "rejected") {
    console.warn("[email] Failed to deliver availability request notification", {
      requestCode: request.request_code,
      adminBccRecipientCount: adminBccRecipients.length,
      adminPrimaryRecipient,
      customerDelivered: customerDelivery.status === "fulfilled",
      adminDelivered: adminDelivery.status === "fulfilled"
    });
  }

  return {
    admin: adminDelivery.status === "fulfilled",
    customer: customerDelivery.status === "fulfilled"
  };
}

export async function sendDepositRequestCustomerEmail(input: SendDepositRequestEmailInput) {
  const email = createDepositRequestCustomerEmail(buildBrandConfig(), {
    bookingCode: input.bookingCode,
    bookingUrl: input.bookingUrl,
    branchName: input.branchName,
    checkInDate: input.checkInDate,
    checkOutDate: input.checkOutDate,
    depositAmount: input.depositAmount,
    guestName: input.guestName,
    nights: input.nights,
    paymentAccountName: input.paymentAccountName,
    paymentAccountNumber: input.paymentAccountNumber,
    paymentBankName: input.paymentBankName,
    paymentCitadCode: input.paymentCitadCode,
    paymentDeadline: input.paymentDeadline,
    paymentQrUrl: input.paymentQrUrl,
    paymentTransferNote: input.paymentTransferNote,
    paymentSwiftCode: input.paymentSwiftCode,
    roomType: input.roomType
  });

  await sendEmail({
    from: getSupabaseEmailFromAddress(),
    html: email.html,
    subject: email.subject,
    to: input.guestEmail
  });

  return email;
}

export async function sendBookingConfirmedCustomerEmail(input: SendBookingConfirmedEmailInput) {
  const email = createBookingConfirmedCustomerEmail(buildBrandConfig(), {
    bookingCode: input.bookingCode,
    bookingUrl: input.bookingUrl,
    branchName: input.branchName,
    checkInDate: input.checkInDate,
    checkOutDate: input.checkOutDate,
    guestName: input.guestName,
    nights: input.nights,
    roomType: input.roomType,
    totalAmount: input.totalAmount
  });

  await sendEmail({
    from: getSupabaseEmailFromAddress(),
    html: email.html,
    subject: email.subject,
    to: input.guestEmail
  });

  return email;
}
