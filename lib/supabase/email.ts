import type { AvailabilityRequestRow, BranchRow, RoomTypeRow } from "@/lib/supabase/database.types";
import {
  getSupabaseEmailAdminRecipient,
  getSupabaseEmailFromAddress,
  getSupabaseEmailFunctionName,
  hasSupabaseServiceConfig
} from "@/lib/supabase/env";
import { listBranches } from "@/lib/supabase/queries/branches";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type SendEmailInput = {
  from: string;
  to: string;
  subject: string;
  html: string;
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
          <td style="padding:10px 12px;border-bottom:1px solid #ece7de;color:#7a6f60;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #ece7de;color:#10233e;font-size:14px;line-height:1.6;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="${escapeHtml(lang)}">
  <body style="margin:0;background:#fbf9f5;color:#1a1a1a;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:680px;margin:0 auto;padding:32px 20px;">
      <div style="padding:28px;border:1px solid rgba(0,12,30,0.08);border-radius:20px;background:linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,244,236,0.96));box-shadow:0 20px 40px rgba(0,12,30,0.06);">
        <p style="margin:0 0 10px;color:#c5a059;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">${escapeHtml(subject)}</p>
        <h1 style="margin:0 0 12px;color:#000c1e;font-size:28px;line-height:1.1;letter-spacing:-0.03em;">${escapeHtml(subject)}</h1>
        <p style="margin:0 0 20px;color:#61656f;font-size:15px;line-height:1.7;">${escapeHtml(intro)}</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;border-spacing:0;">${rows}</table>
        <p style="margin:20px 0 0;color:#61656f;font-size:14px;line-height:1.7;">${escapeHtml(closing)}</p>
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

export async function sendEmail(input: SendEmailInput) {
  if (!hasSupabaseServiceConfig()) {
    return null;
  }

  const supabase = createSupabaseServiceClient();
  const payload = {
    from: input.from.trim(),
    to: input.to.trim(),
    subject: input.subject.trim(),
    html: input.html.trim()
  };

  const { data, error } = await supabase.functions.invoke(getSupabaseEmailFunctionName(), {
    body: payload
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function sendAvailabilityRequestEmails(request: AvailabilityRequestRow) {
  if (!hasSupabaseServiceConfig() || request.source === "admin_console") {
    return null;
  }

  const locale = request.preferred_locale === "en" ? "en" : "vi";
  const labels = localizedLabels(locale);
  const { branch, roomType } = await buildAvailabilityRequestContext(request);
  const adminRecipient = getSupabaseEmailAdminRecipient();
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
    to: adminRecipient,
    subject: adminSubject,
    html: buildHtmlEmail(adminSubject, adminIntro, adminDetailRows, adminClosing, locale)
  } satisfies SendEmailInput;

  const results = await Promise.allSettled([sendEmail(customerEmail), sendEmail(adminEmailPayload)]);

  if (results.some((result) => result.status === "rejected")) {
    console.warn("[email] Failed to deliver availability request notification", {
      requestCode: request.request_code,
      adminDelivered: results[1].status === "fulfilled",
      customerDelivered: results[0].status === "fulfilled"
    });
  }

  return {
    admin: results[1].status === "fulfilled",
    customer: results[0].status === "fulfilled"
  };
}
