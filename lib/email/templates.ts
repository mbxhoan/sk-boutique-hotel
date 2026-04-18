export type {
  BrandConfig,
  BookingConfirmedCustomerEmailData,
  BookingRequestAdminEmailData,
  BookingRequestCustomerEmailData,
  CheckinReminderCustomerEmailData,
  DepositRequestCustomerEmailData,
  EmailTemplate,
  PaymentQrBlock,
  SummaryCard,
  SummaryField
} from "@/docs/email-templates/email-templates";

export {
  createBookingConfirmedCustomerEmail,
  createBookingRequestAdminEmail,
  createBookingRequestCustomerEmail,
  createCheckinReminderCustomerEmail,
  createDepositRequestCustomerEmail
} from "@/docs/email-templates/email-templates";
