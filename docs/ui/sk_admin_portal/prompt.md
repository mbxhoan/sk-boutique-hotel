## 1. Tổng quan & Phong cách (Creative North Star)
Xây dựng giao diện Admin Portal theo phong cách **SaaS hiện đại, tối giản và sang trọng (Luxury Minimalist)**. Giao diện phải mang lại cảm giác chuyên nghiệp, tin cậy của một khách sạn cao cấp nhưng vẫn đảm bảo tính hiệu quả trong vận hành.

- **Vibe:** Sạch sẽ, trực quan, tập trung vào dữ liệu và chức năng.
- **Màu sắc chủ đạo:** 
    - Navy Deep (#0F172A) cho Sidebar để tạo chiều sâu.
    - Gold Accent (#B08D57) cho các thành phần quan trọng (Primary Actions, Active States).
    - Surface Light (#F8FAFC) cho nền chính để giữ sự thông thoáng.
- **Typography:** Sử dụng font **Inter** (hoặc Sans-serif hiện đại tương đương) để tối ưu khả năng đọc dữ liệu số.

---

## 2. Cấu trúc Layout (Layout Shell)
- **Sidebar (Cố định bên trái - 260px):** Nền tối (Navy), logo khách sạn ở trên cùng. Các menu mục lục (Dashboard, Bookings, Room Management, v.v.) đi kèm icon outline thanh mảnh. Trạng thái Active sẽ có vạch màu Gold ở cạnh phải.
- **Top Navigation (Cố định trên cùng):** Nền trắng/trong suốt nhẹ với hiệu ứng backdrop-blur. Chứa thanh Search toàn cục, Icon thông báo (realtime badge), Nút chọn Chi nhánh (Branch Selector) và Profile User.
- **Main Content Area:** Sử dụng hệ thống Grid linh hoạt, các phần nội dung được chia vào các "Card" trắng, bo góc nhẹ (Round 4px hoặc 8px), có bóng đổ cực nhẹ (Flat Elevation).

---

## 3. Quy chuẩn các Component chính

### A. Table List (Dành cho Booking, Khách hàng)
- **Header:** Chứa tiêu đề trang và các nút hành động chính (Thêm mới, Export).
- **Bộ lọc (Filters):** Nằm ngay trên bảng. Bao gồm: Thanh tìm kiếm nhanh, Dropdown chọn trạng thái, Bộ chọn ngày (Date Range Picker).
- **Tính năng bảng:** 
    - Cho phép sắp xếp (Sort) ở tiêu đề cột.
    - Có nút "Columns" để ẩn/hiện các cột dữ liệu theo nhu cầu.
- **Row:** Khoảng cách dòng vừa phải (không quá khít), xen kẽ màu nền nhẹ cho các dòng chẵn/lẻ hoặc highlight khi hover.

### B. Dashboard Widgets
- **Stat Cards:** Hiển thị số liệu lớn (Revenue, Occupancy). Có biểu đồ line-chart nhỏ (Sparkline) đi kèm để thể hiện xu hướng tăng/giảm.
- **Biểu đồ lớn:** Sử dụng biểu đồ Bar hoặc Area chart để thể hiện Occupancy Trends theo tuần/tháng. Màu sắc biểu đồ phải tuân thủ bảng màu Gold/Navy.

### C. Sơ đồ phòng (Floor Plan View)
- Chuyển đổi giữa các tầng bằng Tab hoặc Segmented Control.
- Mỗi phòng là một Card nhỏ chứa: Số phòng, Loại phòng, Trạng thái (Occupied, Available, Cleaning, Maintenance).
- Màu sắc trạng thái: Blue (Đang có khách), Gold (Phòng trống), Light Blue (Đang dọn), Grey (Bảo trì).

---

## 4. Hướng dẫn trải nghiệm người dùng (UX Guidelines)
- **Tối giản nội dung:** Chỉ hiển thị những thông tin thực sự cần thiết ở màn hình chính. Các thông tin chi tiết sẽ được mở trong Drawer (bảng trượt bên phải) hoặc Modal.
- **User Guideline:** Sử dụng các icon "?" hoặc biểu tượng thông tin nhỏ (Tooltip) cạnh các nhãn chức năng phức tạp để hướng dẫn người dùng mà không cần dùng nhiều text.
- **Realtime:** Các thông báo mới phải có hiệu ứng nhẹ (pulse hoặc dot) để thu hút sự chú ý mà không gây phiền toái.
- **Tương tác:** Mọi nút bấm và dòng trong bảng phải có phản hồi khi hover (đổi màu nhẹ hoặc tăng độ sáng).

---

## 5. Danh sách các màn hình cần refactor
1. **Admin Dashboard:** Tổng quan chỉ số và biểu đồ xu hướng.
2. **Booking Management:** Bảng danh sách đặt phòng với bộ lọc nâng cao.
3. **Room Status & Floor Plan:** Bản đồ trạng thái phòng theo thời gian thực.
4. **Content Management System (CMS):** Giao diện quản lý banner và bài viết công khai trên web.
5. **Customer & User Management:** Quản lý thông tin khách hàng và phân quyền nhân viên.