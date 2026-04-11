# CODEX Playbook — SK boutique hotel

## 1) Mục tiêu của playbook
Tài liệu này dùng để bạn **vibe code với Codex** theo một cách nhất quán, ít trôi scope, ít phá cấu trúc, và dễ mở rộng về sau.

Bối cảnh dự án hiện tại:
- Bạn đang dựng **frontend ở mức rất cơ bản trước**.
- Sau đó muốn dùng **Codex** để tiếp tục build các phase tiếp theo.
- Sản phẩm đích là: **hotel website + content CMS + availability request + hold room + manual booking + deposit QR + member portal + analytics**, sẵn sàng mở rộng OTA và payment automation sau này.

Theo tài liệu chính thức của OpenAI, Codex có thể đọc các file `AGENTS.md` trước khi bắt đầu công việc; đây là cách tốt để cung cấp chỉ dẫn ổn định theo repo. OpenAI cũng khuyến nghị dùng `AGENTS.md` và có thể tham chiếu thêm các file hướng dẫn review/quy ước khác trong repo. citeturn0search0turn0search13turn0search15

---

## 2) Cấu trúc file / repo nên dùng

Nếu bạn đang bắt đầu từ frontend basic, tôi khuyên dùng cấu trúc này để Codex dễ hiểu dự án và làm việc theo module.

```text
sk-boutique-hotel/
├─ AGENTS.md
├─ README.md
├─ package.json
├─ next.config.ts
├─ tsconfig.json
├─ middleware.ts
├─ .env.example
├─ public/
│  ├─ images/
│  ├─ icons/
│  └─ brand/
├─ src/
│  ├─ app/
│  │  ├─ (marketing)/
│  │  │  ├─ page.tsx
│  │  │  ├─ about/page.tsx
│  │  │  ├─ branches/page.tsx
│  │  │  ├─ branches/[slug]/page.tsx
│  │  │  ├─ room-types/page.tsx
│  │  │  ├─ room-types/[slug]/page.tsx
│  │  │  ├─ offers/page.tsx
│  │  │  ├─ services/page.tsx
│  │  │  ├─ contact/page.tsx
│  │  │  ├─ support/page.tsx
│  │  │  ├─ careers/page.tsx
│  │  │  └─ blog/
│  │  ├─ (member)/
│  │  │  ├─ login/page.tsx
│  │  │  ├─ first-login/page.tsx
│  │  │  ├─ account/page.tsx
│  │  │  ├─ requests/page.tsx
│  │  │  └─ bookings/page.tsx
│  │  ├─ (admin)/
│  │  │  ├─ admin/page.tsx
│  │  │  ├─ admin/branches/
│  │  │  ├─ admin/floors/
│  │  │  ├─ admin/rooms/
│  │  │  ├─ admin/room-types/
│  │  │  ├─ admin/availability-requests/
│  │  │  ├─ admin/holds/
│  │  │  ├─ admin/reservations/
│  │  │  ├─ admin/payments/
│  │  │  ├─ admin/content/
│  │  │  ├─ admin/blog/
│  │  │  ├─ admin/members/
│  │  │  ├─ admin/analytics/
│  │  │  └─ admin/settings/
│  │  ├─ api/
│  │  ├─ layout.tsx
│  │  ├─ globals.css
│  │  └─ not-found.tsx
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ layout/
│  │  ├─ marketing/
│  │  ├─ room-types/
│  │  ├─ availability/
│  │  ├─ holds/
│  │  ├─ reservations/
│  │  ├─ member/
│  │  ├─ admin/
│  │  ├─ analytics/
│  │  └─ forms/
│  ├─ features/
│  │  ├─ auth/
│  │  ├─ branches/
│  │  ├─ floors/
│  │  ├─ rooms/
│  │  ├─ room-types/
│  │  ├─ availability/
│  │  ├─ holds/
│  │  ├─ reservations/
│  │  ├─ payments/
│  │  ├─ cms/
│  │  ├─ blog/
│  │  ├─ members/
│  │  ├─ analytics/
│  │  ├─ notifications/
│  │  └─ settings/
│  ├─ lib/
│  │  ├─ supabase/
│  │  ├─ auth/
│  │  ├─ permissions/
│  │  ├─ pricing/
│  │  ├─ availability/
│  │  ├─ notifications/
│  │  ├─ pdf/
│  │  ├─ email/
│  │  ├─ i18n/
│  │  ├─ seo/
│  │  ├─ utils/
│  │  ├─ constants/
│  │  └─ validations/
│  ├─ hooks/
│  ├─ store/
│  ├─ types/
│  └─ styles/
├─ supabase/
│  ├─ migrations/
│  ├─ seed/
│  ├─ functions/
│  ├─ views/
│  └─ policies/
├─ docs/
│  ├─ 00-product-context.md
│  ├─ 01-scope.md
│  ├─ 02-architecture.md
│  ├─ 03-workflows.md
│  ├─ 04-data-model.md
│  ├─ 05-permissions.md
│  ├─ 06-ui-rules.md
│  ├─ 07-copywriting-vi-en.md
│  ├─ 08-api-list.md
│  ├─ 09-testing-checklist.md
│  └─ prompts/
│     ├─ 00-kickoff-phase.md
│     ├─ 01-build-feature.md
│     ├─ 02-fix-bug.md
│     ├─ 03-ui-polish.md
│     ├─ 04-upgrade-feature.md
│     ├─ 05-refactor.md
│     ├─ 06-supabase-mcp.md
│     ├─ 07-review.md
│     └─ 08-release-prep.md
└─ tests/
   ├─ unit/
   ├─ integration/
   └─ e2e/
```

