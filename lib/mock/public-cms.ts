import type { LocalizedText } from "./i18n.ts";
import { buildMediaReference } from "../media/library.ts";

const text = (vi: string, en: string): LocalizedText => ({ vi, en });
const media = (collectionSlug: string, assetSlug: string, fallbackUrl: string) =>
  buildMediaReference(collectionSlug, assetSlug, fallbackUrl);

export type CmsTone = "ink" | "paper" | "gold";
export type CmsActionTone = "solid" | "ghost" | "text";

export type CmsAction = {
  href: string;
  label: LocalizedText;
  tone?: CmsActionTone;
};

export type CmsMediaFrame = {
  chips?: Array<string | LocalizedText>;
  description: LocalizedText;
  image?: string;
  imageAlt?: LocalizedText;
  label: LocalizedText;
  note?: LocalizedText;
  tone?: CmsTone;
  title: LocalizedText;
};

export type CmsHeroSlide = {
  image: string;
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  actions: {
    primary: CmsAction;
    secondary?: CmsAction;
  };
};

export type CmsStat = {
  detail: LocalizedText;
  label: LocalizedText;
  tone?: CmsTone;
  value: string | LocalizedText;
};

export type CmsCollectionItem = {
  image?: string;
  imageAlt?: LocalizedText;
  description: LocalizedText;
  href: string;
  meta: LocalizedText[];
  tone?: CmsTone;
  title: LocalizedText;
  eyebrow: LocalizedText;
};

export type CmsLocaleZone = {
  bullets: LocalizedText[];
  description: LocalizedText;
  note?: LocalizedText;
  title: LocalizedText;
  eyebrow: LocalizedText;
};

export type CmsPageSeo = {
  description: LocalizedText;
  title: LocalizedText;
};

type CmsSectionBase = {
  id: string;
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
};

export type CmsHeroSection = CmsSectionBase & {
  kind: "hero";
  layout?: "centered" | "split" | "carousel";
  actions: {
    primary: CmsAction;
    secondary?: CmsAction;
  };
  bullets: LocalizedText[];
  frame: CmsMediaFrame;
  slides?: CmsHeroSlide[];
};

export type CmsStatsSection = CmsSectionBase & {
  kind: "stats";
  items: CmsStat[];
};

export type CmsSplitSection = CmsSectionBase & {
  kind: "split";
  bullets: LocalizedText[];
  frame: CmsMediaFrame;
  reverse?: boolean;
};

export type CmsFeatureSection = CmsSectionBase & {
  kind: "feature";
  body: LocalizedText[];
  frames: [CmsMediaFrame, CmsMediaFrame];
  metrics: CmsStat[];
};

export type CmsCardsSection = CmsSectionBase & {
  kind: "cards";
  items: CmsCollectionItem[];
};

export type CmsAmenityItem = {
  icon?: "water";
  label: LocalizedText;
  value?: LocalizedText;
  display?: "check" | "text";
};

export type CmsAmenityGroup = {
  items: CmsAmenityItem[];
  title: LocalizedText;
};

export type CmsAmenitiesSection = CmsSectionBase & {
  kind: "amenities";
  groups: CmsAmenityGroup[];
};

export type CmsBandSection = CmsSectionBase & {
  kind: "band";
  actions: {
    primary: CmsAction;
    secondary?: CmsAction;
  };
};

export type CmsLocaleZonesSection = {
  id: string;
  kind: "locale-zones";
  description: LocalizedText;
  title: LocalizedText;
  zones: {
    en: CmsLocaleZone;
    vi: CmsLocaleZone;
  };
  eyebrow: LocalizedText;
};

export type CmsSection =
  | CmsHeroSection
  | CmsStatsSection
  | CmsSplitSection
  | CmsFeatureSection
  | CmsCardsSection
  | CmsAmenitiesSection
  | CmsBandSection
  | CmsLocaleZonesSection;

export type CmsPageCopy = {
  kind: "article" | "collection" | "detail" | "home";
  seo: CmsPageSeo;
  sections: CmsSection[];
  slug: string;
};

const premiumRoomFrame: CmsMediaFrame = {
  chips: ["Room type", "Physical room", "Manual hold"],
  description: text(
    "Một frame mô phỏng ảnh phòng và trạng thái CMS-ready.",
    "A frame that stands in for a room image and CMS-ready state."
  ),
  label: text("Room showcase", "Room showcase"),
  note: text(
    "Thay ảnh thật sau này mà không phải đổi cấu trúc.",
    "Swap in real imagery later without changing the structure."
  ),
  tone: "ink",
  title: text("A calm room story", "A calm room story")
};

const premiumBranchFrame: CmsMediaFrame = {
  chips: ["Branch", "Map-ready", "24/7 service"],
  description: text(
    "Frame mô phỏng chi nhánh, map, và điểm chạm vận hành.",
    "A frame for branch imagery, maps, and operational touchpoints."
  ),
  label: text("Branch overview", "Branch overview"),
  note: text(
    "Vùng này có thể map sang gallery hoặc Google Map về sau.",
    "This area can later map to a gallery or Google Map embed."
  ),
  tone: "gold",
  title: text("Arrival and access", "Arrival and access")
};

const premiumArticleFrame: CmsMediaFrame = {
  chips: ["News", "Editorial", "VI/EN"],
  description: text(
    "Frame mô phỏng hero của bài viết hoặc news story.",
    "A frame that stands in for a story or news hero."
  ),
  label: text("Story header", "Story header"),
  note: text(
    "Dùng để thay cover image hoặc editorial artwork.",
    "Use this for a cover image or editorial artwork."
  ),
  tone: "paper",
  title: text("Editorial hospitality", "Editorial hospitality")
};

const featureFrameLeft: CmsMediaFrame = {
  chips: ["About us", "Interiors", "Guest comfort"],
  description: text(
    "Khung cảnh ấm cúng, sang trọng và cảm giác boutique.",
    "A warm, premium frame with a distinct boutique mood."
  ),
  image: media("about-visuals", "about-visual-1", "/home/block.jpg"),
  imageAlt: text("Phòng khách boutique sáng và tinh tế", "A bright and refined boutique room"),
  label: text("SK stay story", "SK stay story"),
  note: text(
    "Có thể thay bằng ảnh thật của phòng, lobby hoặc dining zone.",
    "Can later become real photography for rooms, lobby, or dining zones."
  ),
  tone: "paper",
  title: text("Ấm, êm, sang trọng.", "Warm, calm, premium")
};

const featureFrameRight: CmsMediaFrame = {
  chips: ["Signature", "Detail", "Mood"],
  description: text(
    "Khung cảnh ấm cúng, sang trọng và cảm giác boutique.",
    "A warm, premium frame with a distinct boutique mood."
  ),
  image: media("about-visuals", "about-visual-2", "/home/block.jpg"),
  imageAlt: text("Không gian boutique với nhịp thị giác ấm", "A warm boutique space with layered visual rhythm"),
  label: text("Visual detail", "Visual detail"),
  note: text(
    "Vùng này vẫn map được sang gallery hoặc CMS media field sau này.",
    "This area can still map to gallery or CMS media fields later."
  ),
  tone: "gold",
  title: text("Ấm, êm, sang trọng.", "Warm, calm, premium")
};

const toCardItem = (
  href: string,
  eyebrow: LocalizedText,
  title: LocalizedText,
  description: LocalizedText,
  meta: LocalizedText[],
  tone: CmsTone = "paper",
  image?: string,
  imageAlt?: LocalizedText
): CmsCollectionItem => ({
  href,
  eyebrow,
  title,
  description,
  meta,
  tone,
  image,
  imageAlt
});

const amenityTextItem = (labelVi: string, labelEn: string, valueVi: string, valueEn: string): CmsAmenityItem => ({
  display: "text",
  label: text(labelVi, labelEn),
  value: text(valueVi, valueEn)
});

const amenityCheckItem = (labelVi: string, labelEn: string): CmsAmenityItem => ({
  display: "check",
  label: text(labelVi, labelEn)
});

const amenityWaterItem = (labelVi: string, labelEn: string): CmsAmenityItem => ({
  display: "check",
  icon: "water",
  label: text(labelVi, labelEn)
});

const roomItems: CmsCollectionItem[] = [
  toCardItem(
    "/phong/family-room",
    text("Phòng", "Room"),
    text("Family Room", "Family Room"),
    text(
      "Không gian rộng rãi, lý tưởng cho gia đình, kết hợp sự tiện nghi và riêng tư với tầm nhìn sân vườn & hồ bơi.",
      "Spacious and refined, perfect for families seeking comfort, privacy, and serene garden & pool views."
    ),
    [text("6 khách", "6 guests"), text("60 m²", "60 sqm"), text("From 1,700,000", "From 1,700,000")],
    "paper",
    "/home/bed1.jpg",
    text("Family Room", "Family Room")
  ),
  toCardItem(
    "/phong/superior-room",
    text("Phòng", "Room"),
    text("Superior Room", "Superior Room"),
    text(
      "Thiết kế tinh gọn, ấm cúng, phù hợp cho cặp đôi hoặc khách công tác, mang lại trải nghiệm nghỉ dưỡng nhẹ nhàng.",
      "A cozy, well-designed retreat ideal for couples or solo travelers looking for a calm, elegant stay."
    ),
    [text("3 khách", "3 guests"), text("25 m²", "25 sqm"), text("Từ 650,000đ", "From 650,000")],
    "gold",
    "/home/bed1.jpg",
    text("Superior Room", "Superior Room")
  ),
  toCardItem(
    "/phong/quadruple-room",
    text("Phòng", "Room"),
    text("Quadruple Room", "Quadruple Room"),
    text(
      "Lựa chọn linh hoạt cho nhóm bạn hoặc gia đình nhỏ, cân bằng giữa không gian, tiện nghi và chi phí.",
      "Flexible and comfortable, designed for small groups with a balance of space, functionality, and value."
    ),
    [text("5 khách", "5 guests"), text("35 m²", "35 sqm"), text("From 1,300,000", "From 1,300,000")],
    "ink",
    "/home/bed1.jpg",
    text("Quadruple Room", "Quadruple Room")
  )
];

