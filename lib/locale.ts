export type Locale = "vi" | "en";

export const locales: Locale[] = ["vi", "en"];
export const defaultLocale: Locale = "vi";
export const localeQueryKey = "lang";

const translations: Record<string, string> = {
  "Trang chủ": "Home",
  "Phòng": "Rooms",
  "Tin tức": "News",
  "Thương hiệu": "Brand",
  "Chi nhánh": "Branches",
  "Ưu đãi": "Offers",
  "Dịch vụ": "Services",
  "Về chúng tôi": "About Us",
  "Liên hệ": "Contact",
  "Tuyển dụng": "Careers",
  "Hỗ trợ": "Support",
  "Đặt phòng": "Book Now",
  "Kiểm tra phòng trống": "Check availability",
  "Khám phá": "Explore",
  "Liên hệ mẫu": "Sample contact",
  "Địa chỉ": "Address",
  "Điện thoại": "Phone",
  "Giờ làm việc": "Hours",
  "Bắt đầu chỉnh sửa": "Start editing",
  "Xem hỗ trợ": "View support",
  "Quay về trang chủ": "Back to home",
  "Về trang chủ": "Back to home",
  "Xem ưu đãi": "See offers",
  "Đặt ngay": "Book now",
  "Liên hệ đặt phòng": "Contact reservations",
  "Xem dịch vụ": "View services",
  "Gửi yêu cầu": "Send request",
  "Gửi tin nhắn": "Send message",
  "Gửi CV hoặc form": "Submit your CV or form",
  "Quay lại trang chủ": "Return to home",
  "Xem trang chủ": "See home",
  "Xem liên hệ": "See contact",
  "Nhận diện": "Identity",
  "Sẵn sàng triển khai": "Ready to launch",
  "Địa điểm": "Location",
  "Tạo một hệ nhận diện tối giản nhưng giàu cảm giác chạm.": "A minimal identity system with tactile presence.",
  "Một câu chuyện nhỏ về sự chăm chút lớn.": "A short story about careful hospitality.",
  "Khi cần đặt phòng hoặc hỏi thêm, đây là nơi bắt đầu.": "When you need to book or ask a question, start here.",
  "Một nơi để hỏi nhanh, nhận câu trả lời rõ, và tiếp tục hành trình.": "A place to ask quickly, get clear answers, and move on.",
  "Gói ưu đãi được dựng như một bộ sưu tập nhỏ, không phải banner khô cứng.": "Offers are presented like a curated collection, not a flat banner.",
  "Dịch vụ được trình bày như một trải nghiệm, không phải danh sách khô.": "Services are presented as an experience, not a plain list.",
  "Mỗi chi nhánh có cùng tinh thần, nhưng một nhịp riêng.": "Every branch shares the same spirit, but moves at its own pace.",
  "Mọi ưu đãi đều có thể đổi, nhưng cấu trúc template thì giữ nguyên.": "Every offer can change, but the template structure stays the same.",
  "Một khối liên hệ sạch sẽ luôn làm website khách sạn trông đáng tin hơn.": "A clean contact block always makes a hotel site feel more credible.",
  "Một khối nội dung để bạn thay bằng thông tin thật.": "A content block ready to be replaced with real information.",
  "Các trang phụ đã sẵn sàng với cùng một ngôn ngữ thiết kế.": "The supporting pages are ready with the same visual language.",
  "Nơi di sản gặp sự tinh tuyển.": "Where heritage meets refinement.",
  "Trang mẫu tĩnh theo đúng tinh thần của thư mục templates: sang, nhiều khoảng thở, ít đường kẻ và sẵn sàng cho logo, ảnh, cùng nội dung thật của bạn.": "A static template following the templates folder: elegant, airy, borderless, and ready for your logo, images, and real content.",
  "Khối nội dung này kể lại tinh thần SK Boutique Hotel theo kiểu editorial: ngắn, rõ, giàu hình ảnh và đủ sâu để tạo niềm tin.":
    "This block tells the SK Boutique Hotel story in an editorial way: concise, clear, image-led, and credible.",
  "Di sản, con người và sự tinh gọn": "Heritage, people, and refinement",
  "Placeholder cho ảnh kiến trúc hoặc trang lịch sử.": "Placeholder for architectural imagery or a history page.",
  "Khởi đầu": "Start",
  "Một mốc thời gian phù hợp với tag ETS.2020": "A milestone that fits the ETS.2020 tag.",
  "Giá trị cốt lõi": "Core values",
  "Tinh tế, riêng tư, nhất quán": "Refined, private, consistent",
  "Tầm nhìn": "Vision",
  "Giữ trải nghiệm boutique ở mọi điểm chạm": "Keep the boutique experience consistent at every touchpoint.",
  "Khách hàng": "Guests",
  "Template mở rộng được cho nhiều phân khúc": "A template that can scale across many segments.",
  "Chọn phòng của bạn": "Choose your room",
  "Xem các hạng phòng, kiểm tra ngày và mở popup chi tiết ngay trên trang danh sách.":
    "View room types, check dates, and open the room details popup without leaving the listing.",
  "Xem tiện nghi": "View amenities",
  "Bố cục editorial, góc vuông, và nhịp nghỉ rộng rãi.": "An editorial layout, crisp geometry, and generous breathing room.",
  "Mẫu này ưu tiên cảm giác một tờ tạp chí cao cấp: hình ảnh lớn, chữ serif có trọng lượng, và các khối nội dung được đẩy lệch nhẹ để tạo độ thủ công.": "This layout feels like a luxury magazine: large imagery, weighted serif type, and deliberately shifted blocks for a handcrafted feel.",
  "Khối hình ảnh có thể thay bằng phòng, sảnh, spa, hoặc nhà hàng.": "The image block can become a room, lobby, spa, or restaurant scene.",
  "Một khách sạn boutique cần nói ít nhưng đúng.": "A boutique hotel should say little, but say it well.",
  "Bảng màu": "Palette",
  "Navy, gold, and warm paper tone.": "Navy, gold, and a warm paper tone.",
  "Giường đôi": "Double bed",
  "Giường đơn": "Single bed",
  "Giường king": "King bed",
  "Giường queen": "Queen bed",
  "Khu nghỉ dưỡng phức hợp Marina, Bim Group, MP-135, Marina Square, Ấp Đường Bào, Phú Quốc, An Giang 92509":
    "Marina Integrated Resort, Bim Group, MP-135, Marina Square, Duong Bao Hamlet, Phu Quoc, An Giang 92509",
  "SK Boutique Hotel Phú Quốc": "SK Boutique Hotel Phu Quoc",
  "Mỗi địa điểm nên nhìn cùng một ngôn ngữ, nhưng khác câu chuyện.": "Every location should speak the same language, but tell a different story.",
  "Gói phòng, voucher và chiến dịch theo mùa": "Room packages, vouchers, and seasonal campaigns",
  "Card khuyến mãi dạng cao cấp, hợp với ảnh và headline lớn.": "A premium promo card style that works with bold imagery and headlines.",
  "Spa, concierge, dining và transfer": "Spa, concierge, dining, and transfer",
  "Khung để bạn mô tả dịch vụ của khách sạn theo từng nhóm.": "A frame for describing hotel services by category.",
  "Câu chuyện thương hiệu và mốc thời gian": "Brand story and timeline",
  "Khung hiển thị danh sách chi nhánh theo phong cách editorial.": "An editorial-style branch listing frame.",
  "Một landing page tuyển dụng đồng bộ với ngôn ngữ thương hiệu.": "A careers landing page that matches the brand language.",
  "FAQ, kênh hỗ trợ và câu trả lời nhanh": "FAQ, support channels, and quick answers",
  "Trang hỗ trợ khách lưu trú hoặc khách đang cân nhắc đặt phòng.": "Support for staying guests or guests considering a booking.",
  "Một khách sạn boutique sống bằng cảm giác, không chỉ bằng phòng ngủ.": "A boutique hotel lives by feeling, not just by rooms.",
  "Sự tinh tế đến từ chi tiết nhỏ.": "Refinement comes from small details.",
  "Một timeline ngắn để kể câu chuyện phát triển.": "A short timeline for your brand story.",
  "Quy trình ứng tuyển": "Application process",
  "Một vài câu trả lời ngắn trước khi khách liên hệ.": "A few quick answers before guests reach out.",
  "Những câu hỏi hay gặp nhất.": "Most common questions.",
  "Bố cục sẵn cho phần điều khoản ngắn.": "A ready layout for short policy notes.",
  "Khi cần trợ giúp, khách chỉ cần một trang rõ ràng.": "When guests need help, they only need one clear page.",
  "Nếu bạn chỉ muốn thay logo, template này đã sẵn sàng.": "If you only want to swap the logo, this template is ready.",
  "Chỉ cần thay file logo trong public và cập nhật text placeholder là toàn bộ hệ thống vẫn giữ được cảm giác cao cấp.": "Swap the logo files in public and update the placeholder text to keep the full system feeling premium.",
  "Một khối minimal để chèn ảnh đội ngũ hoặc không gian.": "A minimal block for team or venue imagery.",
  "Mỗi chi tiết nên có lý do tồn tại.": "Every detail should have a reason to exist.",
  "Thay vì nhồi thông tin, giao diện này ưu tiên các điểm nhấn rõ ràng: headline lớn, đoạn mô tả ngắn, và các khối nội dung được sắp như một layout tạp chí.": "Instead of stuffing information, this layout focuses on strong headlines, short descriptions, and magazine-like composition.",
  "Màu sắc đi theo ngôn ngữ của heritage: nền ấm, mực tối, và gold dùng như một điểm nhấn vừa đủ để tạo cảm giác premium.": "The color system follows a heritage language: warm surfaces, deep ink, and gold used sparingly for premium emphasis.",
  "Logo là một slot riêng để bạn thay asset mà không đụng vào layout.": "The logo is a dedicated slot, so you can swap the asset without touching the layout.",
  "Tông navy và gold giữ cảm giác sang, đủ ấm nhưng vẫn rõ ràng.": "Navy and gold keep the tone luxurious, warm, and clear.",
  "Bố cục được giữ theo logic của mẫu gốc: một hero lớn, một số card lệch nhịp, và nhiều khoảng thở để website có cảm giác đắt hơn là dày đặc.": "The layout follows the original logic: a large hero, staggered cards, and generous space so the site feels premium rather than dense.",
  "Một tấm placeholder rộng, có thể đổi thành ảnh hoặc video cover.": "A wide placeholder that can become an image or video cover.",
  "Một hệ nhận diện tối giản nhưng giàu cảm giác chạm.": "A minimal identity system with tactile presence.",
  "Khách sạn boutique cần nói ít nhưng đúng.": "A boutique hotel should say little, but say it well.",
  "Mọi chi tiết đều có thể thay đổi, nhưng template này vẫn giữ nguyên khung.": "Every detail can change, but this template keeps its structure.",
  "Nếu cần, bạn chỉ việc thay logo trong public và cập nhật các ảnh placeholder bằng asset của mình.": "If needed, just replace the logo in public and update the placeholder images with your own assets.",
  "Đây là nơi bạn nối form thật khi sẵn sàng.": "This is where you connect the real form when you're ready.",
  "Không gian lưu trú boutique mang phong cách tinh tế, riêng tư và ấm cúng. Chúng tôi mang đến trải nghiệm nghỉ dưỡng nhẹ nhàng, hiện đại, phù hợp cho cả du lịch và công tác.": "Our boutique accommodations offer a sophisticated, private, and cozy atmosphere. We provide a relaxed, modern vacation experience suitable for both leisure and business travelers.",
  "Chỉ cần thay file logo trong thư mục /public, header và footer sẽ đổi theo.": "Swap the logo files in /public and the header and footer will update accordingly.",
  "Một số chủ đề cần chặn?": "Need to block some topics?",
  "Địa chỉ mẫu, Quận trung tâm, TP.HCM": "Sample address, central district, Ho Chi Minh City",
  "Khả năng mở rộng": "Scalability",
  "Frontend foundation manual-first, sẵn sàng cho Supabase sau này.": "A manual-first front-end foundation ready for Supabase later."
};

export function resolveLocale(input?: string | null): Locale {
  return input?.toLowerCase() === "en" ? "en" : defaultLocale;
}

export function readLocaleFromFormData(formData: FormData): Locale {
  const value = formData.get("locale");

  return resolveLocale(typeof value === "string" ? value : null);
}

export function translate(locale: Locale, value: string): string {
  if (locale === "vi") {
    return value;
  }

  return translations[value] ?? value;
}

export function appendLocaleQuery(href: string, locale: Locale) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }

  const url = new URL(href, "https://sk-boutique-hotel.local");

  if (locale === "en") {
    url.searchParams.set(localeQueryKey, "en");
  } else {
    url.searchParams.delete(localeQueryKey);
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function localeLabel(locale: Locale) {
  return locale === "en" ? "EN" : "VI";
}
