# Release policy

## Mục tiêu

Giữ `README.md` gọn và hữu ích bằng cách chỉ ghi lại những mốc thay đổi đủ lớn để team hoặc người dùng cần biết.

## README là release highlights, không phải changelog chi tiết

Mục `What's New` trong `README.md` chỉ dùng cho:
- milestone đáng chú ý,
- thay đổi lớn về sản phẩm,
- thay đổi kiến trúc,
- thay đổi workflow chính,
- capability mới có tác động rộng,
- tối ưu hiệu năng quan trọng.

Không dùng nó để ghi:
- pixel/UI tweaks,
- spacing,
- color changes,
- copy changes,
- icon changes,
- refactor nhỏ,
- docs nhỏ,
- bug fix nhỏ.

## Khi nào được thêm version mới

Được thêm entry mới nếu có ít nhất một điều sau:
- ra module lớn mới,
- thêm capability lớn mới,
- thay đổi kiến trúc hệ thống đáng kể,
- thay đổi mạnh flow sử dụng chính,
- hiệu năng cải thiện rõ rệt ở cấp toàn app,
- milestone release mà team cần nhìn thấy ngay trong README.

## Khi nào không nên thêm

Không thêm entry mới nếu thay đổi chủ yếu là:
- UI polish,
- wording,
- CSS fix,
- refactor nội bộ,
- validation tweak nhỏ,
- fix bug không làm đổi capability chính.

## Quy tắc viết entry

- Dùng heading kiểu: `### v0.2.0 — Batch Import & Validation Upgrade (May 2026)`
- Viết ngắn gọn, 3–6 bullet lớn.
- Nhấn vào tác động người dùng hoặc tác động kỹ thuật quan trọng.
- Không liệt kê implementation detail vụn.

## Nguyên tắc mặc định

Nếu agent không chắc thay đổi có đủ lớn hay không, hãy **không thêm entry mới**.