const homeRoomItems: CmsCollectionItem[] = roomItems.map((item, index) => ({
  ...item,
  image: [
    media("room-family", "cover-1", "/home/bed1.jpg"),
    media("room-superior", "cover-1", "/home/bed1.jpg"),
    media("room-quadruple", "cover-1", "/home/bed1.jpg")
  ][index],
  imageAlt: item.title,
}));

const branchItems: CmsCollectionItem[] = [
  toCardItem(
    "/chi-nhanh/central-district",
    text("Chi nhánh", "Branch"),
    text("Central District", "Central District"),
    text(
      "Trục vận hành chính với khu check-in nhanh, phòng tiêu chuẩn và dịch vụ concierge.",
      "The main operating branch with fast check-in, standard rooms, and concierge service."
    ),
    [text("Quận trung tâm", "Central district"), text("24/7", "24/7"), text("Map-ready", "Map-ready")],
    "ink"
  ),
  toCardItem(
    "/chi-nhanh/riverside",
    text("Chi nhánh", "Branch"),
    text("Riverside", "Riverside"),
    text(
      "Chi nhánh nhiều ánh sáng tự nhiên, phù hợp cho khách thích nhịp thư giãn hơn.",
      "A brighter branch suited to guests who want a calmer pace."
    ),
    [text("Bến sông", "Riverside"), text("Breakfast", "Breakfast"), text("Spa access", "Spa access")],
    "gold"
  )
];

const articleItems: CmsCollectionItem[] = [
  toCardItem(
    "/tin-tuc/hold-room-workflow",
    text("News", "News"),
    text("Hold room workflow", "Hold room workflow"),
    text(
      "Cách giữ phòng, expiry 30 phút và manual confirmation được thể hiện trong UI.",
      "How room holds, the 30-minute expiry, and manual confirmation appear in the UI."
    ),
    [text("Workflow", "Workflow"), text("5 min read", "5 min read"), text("April 2026", "April 2026")],
    "paper"
  ),
  toCardItem(
    "/tin-tuc/deposit-qr-manual-verification",
    text("News", "News"),
    text("Deposit QR and manual verification", "Deposit QR and manual verification"),
    text(
      "Bước QR, proof upload và xác minh thủ công cho phase 1 manual-first.",
      "The QR step, proof upload, and manual verification flow for phase 1."
    ),
    [text("Payment", "Payment"), text("4 min read", "4 min read"), text("April 2026", "April 2026")],
    "gold"
  ),
  toCardItem(
    "/tin-tuc/member-portal-vision",
    text("News", "News"),
    text("Member portal vision", "Member portal vision"),
    text(
      "Cách member portal giữ request, booking và lịch sử theo một cấu trúc gọn.",
      "How the member portal keeps requests, bookings, and history in one compact structure."
    ),
    [text("Member", "Member"), text("6 min read", "6 min read"), text("April 2026", "April 2026")],
    "ink"
  )
];

const roomHero: CmsHeroSection = {
  id: "hero",
  kind: "hero",
  eyebrow: text("Room catalog", "Room catalog"),
  title: text("Phòng được trình bày như nội dung CMS, không chỉ là danh sách giá.", "Rooms presented as CMS content, not just a price list."),
  description: text(
    "Mỗi room type có chỗ cho mô tả VI/EN, pricing note, và liên kết tới physical room flow sau này.",
    "Each room type leaves room for VI/EN copy, pricing notes, and a future physical-room workflow."
  ),
  actions: {
    primary: {
      href: "/lien-he",
      label: text("Kiểm tra phòng trống", "Check availability"),
      tone: "solid"
    },
    secondary: {
      href: "/chi-nhanh",
      label: text("Xem chi nhánh", "View branches"),
      tone: "ghost"
    }
  },
  bullets: [
    text("Room cards map cleanly to room type records.", "Room cards map cleanly to room type records."),
    text("Price can be shown or hidden per page.", "Price can be shown or hidden per page."),
    text("Content is structured for Supabase later.", "Content is structured for Supabase later.")
  ],
  frame: premiumRoomFrame
};

const branchHero: CmsHeroSection = {
  id: "hero",
  kind: "hero",
  eyebrow: text("Branch catalog", "Branch catalog"),
  title: text("Chi nhánh được tổ chức theo branch content, không nhồi text vào page.", "Branches are organized as content records, not page-local copy."),
  description: text(
    "Trang chi nhánh cần một vùng cho mô tả VI/EN, address, map hint và các điểm mạnh theo từng địa điểm.",
    "Branch pages need room for VI/EN copy, address, map hints, and location-specific strengths."
  ),
  actions: {
    primary: {
      href: "/lien-he",
      label: text("Liên hệ đặt phòng", "Contact reservations"),
      tone: "solid"
    },
    secondary: {
      href: "/phong",
      label: text("Xem phòng", "View rooms"),
      tone: "text"
    }
  },
  bullets: [
    text("Each branch can have its own map, hours, and CTA.", "Each branch can have its own map, hours, and CTA."),
    text("Public copy stays bilingual.", "Public copy stays bilingual."),
    text("Operational details remain future CMS-ready.", "Operational details remain future CMS-ready.")
  ],
  frame: premiumBranchFrame
};

const newsHero: CmsHeroSection = {
  id: "hero",
  kind: "hero",
  eyebrow: text("Newsroom", "Newsroom"),
  title: text("Blog/news có layout riêng, editorial hơn, nhưng vẫn dùng cùng schema.", "Blog/news has its own editorial layout while still using the same schema."),
  description: text(
    "Mỗi bài viết có slug, SEO, block nội dung và vùng liên kết sang các bài liên quan.",
    "Each article carries a slug, SEO, content blocks, and related-article links."
  ),
  actions: {
    primary: {
      href: "/tin-tuc",
      label: text("Mở news list", "Open news list"),
      tone: "solid"
    },
    secondary: {
      href: "/phong",
      label: text("Xem phòng", "View rooms"),
      tone: "ghost"
    }
  },
  bullets: [
    text("Separate list and detail layout.", "Separate list and detail layout."),
    text("CMS-friendly article cards and related content.", "CMS-friendly article cards and related content."),
    text("Bilingual content zones for editorial copy.", "Bilingual content zones for editorial copy.")
  ],
  frame: premiumArticleFrame
};

