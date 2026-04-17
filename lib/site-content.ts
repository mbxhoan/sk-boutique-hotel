import type { LocalizedText } from "@/lib/mock/i18n";

export type LinkItem = {
  label: string;
  href: string;
};

export type HeaderMenuItem = {
  children?: HeaderMenuItem[];
  href: string;
  label: LocalizedText;
};

export type HeaderMenuConfig = {
  cta: HeaderMenuItem;
  items: HeaderMenuItem[];
};

export type MetricItem = {
  value: string;
  label: string;
  detail: string;
};

export type VisualPanelData = {
  label: string;
  title: string;
  description: string;
  variant?: "ink" | "paper" | "gold";
  note?: string;
  chips?: string[];
};

export type SplitSectionData = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  visual: VisualPanelData;
  reverse?: boolean;
};

export type CardItem = {
  kicker: string;
  title: string;
  description: string;
  meta?: string;
  href?: string;
  tone?: "ink" | "paper" | "gold";
};

export type CardSectionData = {
  eyebrow: string;
  title: string;
  description: string;
  cards: CardItem[];
};

export type TimelineItem = {
  step: string;
  title: string;
  description: string;
};

export type TimelineSectionData = {
  eyebrow: string;
  title: string;
  description: string;
  items: TimelineItem[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSectionData = {
  eyebrow: string;
  title: string;
  description: string;
  items: FaqItem[];
};

export type ContactField = {
  label: string;
  placeholder: string;
  type: "text" | "email" | "tel" | "textarea";
};

export type ContactSectionData = {
  eyebrow: string;
  title: string;
  description: string;
  details: {
    label: string;
    value: string;
    href?: string;
  }[];
  formTitle: string;
  formFields: ContactField[];
};

export type ClosingSectionData = {
  eyebrow: string;
  title: string;
  description: string;
  cta: LinkItem;
  secondaryCta?: LinkItem;
};

export type HeroData = {
  layout: "stacked" | "split";
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: LinkItem;
  secondaryCta?: LinkItem;
  visual: VisualPanelData;
};

export type PageContent = {
  slug: string;
  title: string;
  description: string;
  hero: HeroData;
  metrics?: MetricItem[];
  splitSections?: SplitSectionData[];
  cardSections?: CardSectionData[];
  timelineSection?: TimelineSectionData;
  faqSection?: FaqSectionData;
  contactSection?: ContactSectionData;
  closingSection?: ClosingSectionData;
};

export const navItems: LinkItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Phòng", href: "/rooms" },
  { label: "Tin tức", href: "/tin-tuc" },
  { label: "Thương hiệu", href: "/thuong-hieu" },
  { label: "Về chúng tôi", href: "/about-us" },
  { label: "Liên hệ", href: "/lien-he" },
  { label: "Tuyển dụng", href: "/tuyen-dung" },
  { label: "Hỗ trợ", href: "/ho-tro" }
];

export const headerMenu: HeaderMenuConfig = {
  items: [
    {
      href: "/rooms",
      label: { vi: "Phòng", en: "Rooms" }
    },
    {
      href: "#vi-tri",
      label: { vi: "Vị trí", en: "Location" }
    },
    {
      href: "#about-sk",
      label: { vi: "Về SK", en: "About SK" },
      children: [
        { href: "/about-us", label: { vi: "Về chúng tôi", en: "About us" } }
      ]
    }
  ],
  cta: {
    href: "/rooms",
    label: { vi: "Đặt phòng", en: "Book now" }
  }
};

export const footerLinks = navItems;

export const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com",
    icon: "/templates/components/SocialFacebook.svg"
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com",
    icon: "/templates/components/SocialYouTube.svg"
  }
];

export const siteInfo = {
  gg_map_address: "SK boutique hotel",
  address: "Khu nghỉ dưỡng phức hợp Marina, Bim Group, MP-135, Marina Square, Ấp Đường Bào, Phú Quốc, An Giang 92509",
  phone: "+84 908 233 583",
  zalo: "0908 233 583",
  facebook: "https://www.facebook.com/p/SK-Boutique-Hotel-100088332707267/",
  email: "skhotel.phuquoc@gmail.com",
  hours: "08:00 - 22:00",
  legal: "© 2026 SK Boutique Hotel. Front-end foundation manual-first, sẵn sàng cho Supabase sau này."
} as const;

