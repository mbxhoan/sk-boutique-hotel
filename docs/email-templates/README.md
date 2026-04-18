# SK Boutique Hotel — TypeScript Email Templates

Bộ này gồm 5 email template HTML + text, viết bằng TypeScript thuần để dùng được với:
- Next.js
- Postmark
- Resend
- Nodemailer
- bất kỳ mail provider nào nhận `subject`, `html`, `text`

## Files
- `email-templates.ts`
- `example-usage.ts`

## Output
Mỗi hàm template trả về:
```ts
{
  subject: string;
  previewText: string;
  html: string;
  text: string;
}
```

## Hàm có sẵn
- `createBookingRequestCustomerEmail`
- `createBookingRequestAdminEmail`
- `createDepositRequestCustomerEmail`
- `createBookingConfirmedCustomerEmail`
- `createCheckinReminderCustomerEmail`

## Gợi ý dùng với Resend
```ts
const email = createBookingConfirmedCustomerEmail(brand, data);

await resend.emails.send({
  from: "SK Boutique Hotel <booking@yourdomain.com>",
  to: "guest@example.com",
  subject: email.subject,
  html: email.html,
  text: email.text
});
```

## Gợi ý dùng với Postmark
```ts
const email = createDepositRequestCustomerEmail(brand, data);

await postmarkClient.sendEmail({
  From: "booking@yourdomain.com",
  To: "guest@example.com",
  Subject: email.subject,
  HtmlBody: email.html,
  TextBody: email.text
});
```