const homePageSections: CmsSection[] = [
  {
    id: "hero",
    kind: "hero",
    layout: "carousel",
    eyebrow: text("SK Boutique Hotel", "SK Boutique Hotel"),
    title: text("Chào mừng đến SK Boutique Hotel", "Welcome to SK Boutique Hotel"),
    description: text(
      "Trải nghiệm lưu trú boutique đẳng cấp, nơi sự tinh tế gặp gỡ sự thoải mái.",
      "Experience premium boutique hospitality where elegance meets comfort."
    ),
    actions: {
      primary: {
        href: "/phong",
        label: text("Khám phá phòng", "Explore rooms"),
        tone: "solid"
      },
      secondary: {
        href: "/lien-he",
        label: text("Liên hệ ngay", "Contact us"),
        tone: "ghost"
      }
    },
    bullets: [],
    frame: {
      chips: [],
      description: text("", ""),
      label: text("", ""),
      tone: "ink",
      title: text("", "")
    },
    slides: [
      {
        image: media("home-hero", "slide-1", "/hero/hero-1.png"),
        eyebrow: text("SK Boutique Hotel", "SK Boutique Hotel"),
        title: text(
          "Chào mừng đến SK Boutique Hotel",
          "Welcome to SK Boutique Hotel"
        ),
        description: text(
          "Nơi sự tinh tế trong từng chi tiết tạo nên trải nghiệm lưu trú khó quên.",
          "Where refined details craft an unforgettable stay experience."
        ),
        actions: {
          primary: {
            href: "/phong",
            label: text("Khám phá phòng", "Explore rooms"),
            tone: "solid"
          },
          secondary: {
            href: "/lien-he",
            label: text("Liên hệ ngay", "Contact us"),
            tone: "ghost"
          }
        }
      },
      {
        image: media("home-hero", "slide-2", "/hero/hero-2.png"),
        eyebrow: text("Phòng nghỉ", "Our Rooms"),
        title: text(
          "Phòng nghỉ sang trọng, thanh lịch",
          "Elegant luxury rooms"
        ),
        description: text(
          "Mỗi căn phòng là một câu chuyện riêng — yên tĩnh, ấm áp và đầy đủ tiện nghi cao cấp.",
          "Each room tells its own story — calm, warm, and fully equipped with premium amenities."
        ),
        actions: {
          primary: {
            href: "/phong",
            label: text("Xem tất cả phòng", "View all rooms"),
            tone: "solid"
          },
          secondary: {
            href: "/lien-he",
            label: text("Đặt phòng ngay", "Book now"),
            tone: "ghost"
          }
        }
      },
      {
        image: media("home-hero", "slide-3", "/hero/hero-3.png"),
        eyebrow: text("Trải nghiệm", "Experience"),
        title: text(
          "Thư giãn đẳng cấp, tầm nhìn tuyệt đẹp",
          "Premium relaxation, breathtaking views"
        ),
        description: text(
          "Tận hưởng không gian nghỉ dưỡng hoàn hảo với hồ bơi, lounge bar và tầm nhìn toàn cảnh.",
          "Enjoy the perfect retreat with pool, lounge bar, and panoramic views."
        ),
        actions: {
          primary: {
            href: "/chi-nhanh",
            label: text("Khám phá chi nhánh", "Explore branches"),
            tone: "solid"
          },
          secondary: {
            href: "/lien-he",
            label: text("Liên hệ tư vấn", "Get in touch"),
            tone: "ghost"
          }
        }
      }
    ]
  },
  {
    id: "about",
    kind: "feature",
    eyebrow: text("Về chúng tôi", "About us"),
    title: text("Chạm vào một kỳ nghỉ tinh tế hơn", "Embrace a more refined vacation."),
    description: text(
      "Không gian lưu trú boutique được thiết kế để mang lại cảm giác riêng tư, chỉn chu và thư thái trong từng khoảnh khắc.",
      "Boutique accommodations are designed to provide a sense of privacy, sophistication, and relaxation in every moment."
    ),
    body: [
      text(
        "Kỳ nghỉ sang trọng, trải nghiệm tinh tế",
        "Boutique stay, refined experience"
      ),
      text(
        "Nghỉ ngơi theo cách có gu",
        "Relax in style"
      )
    ],
    frames: [featureFrameLeft, featureFrameRight],
    metrics: [
      {
        value: text("03", "03"),
        label: text("Hạng phòng", "Room types"),
        detail: text(
          "Hạng phòng đa dạng phù hợp mọi nhu cầu.",
          "Diverse room types suitable for all needs."
        ),
        tone: "paper"
      },
      {
        value: text("20", "20"),
        label: text("Phút", "Minutes"),
        detail: text(
          "Khoảng 20 phút để vào trung tâm thành phố.",
          "About 20 minutes to the city center."
        ),
        tone: "gold"
      },
      {
        value: text("24/7", "24/7"),
        label: text("Hỗ trợ", "Support"),
        detail: text(
          "Luôn có hỗ trợ khi khách cần.",
          "Support is available whenever guests need it."
        ),
        tone: "ink"
      }
    ]
  },
  {
    id: "destinations",
    kind: "cards",
    eyebrow: text("Hạng phòng", "Hotel Rooms"),
    title: text("Nơi dấu ấn được đặt tên", "Where the signature is set"),
    description: text(
      "Đa dang hạng phòng với số lượng phòng phù hợp với mọi nhu cầu lưu trú.",
      "A diverse range of room types with a boutique-appropriate number of rooms to fit every stay need."
    ),
    items: homeRoomItems
  },
  /* tạm ẩn phần Tiện nghi vì đã có phần Tiện nghi cố định trên trang */
  // {
  //   id: "amenities",
  //   kind: "amenities",
  //   eyebrow: text("Tiện nghi", "Amenities"),
  //   title: text("Tiện nghi khách sạn", "Hotel amenities"),
  //   description: text(
  //     "Những tiện nghi và thông tin vận hành quan trọng được trình bày rõ ràng theo từng nhóm.",
  //     "Key room amenities and operational details are grouped clearly for fast reading."
  //   ),
  //   groups: [
  //     {
  //       title: text("Tiện nghi khách sạn", "Hotel amenities"),
  //       items: [
  //         amenityTextItem("Loại giường", "Bed type", "Giường đôi", "Double bed"),
  //         amenityTextItem("View phòng", "Room view", "Sân vườn và hồ bơi", "Garden & pool view"),
  //         amenityWaterItem("Hồ bơi ngoài trời", "Outdoor pool"),
  //         amenityCheckItem("Cửa sổ", "Windows"),
  //         amenityCheckItem("Ban công", "Balcony"),
  //         amenityCheckItem("Kê nệm phụ", "Extra mattress"),
  //         amenityCheckItem("Bồn tắm", "Bathtub"),
  //         amenityCheckItem("Bàn làm việc", "Desk"),
  //         amenityCheckItem("Tủ lạnh", "Fridge"),
  //         amenityCheckItem("Smart TV / Netflix", "Smart TV / Netflix"),
  //         amenityCheckItem("Máy sấy tóc", "Hair dryer"),
  //         amenityCheckItem("Ấm đun nước / trà / cà phê", "Kettle / tea / coffee")
  //       ]
  //     },
  //     {
  //       title: text("Thông tin khác", "Other information"),
  //       items: [
  //         // amenityCheckItem("Không hút thuốc", "No smoking"),
  //         // amenityCheckItem("Không cho thú cưng", "No pets"),
  //         amenityTextItem("Két sắt", "Safe", "Chỉ dành cho phòng VIP", "VIP rooms only"),
  //         amenityTextItem("Dọn phòng", "Housekeeping", "Mỗi ngày", "Daily"),
  //         amenityTextItem("Dịch vụ phòng", "Room service", "24/7", "24/7"),
  //         amenityCheckItem("Không phụ thu cuối tuần", "No weekend surcharge"),
  //         amenityCheckItem("Cho check-in sớm", "Early check-in available"),
  //         amenityCheckItem("Không thu phí check-in sớm", "No early check-in fee")
  //       ]
  //     }
  //   ]
  // },
  // {
  //   id: "next-step",
  //   kind: "band",
  //   eyebrow: text("Booking", "Booking"),
  //   title: text("Để lại nhu cầu của bạn tại đây.", "Leave your needs here."),
  //   description: text(
  //     "Nhân viên sẽ liên hệ cho bạn ngay khi nhận được yêu cầu, giúp bạn giữ phòng và giải đáp mọi thắc mắc về giá cả hoặc điều kiện lưu trú.",
  //     "Our staff will get back to you as soon as your request comes in, helping you hold a room and answer any questions about pricing or stay details."
  //   ),
  //   actions: {
  //     primary: {
  //       href: "/lien-he",
  //       label: text("Kiểm tra phòng trống", "Check availability"),
  //       tone: "solid"
  //     },
  //     secondary: {
  //       href: "/member",
  //       label: text("Member portal", "Member portal"),
  //       tone: "text"
  //     }
  //   }
  // }
];

const collectionSplitSection = (
  id: string,
  eyebrow: LocalizedText,
  title: LocalizedText,
  description: LocalizedText,
  bullets: LocalizedText[],
  frame: CmsMediaFrame,
  reverse = false
): CmsSplitSection => ({
  id,
  kind: "split",
  eyebrow,
  title,
  description,
  bullets,
  frame,
  reverse
});

const collectionBand = (href: string, label: LocalizedText, title: LocalizedText, description: LocalizedText): CmsBandSection => ({
  id: "cta",
  kind: "band",
  eyebrow: text("Next step", "Next step"),
  title,
  description,
  actions: {
    primary: {
      href,
      label,
      tone: "solid"
    },
    secondary: {
      href: "/lien-he",
      label: text("Liên hệ", "Contact"),
      tone: "ghost"
    }
  }
});

const roomCollectionPage: CmsPageCopy = {
  kind: "collection",
  slug: "/phong",
  seo: {
    title: text("Phòng", "Rooms"),
    description: text(
      "Danh sách room types theo hướng CMS-ready cho SK Boutique Hotel.",
      "CMS-ready room type listing for SK Boutique Hotel."
    )
  },
  sections: [
    roomHero,
    {
      id: "features",
      kind: "stats",
      eyebrow: text("Pricing and inventory", "Pricing and inventory"),
      title: text("Room cards sẽ map sang pricing và inventory records.", "Room cards map into pricing and inventory records."),
      description: text(
        "Mỗi card có thể hiển thị hoặc ẩn giá, và sau này nối với physical-room data.",
        "Each card can show or hide price and later connect to physical-room data."
      ),
      items: [
        {
          value: "From",
          label: text("Giá hiển thị", "Public price"),
          detail: text(
            "Có thể đổi sang CTA-only nếu muốn ẩn giá công khai.",
            "Can switch to CTA-only when public pricing should be hidden."
          ),
          tone: "paper"
        },
        {
          value: "1:1",
          label: text("Mapping", "Mapping"),
          detail: text(
            "UI phase 1 map một booking sang một room, nhưng schema không khóa tương lai.",
            "Phase 1 UI maps one booking to one room while the schema stays future-proof."
          ),
          tone: "gold"
        },
        {
          value: "VI/EN",
          label: text("Content", "Content"),
          detail: text(
            "Room content có vùng tiếng Việt và tiếng Anh riêng.",
            "Room content has separate Vietnamese and English zones."
          ),
          tone: "ink"
        },
        {
          value: "Hold",
          label: text("Flow", "Flow"),
          detail: text(
            "CTA giữ phòng và kiểm tra availability luôn đứng trước booking.",
            "Hold and availability CTAs always come before booking."
          ),
          tone: "paper"
        }
      ]
    },
    collectionSplitSection(
      "room-model",
      text("Room model", "Room model"),
      text("Public room card = content record + pricing note + CTA.", "Public room card = content record + pricing note + CTA."),
      text(
        "Một card phòng tốt phải có đủ vùng cho ảnh, description, price note và flow tiếp theo.",
        "A strong room card needs room for imagery, description, pricing note, and the next step."
      ),
      [
        text("Show or hide price without changing layout.", "Show or hide price without changing layout."),
        text("Keep amenities, capacity, and view in structured fields.", "Keep amenities, capacity, and view in structured fields."),
        text("Prepare for later room-type CMS forms.", "Prepare for later room-type CMS forms.")
      ],
      premiumRoomFrame
    ),
    {
      id: "room-cards",
      kind: "cards",
      eyebrow: text("Room cards", "Room cards"),
      title: text("Ba room types mẫu", "Three sample room types"),
      description: text(
        "Các card này sẽ map sang record trong CMS hoặc table sau này.",
        "These cards can later map into CMS records or tables."
      ),
      items: roomItems
    },
    collectionBand(
      "/lien-he",
      text("Kiểm tra phòng trống", "Check availability"),
      text("Cần hỏi thêm về giá, hold hoặc thời gian lưu trú?", "Need to ask about pricing, holds, or stay dates?"),
      text(
        "Trang phòng dẫn khách sang contact flow manual-first thay vì hứa instant booking.",
        "The room page guides guests into a manual-first contact flow instead of promising instant booking."
      )
    )
  ]
};