### Vì sao cấu trúc này hợp với Codex
- Tách `app` và `features` giúp Codex biết chỗ đặt route và chỗ đặt business logic.
- Tách `lib/supabase`, `lib/permissions`, `lib/pricing`, `lib/availability` giúp agent không nhét logic lung tung vào component.
- `docs/` làm “bộ não repo” để Codex bám theo khi build tiếp.
- `AGENTS.md` ở root giúp Codex đọc hướng dẫn ngay từ đầu. citeturn0search0turn0search15

---

## 3) Bộ file nên có ngay từ đầu để Codex làm việc tốt hơn

### Bắt buộc nên có
- `AGENTS.md`
- `README.md`
- `.env.example`
- `docs/00-product-context.md`
- `docs/01-scope.md`
- `docs/02-architecture.md`
- `docs/03-workflows.md`
- `docs/04-data-model.md`
- `docs/05-permissions.md`
- `docs/06-ui-rules.md`

### Nên có sớm
- `docs/07-copywriting-vi-en.md`
- `docs/08-api-list.md`
- `docs/09-testing-checklist.md`

### Rất hữu ích khi project lớn dần
- `docs/decisions/ADR-001-*.md`
- `docs/reviews/code_review.md`
- `docs/release/release_checklist.md`

---

## 4) Cách dùng Codex theo phase

## Phase A — Frontend foundation
Mục tiêu:
- dựng layout, navigation, theme, typography, section builder cơ bản
- room list/detail mock UI
- branch list/detail mock UI
- admin shell basic

### Prompt mẫu mở phase
```md
Bạn đang làm việc trong dự án Next.js App Router cho SK boutique hotel.

Mục tiêu phase hiện tại:
- chỉ tập trung frontend foundation
- chưa tích hợp database thật
- ưu tiên dựng kiến trúc component và route đúng ngay từ đầu

Hãy:
1. đọc AGENTS.md và các file docs liên quan
2. rà soát cấu trúc app hiện tại
3. đề xuất chỉnh lại cấu trúc nếu cần nhưng giữ thay đổi tối thiểu
4. triển khai shell layout cho:
   - marketing site
   - member area
   - admin area
5. dùng mock data tách riêng
6. đảm bảo code sạch, dễ mở rộng cho Supabase sau này

Yêu cầu:
- Next.js App Router + TypeScript
- component tách nhỏ, không nhồi logic vào page
- UI tinh tế, hiện đại, không sến
- responsive tốt
- không thêm dependency không cần thiết
- cuối cùng tóm tắt file nào đã tạo/sửa và việc gì còn dang dở
```