export const pages: PageContent[] = [
  {
    slug: "/",
    title: "Trang chủ",
    description: "Trang chủ editorial cho SK Boutique Hotel, dựng theo mẫu majestic heritage với layout tinh tuyển, placeholder tĩnh và logo thay thế dễ dàng.",
    hero: {
      layout: "stacked",
      eyebrow: "SK BOUTIQUE HOTEL",
      title: "Nơi di sản gặp sự tinh tuyển.",
      description:
        "Trang mẫu tĩnh theo đúng tinh thần của thư mục templates: sang, nhiều khoảng thở, ít đường kẻ và sẵn sàng cho logo, ảnh, cùng nội dung thật của bạn.",
      primaryCta: { label: "Đặt phòng", href: "/lien-he" },
      secondaryCta: { label: "Khám phá thương hiệu", href: "/thuong-hieu" },
      visual: {
        label: "HOMEPAGE HERO",
        title: "Ảnh hero / video cover",
        description: "Placeholder cho mặt tiền, phòng ngủ, sảnh hoặc một đoạn video dài.",
        variant: "ink",
        note: "Logo slot: thay file /public/logo.png",
        chips: ["Lobby", "Suite", "Spa"]
      }
    },
    metrics: [
      { value: "01", label: "Tinh thần boutique", detail: "Ấn phẩm lưu trú thay vì booking khô cứng" },
      { value: "02", label: "Khoảng trắng", detail: "Làm nền cho nội dung và ảnh nổi bật" },
      { value: "03", label: "Logo slot", detail: "Chỉ cần thay file trong /public" },
      { value: "04", label: "Placeholder", detail: "Mọi khối đều là nội dung tĩnh mẫu" }
    ],
    splitSections: [
      {
        eyebrow: "ĐỊNH VỊ",
        title: "Bố cục editorial, góc vuông, và nhịp nghỉ rộng rãi.",
        description:
          "Mẫu này ưu tiên cảm giác một tờ tạp chí cao cấp: hình ảnh lớn, chữ serif có trọng lượng, và các khối nội dung được đẩy lệch nhẹ để tạo độ thủ công.",
        bullets: [
          "Tông navy và gold giữ cảm giác sang, đủ ấm nhưng vẫn rõ ràng.",
          "Các card không dùng đường kẻ phân tách mà dựa vào khoảng nền và tonal layer.",
          "Logo được đặt ở vị trí cố định để bạn thay bằng bộ nhận diện của khách sạn.",
          "CTA và các trang phụ đã được dựng sẵn để bạn nối data sau này."
        ],
        visual: {
          label: "DESIGN PRINCIPLES",
          title: "No-line, warm surface, and layered depth.",
          description: "Khối mô phỏng một ảnh kiến trúc lớn với chú thích placeholder ở góc.",
          variant: "paper",
          note: "Replace logo, imagery, and copy here"
        }
      },
      {
        eyebrow: "NHỊP KHÔNG GIAN",
        title: "Khối hình ảnh có thể thay bằng phòng, sảnh, spa, hoặc nhà hàng.",
        description:
          "Layout được giữ theo logic của mẫu gốc: một hero lớn, một số card lệch nhịp, và nhiều khoảng thở để website có cảm giác đắt hơn là dày đặc.",
        bullets: [
          "Mỗi section đều có một điểm nhìn chính và một nhịp phụ để giữ mắt người xem ở lại.",
          "Các chi tiết mẫu hiện đang là text tĩnh, phù hợp để bạn gắn data thật sau này.",
          "Nếu cần, bạn chỉ việc thay logo trong public và cập nhật các ảnh placeholder bằng asset của mình.",
          "Site vẫn giữ được tinh thần luxury dù chưa có dữ liệu động."
        ],
        visual: {
          label: "VISUAL COLLAGE",
          title: "Ảnh phòng / sảnh / rooftop",
          description: "Một tấm placeholder rộng, có thể đổi thành ảnh hoặc video cover.",
          variant: "gold",
          note: "Static placeholder panel"
        },
        reverse: true
      }
    ],
    cardSections: [
      {
        eyebrow: "CÁC TRANG CHÍNH",
        title: "Template đã có khung cho toàn bộ các trang bạn cần.",
        description: "Các thẻ dưới đây dẫn đến từng route tĩnh trong App Router.",
        cards: [
          {
            kicker: "TRANG CHỦ",
            title: "Hero, điểm nhấn và CTA đặt phòng",
            description: "Trang mở đầu theo style mẫu, nhiều khoảng thở và block hình ảnh lớn.",
            meta: "Route: /",
            href: "/"
          },
          {
            kicker: "THƯƠNG HIỆU",
            title: "Ngôn ngữ nhận diện và logo slot",
            description: "Nơi bạn thay logo, màu sắc, font và tone thương hiệu.",
            meta: "Route: /thuong-hieu",
            href: "/thuong-hieu"
          },
          {
            kicker: "CHI NHÁNH",
            title: "Các cơ sở, giờ hoạt động và mô tả địa điểm",
            description: "Khung hiển thị danh sách chi nhánh theo phong cách editorial.",
            meta: "Route: /chi-nhanh",
            href: "/chi-nhanh"
          },
          {
            kicker: "ƯU ĐÃI",
            title: "Gói phòng, voucher và chiến dịch theo mùa",
            description: "Card khuyến mãi dạng cao cấp, hợp với ảnh và headline lớn.",
            meta: "Route: /uu-dai",
            href: "/uu-dai"
          }
        ]
      },
      {
        eyebrow: "CÁC TRANG HỖ TRỢ",
        title: "Tất cả khối phụ cũng đã có template sẵn.",
        description: "Dùng tiếp cho nội dung dịch vụ, lịch sử, liên hệ, tuyển dụng và hỗ trợ.",
        cards: [
          {
            kicker: "DỊCH VỤ",
            title: "Spa, concierge, dining và transfer",
            description: "Khung để bạn mô tả dịch vụ của khách sạn theo từng nhóm.",
            meta: "Route: /dich-vu",
            href: "/dich-vu"
          },
          {
            kicker: "VỀ CHÚNG TÔI",
            title: "Câu chuyện thương hiệu và mốc thời gian",
            description: "Giữ tinh thần của một resort editorial, có timeline và values.",
            meta: "Route: /about-us",
            href: "/about-us"
          },
          {
            kicker: "LIÊN HỆ",
            title: "Form mẫu, hotline, email và bản đồ",
            description: "Bố cục contact có sẵn, dễ nối backend sau này.",
            meta: "Route: /lien-he",
            href: "/lien-he"
          },
          {
            kicker: "TUYỂN DỤNG",
            title: "Vai trò, văn hóa và quy trình ứng tuyển",
            description: "Một landing page tuyển dụng đồng bộ với ngôn ngữ thương hiệu.",
            meta: "Route: /tuyen-dung",
            href: "/tuyen-dung"
          },
          {
            kicker: "HỖ TRỢ",
            title: "FAQ, kênh hỗ trợ và câu trả lời nhanh",
            description: "Trang hỗ trợ khách lưu trú hoặc khách đang cân nhắc đặt phòng.",
            meta: "Route: /ho-tro",
            href: "/ho-tro"
          }
        ]
      }
    ],
    closingSection: {
      eyebrow: "SẴN SÀNG TRIỂN KHAI",
      title: "Một template đủ sang để bạn bắt đầu ngay, đủ đơn giản để thay data sau này.",
      description:
        "Tất cả phần nội dung hiện tại đều là placeholder tĩnh. Bạn chỉ cần thay logo, đổi ảnh và gắn data thật vào các route có sẵn.",
      cta: { label: "Bắt đầu chỉnh sửa", href: "/lien-he" },
      secondaryCta: { label: "Xem hỗ trợ", href: "/ho-tro" }
    }
  },
  {
    slug: "/thuong-hieu",
    title: "Thương hiệu",
    description: "Trang thương hiệu cho SK Boutique Hotel với palette ink / gold, logo slot và layout editorial có chiều sâu.",
    hero: {
      layout: "split",
      eyebrow: "THE BRAND",
      title: "Một hệ nhận diện tối giản nhưng giàu cảm giác chạm.",
      description:
        "Trang này gom những gì làm nên hình ảnh SK Boutique Hotel: logo, nhịp chữ, bảng màu, và cách không gian thở trong toàn bộ website.",
      primaryCta: { label: "Về trang chủ", href: "/" },
      secondaryCta: { label: "Xem ưu đãi", href: "/uu-dai" },
      visual: {
        label: "BRAND BOARD",
        title: "Logo, type, màu sắc và khoảng thở",
        description: "Bảng nhận diện mẫu để bạn thay logo và tinh chỉnh tone.",
        variant: "gold",
        note: "Logo placeholder: /public/logo.png",
        chips: ["Ink", "Gold", "Paper"]
      }
    },
    metrics: [
      { value: "03", label: "Màu nền chính", detail: "Ink, gold, paper" },
      { value: "02", label: "Nhóm font", detail: "Serif cho headline, sans cho body" },
      { value: "01", label: "Logo slot", detail: "Thay một lần là toàn site đổi" }
    ],
    splitSections: [
      {
        eyebrow: "GIỌNG ĐIỆU",
        title: "Một khách sạn boutique cần nói ít nhưng đúng.",
        description:
          "Thay vì nhồi thông tin, giao diện này ưu tiên các điểm nhấn rõ ràng: headline lớn, đoạn mô tả ngắn, và các khối nội dung được sắp như một layout tạp chí.",
        bullets: [
          "Serif cho headline tạo cảm giác trang trọng và có tính di sản.",
          "Sans cho body giữ khả năng đọc tốt trên nhiều kích thước màn hình.",
          "Khoảng trắng được dùng như một thành phần thiết kế, không phải phần bỏ trống.",
          "Logo là một slot riêng để bạn thay asset mà không đụng vào layout."
        ],
        visual: {
          label: "TYPOGRAPHY / LOGO",
          title: "Noto Serif + Manrope",
          description: "Một khối preview mô phỏng hệ chữ và logo placement.",
          variant: "ink",
          note: "Replace /public/logo.png and /public/logo-white-transparent.png"
        }
      },
      {
        eyebrow: "BẢNG MÀU",
        title: "Navy, gold, and warm paper tone.",
        description:
          "Màu sắc đi theo ngôn ngữ của heritage: nền ấm, mực tối, và gold dùng như một điểm nhấn vừa đủ để tạo cảm giác premium.",
        bullets: [
          "Ink làm nền cho các section tối và footer.",
          "Gold dùng cho nút, nhãn, và các điểm chạm quan trọng.",
          "Paper giữ bề mặt sáng để nội dung không bị nặng nề.",
          "Mọi gradient đều rất nhẹ để tránh cảm giác lòe loẹt."
        ],
        visual: {
          label: "PALETTE",
          title: "Ink / Gold / Paper",
          description: "Ba lớp nền màu chủ đạo của toàn bộ website.",
          variant: "paper",
          chips: ["#000c1e", "#c5a059", "#fdfbf7"]
        },
        reverse: true
      }
    ],
    cardSections: [
      {
        eyebrow: "CÁC CHI TIẾT THƯƠNG HIỆU",
        title: "Những phần nên giữ nhất quán trên toàn bộ website.",
        description: "Bốn card này mô tả các yếu tố cần áp dụng đồng đều.",
        cards: [
          {
            kicker: "LOGO",
            title: "Logo chính và logo nền tối",
            description: "Dùng bản sáng cho nền tối và bản tối cho nền giấy.",
            meta: "Slot asset: public/logo*.png"
          },
          {
            kicker: "TYPOGRAPHY",
            title: "Serif headline, sans body",
            description: "Tạo cảm giác khách sạn boutique, có chiều sâu và rõ trật tự."
          },
          {
            kicker: "TONE",
            title: "Ít lời, nhiều khoảng thở",
            description: "Câu chữ ngắn, giàu hình dung và không làm giao diện nặng nề."
          },
          {
            kicker: "MOTION",
            title: "Hover nhẹ, không màu mè",
            description: "Chuyển động chỉ nên hỗ trợ, không lấn át trải nghiệm đọc."
          }
        ]
      }
    ],
    timelineSection: {
      eyebrow: "TRIỂN KHAI THƯƠNG HIỆU",
      title: "Quy trình áp dụng nhận diện vào website.",
      description: "Chuỗi mốc bên dưới là một roadmap tĩnh, phù hợp để team nội bộ bám theo.",
      items: [
        {
          step: "01",
          title: "Thay logo và xác nhận tone",
          description: "Đổi asset trong /public rồi kiểm tra lại độ tương phản trên header và footer."
        },
        {
          step: "02",
          title: "Chốt palette và type scale",
          description: "Giữ serif cho tiêu đề, sans cho body, và một lớp gold vừa đủ để làm điểm nhấn."
        },
        {
          step: "03",
          title: "Đẩy template sang các trang phụ",
          description: "Áp layout hero, split section, card grid và footer cho toàn bộ site."
        }
      ]
    },
    closingSection: {
      eyebrow: "NHẬN DIỆN",
      title: "Nếu bạn chỉ muốn thay logo, template này đã sẵn sàng.",
      description:
        "Chỉ cần thay file logo trong public và cập nhật text placeholder là toàn bộ hệ thống vẫn giữ được cảm giác cao cấp.",
      cta: { label: "Xem trang chủ", href: "/" },
      secondaryCta: { label: "Xem liên hệ", href: "/lien-he" }
    }
  },
  {
    slug: "/chi-nhanh",
    title: "Chi nhánh",
    description: "Trang chi nhánh với các khối địa điểm, giờ mở cửa và placeholder cho ảnh ngoại cảnh hoặc bản đồ.",
    hero: {
      layout: "split",
      eyebrow: "BRANCHES",
      title: "Mỗi chi nhánh có cùng tinh thần, nhưng một nhịp riêng.",
      description:
        "Dựng sẵn khung để bạn giới thiệu từng cơ sở: trung tâm, ven sông, sân bay, hoặc bất kỳ địa điểm nào bạn muốn.",
      primaryCta: { label: "Liên hệ đặt phòng", href: "/lien-he" },
      secondaryCta: { label: "Xem dịch vụ", href: "/dich-vu" },
      visual: {
        label: "LOCATION PREVIEW",
        title: "Ảnh ngoại cảnh / bản đồ",
        description: "Placeholder cho mặt tiền khách sạn hoặc bản đồ định vị.",
        variant: "ink",
        chips: ["City", "Riverside", "Airport"]
      }
    },
    metrics: [
      { value: "03", label: "Không gian mẫu", detail: "Trung tâm, ven sông, sân bay" },
      { value: "24/7", label: "Hỗ trợ lưu trú", detail: "Khung giờ tiếp nhận thông tin mẫu" },
      { value: "10", label: "Phút phản hồi", detail: "Placeholder cho SLA nội bộ" }
    ],
    splitSections: [
      {
        eyebrow: "BẢN ĐỒ",
        title: "Mỗi địa điểm nên nhìn cùng một ngôn ngữ, nhưng khác câu chuyện.",
        description:
          "Chi nhánh trung tâm có thể đẩy mạnh tính tiện nghi, chi nhánh ven sông nhấn vào thư giãn, còn chi nhánh sân bay ưu tiên tốc độ và sự mạch lạc.",
        bullets: [
          "Khối thông tin mỗi chi nhánh gồm tên, khu vực, giờ hoạt động và một mô tả ngắn.",
          "Ảnh có thể là mặt tiền, lobby, hoặc ảnh lifestyle tùy theo vị trí.",
          "Tất cả đều dùng chung header, footer và hệ nút để giữ độ đồng nhất.",
          "Trang này sẵn cho bạn nối dữ liệu từ CMS sau này."
        ],
        visual: {
          label: "MAP / ADDRESS",
          title: "Bản đồ và thông tin liên hệ",
          description: "Một khung lớn để đặt bản đồ hoặc ảnh định vị.",
          variant: "paper",
          note: "Replace with map embed later"
        },
        reverse: true
      }
    ],
    cardSections: [
      {
        eyebrow: "DANH SÁCH CHI NHÁNH",
        title: "Ba card mẫu cho ba điểm đến.",
        description: "Bạn có thể nhân bản các card này và đổi nội dung theo từng cơ sở.",
        cards: [
          {
            kicker: "CENTRAL",
            title: "SK Boutique Hotel Central",
            description: "Phục vụ khách công tác, city break và các chuyến lưu trú ngắn.",
            meta: "Quận trung tâm · 08:00 - 22:00"
          },
          {
            kicker: "RIVERSIDE",
            title: "SK Boutique Hotel Riverside",
            description: "Tập trung vào trải nghiệm thư giãn, ánh sáng tự nhiên và không gian mở.",
            meta: "Ven sông · 24/7"
          },
          {
            kicker: "AIRPORT",
            title: "SK Boutique Hotel Airport",
            description: "Khung template cho điểm dừng nhanh, tiện di chuyển và check-in gọn.",
            meta: "Khu vực sân bay · 24/7"
          }
        ]
      }
    ],
    closingSection: {
      eyebrow: "ĐỊA ĐIỂM",
      title: "Sẵn sàng thêm bao nhiêu chi nhánh cũng được.",
      description:
        "Khung hiện tại chỉ là placeholder, nhưng cấu trúc đã đủ để bạn mở rộng mà không cần thay đổi layout.",
      cta: { label: "Quay về trang chủ", href: "/" },
      secondaryCta: { label: "Xem ưu đãi", href: "/uu-dai" }
    }
  },
  {
    slug: "/uu-dai",
    title: "Ưu đãi",
    description: "Trang ưu đãi cho các gói lưu trú, voucher, và chiến dịch theo mùa của khách sạn.",
    hero: {
      layout: "split",
      eyebrow: "OFFERS",
      title: "Gói ưu đãi được dựng như một bộ sưu tập nhỏ, không phải banner khô cứng.",
      description:
        "Thiết kế này cho phép bạn đưa lên các gói phòng, deal cuối tuần, long stay, hoặc ưu đãi sinh nhật mà vẫn giữ cảm giác sang.",
      primaryCta: { label: "Đặt ngay", href: "/lien-he" },
      secondaryCta: { label: "Hỗ trợ", href: "/ho-tro" },
      visual: {
        label: "PROMO COVER",
        title: "Banner ưu đãi / cover mùa",
        description: "Placeholder cho ảnh campaign, phòng suite hoặc hero banner.",
        variant: "gold",
        chips: ["Weekend", "Long stay", "Seasonal"]
      }
    },
    metrics: [
      { value: "04", label: "Gói mẫu", detail: "Weekend, long stay, birthday, early bird" },
      { value: "02", label: "Mùa campaign", detail: "Có thể đổi theo quý hoặc theo lễ" },
      { value: "24h", label: "Khung ưu đãi", detail: "Placeholder cho thời hạn chiến dịch" }
    ],
    splitSections: [
      {
        eyebrow: "CÁCH TRÌNH BÀY",
        title: "Ưu đãi nên nhìn như một bộ editorial ngắn.",
        description:
          "Mỗi deal có ảnh lớn, tiêu đề rõ và vài dòng mô tả để khách hiểu nhanh lợi ích. Các tag nhỏ ở góc giữ cảm giác premium thay vì quảng cáo dày đặc.",
        bullets: [
          "Một deal chỉ cần nêu rõ tên gói, thời hạn và vài quyền lợi chính.",
          "Card dùng màu nền giấy và gold để nổi bật nhưng không quá gắt.",
          "Khu vực CTA có thể dẫn thẳng sang form liên hệ hoặc đặt phòng.",
          "Bạn có thể thay ảnh bằng cover campaign hoặc lifestyle shot."
        ],
        visual: {
          label: "SEASONAL CAMPAIGN",
          title: "Ảnh phòng / voucher / campaign",
          description: "Một placeholder lớn cho mặt visual của chiến dịch.",
          variant: "paper",
          note: "Use this space for offer imagery"
        }
      }
    ],
    cardSections: [
      {
        eyebrow: "DANH SÁCH DEAL",
        title: "Bốn gói mẫu cho các mục đích khác nhau.",
        description: "Mỗi card có thể đổi thành một chương trình khuyến mãi thực tế.",
        cards: [
          {
            kicker: "WEEKEND",
            title: "Kỳ nghỉ cuối tuần",
            description: "Áp dụng cho hai đêm lưu trú, check-in linh hoạt, và một quyền lợi nhỏ.",
            meta: "Valid until 31/12"
          },
          {
            kicker: "LONG STAY",
            title: "Lưu trú dài ngày",
            description: "Phù hợp với khách công tác hoặc khách ở lâu hơn một tuần.",
            meta: "From 7 nights"
          },
          {
            kicker: "BIRTHDAY",
            title: "Gói sinh nhật",
            description: "Thêm hoa, bánh hoặc một yếu tố chúc mừng trong phòng.",
            meta: "Gift-ready template"
          },
          {
            kicker: "EARLY BIRD",
            title: "Đặt sớm",
            description: "Tặng mức giá tốt hơn cho khách chốt phòng trước một khoảng thời gian.",
            meta: "Book ahead"
          }
        ]
      }
    ],
    faqSection: {
      eyebrow: "CÂU HỎI THƯỜNG GẶP",
      title: "Bố cục sẵn cho phần điều khoản ngắn.",
      description: "Dùng để giải thích ưu đãi mà không làm người xem phải rời khỏi trang.",
      items: [
        {
          question: "Các ưu đãi này có thể thay theo mùa không?",
          answer: "Có. Đây chỉ là placeholder tĩnh nên bạn có thể đổi tên gói, thời hạn và quyền lợi bất cứ lúc nào."
        },
        {
          question: "Có thể thêm ảnh riêng cho từng deal không?",
          answer: "Có. Mỗi card đã có vùng visual để bạn thay bằng ảnh campaign hoặc ảnh phòng."
        },
        {
          question: "CTA nên dẫn về đâu?",
          answer: "Thông thường là trang liên hệ hoặc một form đặt phòng ngắn gọn."
        }
      ]
    },
    closingSection: {
      eyebrow: "KHUYẾN MÃI",
      title: "Mọi ưu đãi đều có thể đổi, nhưng cấu trúc template thì giữ nguyên.",
      description:
        "Đây là khung hợp lý để đội marketing thay headline, thời hạn và asset mà không phải đụng lại layout.",
      cta: { label: "Gửi yêu cầu", href: "/lien-he" },
      secondaryCta: { label: "Hỗ trợ", href: "/ho-tro" }
    }
  },
  {
    slug: "/dich-vu",
    title: "Dịch vụ",
    description: "Trang mô tả dịch vụ khách sạn theo phong cách boutique, gọn gàng và giàu cảm giác chạm.",
    hero: {
      layout: "split",
      eyebrow: "SERVICES",
      title: "Dịch vụ được trình bày như một trải nghiệm, không phải danh sách khô.",
      description:
        "Từ concierge đến dining, từ spa đến transfer, mỗi nhóm dịch vụ đều có chỗ cho headline lớn và card mô tả ngắn.",
      primaryCta: { label: "Đặt phòng", href: "/lien-he" },
      secondaryCta: { label: "Chi nhánh", href: "/chi-nhanh" },
      visual: {
        label: "SERVICE LAYER",
        title: "Spa / dining / concierge",
        description: "Placeholder cho các hình dịch vụ hoặc môi trường sử dụng.",
        variant: "ink",
        chips: ["Spa", "Dining", "Transfer"]
      }
    },
    metrics: [
      { value: "24/7", label: "Concierge", detail: "Hỗ trợ khách theo khung giờ mẫu" },
      { value: "04", label: "Nhóm dịch vụ", detail: "Lưu trú, ẩm thực, chăm sóc, di chuyển" },
      { value: "01", label: "Trải nghiệm", detail: "Một lối trình bày xuyên suốt" },
      { value: "∞", label: "Khả năng mở rộng", detail: "Có thể nối thêm data sau này" }
    ],
    splitSections: [
      {
        eyebrow: "PHONG CÁCH PHỤC VỤ",
        title: "Dịch vụ tốt thường không ồn ào, mà chuẩn chỉ ở từng điểm chạm.",
        description:
          "Phần nội dung này cho bạn khung để mô tả cách khách được tiếp đón, chăm sóc và hỗ trợ trong suốt hành trình lưu trú.",
        bullets: [
          "Concierge có thể mô tả đặt bàn, gợi ý hành trình hoặc xử lý yêu cầu nhỏ.",
          "Dining dùng cho breakfast, lounge, afternoon tea hoặc private dinner.",
          "Spa và wellness có thể là khối riêng nếu khách sạn có dịch vụ chăm sóc cơ thể.",
          "Transfer và vận chuyển nên được đặt rõ ở cuối để khách dễ ra quyết định."
        ],
        visual: {
          label: "GUEST JOURNEY",
          title: "Từ check-in đến check-out",
          description: "Một khung lớn để mô tả hành trình khách lưu trú.",
          variant: "gold",
          note: "Service imagery placeholder"
        },
        reverse: true
      }
    ],
    cardSections: [
      {
        eyebrow: "DANH MỤC DỊCH VỤ",
        title: "Bốn card dịch vụ mẫu.",
        description: "Mỗi card đủ chỗ cho headline, một đoạn mô tả ngắn và một ghi chú.",
        cards: [
          {
            kicker: "CONCIERGE",
            title: "Hỗ trợ khách 24/7",
            description: "Dùng để mô tả các yêu cầu đặc biệt, đặt chỗ và hỗ trợ nhanh.",
            meta: "At your service"
          },
          {
            kicker: "DINING",
            title: "Ẩm thực và lounge",
            description: "Khung cho bữa sáng, phục vụ tại phòng hoặc một lounge nhỏ.",
            meta: "Breakfast / lounge"
          },
          {
            kicker: "WELLNESS",
            title: "Spa và thư giãn",
            description: "Dành cho massage, chăm sóc da hoặc một chương trình wellness.",
            meta: "Calm & restorative"
          },
          {
            kicker: "TRANSFER",
            title: "Di chuyển thuận tiện",
            description: "Dịch vụ đón tiễn sân bay hoặc sắp xếp phương tiện theo yêu cầu.",
            meta: "Airport-ready"
          }
        ]
      }
    ],
    timelineSection: {
      eyebrow: "TRẢI NGHIỆM KHÁCH HÀNG",
      title: "Một hành trình mạch lạc từ lúc chạm trang đến lúc nhận phòng.",
      description: "Roadmap mẫu này giúp bạn trình bày quy trình dịch vụ theo từng bước.",
      items: [
        {
          step: "01",
          title: "Khách chọn dịch vụ",
          description: "Từ trang dịch vụ hoặc ưu đãi, khách thấy được các lựa chọn chính."
        },
        {
          step: "02",
          title: "Concierge tiếp nhận",
          description: "Mọi yêu cầu đi qua một điểm tiếp nhận rõ ràng và dễ theo dõi."
        },
        {
          step: "03",
          title: "Dịch vụ được thực thi",
          description: "Khung template có thể mở rộng cho quy trình nội bộ sau này."
        },
        {
          step: "04",
          title: "Theo dõi sau trải nghiệm",
          description: "Đây là chỗ thích hợp để thêm feedback hoặc chăm sóc sau lưu trú."
        }
      ]
    },
    closingSection: {
      eyebrow: "DỊCH VỤ",
      title: "Mọi dịch vụ đều có thể thay đổi, nhưng template này đã sẵn cho việc mở rộng.",
      description:
        "Chỉ cần thay nội dung và ảnh là trang dịch vụ có thể dùng ngay cho một khách sạn boutique thực thụ.",
      cta: { label: "Liên hệ", href: "/lien-he" },
      secondaryCta: { label: "Xem hỗ trợ", href: "/ho-tro" }
    }
  },
  {
    slug: "/about-us",
    title: "Về chúng tôi",
    description: "Trang về chúng tôi với câu chuyện thương hiệu, mốc thời gian và giá trị cốt lõi.",
    hero: {
      layout: "split",
      eyebrow: "ABOUT US",
      title: "Một câu chuyện nhỏ về sự chăm chút lớn.",
      description:
        "Khối nội dung này kể lại tinh thần SK Boutique Hotel theo kiểu editorial: ngắn, rõ, giàu hình ảnh và đủ sâu để tạo niềm tin.",
      primaryCta: { label: "Liên hệ", href: "/lien-he" },
      secondaryCta: { label: "Chi nhánh", href: "/chi-nhanh" },
      visual: {
        label: "HERITAGE TIMELINE",
        title: "Di sản, con người và sự tinh gọn",
        description: "Placeholder cho ảnh kiến trúc hoặc trang lịch sử.",
        variant: "paper",
        chips: ["2020", "2022", "2024"]
      }
    },
    metrics: [
      { value: "2020", label: "Khởi đầu", detail: "Một mốc thời gian phù hợp với tag ETS.2020" },
      { value: "03", label: "Giá trị cốt lõi", detail: "Tinh tế, riêng tư, nhất quán" },
      { value: "01", label: "Tầm nhìn", detail: "Giữ trải nghiệm boutique ở mọi điểm chạm" },
      { value: "∞", label: "Khách hàng", detail: "Template mở rộng được cho nhiều phân khúc" }
    ],
    splitSections: [
      {
        eyebrow: "CÂU CHUYỆN",
        title: "Khách sạn boutique sống bằng cảm giác, không chỉ bằng phòng ngủ.",
        description:
          "Từ thiết kế tới cách nói chuyện, mọi thứ đều nên cùng chung một ngôn ngữ: ấm, gọn, và có chủ đích.",
        bullets: [
          "Chúng tôi đặt trải nghiệm thị giác lên trước để tạo ấn tượng đầu tiên tốt.",
          "Sau đó là dịch vụ và sự nhất quán, vì đó mới là điều khách nhớ lâu.",
          "Website được viết như một ấn phẩm nhỏ: ít chữ thừa, nhiều không gian cho hình ảnh.",
          "Mỗi section đều có thể thay thành dữ liệu thật mà không cần đập lại giao diện."
        ],
        visual: {
          label: "FOUNDING STORY",
          title: "Tập trung vào cảm giác chạm",
          description: "Khung lớn cho hình ảnh lịch sử, mặt tiền hoặc bản vẽ.",
          variant: "ink",
          note: "Add heritage imagery here"
        }
      },
      {
        eyebrow: "GIÁ TRỊ",
        title: "Sự tinh tế đến từ chi tiết nhỏ.",
        description:
          "Ba giá trị dưới đây có thể được dùng làm nội dung thương hiệu hoặc trong phần giới thiệu ngắn.",
        bullets: [
          "Tinh tế: mọi thứ đều có lý do tồn tại, không có chi tiết thừa.",
          "Riêng tư: không gian và ngôn từ đều giữ một khoảng cách lịch thiệp.",
          "Nhất quán: từ header đến footer đều cùng một nhịp thị giác."
        ],
        visual: {
          label: "VALUE SYSTEM",
          title: "Tĩnh, gọn, và đáng nhớ",
          description: "Một khối minimal để chèn ảnh đội ngũ hoặc không gian.",
          variant: "gold",
          chips: ["Quiet luxury", "Editorial", "Boutique"]
        },
        reverse: true
      }
    ],
    cardSections: [
      {
        eyebrow: "CỐT LÕI",
        title: "Bốn giá trị có thể dùng làm nội dung thương hiệu.",
        description: "Mỗi card phù hợp cho phần About, Brand hoặc một slide giới thiệu.",
        cards: [
          {
            kicker: "CRAFT",
            title: "Chăm chút",
            description: "Mỗi điểm chạm đều được xử lý như một phần của trải nghiệm.",
            meta: "Detail first"
          },
          {
            kicker: "CALM",
            title: "Tĩnh lặng",
            description: "Không gian, màu sắc và chữ viết đều ưu tiên cảm giác thư giãn.",
            meta: "Quiet luxury"
          },
          {
            kicker: "SERVICE",
            title: "Phục vụ",
            description: "Chuẩn mực dịch vụ phải xuất hiện ngay từ giao diện.",
            meta: "Human-first"
          },
          {
            kicker: "CONSISTENCY",
            title: "Nhất quán",
            description: "Mọi trang phụ đều đi cùng một hệ nhận diện, không đứt gãy.",
            meta: "One language"
          }
        ]
      }
    ],
    timelineSection: {
      eyebrow: "MỐC THỜI GIAN",
      title: "Một timeline ngắn để kể câu chuyện phát triển.",
      description: "Khung này đủ cho những khách sạn muốn giới thiệu quá trình hình thành.",
      items: [
        {
          step: "2020",
          title: "Khởi dựng SK Boutique Hotel",
          description: "Nền tảng thương hiệu bắt đầu bằng một tinh thần boutique rõ ràng."
        },
        {
          step: "2022",
          title: "Hoàn thiện trải nghiệm khách",
          description: "Chuẩn hóa chào đón, phòng ở và những chi tiết nhỏ trong lưu trú."
        },
        {
          step: "2024",
          title: "Mở rộng danh mục dịch vụ",
          description: "Thêm các lớp nội dung mới cho dining, wellness và hỗ trợ."
        },
        {
          step: "2026",
          title: "Đưa template lên website",
          description: "Bộ khung UI hiện tại được dựng để bạn triển khai nhanh hơn."
        }
      ]
    },
    closingSection: {
      eyebrow: "CÂU CHUYỆN THƯƠNG HIỆU",
      title: "Một câu chuyện đủ ngắn để nhớ, đủ rõ để tin.",
      description:
        "Bạn có thể thay phần này bằng nội dung thật về lịch sử, đội ngũ và triết lý phục vụ của khách sạn.",
      cta: { label: "Xem liên hệ", href: "/lien-he" },
      secondaryCta: { label: "Xem tuyển dụng", href: "/tuyen-dung" }
    }
  },
  {
    slug: "/lien-he",
    title: "Liên hệ",
    description: "Trang liên hệ cho khách sạn với form mẫu, thông tin mẫu và khối hỗ trợ rõ ràng.",
    hero: {
      layout: "split",
      eyebrow: "CONTACT",
      title: "Khi cần đặt phòng hoặc hỏi thêm, đây là nơi bắt đầu.",
      description:
        "Trang liên hệ được giữ gọn và dễ đọc, để khách tìm hotline, email, giờ làm việc hoặc gửi yêu cầu chỉ trong vài giây.",
      primaryCta: { label: "Gửi yêu cầu", href: "/lien-he" },
      secondaryCta: { label: "Hỗ trợ", href: "/ho-tro" },
      visual: {
        label: "RECEPTION / MAP",
        title: "Map / lễ tân / hotline",
        description: "Placeholder cho bản đồ, ảnh quầy lễ tân hoặc một vùng hero nhỏ.",
        variant: "paper",
        chips: ["Hotline", "Email", "Map"]
      }
    },
    metrics: [
      { value: "24/7", label: "Hotline", detail: "Khung hỗ trợ mẫu theo ca" },
      { value: "08:00", label: "Giờ mở cửa", detail: "Điều chỉnh tùy theo khách sạn" },
      { value: "03", label: "Kênh chính", detail: "Phone, email, form" }
    ],
    splitSections: [
      {
        eyebrow: "THÔNG TIN NHANH",
        title: "Một khối liên hệ rõ ràng giúp khách quyết định nhanh hơn.",
        description:
          "Từ vị trí đến thời gian làm việc, tất cả nên nằm ngay trước mắt người xem mà không cần cuộn quá nhiều.",
        bullets: [
          "Thông tin liên hệ có thể đặt ở dạng card hoặc danh sách để dễ scan.",
          "Form nên ngắn, tập trung vào tên, email, số điện thoại và nhu cầu.",
          "Bạn có thể gắn Google Maps hoặc một embed bản đồ ở vùng visual.",
          "Nếu cần, phần này hoàn toàn có thể kết nối backend hoặc service email."
        ],
        visual: {
          label: "ADDRESS BLOCK",
          title: "Bản đồ / địa chỉ / lễ tân",
          description: "Một khung đủ lớn cho map hoặc ảnh sảnh đón khách.",
          variant: "ink",
          note: "Replace with map embed later"
        }
      }
    ],
    contactSection: {
      eyebrow: "GỬI YÊU CẦU",
      title: "Một form mẫu ngắn gọn để khách đặt câu hỏi.",
      description: "Đây là nơi bạn nối form thật khi sẵn sàng.",
      details: [
        { label: "Hotline", value: siteInfo.phone, href: "tel:+84908233583" },
        { label: "Zalo", value: siteInfo.zalo, href: "https://zalo.me/0908233583" },
        { label: "Facebook", value: "SK Boutique Hotel", href: siteInfo.facebook },
        { label: "Email", value: siteInfo.email, href: `mailto:${siteInfo.email}` },
        { label: "Địa điểm", value: siteInfo.address },
        { label: "Giờ làm việc", value: "08:00 - 22:00" }
      ],
      formTitle: "Gửi tin nhắn",
      formFields: [
        { label: "Họ và tên", placeholder: "Nhập tên của bạn", type: "text" },
        { label: "Email", placeholder: "you@example.com", type: "email" },
        { label: "Số điện thoại", placeholder: "+84 9x xxx xxxx", type: "tel" },
        { label: "Nội dung", placeholder: "Hãy cho chúng tôi biết bạn cần gì", type: "textarea" }
      ]
    },
    faqSection: {
      eyebrow: "CÂU HỎI NHANH",
      title: "Một vài câu trả lời ngắn trước khi khách liên hệ.",
      description: "Phần FAQ giúp giảm số lần phải gọi lại cho các câu hỏi cơ bản.",
      items: [
        {
          question: "Bao lâu thì khách sạn phản hồi?",
          answer: "Khung mẫu hiện để sẵn 24/7, nhưng bạn có thể đổi thành thời gian thực tế của team."
        },
        {
          question: "Có thể thay form này bằng widget đặt phòng không?",
          answer: "Có. Form hiện là placeholder tĩnh và có thể thay bằng booking engine sau này."
        },
        {
          question: "Địa chỉ có đang là dữ liệu thật không?",
          answer: "Không. Đây là địa chỉ mẫu để giữ giao diện hoàn chỉnh trong lúc chưa nối data thật."
        },
        {
          question: "Tôi có thể đổi logo ở đâu?",
          answer: "Chỉ cần thay các file logo trong thư mục /public, header và footer sẽ tự dùng asset mới."
        }
      ]
    },
    closingSection: {
      eyebrow: "LIÊN HỆ",
      title: "Một khối liên hệ sạch sẽ luôn làm website khách sạn trông đáng tin hơn.",
      description:
        "Bạn có thể giữ nguyên layout này và thay text placeholder bằng thông tin thật của khách sạn.",
      cta: { label: "Xem hỗ trợ", href: "/ho-tro" },
      secondaryCta: { label: "Quay về trang chủ", href: "/" }
    }
  },
  {
    slug: "/tuyen-dung",
    title: "Tuyển dụng",
    description: "Trang tuyển dụng cho khách sạn với danh sách vị trí, văn hóa làm việc và lộ trình ứng tuyển.",
    hero: {
      layout: "split",
      eyebrow: "CAREERS",
      title: "Một nơi làm việc chuyên nghiệp, tinh tế và đáng để gắn bó.",
      description:
        "Template này giúp bạn giới thiệu văn hóa, cơ hội nghề nghiệp và quy trình ứng tuyển trong cùng một phong cách với phần còn lại của site.",
      primaryCta: { label: "Ứng tuyển", href: "/lien-he" },
      secondaryCta: { label: "Về chúng tôi", href: "/about-us" },
      visual: {
        label: "TEAM / CULTURE",
        title: "Đội ngũ và môi trường làm việc",
        description: "Placeholder cho ảnh team, behind-the-scenes hoặc workspace.",
        variant: "gold",
        chips: ["Growth", "Culture", "Training"]
      }
    },
    metrics: [
      { value: "04", label: "Nhóm vai trò", detail: "Front office, housekeeping, F&B, support" },
      { value: "03", label: "Giá trị", detail: "Tôn trọng, học hỏi, nhất quán" },
      { value: "01", label: "Quy trình", detail: "Một đường dẫn ứng tuyển rõ ràng" }
    ],
    splitSections: [
      {
        eyebrow: "VĂN HÓA LÀM VIỆC",
        title: "Cần một nơi vừa chỉn chu vừa đủ ấm để làm việc.",
        description:
          "Trang tuyển dụng nên giúp ứng viên hiểu ngay cảm giác làm việc trong khách sạn: nhịp nhanh, chi tiết nhiều nhưng luôn có sự tôn trọng.",
        bullets: [
          "Công việc được mô tả rõ vai trò, trách nhiệm và quy mô ca làm.",
          "Mỗi vị trí nên có một card riêng để người xem dễ scan.",
          "Bạn có thể gắn link ứng tuyển hoặc email tuyển dụng sau này.",
          "Nếu cần, khối timeline có thể thay bằng quy trình tuyển dụng thực tế."
        ],
        visual: {
          label: "WORKPLACE SNAPSHOT",
          title: "Ảnh đội ngũ / workspace",
          description: "Một vùng hero để đặt ảnh đời sống nội bộ hoặc team building.",
          variant: "paper",
          note: "Replace with team photography"
        }
      }
    ],
    cardSections: [
      {
        eyebrow: "VỊ TRÍ MỞ",
        title: "Bốn card mẫu cho các vị trí phổ biến trong khách sạn.",
        description: "Bạn có thể đổi title, mô tả và mức độ ưu tiên của từng vị trí.",
        cards: [
          {
            kicker: "FRONT OFFICE",
            title: "Guest Relations / Reception",
            description: "Tiếp nhận khách, hỗ trợ check-in và giữ cảm giác chuyên nghiệp.",
            meta: "Full-time template"
          },
          {
            kicker: "HOUSEKEEPING",
            title: "Housekeeping / Room Care",
            description: "Chăm sóc phòng ở, kiểm tra chuẩn mực và tính chỉn chu.",
            meta: "Shift-based"
          },
          {
            kicker: "F&B",
            title: "Restaurant / Lounge Service",
            description: "Phục vụ ẩm thực và hỗ trợ trải nghiệm ăn uống của khách.",
            meta: "Service-minded"
          },
          {
            kicker: "SUPPORT",
            title: "Operations / Admin / Finance",
            description: "Các vị trí hậu trường giữ cho toàn bộ vận hành trơn tru.",
            meta: "Cross-functional"
          }
        ]
      }
    ],
    timelineSection: {
      eyebrow: "QUY TRÌNH ỨNG TUYỂN",
      title: "Ứng viên nên biết rõ điều gì sẽ diễn ra tiếp theo.",
      description: "Một timeline ngắn làm cho trang tuyển dụng trông đáng tin hơn.",
      items: [
        {
          step: "01",
          title: "Gửi CV hoặc form",
          description: "Ứng viên để lại thông tin cơ bản và vị trí muốn ứng tuyển."
        },
        {
          step: "02",
          title: "Sàng lọc hồ sơ",
          description: "Đội tuyển dụng xem nhanh độ phù hợp và liên hệ lại."
        },
        {
          step: "03",
          title: "Phỏng vấn",
          description: "Thảo luận về kinh nghiệm, ca làm và định hướng phát triển."
        },
        {
          step: "04",
          title: "Onboarding",
          description: "Nếu phù hợp, ứng viên được chào đón vào đội ngũ khách sạn."
        }
      ]
    },
    closingSection: {
      eyebrow: "TUYỂN DỤNG",
      title: "Dùng template này để làm trang nghề nghiệp thật sự đồng nhất với brand.",
      description:
        "Chỉ cần thay nội dung là bạn có thể dùng ngay cho các vị trí đang mở hoặc chiến dịch tuyển dụng sau này.",
      cta: { label: "Liên hệ tuyển dụng", href: "/lien-he" },
      secondaryCta: { label: "Hỗ trợ", href: "/ho-tro" }
    }
  },
  {
    slug: "/ho-tro",
    title: "Hỗ trợ",
    description: "Trang hỗ trợ khách lưu trú và khách đang xem xét đặt phòng với FAQ, kênh liên hệ và câu trả lời nhanh.",
    hero: {
      layout: "split",
      eyebrow: "SUPPORT",
      title: "Một nơi để hỏi nhanh, nhận câu trả lời rõ, và tiếp tục hành trình.",
      description:
        "Khung này phù hợp cho FAQ, các kênh hỗ trợ, và những câu hỏi lặp lại mà khách hay gửi trước khi đặt phòng.",
      primaryCta: { label: "Liên hệ", href: "/lien-he" },
      secondaryCta: { label: "Ưu đãi", href: "/uu-dai" },
      visual: {
        label: "HELP DESK",
        title: "FAQ / hotline / chat",
        description: "Placeholder cho một quầy hỗ trợ, icon chat hoặc ảnh giao diện help desk.",
        variant: "ink",
        chips: ["FAQ", "Hotline", "Email"]
      }
    },
    metrics: [
      { value: "24/7", label: "Kênh hỗ trợ", detail: "Khung mẫu cho hotline hoặc chat" },
      { value: "05", label: "Câu hỏi chính", detail: "Đặt phòng, giờ check-in, thay đổi lịch, dịch vụ, thanh toán" },
      { value: "10m", label: "Thời gian trả lời", detail: "Placeholder cho mục tiêu hỗ trợ" }
    ],
    splitSections: [
      {
        eyebrow: "KÊNH HỖ TRỢ",
        title: "Khách nên tìm thấy câu trả lời nhanh mà không phải gọi nhiều lần.",
        description:
          "Trang hỗ trợ được thiết kế như một trung tâm thông tin thu nhỏ: rõ ràng, gọn và có điểm chạm liên hệ ngay khi cần.",
        bullets: [
          "FAQ giúp giải đáp các câu hỏi lặp lại trước khi khách nhấc máy.",
          "Kênh liên hệ có thể là hotline, email, hoặc một form ngắn.",
          "Bạn có thể thêm chat widget hoặc ticket hệ thống sau này.",
          "Khối visual có thể thay bằng một ảnh sảnh lễ tân hoặc màn hình help desk."
        ],
        visual: {
          label: "ASSISTANCE",
          title: "Help desk / concierge / FAQ",
          description: "Khối placeholder để đặt ảnh hoặc một khung chat.",
          variant: "paper",
          note: "Support widget placeholder"
        }
      }
    ],
    faqSection: {
      eyebrow: "FAQ",
      title: "Những câu hỏi hay gặp nhất.",
      description: "Dùng bộ câu hỏi này như một nền tảng cho tài liệu hỗ trợ thực tế.",
      items: [
        {
          question: "Tôi có thể thay đổi ngày đến không?",
          answer: "Đây là placeholder nên bạn có thể sửa nội dung câu trả lời theo chính sách thực tế của khách sạn."
        },
        {
          question: "Giờ check-in và check-out là khi nào?",
          answer: "Mục này nên gắn số giờ thật của khách sạn, hiện tại chỉ là dữ liệu mẫu."
        },
        {
          question: "Khách sạn có nhận yêu cầu đặc biệt không?",
          answer: "Có thể dùng form liên hệ hoặc hotline để nhận các yêu cầu đặc biệt trước khi khách đến."
        },
        {
          question: "Tôi có thể hỏi qua email không?",
          answer: "Có. Email mẫu đã được đặt trong footer và trang liên hệ để bạn thay sau."
        },
        {
          question: "Logo của khách sạn đổi ở đâu?",
          answer: "Chỉ cần thay file logo trong thư mục /public, header và footer sẽ hiển thị thương hiệu mới."
        }
      ]
    },
    cardSections: [
      {
        eyebrow: "KÊNH HỖ TRỢ",
        title: "Ba card ngắn cho những cách liên hệ nhanh.",
        description: "Nội dung này có thể được nối sang hotline, email, hoặc live chat.",
        cards: [
          {
            kicker: "HOTLINE",
            title: "Gọi nhanh",
            description: "Phù hợp với khách cần phản hồi ngay hoặc thay đổi gấp.",
            meta: siteInfo.phone
          },
          {
            kicker: "EMAIL",
            title: "Gửi yêu cầu",
            description: "Dùng cho các câu hỏi chi tiết, đặt phòng, hoặc hỗ trợ sau lưu trú.",
            meta: siteInfo.email
          },
          {
            kicker: "CHAT",
            title: "Trao đổi nhanh",
            description: "Nếu bạn muốn thêm chat widget, đây là vị trí hợp lý để đặt.",
            meta: "Widget-ready"
          }
        ]
      }
    ],
    closingSection: {
      eyebrow: "TRỢ GIÚP",
      title: "Khi cần trợ giúp, khách chỉ cần một trang rõ ràng.",
      description:
        "Bố cục này đủ sạch để bạn triển khai FAQ thật, form thật, hoặc một hệ thống ticket sau này.",
      cta: { label: "Liên hệ", href: "/lien-he" },
      secondaryCta: { label: "Quay lại trang chủ", href: "/" }
    }
  }
];

export function findPageBySlug(slug: string) {
  const normalizedPath = slug === "" ? "/" : `/${slug.replace(/^\/+/, "")}`;

  return pages.find((page) => page.slug === normalizedPath);
}

export function getStaticRouteParams() {
  return pages
    .filter((page) => page.slug !== "/" && page.slug !== "/chi-nhanh" && page.slug !== "/about-us")
    .map((page) => ({
      slug: page.slug.replace(/^\//, "")
    }));
}