const branchCollectionPage: CmsPageCopy = {
  kind: "collection",
  slug: "/chi-nhanh",
  seo: {
    title: text("Chi nhánh", "Branches"),
    description: text(
      "Danh sách chi nhánh với cấu trúc content tách riêng cho từng địa điểm.",
      "Branch listing with content structured separately for each location."
    )
  },
  sections: [
    branchHero,
    {
      id: "signals",
      kind: "stats",
      eyebrow: text("Location signals", "Location signals"),
      title: text("Mỗi chi nhánh có thể giữ flow riêng nhưng vẫn cùng ngôn ngữ thiết kế.", "Each branch can keep its own flow while sharing the same design language."),
      description: text(
        "Address, hours, map hints và branch-specific offers đều là dữ liệu record.",
        "Address, hours, map hints, and branch-specific offers are all record-based data."
      ),
      items: [
        {
          value: "Map",
          label: text("Vùng bản đồ", "Map region"),
          detail: text(
            "Có thể thay bằng Google Map hoặc ảnh map mock.",
            "Can later become a Google Map or a mock map image."
          ),
          tone: "gold"
        },
        {
          value: "24/7",
          label: text("Giờ hoạt động", "Hours"),
          detail: text(
            "Branch có thể giữ giờ riêng và hotline riêng.",
            "Each branch can have its own hours and hotline."
          ),
          tone: "paper"
        },
        {
          value: "EN/VI",
          label: text("Ngôn ngữ", "Language"),
          detail: text(
            "Mỗi branch detail đều có vùng content song ngữ.",
            "Each branch detail includes bilingual content zones."
          ),
          tone: "ink"
        },
        {
          value: "Rooms",
          label: text("Hạng phòng", "Room types"),
          detail: text(
            "Public branch page có thể dẫn tới các room types theo branch.",
            "The public branch page can point into branch-specific room types."
          ),
          tone: "paper"
        }
      ]
    },
    collectionSplitSection(
      "branch-model",
      text("Branch model", "Branch model"),
      text("Chi nhánh là một content record có cấu trúc, không chỉ là địa chỉ.", "A branch is a structured content record, not just an address."),
      text(
        "Mỗi địa điểm cần một mô tả rõ, một nhịp brand riêng và vài điểm nhấn vận hành.",
        "Each location needs a clear description, its own brand rhythm, and a few operational highlights."
      ),
      [
        text("Prepare for branch-specific maps.", "Prepare for branch-specific maps."),
        text("Keep contact and hours editable per branch.", "Keep contact and hours editable per branch."),
        text("Support localized marketing copy.", "Support localized marketing copy.")
      ],
      premiumBranchFrame,
      true
    ),
    {
      id: "branch-cards",
      kind: "cards",
      eyebrow: text("Branches", "Branches"),
      title: text("Hai chi nhánh mẫu", "Two sample branches"),
      description: text(
        "Danh sách này sẽ map sang CMS hoặc tables branch về sau.",
        "This list can later map into branch CMS records or tables."
      ),
      items: branchItems
    },
    collectionBand(
      "/lien-he",
      text("Liên hệ chi nhánh", "Contact branches"),
      text("Cần biết chi nhánh nào phù hợp nhất?", "Need to know which branch fits best?"),
      text(
        "Giữ khách trong một flow contact rõ ràng trước khi đi vào hold hoặc booking.",
        "Keep guests in a clear contact flow before moving into hold or booking."
      )
    )
  ]
};

const newsCollectionPage: CmsPageCopy = {
  kind: "collection",
  slug: "/tin-tuc",
  seo: {
    title: text("Tin tức", "News"),
    description: text(
      "Danh sách blog/news với layout editorial và CMS-ready cards.",
      "Blog/news listing with an editorial layout and CMS-ready cards."
    )
  },
  sections: [
    newsHero,
    {
      id: "signals",
      kind: "stats",
      eyebrow: text("Editorial workflow", "Editorial workflow"),
      title: text("Bài viết có thể đi qua draft, review và publish theo ngôn ngữ.", "Articles can move through draft, review, and language-specific publishing."),
      description: text(
        "Luồng nội dung này chuẩn bị sẵn cho CMS review workflow.",
        "This content flow is ready for a CMS review workflow."
      ),
      items: [
        {
          value: "Draft",
          label: text("Bản nháp", "Draft"),
          detail: text(
            "Nội dung có thể giữ trạng thái draft trước khi staff review.",
            "Content can stay draft before staff review."
          ),
          tone: "paper"
        },
        {
          value: "Review",
          label: text("Duyệt", "Review"),
          detail: text(
            "Admin có thể approve hoặc reject theo bài viết và ngôn ngữ.",
            "Admin can approve or reject by article and language."
          ),
          tone: "gold"
        },
        {
          value: "SEO",
          label: text("Metadata", "Metadata"),
          detail: text(
            "Slug, title, description và share preview đều có chỗ.",
            "Slug, title, description, and share previews all have a place."
          ),
          tone: "ink"
        },
        {
          value: "Related",
          label: text("Liên kết", "Related"),
          detail: text(
            "Mỗi bài viết có thể nối sang bài liên quan hoặc room/branch CTA.",
            "Each article can link into related posts or room/branch CTAs."
          ),
          tone: "paper"
        }
      ]
    },
    collectionSplitSection(
      "news-model",
      text("Article model", "Article model"),
      text("News post cần cả hero editorial và body blocks rõ ràng.", "A news post needs both an editorial hero and clear body blocks."),
      text(
        "Bài viết không nên trông như một form. Nó phải đọc như nội dung được biên tập.",
        "An article should not read like a form. It should feel editorial."
      ),
      [
        text("Use large hero and clean body columns.", "Use a large hero and clean body columns."),
        text("Keep related cards close to the article.", "Keep related cards close to the article."),
        text("Support bilingual summary blocks.", "Support bilingual summary blocks.")
      ],
      premiumArticleFrame
    ),
    {
      id: "news-cards",
      kind: "cards",
      eyebrow: text("Stories", "Stories"),
      title: text("Ba bài viết mẫu", "Three sample stories"),
      description: text(
        "Mỗi card là một article record có slug và SEO riêng.",
        "Each card is an article record with its own slug and SEO."
      ),
      items: articleItems
    },
    collectionBand(
      "/lien-he",
      text("Nhận cập nhật", "Get updates"),
      text("Muốn đọc các cập nhật tiếp theo của khách sạn?", "Want to read the hotel’s next updates?"),
      text(
        "Trang news giữ layout riêng để sau này nối CMS blog workflow dễ hơn.",
        "The news page keeps a distinct layout so a CMS blog workflow can be attached later."
      )
    )
  ]
};