---

## Phase B — Public website & CMS-ready frontend
Mục tiêu:
- landing page, room detail, branch detail, blog/news, offers
- chuẩn bị zone cho dữ liệu CMS về sau

### Prompt mẫu
```md
Tiếp tục dự án SK boutique hotel.

Hãy triển khai frontend cho public website theo hướng CMS-ready:
- các section trên homepage phải có thể map dữ liệu động về sau
- room detail và branch detail phải có vùng cho nội dung VI/EN
- blog/news list và detail phải có layout riêng

Cần làm:
- rà lại component hiện có
- tái sử dụng tối đa
- thêm mock schema/type cho dữ liệu page sections
- tạo các component section theo pattern có thể render từ config

Không làm ở bước này:
- chưa cần Supabase fetch thật
- chưa cần auth thật
- chưa cần analytics thật

Kết quả mong muốn:
- route chạy được
- UI thống nhất
- mock data có cấu trúc gần với database/cms tương lai
```

---

## Phase C — Supabase integration foundation
Mục tiêu:
- nối frontend với Supabase
- kết nối mcp với supabase để kiểm tra dữ liệu / schema cho dự án SK boutique hotel
- thiết lập auth, types, clients, env, query helpers, base tables

### Prompt mẫu
```md
Hãy giúp tôi chuyển project từ mock frontend sang có nền tảng Supabase thật.

Mục tiêu:
- setup lib/supabase cho server/client
- tạo types cơ bản cho dữ liệu chính
- thiết kế migration đầu tiên cho branches, floors, rooms, room_types, customers
- giữ frontend hiện có hoạt động ổn định

Yêu cầu:
- mọi thay đổi schema phải nằm trong supabase/migrations
- không hard-code dữ liệu vào UI nữa nếu đã có query thật
- tách query helper theo feature
- giữ code dễ mở rộng cho RLS và role-based access sau này

Hãy làm từng bước an toàn và giải thích ngắn gọn logic thay đổi.
```

---

## Phase D — Availability / Hold / Reservation workflow
### Prompt mẫu
```md
Hãy triển khai phase availability + hold + reservation workflow cho SK boutique hotel.

Bối cảnh nghiệp vụ:
- khách public chỉ check phòng / gửi yêu cầu / giữ phòng
- staff tạo booking thủ công
- phase 1 chỉ 1 booking = 1 phòng ở UI, nhưng data model không nên tự khóa khả năng nhiều phòng trong tương lai
- quản lý theo phòng vật lý
- hold và booking là 2 trạng thái khác nhau
- hold mặc định 30 phút và auto-expire

Cần làm:
1. rà soát data model hiện tại
2. đề xuất thay đổi migration nếu cần
3. tạo action/query/service cho:
   - availability request
   - room suggestion
   - hold room
   - release expired hold
   - create reservation
4. cập nhật UI admin tối thiểu để vận hành được
5. thêm audit log ở nơi hợp lý

Cuối cùng nêu rõ:
- assumptions
- edge cases
- file thay đổi
- việc cần làm tiếp
```

---

## Phase E — Payment proof / confirmation / member history
### Prompt mẫu
```md
Hãy triển khai phase deposit QR + payment proof upload + booking confirmation cho SK boutique hotel.

Yêu cầu nghiệp vụ:
- payment gateway chưa có
- mỗi chi nhánh có tài khoản ngân hàng riêng
- QR động theo amount + booking code
- khách upload ảnh chuyển khoản qua secure public link hoặc khi login
- staff verify thủ công
- sau khi verify gửi email xác nhận + PDF booking confirmation
- member xem được lịch sử yêu cầu và booking sau khi đăng nhập

Cần làm:
- model/payment request và payment proof
- upload flow an toàn
- secure tokenized public upload link
- admin verification UI
- member history UI
- hooks/service cần thiết

Không over-engineer.
Ưu tiên hoàn thành flow end-to-end trước rồi mới polish.
```

