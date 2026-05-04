export type EmailTemplate = {
  subject: string;
  previewText: string;
  html: string;
  text: string;
};

export type BrandConfig = {
  hotelName: string;
  brandLine?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export type SummaryField = {
  label: string;
  value: string;
};

export type SummaryCard = {
  fields: SummaryField[];
};

export type PaymentQrBlock = {
  imageUrl: string;
  alt?: string;
  note?: string;
};

function escapeHtml(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderSummaryCard(card: SummaryCard): string {
  return `
    <div class="card" style="background:#faf8f4;border:1px solid #ece6da;color:#1f1f1f;">
      ${card.fields
        .map(
          (field) => `
            <div class="row" style="color:#4a4a4a;">
              <span class="label" style="color:#7a7a7a;">${escapeHtml(field.label)}</span>
              <span class="value" style="color:#1f1f1f;">${escapeHtml(field.value)}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderQrBlock(qrBlock?: PaymentQrBlock): string {
  if (!qrBlock?.imageUrl) return "";
  return `
    <div class="qr-wrap">
      <img
        src="${escapeHtml(qrBlock.imageUrl)}"
        alt="${escapeHtml(qrBlock.alt || "QR thanh toán")}"
        class="qr-img"
      />
      ${qrBlock.note ? `<p class="note">${escapeHtml(qrBlock.note)}</p>` : ""}
    </div>
  `;
}

function renderBaseEmail(params: {
  brand: BrandConfig;
  eyebrow: string;
  title: string;
  intro?: string;
  sections?: string[];
  cards?: SummaryCard[];
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
  qrBlock?: PaymentQrBlock;
}): string {
  const { brand, eyebrow, title, intro, sections = [], cards = [], ctaLabel, ctaUrl, footerNote, qrBlock } = params;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light only; supported-color-schemes: light; }
    body { margin:0; padding:0; background:#f5f3ee; font-family:Arial, Helvetica, sans-serif; color:#1f1f1f; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse:collapse; }
    .wrapper { width:100%; background:#f5f3ee; padding:32px 16px; }
    .container { max-width:640px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; }
    .header { padding:28px 32px 12px; background:#ffffff; }
    .brand { font-size:22px; font-weight:700; letter-spacing:0.3px; color:#1f1f1f; }
    .subbrand { font-size:12px; color:#777777; margin-top:4px; }
    .content { padding:8px 32px 8px; background:#ffffff; }
    .eyebrow { font-size:12px; letter-spacing:1.6px; color:#b08a35; font-weight:700; text-transform:uppercase; }
    h1 { margin:12px 0 12px; font-size:28px; line-height:1.2; color:#1f1f1f; }
    p { margin:0 0 14px; font-size:15px; line-height:1.7; color:#4a4a4a; }
    .card { margin:20px 0; background:#faf8f4; border:1px solid #ece6da; border-radius:12px; padding:18px; }
    .row { margin:0 0 10px; font-size:14px; line-height:1.6; }
    .row:last-child { margin-bottom:0; }
    .label { color:#7a7a7a; display:block; margin-bottom:2px; }
    .value { color:#1f1f1f; font-weight:600; }
    .button-wrap { padding:8px 0 4px; }
    .button { display:inline-block; background:#b08a35; color:#ffffff !important; text-decoration:none; padding:12px 20px; border-radius:10px; font-size:14px; font-weight:700; mso-padding-alt:0; mso-text-raise:0; }
    .qr-wrap { text-align:center; margin:20px 0; }
    .qr-img { max-width:220px; width:100%; height:auto; border:1px solid #ece6da; border-radius:12px; background:#ffffff; padding:10px; }
    .note { font-size:13px; color:#7a7a7a; margin-top:10px; }
    .footer { padding:20px 32px 32px; font-size:12px; color:#8a8a8a; line-height:1.7; background:#ffffff; }
    .divider { height:1px; background:#eee7db; margin:8px 0 0; }
    @media only screen and (max-width: 640px) {
      .header, .content, .footer { padding-left:20px !important; padding-right:20px !important; }
      h1 { font-size:24px !important; }
    }
    /* Force light scheme for clients that honour prefers-color-scheme. We intentionally
       restate the same light-mode palette so no color flips when device is in dark mode. */
    @media (prefers-color-scheme: dark) {
      body, .wrapper { background:#f5f3ee !important; color:#1f1f1f !important; }
      .container, .header, .content, .footer { background:#ffffff !important; }
      h1, .brand, .value { color:#1f1f1f !important; }
      p, .row, .footer { color:#4a4a4a !important; }
      .label, .subbrand, .note { color:#7a7a7a !important; }
      .card { background:#faf8f4 !important; border-color:#ece6da !important; }
      .button { background:#b08a35 !important; color:#ffffff !important; }
      .eyebrow { color:#b08a35 !important; }
      .qr-img { background:#ffffff !important; border-color:#ece6da !important; }
      .divider { background:#eee7db !important; }
    }
    /* Gmail iOS / Apple Mail dark-mode pass: ensure the same light palette. */
    [data-ogsc] body, [data-ogsc] .wrapper { background:#f5f3ee !important; color:#1f1f1f !important; }
    [data-ogsc] .container, [data-ogsc] .header, [data-ogsc] .content, [data-ogsc] .footer { background:#ffffff !important; }
    [data-ogsc] h1, [data-ogsc] .brand, [data-ogsc] .value { color:#1f1f1f !important; }
    [data-ogsc] p, [data-ogsc] .row { color:#4a4a4a !important; }
    [data-ogsc] .label, [data-ogsc] .subbrand, [data-ogsc] .note { color:#7a7a7a !important; }
    [data-ogsc] .card { background:#faf8f4 !important; border-color:#ece6da !important; }
    [data-ogsc] .button { background:#b08a35 !important; color:#ffffff !important; }
    [data-ogsc] .eyebrow { color:#b08a35 !important; }
    [data-ogsc] .qr-img { background:#ffffff !important; border-color:#ece6da !important; }
    [data-ogsc] .divider { background:#eee7db !important; }
    /* Outlook.com dark mode (uses [data-ogsb]) */
    [data-ogsb] body, [data-ogsb] .wrapper { background:#f5f3ee !important; color:#1f1f1f !important; }
    [data-ogsb] .container, [data-ogsb] .header, [data-ogsb] .content, [data-ogsb] .footer { background:#ffffff !important; }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a, p, h1 { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body bgcolor="#f5f3ee" style="background:#f5f3ee;color:#1f1f1f;">
  <div class="wrapper" style="background:#f5f3ee;">
    <table role="presentation" width="100%" bgcolor="#f5f3ee" style="background:#f5f3ee;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" class="container" bgcolor="#ffffff" style="background:#ffffff;">
            <tr>
              <td class="header" bgcolor="#ffffff" style="background:#ffffff;">
                <div class="brand" style="color:#1f1f1f;">${escapeHtml(brand.hotelName)}</div>
                <div class="subbrand" style="color:#777777;">${escapeHtml(brand.brandLine || "Boutique Hotel")}</div>
              </td>
            </tr>
            <tr><td bgcolor="#ffffff"><div class="divider" style="background:#eee7db;"></div></td></tr>
            <tr>
              <td class="content" bgcolor="#ffffff" style="background:#ffffff;">
                <div class="eyebrow" style="color:#b08a35;">${escapeHtml(eyebrow)}</div>
                <h1 style="color:#1f1f1f;">${escapeHtml(title)}</h1>
                ${intro ? `<p style="color:#4a4a4a;">${escapeHtml(intro)}</p>` : ""}
                ${cards.map(renderSummaryCard).join("")}
                ${sections.map((section) => `<p style="color:#4a4a4a;">${escapeHtml(section)}</p>`).join("")}
                ${renderQrBlock(qrBlock)}
                ${
                  ctaLabel && ctaUrl
                    ? `<div class="button-wrap"><a href="${escapeHtml(ctaUrl)}" class="button" style="background:#b08a35;color:#ffffff;">${escapeHtml(
                        ctaLabel
                      )}</a></div>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td class="footer" bgcolor="#ffffff" style="background:#ffffff;color:#8a8a8a;">
                ${footerNote ? `${escapeHtml(footerNote)}<br>` : ""}
                ${
                  brand.contactPhone || brand.contactEmail
                    ? `Hỗ trợ: ${escapeHtml(brand.contactPhone || "")}${
                        brand.contactPhone && brand.contactEmail ? " · " : ""
                      }${escapeHtml(brand.contactEmail || "")}<br>`
                    : ""
                }
                Trân trọng,<br>
                ${escapeHtml(brand.hotelName)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

function renderPlainText(params: {
  brand: BrandConfig;
  title: string;
  intro?: string;
  sections?: string[];
  cards?: SummaryCard[];
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}): string {
  const { brand, title, intro, sections = [], cards = [], ctaLabel, ctaUrl, footerNote } = params;

  const lines: string[] = [title, ""];
  if (intro) lines.push(intro, "");

  for (const card of cards) {
    for (const field of card.fields) {
      lines.push(`${field.label}: ${field.value}`);
    }
    lines.push("");
  }

  for (const section of sections) {
    lines.push(section);
  }

  if (sections.length) lines.push("");
  if (ctaLabel && ctaUrl) lines.push(`${ctaLabel}: ${ctaUrl}`, "");
  if (footerNote) lines.push(footerNote, "");
  if (brand.contactPhone || brand.contactEmail) {
    lines.push(
      `Hỗ trợ: ${brand.contactPhone || ""}${brand.contactPhone && brand.contactEmail ? " · " : ""}${brand.contactEmail || ""}`
    );
  }
  lines.push("Trân trọng,", brand.hotelName);

  return lines.join("\n").trim();
}

export type BookingRequestCustomerEmailData = {
  guestName: string;
  branchName: string;
  requestCode: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  requestUrl: string;
};

export function createBookingRequestCustomerEmail(
  brand: BrandConfig,
  data: BookingRequestCustomerEmailData
): EmailTemplate {
  const subject = `[${brand.hotelName}] Đã nhận yêu cầu kiểm tra phòng của bạn`;
  const previewText = `Yêu cầu ${data.requestCode} đã được ghi nhận và đang chờ xử lý.`;
  const cards: SummaryCard[] = [
    {
      fields: [
        { label: "Mã yêu cầu", value: data.requestCode },
        { label: "Hạng phòng", value: data.roomType },
        { label: "Ngày nhận phòng", value: data.checkInDate },
        { label: "Ngày trả phòng", value: data.checkOutDate }
      ]
    }
  ];
  const intro = `Xin chào ${data.guestName}, cảm ơn bạn đã gửi yêu cầu kiểm tra phòng tại ${data.branchName}. Đội ngũ của chúng tôi sẽ kiểm tra và liên hệ lại trong thời gian sớm nhất.`;
  const sections = ["Bạn vui lòng kiểm tra email hoặc điện thoại để không bỏ lỡ phản hồi từ khách sạn."];

  return {
    subject,
    previewText,
    html: renderBaseEmail({
      brand,
      eyebrow: "Xác nhận yêu cầu",
      title: "Chúng tôi đã nhận yêu cầu của bạn.",
      intro,
      sections,
      cards,
      ctaLabel: "Xem chi tiết yêu cầu",
      ctaUrl: data.requestUrl
    }),
    text: renderPlainText({
      brand,
      title: "Chúng tôi đã nhận yêu cầu của bạn.",
      intro,
      sections,
      cards,
      ctaLabel: "Xem chi tiết yêu cầu",
      ctaUrl: data.requestUrl
    })
  };
}

export type BookingRequestAdminEmailData = {
  requestCode: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  branchName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  requestedAt: string;
  adminUrl: string;
};

export function createBookingRequestAdminEmail(
  brand: BrandConfig,
  data: BookingRequestAdminEmailData
): EmailTemplate {
  const subject = `[${brand.hotelName}] Yêu cầu mới #${data.requestCode} - ${data.guestName}`;
  const previewText = `Có yêu cầu mới từ ${data.guestName} cần được xử lý.`;
  const cards: SummaryCard[] = [
    {
      fields: [
        { label: "Mã yêu cầu", value: data.requestCode },
        { label: "Khách hàng", value: data.guestName },
        { label: "Số điện thoại", value: data.guestPhone },
        { label: "Email", value: data.guestEmail },
        { label: "Chi nhánh", value: data.branchName },
        { label: "Hạng phòng", value: data.roomType },
        { label: "Check-in / Check-out", value: `${data.checkInDate} → ${data.checkOutDate}` },
        { label: "Thời gian gửi", value: data.requestedAt }
      ]
    }
  ];
  const intro = "Hệ thống vừa ghi nhận một yêu cầu kiểm tra phòng / booking mới. Vui lòng kiểm tra và phản hồi trong SLA quy định.";

  return {
    subject,
    previewText,
    html: renderBaseEmail({
      brand,
      eyebrow: "Thông báo quản trị",
      title: "Có yêu cầu mới cần xử lý.",
      intro,
      cards,
      ctaLabel: "Mở trang quản trị",
      ctaUrl: data.adminUrl,
      footerNote: `Email này được gửi tự động từ hệ thống ${brand.hotelName}.`
    }),
    text: renderPlainText({
      brand,
      title: "Có yêu cầu mới cần xử lý.",
      intro,
      cards,
      ctaLabel: "Mở trang quản trị",
      ctaUrl: data.adminUrl,
      footerNote: `Email này được gửi tự động từ hệ thống ${brand.hotelName}.`
    })
  };
}

export type DepositRequestCustomerEmailData = {
  guestName: string;
  bookingCode: string;
  branchName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nights: string;
  depositAmount: string;
  paymentDeadline: string;
  paymentBankName: string;
  paymentAccountNumber: string;
  paymentAccountName: string;
  paymentSwiftCode: string;
  paymentCitadCode: string;
  paymentTransferNote: string;
  paymentQrUrl: string;
  bookingUrl: string;
};

export function createDepositRequestCustomerEmail(
  brand: BrandConfig,
  data: DepositRequestCustomerEmailData
): EmailTemplate {
  const subject = `[${brand.hotelName}] Xác nhận giữ phòng và thông tin đặt cọc #${data.bookingCode}`;
  const previewText = `Booking ${data.bookingCode} đang được giữ. Vui lòng hoàn tất đặt cọc trước thời hạn.`;
  const cards: SummaryCard[] = [
    {
      fields: [
        { label: "Mã booking", value: data.bookingCode },
        { label: "Chi nhánh", value: data.branchName },
        { label: "Hạng phòng", value: data.roomType },
        { label: "Check-in / Check-out", value: `${data.checkInDate} → ${data.checkOutDate} (${data.nights} đêm)` },
        { label: "Số tiền đặt cọc", value: data.depositAmount },
        { label: "Hạn thanh toán", value: data.paymentDeadline }
      ]
    },
    {
      fields: [
        { label: "Ngân hàng", value: data.paymentBankName },
        { label: "Số tài khoản", value: data.paymentAccountNumber },
        { label: "Chủ tài khoản", value: data.paymentAccountName },
        { label: "SWIFT code", value: data.paymentSwiftCode },
        { label: "CITAD code", value: data.paymentCitadCode },
        { label: "Nội dung chuyển khoản", value: data.paymentTransferNote }
      ]
    }
  ];
  const intro = `Xin chào ${data.guestName}, chúng tôi đã giữ booking của bạn. Vui lòng hoàn tất đặt cọc trước thời hạn bên dưới để xác nhận chính thức.`;
  const sections = ["Sau khi chuyển khoản, vui lòng tải lên ảnh xác nhận thanh toán để chúng tôi kiểm tra nhanh hơn."];

  return {
    subject,
    previewText,
    html: renderBaseEmail({
      brand,
      eyebrow: "Xác nhận giữ phòng",
      title: "Booking của bạn đang được giữ.",
      intro,
      sections,
      cards,
      ctaLabel: "Xem booking và tải ảnh chuyển khoản",
      ctaUrl: data.bookingUrl,
      qrBlock: {
        imageUrl: data.paymentQrUrl,
        alt: "QR thanh toán",
        note: "Bạn có thể quét mã QR hoặc chuyển khoản thủ công theo thông tin trên."
      }
    }),
    text: renderPlainText({
      brand,
      title: "Booking của bạn đang được giữ.",
      intro,
      sections,
      cards,
      ctaLabel: "Xem booking và tải ảnh chuyển khoản",
      ctaUrl: data.bookingUrl
    })
  };
}

export type BookingConfirmedCustomerEmailData = {
  guestName: string;
  bookingCode: string;
  branchName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nights: string;
  totalAmount: string;
  bookingUrl: string;
};

export function createBookingConfirmedCustomerEmail(
  brand: BrandConfig,
  data: BookingConfirmedCustomerEmailData
): EmailTemplate {
  const subject = `[${brand.hotelName}] Booking của bạn đã được xác nhận #${data.bookingCode}`;
  const previewText = `Booking ${data.bookingCode} đã được xác nhận thành công.`;
  const cards: SummaryCard[] = [
    {
      fields: [
        { label: "Mã booking", value: data.bookingCode },
        { label: "Hạng phòng", value: data.roomType },
        { label: "Check-in", value: data.checkInDate },
        { label: "Check-out", value: data.checkOutDate },
        { label: "Tổng số đêm", value: data.nights },
        { label: "Tổng giá trị booking", value: data.totalAmount }
      ]
    }
  ];
  const intro = `Xin chào ${data.guestName}, cảm ơn bạn đã hoàn tất booking tại ${data.branchName}. Thông tin lưu trú của bạn như sau:`;

  return {
    subject,
    previewText,
    html: renderBaseEmail({
      brand,
      eyebrow: "Booking thành công",
      title: "Booking của bạn đã được xác nhận.",
      intro,
      cards,
      ctaLabel: "Xem chi tiết booking",
      ctaUrl: data.bookingUrl,
      footerNote: `Chúng tôi rất mong được đón tiếp bạn tại ${brand.hotelName}.`
    }),
    text: renderPlainText({
      brand,
      title: "Booking của bạn đã được xác nhận.",
      intro,
      cards,
      ctaLabel: "Xem chi tiết booking",
      ctaUrl: data.bookingUrl,
      footerNote: `Chúng tôi rất mong được đón tiếp bạn tại ${brand.hotelName}.`
    })
  };
}

export type CheckinReminderCustomerEmailData = {
  guestName: string;
  bookingCode: string;
  branchName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  bookingUrl: string;
};

export function createCheckinReminderCustomerEmail(
  brand: BrandConfig,
  data: CheckinReminderCustomerEmailData
): EmailTemplate {
  const subject = `[${brand.hotelName}] Nhắc lịch check-in của bạn vào ${data.checkInDate}`;
  const previewText = `Đây là email nhắc lịch trước ngày check-in cho booking ${data.bookingCode}.`;
  const cards: SummaryCard[] = [
    {
      fields: [
        { label: "Mã booking", value: data.bookingCode },
        { label: "Hạng phòng", value: data.roomType },
        { label: "Check-in", value: data.checkInDate },
        { label: "Check-out", value: data.checkOutDate }
      ]
    }
  ];
  const intro = `Xin chào ${data.guestName}, đây là email nhắc lịch trước ngày check-in của bạn tại ${data.branchName}.`;
  const sections = ["Chúng tôi mong sớm được đón tiếp bạn. Nếu cần hỗ trợ trước khi đến, vui lòng liên hệ với khách sạn."];

  return {
    subject,
    previewText,
    html: renderBaseEmail({
      brand,
      eyebrow: "Nhắc lịch lưu trú",
      title: `Hẹn gặp bạn vào ${data.checkInDate}.`,
      intro,
      sections,
      cards,
      ctaLabel: "Xem booking",
      ctaUrl: data.bookingUrl
    }),
    text: renderPlainText({
      brand,
      title: `Hẹn gặp bạn vào ${data.checkInDate}.`,
      intro,
      sections,
      cards,
      ctaLabel: "Xem booking",
      ctaUrl: data.bookingUrl
    })
  };
}