const roomDetails: CmsPageCopy[] = [
  {
    kind: "detail",
    slug: "/phong/family-room",
    seo: {
      title: text("Family Room", "Family Room"),
      description: text(
        "Phòng Family Room với mô tả song ngữ, sức chứa 4 Người lớn & 2 Trẻ em, giường đôi và view sân vườn & hồ bơi.",
        "Family Room with bilingual copy, capacity for 4 adults and 2 children, double bed, and garden & pool views."
      )
    },
    sections: [
      {
        id: "hero",
        kind: "hero",
        eyebrow: text("Room detail", "Room detail"),
        title: text("Family Room", "Family Room"),
        description: text(
          "Room type này có vùng dành cho ảnh, mô tả ngắn, pricing note và view sân vườn & hồ bơi.",
          "This room type leaves space for imagery, a short description, pricing notes, and garden & pool views."
        ),
        actions: {
          primary: {
            href: "/lien-he",
            label: text("Kiểm tra phòng trống", "Check availability"),
            tone: "solid"
          },
          secondary: {
            href: "/chi-nhanh",
            label: text("Xem chi nhánh", "View branches"),
            tone: "ghost"
          }
        },
        bullets: [
          text("Sức chứa 4 Người lớn & 2 Trẻ em.", "Capacity for 4 adults and 2 children."),
          text("Giường đôi và view sân vườn & hồ bơi.", "Double bed and garden & pool views."),
          text("Giữ luồng đặt phòng manual-first.", "Keep the manual-first booking flow.")
        ],
        frame: premiumRoomFrame
      },
      {
        id: "facts",
        kind: "stats",
        eyebrow: text("Room facts", "Room facts"),
        title: text("Những trường dữ liệu chính cho room type", "Key data fields for the room type"),
        description: text(
          "Nhóm này có thể map sang một bảng room type trong CMS.",
          "This group can map into a room type table in the CMS."
        ),
        items: [
          {
            value: "6",
            label: text("Khách", "Guests"),
            detail: text("Sức chứa 4 Người lớn & 2 Trẻ em.", "Capacity for 4 adults and 2 children."),
            tone: "paper"
          },
          {
            value: "60 m²",
            label: text("Diện tích", "Area"),
            detail: text("Một giá trị rõ để hiển thị trong CMS.", "A clear value for CMS display."),
            tone: "gold"
          },
          {
            value: text("Giường đôi", "Double bed"),
            label: text("Bed", "Bed"),
            detail: text("Bed type có thể chỉnh theo inventory.", "Bed type can vary by inventory."),
            tone: "ink"
          },
          {
            value: "From",
            label: text("Public price", "Public price"),
            detail: text("Có thể ẩn nếu muốn CTA-only.", "Can be hidden if CTA-only is preferred."),
            tone: "paper"
          }
        ]
      },
      {
        id: "zones",
        kind: "locale-zones",
        eyebrow: text("VI / EN content", "VI / EN content"),
        title: text("Vùng nội dung song ngữ cho room detail", "Bilingual content zones for the room detail"),
        description: text(
          "Mỗi zone đọc như một content block riêng, dễ map sang CMS translations.",
          "Each zone reads like its own content block and maps cleanly into CMS translations."
        ),
        zones: {
          vi: {
            eyebrow: text("Nội dung VI", "VI content"),
            title: text("Mô tả tiếng Việt", "Vietnamese copy"),
            description: text(
              "Phòng Family Room phù hợp cho gia đình cần không gian rộng, riêng tư và tầm nhìn sân vườn & hồ bơi.",
              "Family Room suits families who want spacious comfort, privacy, and garden & pool views."
            ),
            bullets: [
              text("4 Người lớn & 2 Trẻ em là sức chứa chính.", "Capacity for 4 adults and 2 children."),
              text("Giường đôi và view sân vườn & hồ bơi.", "Double bed and garden & pool views."),
              text("Giữ luồng đặt phòng manual-first.", "Keeps the manual-first booking flow.")
            ],
            note: text("Thiết kế nội dung sẵn cho CMS.", "Content design ready for CMS.")
          },
          en: {
            eyebrow: text("EN content", "EN content"),
            title: text("English copy", "English copy"),
            description: text(
              "This room is presented as a spacious family option with clear capacity and garden & pool views.",
              "This room is presented as a spacious family option with clear capacity and garden & pool views."
            ),
            bullets: [
              text("Capacity for 4 adults and 2 children.", "Capacity for 4 adults and 2 children."),
              text("Double bed and garden & pool views.", "Double bed and garden & pool views."),
              text("Structured for later CMS fetches.", "Structured for later CMS fetches.")
            ],
            note: text("Each block can later become a translation record.", "Each block can later become a translation record.")
          }
        }
      },
      collectionSplitSection(
        "amenities",
        text("Amenities", "Amenities"),
        text("Amenities and booking notes can live in structured blocks.", "Amenities and booking notes can live in structured blocks."),
        text(
          "Phần này sẽ map rất tự nhiên sang các component của CMS sau này.",
          "This section will map naturally into CMS components later."
        ),
        [
          text("Wi-Fi, minibar and laundry notes can be structured.", "Wi-Fi, minibar, and laundry notes can be structured."),
          text("Room policies can live beside the CTA.", "Room policies can live beside the CTA."),
          text("Images can be swapped without touching layout.", "Images can be swapped without touching layout.")
        ],
        premiumRoomFrame,
        true
      ),
      {
        id: "related",
        kind: "cards",
        eyebrow: text("Related rooms", "Related rooms"),
        title: text("Các room type liên quan", "Related room types"),
        description: text(
          "Cards này có thể dùng làm related content hoặc room suggestions.",
          "These cards can act as related content or room suggestions."
        ),
        items: roomItems.filter((item) => item.href !== "/phong/family-room")
      },
      collectionBand(
        "/lien-he",
        text("Giữ phòng", "Hold room"),
        text("Muốn giữ Family Room cho một ngày cụ thể?", "Want to hold Family Room for specific dates?"),
        text(
          "Flow hiện tại dừng ở hold và xác minh thủ công, đúng phase 1.",
          "The current flow stops at hold and manual verification, exactly as phase 1 requires."
        )
      )
    ]
  },
  {
    kind: "detail",
    slug: "/phong/superior-room",
    seo: {
      title: text("Superior Room", "Superior Room"),
      description: text(
        "Superior Room với mô tả song ngữ, sức chứa 2 Người lớn & 1 Trẻ em, giường đôi và view sân vườn & hồ bơi.",
        "Superior Room with bilingual copy, capacity for 2 adults and 1 child, double bed, and garden & pool views."
      )
    },
    sections: [
      {
        id: "hero",
        kind: "hero",
        eyebrow: text("Room detail", "Room detail"),
        title: text("Superior Room", "Superior Room"),
        description: text(
          "Phòng này đủ gọn cho cặp đôi hoặc khách công tác, nhưng vẫn giữ cảm giác riêng tư và premium.",
          "This room stays compact for couples or business travelers while keeping a premium, private feel."
        ),
        actions: {
          primary: {
            href: "/lien-he",
            label: text("Kiểm tra phòng trống", "Check availability"),
            tone: "solid"
          },
          secondary: {
            href: "/phong",
            label: text("Xem tất cả phòng", "View all rooms"),
            tone: "ghost"
          }
        },
        bullets: [
          text("Sức chứa 2 Người lớn & 1 Trẻ em.", "Capacity for 2 adults and 1 child."),
          text("Giường đôi và view sân vườn & hồ bơi.", "Double bed and garden & pool views."),
          text("Room content stays bilingual.", "Room content stays bilingual.")
        ],
        frame: {
          ...premiumRoomFrame,
          chips: ["Room", "Compact", "Premium"]
        }
      },
      {
        id: "facts",
        kind: "stats",
        eyebrow: text("Room facts", "Room facts"),
        title: text("Dữ liệu chính của phòng", "Key room data"),
        description: text(
          "Các trường này có thể map sang bảng room types hoặc pricing notes.",
          "These fields can map into room type tables or pricing notes."
        ),
        items: [
          { value: "3", label: text("Khách", "Guests"), detail: text("Sức chứa 2 Người lớn & 1 Trẻ em.", "Capacity for 2 adults and 1 child."), tone: "paper" },
          { value: "25 m²", label: text("Diện tích", "Area"), detail: text("Không gian rộng hơn.", "A larger footprint."), tone: "gold" },
          { value: text("Giường đôi", "Double bed"), label: text("Bed", "Bed"), detail: text("Giường lớn và thoải mái.", "A large, comfortable bed."), tone: "ink" },
          { value: "From", label: text("Public price", "Public price"), detail: text("Có thể ẩn khi cần.", "Can be hidden when needed."), tone: "paper" }
        ]
      },
      {
        id: "zones",
        kind: "locale-zones",
        eyebrow: text("VI / EN content", "VI / EN content"),
        title: text("Vùng song ngữ cho Superior Room", "Bilingual zones for Superior Room"),
        description: text(
          "Mỗi ngôn ngữ giữ một block riêng và vẫn cùng layout.",
          "Each language keeps its own block while sharing the same layout."
        ),
        zones: {
          vi: {
            eyebrow: text("Nội dung VI", "VI content"),
            title: text("Bản tiếng Việt", "Vietnamese copy"),
            description: text(
              "Phòng Superior Room phù hợp cho cặp đôi hoặc khách công tác muốn sự gọn gàng, riêng tư và sáng sủa.",
              "Superior Room suits couples or business travelers who want a compact, private, and bright stay."
            ),
            bullets: [
              text("2 Người lớn & 1 Trẻ em là sức chứa chính.", "Capacity for 2 adults and 1 child."),
              text("Giường đôi và view sân vườn & hồ bơi.", "Double bed and garden & pool views."),
              text("Giữ đúng manual-first phase.", "Keeps the manual-first phase.")
            ],
            note: text("Translation-friendly copy blocks.", "Translation-friendly copy blocks.")
          },
          en: {
            eyebrow: text("EN content", "EN content"),
            title: text("English copy", "English copy"),
            description: text(
              "The room story stays compact, premium, and easy to extend into CMS records.",
              "The room story stays compact, premium, and easy to extend into CMS records."
            ),
            bullets: [
              text("Capacity for 2 adults and 1 child.", "Capacity for 2 adults and 1 child."),
              text("Double bed and garden & pool views.", "Double bed and garden & pool views."),
              text("Structured for future CMS fields.", "Structured for future CMS fields.")
            ],
            note: text("Good fit for future translation entries.", "Good fit for future translation entries.")
          }
        }
      },
      collectionSplitSection(
        "suite-notes",
        text("Room notes", "Room notes"),
        text("This page leaves room for related amenities and stay notes.", "This page leaves room for related amenities and stay notes."),
        text(
          "Booking notes, amenities and policy details can live in separate blocks later.",
          "Booking notes, amenities, and policy details can live in separate blocks later."
        ),
        [
          text("Add stay notes without changing the hero.", "Add stay notes without changing the hero."),
          text("Keep room rules separate from booking CTAs.", "Keep room rules separate from booking CTAs."),
          text("Move to database-backed content later.", "Move to database-backed content later.")
        ],
        premiumRoomFrame
      ),
      {
        id: "related",
        kind: "cards",
        eyebrow: text("Related rooms", "Related rooms"),
        title: text("Room type liên quan", "Related room types"),
        description: text(
          "Related cards giúp liên kết trong catalog mà không cần hard-code text.",
          "Related cards help the catalog connect without hard-coded copy."
        ),
        items: roomItems.filter((item) => item.href !== "/phong/superior-room")
      },
      collectionBand(
        "/lien-he",
        text("Giữ phòng", "Hold room"),
        text("Muốn giữ Superior Room?", "Want to hold Superior Room?"),
        text(
          "Từ đây khách đi sang hold hoặc contact flow, không vào instant booking.",
          "From here guests move into a hold or contact flow, not instant booking."
        )
      )
    ]
  },
  {
    kind: "detail",
    slug: "/phong/quadruple-room",
    seo: {
      title: text("Quadruple Room", "Quadruple Room"),
      description: text(
        "Quadruple Room với mô tả song ngữ, sức chứa 4 Người lớn & 1 Trẻ em, giường đôi và nhịp lưu trú linh hoạt.",
        "Quadruple Room with bilingual copy, capacity for 4 adults and 1 child, double bed, and flexible stay options."
      )
    },
    sections: [
      {
        id: "hero",
        kind: "hero",
        eyebrow: text("Room detail", "Room detail"),
        title: text("Quadruple Room", "Quadruple Room"),
        description: text(
          "Phòng này dành cho khách cần một trải nghiệm gọn, sáng, linh hoạt và rõ ràng về giá trị.",
          "This room is for guests who want a compact, bright, flexible, and value-led stay."
        ),
        actions: {
          primary: {
            href: "/lien-he",
            label: text("Kiểm tra phòng trống", "Check availability"),
            tone: "solid"
          },
          secondary: {
            href: "/phong",
            label: text("Xem tất cả phòng", "View all rooms"),
            tone: "ghost"
          }
        },
        bullets: [
          text("Sức chứa 4 Người lớn & 1 Trẻ em.", "Capacity for 4 adults and 1 child."),
          text("Giường đôi và view sân vườn & hồ bơi.", "Double bed and garden & pool views."),
          text("Bilingual room content.", "Bilingual room content.")
        ],
        frame: {
          ...premiumRoomFrame,
          chips: ["Room", "Value", "Bright"]
        }
      },
      {
        id: "facts",
        kind: "stats",
        eyebrow: text("Room facts", "Room facts"),
        title: text("Trường dữ liệu tối thiểu nhưng đủ dùng", "Minimal but sufficient data fields"),
        description: text(
          "Những trường này đủ để map sang room type table ban đầu.",
          "These fields are enough for the initial room type table."
        ),
        items: [
          { value: "5", label: text("Khách", "Guests"), detail: text("Sức chứa 4 Người lớn & 1 Trẻ em.", "Capacity for 4 adults and 1 child."), tone: "paper" },
          { value: "35 m²", label: text("Diện tích", "Area"), detail: text("Gọn nhưng đủ thoáng.", "Compact but still airy."), tone: "gold" },
          { value: text("Giường đôi", "Double bed"), label: text("Bed", "Bed"), detail: text("Bed type linh hoạt.", "Flexible bed type."), tone: "ink" },
          { value: "From", label: text("Public price", "Public price"), detail: text("Có thể ẩn để chỉ hiện CTA.", "Can be hidden to show CTA only."), tone: "paper" }
        ]
      },
      {
        id: "zones",
        kind: "locale-zones",
        eyebrow: text("VI / EN content", "VI / EN content"),
        title: text("Vùng nội dung song ngữ", "Bilingual content zones"),
        description: text(
          "Dù là room nhỏ hơn, nội dung vẫn nên giữ cấu trúc đồng bộ.",
          "Even with a smaller room, the content should stay structurally consistent."
        ),
        zones: {
          vi: {
            eyebrow: text("Nội dung VI", "VI content"),
            title: text("Tiếng Việt", "Vietnamese copy"),
            description: text(
              "Phòng Quadruple Room phù hợp cho nhóm nhỏ hoặc gia đình cần không gian linh hoạt, sáng và sạch.",
              "Quadruple Room suits small groups or families who need a flexible, bright, and clean stay."
            ),
            bullets: [
              text("4 Người lớn & 1 Trẻ em là sức chứa chính.", "Capacity for 4 adults and 1 child."),
              text("Giường đôi và view sân vườn & hồ bơi.", "Double bed and garden & pool views."),
              text("Dễ map vào CMS later.", "Easy to map into CMS later.")
            ]
          },
          en: {
            eyebrow: text("EN content", "EN content"),
            title: text("English copy", "English copy"),
            description: text(
              "The room story stays compact so it can be extended into future content blocks.",
              "The room story stays compact so it can be extended into future content blocks."
            ),
            bullets: [
              text("Capacity for 4 adults and 1 child.", "Capacity for 4 adults and 1 child."),
              text("Double bed and flexible views.", "Double bed and flexible views."),
              text("Ready for future CMS content.", "Ready for future CMS content.")
            ]
          }
        }
      },
      collectionSplitSection(
        "studio-notes",
        text("Studio notes", "Studio notes"),
        text("Booking notes and amenity copy can be layered in later.", "Booking notes and amenity copy can be layered in later."),
        text(
          "Giữ cấu trúc này để sau này nối content dễ hơn.",
          "Keep this structure so future content wiring stays easy."
        ),
        [
          text("The room page remains CMS-ready.", "The room page remains CMS-ready."),
          text("No logic gets trapped in the page component.", "No logic gets trapped in the page component."),
          text("Related content can be added anytime.", "Related content can be added anytime.")
        ],
        premiumRoomFrame
      ),
      {
        id: "related",
        kind: "cards",
        eyebrow: text("Related rooms", "Related rooms"),
        title: text("Room type liên quan", "Related room types"),
        description: text(
          "Cards related này phục vụ cross-sell hoặc room suggestions.",
          "These related cards support cross-sell or room suggestions."
        ),
        items: roomItems.filter((item) => item.href !== "/phong/quadruple-room")
      },
      collectionBand(
        "/lien-he",
        text("Giữ phòng", "Hold room"),
        text("Muốn giữ Quadruple Room?", "Want to hold Quadruple Room?"),
        text(
          "Hold và verification vẫn là điểm kết của phase 1.",
          "Hold and verification remain the phase 1 finish line."
        )
      )
    ]
  }
];

