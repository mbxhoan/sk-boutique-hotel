import type { LocalizedText } from "@/lib/mock/i18n";

type MarketingTone = "ink" | "paper" | "gold";

type MarketingLinkCopy = {
  href: string;
  label: LocalizedText;
};

export type MarketingMetric = {
  detail: LocalizedText;
  label: LocalizedText;
  value: string;
};

export type MarketingPillar = {
  bullets: LocalizedText[];
  description: LocalizedText;
  eyebrow: LocalizedText;
  tone: MarketingTone;
  title: LocalizedText;
};

export type MarketingWorkflowStep = {
  description: LocalizedText;
  step: string;
  title: LocalizedText;
};

export type MarketingHomeCopy = {
  hero: {
    badge: LocalizedText;
    bullets: LocalizedText[];
    description: LocalizedText;
    eyebrow: LocalizedText;
    primaryCta: MarketingLinkCopy;
    secondaryCta: MarketingLinkCopy;
    title: LocalizedText;
  };
  metrics: MarketingMetric[];
  pillars: MarketingPillar[];
  trust: {
    description: LocalizedText;
    items: LocalizedText[];
    title: LocalizedText;
  };
  workflow: MarketingWorkflowStep[];
};

export const marketingHomeCopy = {
  hero: {
    badge: {
      vi: "Phase 1 manual-first",
      en: "Phase 1 manual-first"
    },
    bullets: [
      {
        vi: "Public site, member portal, and admin shell are split into route groups from day one.",
        en: "Public site, member portal, and admin shell are split into route groups from day one."
      },
      {
        vi: "Room types are shown publicly, while operations stay grounded in physical rooms.",
        en: "Room types are shown publicly, while operations stay grounded in physical rooms."
      },
      {
        vi: "Hold expiry, payment verification, and audit logging stay visible in the UI model.",
        en: "Hold expiry, payment verification, and audit logging stay visible in the UI model."
      }
    ],
    description: {
      vi: "SK Boutique Hotel đang được dựng như một nền tảng front-end premium, sẵn đường cho Supabase về sau nhưng chưa buộc vào database thật trong phase này.",
      en: "SK Boutique Hotel is being built as a premium front-end foundation, ready for Supabase later while staying detached from the real database in this phase."
    },
    eyebrow: {
      vi: "SK Boutique Hotel",
      en: "SK Boutique Hotel"
    },
    primaryCta: {
      href: "/lien-he",
      label: {
        vi: "Kiểm tra phòng trống",
        en: "Check availability"
      }
    },
    secondaryCta: {
      href: "/thuong-hieu",
      label: {
        vi: "Xem luồng giữ phòng",
        en: "Review hold flow"
      }
    },
    title: {
      vi: "Một shell khách sạn premium, manual-first và sẵn đường mở rộng.",
      en: "A premium, manual-first hotel shell that stays extensible."
    }
  },
  metrics: [
    {
      value: "VI/EN",
      label: {
        vi: "Song ngữ",
        en: "Bilingual"
      },
      detail: {
        vi: "Copy tách riêng để sau này map sang CMS mà không phải sửa cấu trúc shell.",
        en: "Copy is isolated so it can map cleanly to a CMS later without reshaping the shell."
      }
    },
    {
      value: "30m",
      label: {
        vi: "HOLD SLA",
        en: "Hold SLA"
      },
      detail: {
        vi: "Mặc định 30 phút nhưng đủ chỗ để cấu hình lại bằng dữ liệu thật.",
        en: "Defaults to 30 minutes, while still leaving room for configurable data later."
      }
    },
    {
      value: "QR",
      label: {
        vi: "Thanh toán",
        en: "Payment"
      },
      detail: {
        vi: "QR + booking code + proof upload được thể hiện như một flow thủ công rõ ràng.",
        en: "QR, booking code, and proof upload are presented as a clear manual flow."
      }
    },
    {
      value: "Audit",
      label: {
        vi: "Vận hành",
        en: "Operations"
      },
      detail: {
        vi: "Những hành động nhạy cảm luôn có chỗ cho audit log và phân quyền.",
        en: "Sensitive actions always leave room for audit logs and permissions."
      }
    }
  ],
  pillars: [
    {
      tone: "ink",
      eyebrow: {
        vi: "Public marketing site",
        en: "Public marketing site"
      },
      title: {
        vi: "Trang chủ công khai có nhịp chậm, nhiều khoảng thở và CTA đúng phase 1.",
        en: "The public home page keeps a calm rhythm, generous breathing room, and phase-1-correct CTAs."
      },
      description: {
        vi: "Ngôn ngữ hình ảnh và typography được giữ sang nhưng không phô, để sau này thay nội dung thật rất nhẹ tay.",
        en: "Imagery and typography stay premium without being loud, so real content can replace the mock layer with minimal friction."
      },
      bullets: [
        {
          vi: "Hero, room types, offers, and contact blocks đều có thể thay bằng data động sau này.",
          en: "Hero, room types, offers, and contact blocks can all become dynamic data later."
        },
        {
          vi: "CTA công khai nói về kiểm tra phòng trống và giữ phòng, không hứa booking tức thì.",
          en: "Public CTAs talk about checking availability and holds, not instant booking."
        },
        {
          vi: "Màu nền, khoảng thở và tỷ lệ card được giữ ổn định để brand nhìn cao cấp hơn template mặc định.",
          en: "Backgrounds, spacing, and card ratios stay disciplined so the brand feels premium, not template-like."
        }
      ]
    },
    {
      tone: "paper",
      eyebrow: {
        vi: "Member area",
        en: "Member area"
      },
      title: {
        vi: "Member portal gọn, rõ, và sẵn chỗ cho lịch sử yêu cầu / booking.",
        en: "The member portal stays compact and clear, with room for request and booking history."
      },
      description: {
        vi: "Shell member giữ mọi thứ gần nhau: request, hold, booking, proof upload và trạng thái xác thực.",
        en: "The member shell keeps requests, holds, bookings, proof uploads, and verification status close together."
      },
      bullets: [
        {
          vi: "Giữ các panel ở mức dễ quét nhanh trên desktop và vẫn chịu được mobile.",
          en: "Panels stay easy to scan on desktop while still working on mobile."
        },
        {
          vi: "Luồng xác thực và marketing consent có chỗ hiển thị rõ ràng ngay trong shell.",
          en: "Verification state and marketing consent have a clear place inside the shell."
        },
        {
          vi: "Sau này chỉ cần gắn Supabase Auth là có thể đổi sang dữ liệu thật mà không phải sửa khung.",
          en: "Once Supabase Auth lands, real data can slot in without changing the frame."
        }
      ]
    },
    {
      tone: "gold",
      eyebrow: {
        vi: "Admin area",
        en: "Admin area"
      },
      title: {
        vi: "Admin console ưu tiên tốc độ vận hành, queue rõ và audit dễ đọc.",
        en: "The admin console prioritizes operating speed, clear queues, and readable audit trails."
      },
      description: {
        vi: "Các panel cho requests, holds, manual reservations, content approval và audit log đều được đặt theo nhịp làm việc của staff.",
        en: "Panels for requests, holds, manual reservations, content approval, and audit logs are arranged to match staff workflow."
      },
      bullets: [
        {
          vi: "Phân tách queue và snapshot để staff quét trạng thái nhanh hơn.",
          en: "Queues and snapshots are separated so staff can scan status more quickly."
        },
        {
          vi: "Mọi khối dữ liệu vẫn có thể map sang Supabase tables sau này.",
          en: "Every data block can still map cleanly to Supabase tables later."
        },
        {
          vi: "Không có business logic nhồi trong page; page chỉ ghép data vào shell.",
          en: "No business logic is stuffed into the page; pages just compose data into the shell."
        }
      ]
    }
  ],
  trust: {
    description: {
      vi: "Phase 1 ưu tiên manual verification, hold expiry, auditability, và khả năng mở rộng thay vì đẩy người dùng vào booking tự động.",
      en: "Phase 1 prioritizes manual verification, hold expiry, auditability, and future extensibility instead of forcing users into automatic booking."
    },
    items: [
      {
        vi: "Public room type cards",
        en: "Public room type cards"
      },
      {
        vi: "Manual payment proof",
        en: "Manual payment proof"
      },
      {
        vi: "Member history",
        en: "Member history"
      },
      {
        vi: "Audit logging",
        en: "Audit logging"
      }
    ],
    title: {
      vi: "Một nền móng đủ chắc để mở rộng sang OTA, payment automation và CRM sâu hơn.",
      en: "A foundation sturdy enough for OTA, payment automation, and deeper CRM later."
    }
  },
  workflow: [
    {
      step: "01",
      title: {
        vi: "Khách xem phòng",
        en: "Guest explores rooms"
      },
      description: {
        vi: "Website công khai hiển thị room types, branch context và CTA rõ cho bước tiếp theo.",
        en: "The public website shows room types, branch context, and a clear next-step CTA."
      }
    },
    {
      step: "02",
      title: {
        vi: "Gửi yêu cầu",
        en: "Request submitted"
      },
      description: {
        vi: "Khách gửi availability request hoặc hold request nhưng không bị hứa booking tức thì.",
        en: "Guests submit availability or hold requests without being promised instant booking."
      }
    },
    {
      step: "03",
      title: {
        vi: "Staff giữ và xác nhận",
        en: "Staff holds and confirms"
      },
      description: {
        vi: "Nhân sự chọn phòng thật, tạo hold, gắn expiry, rồi tiếp tục thành manual reservation khi cần.",
        en: "Staff selects a physical room, creates the hold, sets expiry, and continues into a manual reservation when needed."
      }
    },
    {
      step: "04",
      title: {
        vi: "Xác minh thanh toán",
        en: "Payment verification"
      },
      description: {
        vi: "QR, amount, proof upload và xác nhận thủ công được đặt thành một bước vận hành rõ ràng.",
        en: "QR, amount, proof upload, and manual confirmation are presented as one clear operating step."
      }
    }
  ]
} satisfies MarketingHomeCopy;