---

## 5) Prompt mẫu theo mục đích

## 5.1 Prompt fix lỗi
Dùng khi bug đã rõ hoặc có stack trace.

```md
Bạn đang sửa lỗi trong dự án SK boutique hotel.

Vấn đề hiện tại:
[PASTE lỗi, stack trace, ảnh, log hoặc mô tả hành vi sai]

Ngữ cảnh:
- framework: Next.js App Router + TypeScript
- ưu tiên sửa đúng gốc, không workaround tạm bợ nếu không cần
- giữ nguyên kiến trúc hiện có, tránh sửa lan rộng

Hãy:
1. đọc AGENTS.md và file liên quan trực tiếp
2. xác định nguyên nhân gốc có khả năng cao nhất
3. sửa với thay đổi tối thiểu nhưng đúng bản chất
4. thêm guard / type / validation nếu cần để tránh tái phát
5. mô tả ngắn gọn nguyên nhân và cách fix

Nếu có nhiều khả năng nguyên nhân, hãy kiểm tra theo thứ tự xác suất và chọn cách sửa an toàn nhất.
```

### Biến thể fix lỗi UI
```md
Tôi có lỗi UI ở màn hình [đường dẫn/trang].

Hiện tượng:
- [mô tả lỗi]
- breakpoint bị lỗi: [mobile/tablet/desktop]
- mong muốn: [kết quả đúng]

Hãy:
- tìm component/layout gây lỗi
- sửa đúng chỗ
- không đập bỏ component cũ nếu chỉ cần chỉnh CSS/layout logic
- giữ visual style premium, gọn, hiện đại
- kiểm tra cả light spacing, alignment, typography và responsive
```

---

## 5.2 Prompt sửa UI / polish UI
Dùng khi UI đã chạy nhưng cần đẹp hơn, tinh tế hơn.

```md
Hãy polish UI cho màn hình [tên màn hình/route] của dự án SK boutique hotel.

Mục tiêu:
- tinh tế, hiện đại, premium, không sến
- nhiều khoảng thở, hierarchy rõ ràng
- nhìn giống website khách sạn boutique chất lượng cao
- ưu tiên trải nghiệm mobile trước nhưng desktop cũng phải đẹp

Ràng buộc:
- không thay đổi business logic
- không thay đổi data contract nếu không thật cần thiết
- tái sử dụng design tokens/component hiện có nếu có
- tránh thêm dependency animation nặng nếu không cần

Hãy:
1. rà lại component tree
2. cải thiện layout, spacing, typography, card states, CTA hierarchy
3. thêm skeleton/empty/loading state nếu hợp lý
4. giữ code sạch, dễ maintain

Cuối cùng tóm tắt thay đổi về UI/UX.
```

---

## 5.3 Prompt thêm tính năng mới
```md
Hãy thêm tính năng mới cho dự án SK boutique hotel.

Tính năng cần thêm:
[ghi rõ feature]

Bối cảnh nghiệp vụ:
[ghi rule nghiệp vụ]

Yêu cầu thực hiện:
- trước tiên đọc AGENTS.md và docs liên quan
- rà soát code hiện có để tìm nơi cắm feature hợp lý
- đề xuất kiến trúc ngắn gọn trước khi sửa code
- sau đó triển khai end-to-end ở mức tối thiểu nhưng chạy được
- update type, validation, UI state, loading/error state
- nếu liên quan DB thì thêm migration chuẩn
- nếu liên quan quyền thì update permission guard tương ứng

Khi xong, báo lại:
- file tạo mới
- file chỉnh sửa
- assumptions
- việc nên làm tiếp theo
```