const branchDetails: CmsPageCopy[] = [
  {
    kind: "detail",
    slug: "/chi-nhanh/central-district",
    seo: {
      title: text("Central District", "Central District"),
      description: text(
        "Branch detail cho chi nhánh trung tâm với vùng VI/EN và map-ready content.",
        "Branch detail for the central branch with VI/EN zones and map-ready content."
      )
    },
    sections: [
      {
        id: "hero",
        kind: "hero",
        eyebrow: text("Branch detail", "Branch detail"),
        title: text("Central District", "Central District"),
        description: text(
          "Chi nhánh này có thể map sang từng block dữ liệu: address, hours, room types và map.",
          "This branch can map into separate data blocks: address, hours, room types, and map."
        ),
        actions: {
          primary: {
            href: "/lien-he",
            label: text("Liên hệ chi nhánh", "Contact branch"),
            tone: "solid"
          },
          secondary: {
            href: "/phong",
            label: text("Xem phòng", "View rooms"),
            tone: "ghost"
          }
        },
        bullets: [
          text("Map-ready branch content.", "Map-ready branch content."),
          text("Address and hours are separate fields.", "Address and hours are separate fields."),
          text("Bilingual blocks stay visible.", "Bilingual blocks stay visible.")
        ],
        frame: premiumBranchFrame
      },
      {
        id: "signals",
        kind: "stats",
        eyebrow: text("Branch facts", "Branch facts"),
        title: text("Dữ liệu chính của chi nhánh", "Branch data essentials"),
        description: text(
          "Những trường này gần với cấu trúc branch record trong CMS.",
          "These fields stay close to a branch record in the CMS."
        ),
        items: [
          { value: "Q1", label: text("Khu vực", "Area"), detail: text("Quận trung tâm.", "Central district."), tone: "paper" },
          { value: "24/7", label: text("Giờ", "Hours"), detail: text("Giờ mở cửa linh hoạt.", "Flexible operating hours."), tone: "gold" },
          { value: "Map", label: text("Bản đồ", "Map"), detail: text("Có thể thay bằng embed.", "Can later become an embed."), tone: "ink" },
          { value: "VI/EN", label: text("Ngôn ngữ", "Language"), detail: text("Mỗi zone đều song ngữ.", "Each zone is bilingual."), tone: "paper" }
        ]
      },
      {
        id: "zones",
        kind: "locale-zones",
        eyebrow: text("VI / EN content", "VI / EN content"),
        title: text("Vùng nội dung song ngữ cho branch detail", "Bilingual content zones for the branch detail"),
        description: text(
          "Mỗi branch có thể giữ câu chuyện riêng nhưng cùng layout.",
          "Each branch can keep its own story while sharing the same layout."
        ),
        zones: {
          vi: {
            eyebrow: text("Nội dung VI", "VI content"),
            title: text("Mô tả chi nhánh", "Branch copy"),
            description: text(
              "Chi nhánh trung tâm phù hợp cho khách muốn trục di chuyển thuận tiện và dịch vụ rõ ràng.",
              "The central branch suits guests who want convenient movement and clear service."
            ),
            bullets: [
              text("Có thể nối map và hotline riêng.", "Can attach its own map and hotline."),
              text("Giữ branch note tách biệt.", "Keep branch notes separate."),
              text("Hỗ trợ branch-specific offers.", "Supports branch-specific offers.")
            ]
          },
          en: {
            eyebrow: text("EN content", "EN content"),
            title: text("English copy", "English copy"),
            description: text(
              "The branch story stays compact, calm, and easy to turn into CMS translations.",
              "The branch story stays compact, calm, and easy to turn into CMS translations."
            ),
            bullets: [
              text("Clear branch positioning.", "Clear branch positioning."),
              text("Ready for maps and hours.", "Ready for maps and hours."),
              text("Translation blocks stay separate.", "Translation blocks stay separate.")
            ]
          }
        }
      },
      collectionSplitSection(
        "branch-story",
        text("Branch story", "Branch story"),
        text("A branch page is a local content record, not a generic page section.", "A branch page is a local content record, not a generic page section."),
        text(
          "Khi nối CMS, branch content sẽ map rất tự nhiên sang record và translation table.",
          "When connected to a CMS, branch content will map naturally into record and translation tables."
        ),
        [
          text("Keep address, hours, and map structured.", "Keep address, hours, and map structured."),
          text("Allow branch-specific room type lists.", "Allow branch-specific room type lists."),
          text("Keep the UX consistent across locations.", "Keep the UX consistent across locations.")
        ],
        premiumBranchFrame,
        true
      ),
      {
        id: "related",
        kind: "cards",
        eyebrow: text("Related branches", "Related branches"),
        title: text("Chi nhánh liên quan", "Related branches"),
        description: text(
          "Cards này có thể dùng để dẫn sang các location khác.",
          "These cards can guide guests to other locations."
        ),
        items: branchItems.filter((item) => item.href !== "/chi-nhanh/central-district")
      },
      collectionBand(
        "/lien-he",
        text("Contact branch", "Contact branch"),
        text("Muốn hỏi thêm về branch này?", "Want to ask more about this branch?"),
        text(
          "Giữ các điểm chạm contact rõ ràng để staff xử lý nhanh.",
          "Keep contact touchpoints clear so staff can respond quickly."
        )
      )
    ]
  },
  {
    kind: "detail",
    slug: "/chi-nhanh/riverside",
    seo: {
      title: text("Riverside", "Riverside"),
      description: text(
        "Chi nhánh Riverside với mô tả song ngữ, giờ hoạt động và vùng bản đồ.",
        "Riverside branch with bilingual copy, operating hours, and map zone."
      )
    },
    sections: [
      {
        id: "hero",
        kind: "hero",
        eyebrow: text("Branch detail", "Branch detail"),
        title: text("Riverside", "Riverside"),
        description: text(
          "Chi nhánh này được trình bày theo cấu trúc content riêng, đủ chỗ cho gallery và map.",
          "This branch is presented as its own content structure, leaving room for a gallery and map."
        ),
        actions: {
          primary: {
            href: "/lien-he",
            label: text("Liên hệ chi nhánh", "Contact branch"),
            tone: "solid"
          },
          secondary: {
            href: "/chi-nhanh",
            label: text("Xem tất cả chi nhánh", "View all branches"),
            tone: "ghost"
          }
        },
        bullets: [
          text("Brighter, more relaxed branch story.", "Brighter, more relaxed branch story."),
          text("Map and hours stay editable.", "Map and hours stay editable."),
          text("Works with future CMS content.", "Works with future CMS content.")
        ],
        frame: {
          ...premiumBranchFrame,
          chips: ["Riverside", "Breakfast", "Spa"]
        }
      },
      {
        id: "signals",
        kind: "stats",
        eyebrow: text("Branch facts", "Branch facts"),
        title: text("Tổ chức dữ liệu branch", "Branch data structure"),
        description: text(
          "Những trường này là nền cho branch record và translation record.",
          "These fields underpin the branch record and translation record."
        ),
        items: [
          { value: "River", label: text("Vị trí", "Location"), detail: text("Gần mặt nước.", "Close to the water."), tone: "gold" },
          { value: "24/7", label: text("Giờ", "Hours"), detail: text("Có thể tuỳ chỉnh.", "Can be customized."), tone: "paper" },
          { value: "Map", label: text("Bản đồ", "Map"), detail: text("Giữ khu map riêng.", "Keep a dedicated map zone."), tone: "ink" },
          { value: "VI/EN", label: text("Ngôn ngữ", "Language"), detail: text("Vùng nội dung song ngữ.", "Bilingual content zones."), tone: "paper" }
        ]
      },
      {
        id: "zones",
        kind: "locale-zones",
        eyebrow: text("VI / EN content", "VI / EN content"),
        title: text("Vùng content cho Riverside", "Content zones for Riverside"),
        description: text(
          "Mỗi block language nên rõ ràng và dễ thay thế trong CMS.",
          "Each language block should be clear and easy to swap in CMS."
        ),
        zones: {
          vi: {
            eyebrow: text("Nội dung VI", "VI content"),
            title: text("Mô tả chi nhánh", "Branch copy"),
            description: text(
              "Riverside phù hợp cho khách thích nhịp nghỉ nhẹ nhàng, sáng sủa hơn.",
              "Riverside suits guests who prefer a lighter, brighter pace."
            ),
            bullets: [
              text("Không gian sáng tự nhiên.", "Natural daylight."),
              text("Có thể thêm branch offer.", "Can add branch offers."),
              text("Giữ layout đồng bộ.", "Keep the layout consistent.")
            ]
          },
          en: {
            eyebrow: text("EN content", "EN content"),
            title: text("English copy", "English copy"),
            description: text(
              "The branch copy keeps a calm premium tone and is easy to adapt later.",
              "The branch copy keeps a calm premium tone and is easy to adapt later."
            ),
            bullets: [
              text("Premium and restrained.", "Premium and restrained."),
              text("Ready for localized updates.", "Ready for localized updates."),
              text("Structured for future CMS entries.", "Structured for future CMS entries.")
            ]
          }
        }
      },
      collectionSplitSection(
        "branch-story",
        text("Branch story", "Branch story"),
        text("A location should feel like a content record with its own rhythm.", "A location should feel like a content record with its own rhythm."),
        text(
          "Không nên trộn địa chỉ, map và nội dung thương hiệu vào cùng một đống text.",
          "Address, maps, and brand copy should not be collapsed into one text blob."
        ),
        [
          text("Keep local content editable.", "Keep local content editable."),
          text("Support branch-specific offers later.", "Support branch-specific offers later."),
          text("Stay close to CMS structures.", "Stay close to CMS structures.")
        ],
        premiumBranchFrame
      ),
      {
        id: "related",
        kind: "cards",
        eyebrow: text("Related branches", "Related branches"),
        title: text("Chi nhánh liên quan", "Related branches"),
        description: text(
          "Giữ người đọc trong funnel location discovery.",
          "Keep guests in the location discovery funnel."
        ),
        items: branchItems.filter((item) => item.href !== "/chi-nhanh/riverside")
      },
      collectionBand(
        "/lien-he",
        text("Contact branch", "Contact branch"),
        text("Cần hỗ trợ với Riverside?", "Need help with Riverside?"),
        text(
          "Flow này chuẩn để staff tiếp nhận request nhanh.",
          "This flow is ready for staff to pick up requests quickly."
        )
      )
    ]
  }
];

