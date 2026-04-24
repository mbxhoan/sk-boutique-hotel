# SK Boutique Hotel FE

Frontend tĩnh cho website `SK Boutique Hotel`, dựng bằng **Next.js App Router** theo tinh thần editorial / heritage trong thư mục `public/templates`.

## What's New

- Đã chuẩn hóa booking detail admin thành màn hình thao tác chính: booking summary, guest profile thật, hold countdown, QR cọc VietQR và hành động gửi email/thông báo.
- Đã thay các khối placeholder member/admin bằng dữ liệu thật từ Supabase cho khách hàng, tài khoản nội bộ, audit logs và request/booking history.
- Đã bổ sung room floor badges, booking payment actions và sidebar admin dạng sticky để vận hành nhanh hơn.
- Đã thêm trang chi tiết booking trong admin portal, có link từ danh sách đặt phòng và hiển thị đầy đủ hồ sơ khách, request, thanh toán cọc, hold và timeline xử lý.
- Đã thêm lớp gửi email qua Supabase Edge Function `send-email`, dùng lại được cho mail khách hàng và thông báo admin trong các workflow đặt phòng / để lại thông tin.
- Đã thêm luồng member auth, booking request từ popup phòng, admin/member realtime updates, và portal member có lịch sử cùng logout.
- Đã chốt luồng phase 1: request phòng -> admin chốt và gửi QR cọc -> member upload proof -> admin verify -> hệ thống tự xác nhận booking, đồng thời làm gọn admin portal theo kiểu SaaS với table cho các queue chính.

## Email Config

- `SUPABASE_EMAIL_FUNCTION_NAME` mặc định là `send-email`
- `SUPABASE_EMAIL_FROM_ADDRESS` mặc định là `admin@bkhanhxinh.com`
- `SUPABASE_EMAIL_FROM_NAME` mặc định là `SK Boutique Hotel`
- `SUPABASE_EMAIL_ADMIN_TO` mặc định là `admin@bkhanhxinh.com`
- Edge Function hiện đang nhận body đơn giản gồm `from`, `to`, `subject`, `html`.
- `from_name` sẽ được gửi theo dạng `SK Boutique Hotel <admin@bkhanhxinh.com>` để hộp thư hiển thị đúng thương hiệu.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Cấu trúc trang

- `/` - Marketing home shell
<!-- - `/thuong-hieu` - Thương hiệu -->
- `/rooms` - Chọn phòng / danh sách phòng
- `/about-us` - Về chúng tôi
- `/chi-nhanh` - Legacy redirect từ slug cũ
- `/lien-he` - Liên hệ
<!-- - `/tuyen-dung` - Tuyển dụng -->
<!-- - `/ho-tro` - Hỗ trợ -->
- `/member` - Member area shell
- `/admin` - Admin area shell

## Logo

- Logo hiện nằm trong `public/logo.png`
- Bản nền tối nằm trong `public/logo-white-transparent.png`
- Bản xám nằm trong `public/logo-gray.png`

Chỉ cần thay các file này là header/footer sẽ đổi theo.

## Cấu hình hiển thị

### Số lượng ảnh phòng
Mặc định, mỗi hạng phòng trong trang danh sách (`/rooms`) chỉ hiển thị tối đa **4 ảnh**. Để thay đổi giới hạn này:
1. Mở file `app/(marketing)/rooms/page.tsx`.
2. Tìm các dòng gọi hàm `loadMediaCollectionImageUrls` cho từng hạng phòng (`room-family`, `room-superior`, `room-quadruple`).
3. Thay đổi tham số `limit` (con số cuối cùng, ví dụ: `4`) thành số lượng bạn muốn hiển thị.

## Ghi chú

- Nội dung hiện tại là placeholder tĩnh, chưa map data.
- Giao diện dùng cùng một hệ layout, nút, card và hero cho toàn bộ site.
- File mẫu tham chiếu nằm trong `public/templates/DESIGN.md` và `public/templates/Desktop.png`.