---

## 5.4 Prompt nâng cấp tính năng hiện có
```md
Hãy nâng cấp tính năng hiện có trong dự án SK boutique hotel.

Tính năng hiện tại:
[mô tả ngắn]

Nâng cấp mong muốn:
[mô tả mục tiêu mới]

Hạn chế:
- không phá luồng cũ đang hoạt động
- ưu tiên backward compatible
- thay đổi tối thiểu nhưng đủ mở rộng cho tương lai

Hãy:
1. phân tích implementation hiện có
2. nêu điểm nghẽn hoặc debt chính
3. đề xuất cách nâng cấp ít rủi ro nhất
4. thực hiện thay đổi
5. rà lại các chỗ phụ thuộc
```

---

## 5.5 Prompt refactor
```md
Hãy refactor khu vực code này trong dự án SK boutique hotel mà không thay đổi hành vi nghiệp vụ.

Phạm vi:
[path/file/module]

Mục tiêu:
- giảm lặp code
- tách business logic khỏi UI
- cải thiện type safety
- giữ naming rõ ràng
- giúp Codex và dev sau này đọc dễ hơn

Không làm:
- không đổi output UI/behavior nếu không cần
- không đổi API contract nếu không cần

Kết quả mong muốn:
- code gọn hơn
- ít coupling hơn
- file structure hợp lý hơn
```

---

## 5.6 Prompt tra cứu dữ liệu với MCP / Supabase
Dùng khi bạn muốn Codex tìm dữ liệu, rà schema, kiểm tra row, policy, migration.

```md
Hãy dùng MCP Supabase để kiểm tra dữ liệu / schema cho dự án SK boutique hotel.

Mục tiêu:
[ví dụ: kiểm tra vì sao room availability bị âm / kiểm tra customer nào có payment proof chưa verify / rà cấu trúc bảng reservations]

Yêu cầu:
- trước tiên xác định bảng và quan hệ liên quan
- nếu cần hãy inspect schema, indexes, constraints, RLS/policies
- nếu cần hãy chạy query chỉ đọc để xác minh giả thuyết
- không được sửa/xóa dữ liệu production trừ khi tôi yêu cầu rất rõ
- nếu phát hiện vấn đề data model, hãy đề xuất migration hoặc cleanup script riêng, không sửa tay tùy tiện

Trả lời theo cấu trúc:
1. tôi đã kiểm tra những bảng nào
2. phát hiện gì
3. nguyên nhân có khả năng cao nhất
4. hướng sửa ở mức code/data/schema
```

### Prompt mẫu: kiểm tra schema
```md
Dùng MCP Supabase để rà schema của module reservation.

Tôi cần bạn:
- liệt kê bảng liên quan reservation/holds/payments
- chỉ ra khóa chính, khóa ngoại, unique/index quan trọng
- kiểm tra field nào đang thiếu cho phase 1 của SK boutique hotel
- đề xuất migration tiếp theo nếu cần
```

### Prompt mẫu: kiểm tra dữ liệu sai
```md
Dùng MCP Supabase để điều tra vì sao có một số booking đã expired nhưng phòng vẫn không được release.

Hãy:
- kiểm tra bảng reservation_holds / reservations / room_availability_daily / room_operational_status_logs
- truy xem state transition nào bị thiếu
- xác định lỗi là do data, cron job hay logic app
- không sửa dữ liệu trực tiếp, chỉ report rõ root cause và cách xử lý an toàn
```

---

## 5.7 Prompt review code / review feature
OpenAI có nhắc đến pattern dùng file review instructions cùng `AGENTS.md` để giữ cách review nhất quán. citeturn0search13

