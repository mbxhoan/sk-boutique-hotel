# SK Boutique Hotel FE

Frontend tĩnh cho website `SK Boutique Hotel`, dựng bằng **Next.js App Router** theo tinh thần editorial / heritage trong thư mục `public/templates`.

## What's New

- Đã thêm lớp gửi email qua Supabase Edge Function `send-email`, dùng lại được cho mail khách hàng và thông báo admin trong các workflow đặt phòng / để lại thông tin.
- Đã thêm luồng member auth, booking request từ popup phòng, admin/member realtime updates, và portal member có lịch sử cùng logout.

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
- `/thuong-hieu` - Thương hiệu
- `/rooms` - Chọn phòng / danh sách phòng
- `/about-us` - Về chúng tôi
- `/chi-nhanh` - Legacy redirect từ slug cũ
- `/lien-he` - Liên hệ
- `/tuyen-dung` - Tuyển dụng
- `/ho-tro` - Hỗ trợ
- `/member` - Member area shell
- `/admin` - Admin area shell

## Logo

- Logo hiện nằm trong `public/logo.png`
- Bản nền tối nằm trong `public/logo-white-transparent.png`
- Bản xám nằm trong `public/logo-gray.png`

Chỉ cần thay các file này là header/footer sẽ đổi theo.

## Ghi chú

- Nội dung hiện tại là placeholder tĩnh, chưa map data.
- Giao diện dùng cùng một hệ layout, nút, card và hero cho toàn bộ site.
- File mẫu tham chiếu nằm trong `public/templates/DESIGN.md` và `public/templates/Desktop.png`.
