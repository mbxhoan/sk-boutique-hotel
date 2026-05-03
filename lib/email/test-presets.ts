import {
  createBookingConfirmedCustomerEmail,
  createBookingRequestAdminEmail,
  createBookingRequestCustomerEmail,
  createCheckinReminderCustomerEmail,
  createDepositRequestCustomerEmail,
  type BrandConfig,
  type EmailTemplate
} from "@/lib/email/templates";

export type EmailTemplateTestKey =
  | "booking_request_customer"
  | "booking_request_admin"
  | "deposit_request_customer"
  | "booking_confirmed_customer"
  | "checkin_reminder_customer";

export const emailTemplateTestOptions: Array<{
  description: string;
  label: string;
  value: EmailTemplateTestKey;
}> = [
  {
    value: "booking_request_customer",
    label: "Xác nhận kiểm tra phòng",
    description: "Gửi cho khách sau khi tạo yêu cầu kiểm tra phòng / booking."
  },
  {
    value: "booking_request_admin",
    label: "Thông báo admin",
    description: "Gửi cho quản lý khi có yêu cầu mới từ khách."
  },
  {
    value: "deposit_request_customer",
    label: "Yêu cầu đặt cọc",
    description: "Gửi thông tin đặt cọc và QR cho khách."
  },
  {
    value: "booking_confirmed_customer",
    label: "Booking thành công",
    description: "Gửi khi booking được xác nhận sau verify."
  },
  {
    value: "checkin_reminder_customer",
    label: "Nhắc check-in",
    description: "Gửi trước ngày check-in cho khách."
  }
];

const sampleBrand: BrandConfig = {
  brandLine: "SK Boutique Hotel",
  contactEmail: "service@skhotel.com.vn",
  contactPhone: "0908 233 583",
  hotelName: "SK Boutique Hotel"
};

const sampleRequestUrl = "https://bkhanhxinh.com/member/requests/RQ-240001";
const sampleAdminUrl = "https://bkhanhxinh.com/admin?request=RQ-240001";
const sampleBookingUrl = "https://bkhanhxinh.com/member/bookings/BK-240001";
const sampleQrUrl = "https://placehold.co/320x320/png?text=QR";

export function buildEmailTemplateTestEmail(templateKey: EmailTemplateTestKey): EmailTemplate {
  switch (templateKey) {
    case "booking_request_customer":
      return createBookingRequestCustomerEmail(sampleBrand, {
        branchName: "SK Boutique Hotel Phú Quốc",
        checkInDate: "20/04/2026",
        checkOutDate: "22/04/2026",
        guestName: "Nguyễn Văn A",
        requestCode: "RQ-240001",
        requestUrl: sampleRequestUrl,
        roomType: "Deluxe Double"
      });
    case "booking_request_admin":
      return createBookingRequestAdminEmail(sampleBrand, {
        adminUrl: sampleAdminUrl,
        branchName: "SK Boutique Hotel Phú Quốc",
        checkInDate: "20/04/2026",
        checkOutDate: "22/04/2026",
        guestEmail: "guest@example.com",
        guestName: "Nguyễn Văn A",
        guestPhone: "0909 999 999",
        requestCode: "RQ-240001",
        requestedAt: "18/04/2026 10:30",
        roomType: "Deluxe Double"
      });
    case "deposit_request_customer":
      return createDepositRequestCustomerEmail(sampleBrand, {
        bookingCode: "BK-240001",
        bookingUrl: sampleBookingUrl,
        branchName: "SK Boutique Hotel Phú Quốc",
        checkInDate: "20/04/2026",
        checkOutDate: "22/04/2026",
        depositAmount: "1.000.000đ",
        guestName: "Nguyễn Văn A",
        nights: "2",
        paymentAccountName: "CONG TY TNHH ABC",
        paymentAccountNumber: "0123456789",
        paymentBankName: "TPBank",
        paymentDeadline: "18/04/2026 11:00",
        paymentQrUrl: sampleQrUrl,
        paymentTransferNote: "SK DP BK-240001",
        roomType: "Deluxe Double"
      });
    case "booking_confirmed_customer":
      return createBookingConfirmedCustomerEmail(sampleBrand, {
        bookingCode: "BK-240001",
        bookingUrl: sampleBookingUrl,
        branchName: "SK Boutique Hotel Phú Quốc",
        checkInDate: "20/04/2026",
        checkOutDate: "22/04/2026",
        guestName: "Nguyễn Văn A",
        nights: "2",
        roomType: "Deluxe Double",
        totalAmount: "2.800.000đ"
      });
    case "checkin_reminder_customer":
      return createCheckinReminderCustomerEmail(sampleBrand, {
        bookingCode: "BK-240001",
        bookingUrl: sampleBookingUrl,
        branchName: "SK Boutique Hotel Phú Quốc",
        checkInDate: "20/04/2026",
        checkOutDate: "22/04/2026",
        guestName: "Nguyễn Văn A",
        roomType: "Deluxe Double"
      });
  }
}