```md
Hãy review phần code tôi vừa thay đổi trong dự án SK boutique hotel như một senior engineer.

Tập trung vào:
- correctness
- maintainability
- risk khi scale
- security/auth/permission
- i18n VI/EN
- edge cases nghiệp vụ khách sạn
- dữ liệu availability/holds/reservations/payments

Không cần viết lại cả module.
Hãy chỉ ra:
1. lỗi nghiêm trọng
2. rủi ro trung bình
3. clean-up nên làm sau
4. phần nào ổn và nên giữ nguyên
```

---

## 5.8 Prompt tạo migration / seed / policy
```md
Hãy tạo migration Supabase/Postgres cho module [tên module] trong dự án SK boutique hotel.

Yêu cầu:
- đặt tên migration rõ ràng
- có primary key, foreign key, timestamps, indexes cần thiết
- cân nhắc soft delete nếu hợp lý
- chuẩn bị cho audit log nếu module này quan trọng
- nếu cần RLS thì nêu rõ policy gợi ý, chưa cần bật hết nếu phase hiện tại chưa dùng

Ngoài migration, hãy cho thêm:
- giải thích ngắn schema
- ví dụ seed data tối thiểu nếu cần để dev/test
```

---

## 5.9 Prompt làm trang admin mới
```md
Hãy tạo màn hình admin mới cho module [module name] của SK boutique hotel.

Mục tiêu:
- dễ dùng cho staff
- nhìn gọn, không rối
- ưu tiên thao tác nhanh
- có search/filter/sort nếu phù hợp
- có empty/loading/error state

Cần có:
- list view
- detail drawer/page/modal tùy hợp lý
- action chính rõ ràng
- permission guard nếu cần

Đừng nhồi quá nhiều thứ vào một màn hình.
Hãy thiết kế theo workflow vận hành thực tế.
```

---

## 5.10 Prompt tạo API route / server action
```md
Hãy triển khai API/server action cho [feature] trong dự án SK boutique hotel.

Yêu cầu:
- validate input chặt chẽ
- trả lỗi rõ ràng
- không để business logic nằm hết trong route handler
- tách service/helper nếu logic dài
- kiểm tra permission nếu là admin/member action
- log/audit nếu là action nhạy cảm

Sau khi làm xong, liệt kê contract request/response ngắn gọn.
```

---

## 6) Prompt nhanh theo đúng tình huống thường gặp

## Khi Codex làm sai scope
```md
Dừng mở rộng thêm.
Hãy quay lại đúng phạm vi tôi yêu cầu.
Không thêm feature mới ngoài scope.
Chỉ sửa trong các file liên quan trực tiếp đến [module/route].
Nếu cần assumption, hãy chọn assumption tối thiểu và ghi rõ cuối câu trả lời.
```

## Khi Codex sửa quá nhiều file
```md
Hãy rollback tư duy “rewrite diện rộng”.
Tôi muốn thay đổi tối thiểu, surgical change.
Ưu tiên tái sử dụng code hiện có, chỉ tách file nếu thật sự giúp dễ bảo trì hơn.
```

## Khi Codex làm UI chưa đúng gu
```md
UI hiện tại còn thô / generic quá.
Hãy chỉnh theo hướng boutique hotel premium:
- typography thanh lịch
- spacing thoáng
- card và section rõ hierarchy
- hình ảnh là trung tâm
- CTA tinh gọn
- tránh màu sắc loè loẹt và hiệu ứng rẻ tiền
```

## Khi Codex quên i18n
```md
Nhớ rằng phase 1 của dự án bắt buộc hỗ trợ VI/EN.
Nếu thêm màn hình mới hoặc thêm copy text mới, hãy đặt structure sẵn để tách chuỗi và hỗ trợ song ngữ.
```

---

## 7) Cách viết prompt hiệu quả cho Codex

### Công thức prompt nên dùng
- **Bối cảnh dự án là gì**
- **Mục tiêu của task là gì**
- **Những gì không được làm**
- **Ràng buộc kiến trúc**
- **Kết quả mong muốn**
- **Cách report lại**