const newsDetails: CmsPageCopy[] = [
  {
    kind: "article",
    slug: "/tin-tuc/hold-room-workflow",
    seo: {
      title: text("Hold room workflow", "Hold room workflow"),
      description: text(
        "Bài viết blog/news về cách hold room và expiry hoạt động trong phase 1.",
        "Blog/news article about how room holds and expiry work in phase 1."
      )
    },
    sections: [
      {
        id: "hero",
        kind: "hero",
        eyebrow: text("News article", "News article"),
        title: text("Hold room workflow", "Hold room workflow"),
        description: text(
          "Bài này được trình bày như một editorial article riêng, không giống listing page.",
          "This article is presented as its own editorial layout, not a listing page."
        ),
        actions: {
          primary: {
            href: "/tin-tuc",
            label: text("Xem news list", "View news list"),
            tone: "solid"
          },
          secondary: {
            href: "/lien-he",
            label: text("Liên hệ", "Contact"),
            tone: "ghost"
          }
        },
        bullets: [
          text("Hold and expiry remain manual-first.", "Holds and expiry remain manual-first."),
          text("Content stays near future CMS records.", "Content stays close to future CMS records."),
          text("Related articles link naturally.", "Related articles link naturally.")
        ],
        frame: premiumArticleFrame
      },
      {
        id: "stats",
        kind: "stats",
        eyebrow: text("Article facts", "Article facts"),
        title: text("Thông tin bài viết", "Article facts"),
        description: text(
          "News articles cần metadata đủ rõ để sau này publish theo ngôn ngữ.",
          "News articles need clear metadata so language-specific publishing is easy later."
        ),
        items: [
          { value: "News", label: text("Loại", "Type"), detail: text("Bài viết tin tức.", "News article."), tone: "paper" },
          { value: "5m", label: text("Độ dài", "Read time"), detail: text("Đọc nhanh.", "Quick read."), tone: "gold" },
          { value: "Draft", label: text("Workflow", "Workflow"), detail: text("Có thể qua review.", "Can go through review."), tone: "ink" },
          { value: "VI/EN", label: text("Ngôn ngữ", "Language"), detail: text("Nội dung song ngữ.", "Bilingual content."), tone: "paper" }
        ]
      },
      {
        id: "zones",
        kind: "locale-zones",
        eyebrow: text("VI / EN content", "VI / EN content"),
        title: text("Vùng song ngữ cho bài viết", "Bilingual zones for the article"),
        description: text(
          "Bài viết nên có block nội dung Việt và Anh riêng để CMS map dễ hơn.",
          "The article should have separate Vietnamese and English blocks so CMS mapping stays easy."
        ),
        zones: {
          vi: {
            eyebrow: text("Bản tiếng Việt", "Vietnamese"),
            title: text("Nội dung VI", "Vietnamese copy"),
            description: text(
              "Hold room workflow giải thích rõ cách khách gửi request, staff giữ phòng và expiry chạy ra sao.",
              "Hold room workflow explains how guests submit requests, staff creates a hold, and the expiry runs."
            ),
            bullets: [
              text("Giữ phase 1 manual-first.", "Keeps phase 1 manual-first."),
              text("Có thể nối sang hold CTA.", "Can connect to a hold CTA."),
              text("Không hứa booking tức thì.", "No instant booking promise.")
            ]
          },
          en: {
            eyebrow: text("English copy", "English copy"),
            title: text("English content", "English content"),
            description: text(
              "The article copy stays editorial and can later be split into translation records.",
              "The article copy stays editorial and can later be split into translation records."
            ),
            bullets: [
              text("Article blocks stay clean and separate.", "Article blocks stay clean and separate."),
              text("Suitable for CMS review workflow.", "Suitable for CMS review workflow."),
              text("Links naturally into other content.", "Links naturally into other content.")
            ]
          }
        }
      },
      collectionSplitSection(
        "body",
        text("Article body", "Article body"),
        text("The body can carry notes, rules, and editorial subheads.", "The body can carry notes, rules, and editorial subheads."),
        text(
          "Đây là nơi diễn giải quy trình, không phải nơi nhồi biểu mẫu.",
          "This is where the process is explained, not where forms are stuffed."
        ),
        [
          text("Use editorial rhythm and big type.", "Use editorial rhythm and big type."),
          text("Keep related links visible.", "Keep related links visible."),
          text("Structure content for future CMS blocks.", "Structure content for future CMS blocks.")
        ],
        premiumArticleFrame
      ),
      {
        id: "related",
        kind: "cards",
        eyebrow: text("Related articles", "Related articles"),
        title: text("Bài viết liên quan", "Related articles"),
        description: text(
          "Cards liên quan giữ người đọc trong newsroom funnel.",
          "Related cards keep readers inside the newsroom funnel."
        ),
        items: articleItems.filter((item) => item.href !== "/tin-tuc/hold-room-workflow")
      },
      collectionBand(
        "/tin-tuc",
        text("Read more", "Read more"),
        text("Muốn xem thêm các bài cập nhật?", "Want to see more updates?"),
        text(
          "Layout này khác list page để article đọc như nội dung biên tập.",
          "This layout differs from the list page so the article reads like editorial content."
        )
      )
    ]
  },
  {
    kind: "article",
    slug: "/tin-tuc/deposit-qr-manual-verification",
    seo: {
      title: text("Deposit QR and manual verification", "Deposit QR and manual verification"),
      description: text(
        "Bài viết blog/news về deposit QR, proof upload và manual verification.",
        "Blog/news article about deposit QR, proof upload, and manual verification."
      )
    },
    sections: [
      {
        id: "hero",
        kind: "hero",
        eyebrow: text("News article", "News article"),
        title: text("Deposit QR and manual verification", "Deposit QR and manual verification"),
        description: text(
          "Bài viết này mô tả luồng manual payment trong phase 1, gọn và rõ.",
          "This article describes the manual payment flow for phase 1 in a clean, concise way."
        ),
        actions: {
          primary: {
            href: "/tin-tuc",
            label: text("Xem news list", "View news list"),
            tone: "solid"
          },
          secondary: {
            href: "/lien-he",
            label: text("Liên hệ", "Contact"),
            tone: "ghost"
          }
        },
        bullets: [
          text("QR generation happens from amount and booking code.", "QR generation happens from amount and booking code."),
          text("Proof upload stays manual.", "Proof upload stays manual."),
          text("Verification sits with staff.", "Verification sits with staff.")
        ],
        frame: {
          ...premiumArticleFrame,
          chips: ["QR", "Deposit", "Verification"]
        }
      },
      {
        id: "stats",
        kind: "stats",
        eyebrow: text("Article facts", "Article facts"),
        title: text("Các trường metadata", "Metadata fields"),
        description: text(
          "Bài này có thể map sang article record và workflow status.",
          "This article can map to an article record and workflow status."
        ),
        items: [
          { value: "Payment", label: text("Chủ đề", "Topic"), detail: text("Xác minh thủ công.", "Manual verification."), tone: "gold" },
          { value: "QR", label: text("Cơ chế", "Mechanism"), detail: text("QR theo booking code.", "QR based on booking code."), tone: "paper" },
          { value: "Draft", label: text("Workflow", "Workflow"), detail: text("Dễ đưa qua review.", "Easy to review."), tone: "ink" },
          { value: "VI/EN", label: text("Ngôn ngữ", "Language"), detail: text("Song ngữ.", "Bilingual."), tone: "paper" }
        ]
      },
      {
        id: "zones",
        kind: "locale-zones",
        eyebrow: text("VI / EN content", "VI / EN content"),
        title: text("Vùng song ngữ cho bài QR", "Bilingual zones for the QR article"),
        description: text(
          "Article content có thể tách thành block theo ngôn ngữ khi nối CMS.",
          "Article content can split into language blocks when a CMS is attached."
        ),
        zones: {
          vi: {
            eyebrow: text("Bản tiếng Việt", "Vietnamese"),
            title: text("Nội dung VI", "Vietnamese copy"),
            description: text(
              "Bài viết này giải thích vì sao phase 1 cần xác minh thủ công thay vì tự động.",
              "This article explains why phase 1 needs manual verification instead of automation."
            ),
            bullets: [
              text("Giữ quy trình minh bạch.", "Keep the workflow transparent."),
              text("Không lẫn với booking tự động.", "Do not mix with automatic booking."),
              text("Chuẩn bị cho payment automation sau này.", "Prepare for payment automation later.")
            ]
          },
          en: {
            eyebrow: text("English copy", "English copy"),
            title: text("English content", "English content"),
            description: text(
              "The article reads as an editorial explainer with a future CMS structure in mind.",
              "The article reads as an editorial explainer with a future CMS structure in mind."
            ),
            bullets: [
              text("Manual verification first.", "Manual verification first."),
              text("Ready for future workflow records.", "Ready for future workflow records."),
              text("No instant payment confirmation promise.", "No instant payment confirmation promise.")
            ]
          }
        }
      },
      collectionSplitSection(
        "body",
        text("Payment body", "Payment body"),
        text("This is where the QR flow and payment proof notes can be explained.", "This is where the QR flow and payment proof notes can be explained."),
        text(
          "Không nhồi các bước vào một paragraph dài; dùng block rõ ràng.",
          "Avoid stuffing the steps into one long paragraph; use clear blocks."
        ),
        [
          text("Keep proof upload separate from confirmation.", "Keep proof upload separate from confirmation."),
          text("Use article blocks for policy notes.", "Use article blocks for policy notes."),
          text("Support future translation records.", "Support future translation records.")
        ],
        premiumArticleFrame
      ),
      {
        id: "related",
        kind: "cards",
        eyebrow: text("Related articles", "Related articles"),
        title: text("Bài viết liên quan", "Related articles"),
        description: text(
          "Giữ newsroom navigation tự nhiên và không cần hard-code text.",
          "Keep newsroom navigation natural and free from hard-coded text."
        ),
        items: articleItems.filter((item) => item.href !== "/tin-tuc/deposit-qr-manual-verification")
      },
      collectionBand(
        "/tin-tuc",
        text("Read more", "Read more"),
        text("Cần thêm bài viết về phase 1 manual flow?", "Need more articles about the phase 1 manual flow?"),
        text(
          "Layout này khác list để đọc như bài viết, không phải catalog.",
          "This layout differs from the list so it reads as an article, not a catalog."
        )
      )
    ]
  },
  {
    kind: "article",
    slug: "/tin-tuc/member-portal-vision",
    seo: {
      title: text("Member portal vision", "Member portal vision"),
      description: text(
        "Bài viết blog/news về member portal, lịch sử request và booking.",
        "Blog/news article about the member portal, request history, and bookings."
      )
    },
    sections: [
      {
        id: "hero",
        kind: "hero",
        eyebrow: text("News article", "News article"),
        title: text("Member portal vision", "Member portal vision"),
        description: text(
          "Bài viết này mô tả cách member portal giữ request, hold và booking history trong một shell gọn.",
          "This article shows how the member portal keeps requests, holds, and booking history inside one compact shell."
        ),
        actions: {
          primary: {
            href: "/member",
            label: text("Mở member portal", "Open member portal"),
            tone: "solid"
          },
          secondary: {
            href: "/tin-tuc",
            label: text("Xem news list", "View news list"),
            tone: "ghost"
          }
        },
        bullets: [
          text("Member history stays in one place.", "Member history stays in one place."),
          text("Consent and bookings remain visible.", "Consent and bookings remain visible."),
          text("Layout is editorial, not dashboard-heavy.", "Layout is editorial, not dashboard-heavy.")
        ],
        frame: premiumArticleFrame
      },
      {
        id: "stats",
        kind: "stats",
        eyebrow: text("Article facts", "Article facts"),
        title: text("Metadata cho member portal story", "Metadata for the member portal story"),
        description: text(
          "Bài này có thể đi theo review workflow và then publish.",
          "This article can move through review workflow and then be published."
        ),
        items: [
          { value: "Member", label: text("Chủ đề", "Topic"), detail: text("Portal và history.", "Portal and history."), tone: "paper" },
          { value: "6m", label: text("Độ dài", "Read time"), detail: text("Bài dài hơn chút.", "A slightly longer read."), tone: "gold" },
          { value: "Draft", label: text("Workflow", "Workflow"), detail: text("Có thể review trước publish.", "Can be reviewed before publishing."), tone: "ink" },
          { value: "VI/EN", label: text("Ngôn ngữ", "Language"), detail: text("Song ngữ.", "Bilingual."), tone: "paper" }
        ]
      },
      {
        id: "zones",
        kind: "locale-zones",
        eyebrow: text("VI / EN content", "VI / EN content"),
        title: text("Vùng song ngữ cho member article", "Bilingual zones for the member article"),
        description: text(
          "Nội dung có thể chia thành các block riêng để CMS map dễ hơn.",
          "Content can be split into blocks so CMS mapping stays easy."
        ),
        zones: {
          vi: {
            eyebrow: text("Bản tiếng Việt", "Vietnamese"),
            title: text("Nội dung VI", "Vietnamese copy"),
            description: text(
              "Member portal giữ cho người dùng nhìn thấy request, hold, booking và proof status ở một nơi.",
              "The member portal keeps requests, holds, bookings, and proof status in one place."
            ),
            bullets: [
              text("Lịch sử không bị phân tán.", "History is not scattered."),
              text("Consent tách khỏi giao dịch.", "Consent stays separate from transactions."),
              text("Dễ map vào profile record.", "Easy to map into a profile record.")
            ]
          },
          en: {
            eyebrow: text("English copy", "English copy"),
            title: text("English content", "English content"),
            description: text(
              "The article keeps an editorial tone while still making the product structure easy to read.",
              "The article keeps an editorial tone while still making the product structure easy to read."
            ),
            bullets: [
              text("History-first member UX.", "History-first member UX."),
              text("Suitable for future auth records.", "Suitable for future auth records."),
              text("Can grow into a CMS article.", "Can grow into a CMS article.")
            ]
          }
        }
      },
      collectionSplitSection(
        "body",
        text("Member body", "Member body"),
        text("The body can explain how the member area is organized.", "The body can explain how the member area is organized."),
        text(
          "Giữ nội dung rõ, sạch và đủ editorial để đọc như một bài viết.",
          "Keep the content clear, clean, and editorial enough to read like an article."
        ),
        [
          text("Keep request and booking history together.", "Keep request and booking history together."),
          text("Make consent visible but separate.", "Make consent visible but separate."),
          text("Prepare for future member CMS entries.", "Prepare for future member CMS entries.")
        ],
        premiumArticleFrame
      ),
      {
        id: "related",
        kind: "cards",
        eyebrow: text("Related articles", "Related articles"),
        title: text("Bài viết liên quan", "Related articles"),
        description: text(
          "Giữ người đọc trong newsletter/newsroom loop.",
          "Keep readers in the newsletter/newsroom loop."
        ),
        items: articleItems.filter((item) => item.href !== "/tin-tuc/member-portal-vision")
      },
      collectionBand(
        "/member",
        text("Open portal", "Open portal"),
        text("Muốn xem member portal thật của phase này?", "Want to see the current phase member portal?"),
        text(
          "Bài viết dẫn sang member shell để giữ cấu trúc rõ.",
          "The article leads into the member shell to keep the structure clear."
        )
      )
    ]
  }
];

