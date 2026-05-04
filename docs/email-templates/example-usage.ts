import {
  createBookingRequestCustomerEmail,
  createBookingRequestAdminEmail,
  createDepositRequestCustomerEmail,
  createBookingConfirmedCustomerEmail,
  createCheckinReminderCustomerEmail
} from "./email-templates";

const brand = {
  hotelName: "SK Boutique Hotel",
  brandLine: "Boutique Hotel",
  contactPhone: "0908 233 583",
  contactEmail: "skhotel.phuquoc@gmail.com"
};

const requestCustomer = createBookingRequestCustomerEmail(brand, {
  guestName: "Nguyễn Văn A",
  branchName: "SK Boutique Hotel Phú Quốc",
  requestCode: "RQ-240001",
  roomType: "Deluxe Double",
  checkInDate: "20/04/2026",
  checkOutDate: "22/04/2026",
  requestUrl: "https://example.com/member/requests/RQ-240001"
});

const requestAdmin = createBookingRequestAdminEmail(brand, {
  requestCode: "RQ-240001",
  guestName: "Nguyễn Văn A",
  guestPhone: "0909 999 999",
  guestEmail: "guest@example.com",
  branchName: "SK Boutique Hotel Phú Quốc",
  roomType: "Deluxe Double",
  checkInDate: "20/04/2026",
  checkOutDate: "22/04/2026",
  requestedAt: "18/04/2026 10:30",
  adminUrl: "https://example.com/admin/requests/RQ-240001"
});

const depositRequest = createDepositRequestCustomerEmail(brand, {
  guestName: "Nguyễn Văn A",
  bookingCode: "BK-240001",
  branchName: "SK Boutique Hotel Phú Quốc",
  roomType: "Deluxe Double",
  checkInDate: "20/04/2026",
  checkOutDate: "22/04/2026",
  nights: "2",
  depositAmount: "1.000.000đ",
  paymentDeadline: "18/04/2026 11:00",
  paymentBankName: "TPBank",
  paymentAccountNumber: "0123456789",
  paymentAccountName: "CONG TY TNHH ABC",
  paymentSwiftCode: "TPBVVNVX",
  paymentCitadCode: "970423",
  paymentTransferNote: "SK DP BK-240001",
  paymentQrUrl: "https://example.com/qr/bk-240001.png",
  bookingUrl: "https://example.com/member/bookings/BK-240001"
});

const bookingConfirmed = createBookingConfirmedCustomerEmail(brand, {
  guestName: "Nguyễn Văn A",
  bookingCode: "BK-240001",
  branchName: "SK Boutique Hotel Phú Quốc",
  roomType: "Deluxe Double",
  checkInDate: "20/04/2026",
  checkOutDate: "22/04/2026",
  nights: "2",
  totalAmount: "2.800.000đ",
  bookingUrl: "https://example.com/member/bookings/BK-240001"
});

const reminder = createCheckinReminderCustomerEmail(brand, {
  guestName: "Nguyễn Văn A",
  bookingCode: "BK-240001",
  branchName: "SK Boutique Hotel Phú Quốc",
  roomType: "Deluxe Double",
  checkInDate: "20/04/2026",
  checkOutDate: "22/04/2026",
  bookingUrl: "https://example.com/member/bookings/BK-240001"
});

console.log(requestCustomer.subject, requestCustomer.previewText);
console.log(requestAdmin.subject, requestAdmin.previewText);
console.log(depositRequest.subject, depositRequest.previewText);
console.log(bookingConfirmed.subject, bookingConfirmed.previewText);
console.log(reminder.subject, reminder.previewText);