### Prompt ngắn nhưng tốt
```md
Tiếp tục dự án SK boutique hotel.
Task: thêm admin list page cho room holds.
Ràng buộc: không đổi schema, không thêm dependency, giữ UI gọn cho staff.
Yêu cầu: table + filters + status badge + action xem chi tiết + loading/empty/error states.
Đọc AGENTS.md trước khi làm và tóm tắt file thay đổi khi xong.
```

### Prompt kém hiệu quả
```md
làm giúp tôi trang hold room
```

Lý do prompt kém:
- thiếu scope
- thiếu ràng buộc
- thiếu output mong muốn
- dễ khiến agent đoán bừa

---

## 8) Thứ tự ưu tiên khi nhờ Codex làm việc

1. **Đọc hiểu và đề xuất**
2. **Dựng skeleton / structure**
3. **Làm end-to-end tối thiểu**
4. **Sửa bug và edge cases**
5. **Polish UI**
6. **Refactor**
7. **Viết test và checklist**

Đừng bắt Codex vừa làm tất cả cùng lúc ở prompt đầu tiên.

---

## 9) Luồng làm việc khuyên dùng cho bạn

### Vòng 1: dựng khung
- route
- layout
- feature folders
- mock data
- ui shell

### Vòng 2: nối data
- supabase clients
- schema
- migrations
- services
- server actions

### Vòng 3: hoàn thiện flow
- availability
- holds
- reservations
- payments
- member history

### Vòng 4: refine
- permissions
- audit log
- analytics
- email/pdf
- ui polish

### Vòng 5: hardening
- edge cases
- loading/error states
- cleanup
- tests
- release checklist

---

## 10) Bộ prompt ngắn nên lưu sẵn trong repo

Bạn có thể tạo các file này trong `docs/prompts/` để dùng lại nhanh:

- `00-kickoff-phase.md`
- `01-build-feature.md`
- `02-fix-bug.md`
- `03-ui-polish.md`
- `04-upgrade-feature.md`
- `05-refactor.md`
- `06-supabase-mcp.md`
- `07-review.md`
- `08-release-prep.md`

Mỗi file chỉ cần 1 template như các phần trên.

---

## 11) Đề xuất thực tế cho dự án của bạn ngay bây giờ

Vì bạn nói đang dựng **frontend cực kỳ cơ bản trước**, tôi khuyên thứ tự tiếp theo với Codex là:

### Bước 1
Dùng Codex để chỉnh lại **repo structure + app routes + shared layout**.

### Bước 2
Dùng Codex dựng **mock-based public pages**:
- home
- branch list/detail
- room type list/detail
- contact/about/offers

### Bước 3
Dùng Codex dựng **admin shell**:
- dashboard shell
- left nav
- top bar
- list page patterns

### Bước 4
Dùng Codex tạo **typed mock models** bám theo data model thật tương lai.

### Bước 5
Mới bắt đầu nối Supabase.

Lý do: frontend sẽ không bị “vẽ xong rồi đập đi” khi data model vào.

---

## 12) Checklist trước khi giao task cho Codex

Trước khi prompt, bạn tự check nhanh 6 câu này:
- task này đang ở phase nào?
- là build mới hay sửa cái cũ?
- có đụng schema không?
- có đụng auth/permission không?
- có đụng i18n VI/EN không?
- tôi muốn thay đổi tối thiểu hay chấp nhận refactor?

Nếu trả lời được 6 câu này, prompt của bạn sẽ tốt hơn rất nhiều.

---

## 13) Kết luận

Với dự án này, Codex sẽ mạnh nhất khi bạn cho nó:
- `AGENTS.md` rõ ràng
- repo structure sạch
- docs ngắn nhưng chuẩn
- prompt có bối cảnh + ràng buộc + output mong muốn

Tài liệu chính thức của OpenAI xác nhận Codex đọc `AGENTS.md` trước khi làm việc, và đây là cơ chế cốt lõi để duy trì hành vi nhất quán theo repo. citeturn0search0turn0search15