export const homePageCopy: CmsPageCopy = {
  kind: "home",
  slug: "/",
  seo: {
    title: text("SK Boutique Hotel", "SK Boutique Hotel"),
    description: text(
      "Từ không gian, dịch vụ đến từng chi tiết nhỏ, mọi thứ được sắp đặt để bạn tận hưởng một kỳ nghỉ thoải mái và khác biệt.",
      "From the ambiance and service to the smallest details, everything is arranged for you to enjoy a comfortable and unique vacation."
    )
  },
  sections: homePageSections
};

export const roomCollectionPageCopy = roomCollectionPage;
export const branchCollectionPageCopy = branchCollectionPage;
export const newsCollectionPageCopy = newsCollectionPage;

export const roomDetailPages = roomDetails;
export const branchDetailPages = branchDetails;
export const newsDetailPages = newsDetails;

export function getRoomCollectionItems() {
  return roomItems;
}

export function getBranchCollectionItems() {
  return branchItems;
}

export function getNewsCollectionItems() {
  return articleItems;
}

export function findRoomPageBySlug(slug: string) {
  return roomDetails.find((page) => page.slug === `/phong/${slug}`);
}

export function findBranchPageBySlug(slug: string) {
  return branchDetails.find((page) => page.slug === `/chi-nhanh/${slug}`);
}

export function findNewsPageBySlug(slug: string) {
  return newsDetails.find((page) => page.slug === `/tin-tuc/${slug}`);
}

export function getRoomStaticParams() {
  return roomDetails.map((page) => ({ slug: page.slug.replace("/phong/", "") }));
}

export function getBranchStaticParams() {
  return branchDetails.map((page) => ({ slug: page.slug.replace("/chi-nhanh/", "") }));
}

export function getNewsStaticParams() {
  return newsDetails.map((page) => ({ slug: page.slug.replace("/tin-tuc/", "") }));
}
