import type { LocalizedText } from "@/lib/mock/i18n";

export type MemberNavItem = {
  href: string;
  label: LocalizedText;
};

export type MemberStat = {
  detail: LocalizedText;
  label: LocalizedText;
  value: string;
};

export type MemberRequestCard = {
  code: string;
  detail: LocalizedText;
  note: LocalizedText;
  status: LocalizedText;
  title: LocalizedText;
  tone: "ink" | "paper" | "gold";
};

export type MemberTimelineItem = {
  description: LocalizedText;
  title: LocalizedText;
  time: string;
};

export type MemberProfileItem = {
  label: LocalizedText;
  value: LocalizedText;
};

export type MemberDashboardCopy = {
  shell: {
    actions: {
      primary: {
        href: string;
        label: LocalizedText;
      };
      secondary: {
        href: string;
        label: LocalizedText;
      };
    };
    badge: LocalizedText;
    bullets: LocalizedText[];
    description: LocalizedText;
    eyebrow: LocalizedText;
    title: LocalizedText;
  };
  nav: MemberNavItem[];
  profile: MemberProfileItem[];
  requests: MemberRequestCard[];
  stats: MemberStat[];
  timeline: MemberTimelineItem[];
  sections: {
    history: {
      description: LocalizedText;
      eyebrow: LocalizedText;
      title: LocalizedText;
    };
    notifications: {
      description: LocalizedText;
      eyebrow: LocalizedText;
      title: LocalizedText;
    };
    profile: {
      description: LocalizedText;
      eyebrow: LocalizedText;
      title: LocalizedText;
    };
    requests: {
      description: LocalizedText;
      eyebrow: LocalizedText;
      title: LocalizedText;
    };
    summary: {
      description: LocalizedText;
      eyebrow: LocalizedText;
      title: LocalizedText;
    };
  };
};

export const memberDashboardCopy = {
  nav: [
    {
      href: "#requests",
      label: {
        vi: "Đặt phòng",
        en: "Booking"
      }
    },
    {
      href: "#history",
      label: {
        vi: "Lịch sử",
        en: "History"
      }
    },
    {
      href: "#profile",
      label: {
        vi: "Thông tin",
        en: "Profile"
      }
    },
    {
      href: "#notifications",
      label: {
        vi: "Thông báo",
        en: "Notifications"
      }
    }
  ],
  profile: [
    {
      label: {
        vi: "Email đã xác minh",
        en: "Verified email"
      },
      value: {
        vi: "Đang chờ",
        en: "Pending"
      }
    },
    {
      label: {
        vi: "Marketing consent",
        en: "Marketing consent"
      },
      value: {
        vi: "Được lưu riêng",
        en: "Stored separately"
      }
    },
    {
      label: {
        vi: "Ưu tiên chi nhánh",
        en: "Preferred branch"
      },
      value: {
        vi: "Central District",
        en: "Central District"
      }
    }
  ],
  requests: [
    {
      code: "REQ-2604-01",
      detail: {
        vi: "Availability request cho cuối tuần tại branch trung tâm.",
        en: "Availability request for a weekend stay at the central branch."
      },
      note: {
        vi: "Đang chờ staff phản hồi trong SLA 30 phút.",
        en: "Waiting for staff response within the 30-minute SLA."
      },
      status: {
        vi: "Đang xử lý",
        en: "In progress"
      },
      title: {
        vi: "Yêu cầu kiểm tra phòng",
        en: "Availability check"
      },
      tone: "ink"
    },
    {
      code: "HOLD-2604-08",
      detail: {
        vi: "Hold tạm cho 1 phòng superior, expiry còn 17 phút.",
        en: "Temporary hold for one superior room, expiring in 17 minutes."
      },
      note: {
        vi: "Cần proof upload trước khi staff chuyển sang manual reservation.",
        en: "Proof upload is needed before staff can move it to manual reservation."
      },
      status: {
        vi: "Giữ chỗ",
        en: "Held"
      },
      title: {
        vi: "Yêu cầu giữ phòng",
        en: "Hold request"
      },
      tone: "gold"
    },
    {
      code: "BOOK-2599-14",
      detail: {
        vi: "Booking đã xác nhận thủ công sau khi proof được duyệt.",
        en: "Booking confirmed manually after proof was approved."
      },
      note: {
        vi: "PDF booking confirmation đã sẵn sàng trong lịch sử.",
        en: "Booking confirmation PDF is ready in history."
      },
      status: {
        vi: "Đã xác nhận",
        en: "Confirmed"
      },
      title: {
        vi: "Đặt phòng gần nhất",
        en: "Latest booking"
      },
      tone: "paper"
    }
  ],
  sections: {
    history: {
      description: {
        vi: "Các mốc gần nhất hiển thị theo trật tự vận hành, để người dùng thấy rõ mọi bước đều được xử lý thủ công.",
        en: "Recent milestones follow the operating order so guests can see that every step is handled manually."
      },
      eyebrow: {
        vi: "Hoạt động gần nhất",
        en: "Recent activity"
      },
      title: {
        vi: "Nhật ký trạng thái",
        en: "Status timeline"
      }
    },
    profile: {
      description: {
        vi: "Thông tin hồ sơ, consent, và nhịp liên hệ được tách rõ để sau này nối Supabase Auth dễ hơn.",
        en: "Profile data, consent, and contact rhythm are separated so Supabase Auth can be added later with less friction."
      },
      eyebrow: {
        vi: "Hồ sơ thành viên",
        en: "Member profile"
      },
      title: {
        vi: "Mẫu dữ liệu thành viên",
        en: "Member data snapshot"
      }
    },
    notifications: {
      description: {
        vi: "Thông báo realtime giúp khách nhìn thấy trạng thái mới của request, hold, booking và proof.",
        en: "Realtime notifications show guests the latest state changes for requests, holds, bookings, and proof."
      },
      eyebrow: {
        vi: "Thông báo",
        en: "Notifications"
      },
      title: {
        vi: "Cập nhật gần nhất",
        en: "Latest updates"
      }
    },
    requests: {
      description: {
        vi: "Panel này dành cho availability request, hold request và booking manual trong cùng một màn hình gọn.",
        en: "This panel groups availability requests, hold requests, and manual bookings into one compact screen."
      },
      eyebrow: {
        vi: "Yêu cầu và booking",
        en: "Requests and bookings"
      },
      title: {
        vi: "Những mục đang theo dõi",
        en: "Tracked items"
      }
    },
    summary: {
      description: {
        vi: "Tổng quan nên nói rõ điều gì đang mở, điều gì đang giữ, và điều gì đã xác nhận.",
        en: "The summary should show what is open, what is held, and what is already confirmed."
      },
      eyebrow: {
        vi: "Tổng quan nhanh",
        en: "Quick overview"
      },
      title: {
        vi: "Member portal",
        en: "Member portal"
      }
    }
  },
  shell: {
    actions: {
      primary: {
        href: "#requests",
        label: {
          vi: "Gửi yêu cầu mới",
          en: "New request"
        }
      },
      secondary: {
        href: "/lien-he",
        label: {
          vi: "Hỗ trợ",
          en: "Support"
        }
      }
    },
    badge: {
      vi: "Member portal",
      en: "Member portal"
    },
    bullets: [
      {
        vi: "Request, hold, booking, và payment proof đều hiển thị trong một shell gọn.",
        en: "Requests, holds, bookings, and payment proof all live inside one compact shell."
      },
      {
        vi: "Marketing consent được tách riêng để không lẫn với luồng giao dịch.",
        en: "Marketing consent stays separate so it never mixes with transactional flow."
      },
      {
        vi: "Mọi thứ ở đây vẫn là mock, sẵn chỗ map sang dữ liệu thật sau này.",
        en: "Everything here is still mock data, ready to map to real records later."
      }
    ],
    description: {
      vi: "Member area này giúp khách xem lịch sử yêu cầu, hold, booking và trạng thái proof mà không làm họ lạc trong giao diện quá phức tạp.",
      en: "This member area lets guests review requests, holds, bookings, and proof status without getting lost in a complicated interface."
    },
    eyebrow: {
      vi: "Khách đã đăng nhập",
      en: "Signed-in guest"
    },
    title: {
      vi: "Mọi lịch sử lưu trú ở cùng một nơi.",
      en: "All stay history in one place."
    }
  },
  stats: [
    {
      value: "02",
      label: {
        vi: "Yêu cầu đang mở",
        en: "Open requests"
      },
      detail: {
        vi: "Một availability request và một hold request đang chờ staff xử lý.",
        en: "One availability request and one hold request are waiting for staff action."
      }
    },
    {
      value: "17m",
      label: {
        vi: "Hold còn lại",
        en: "Hold remaining"
      },
      detail: {
        vi: "Thời gian còn lại của hold đang chạy theo SLA 30 phút.",
        en: "The hold is counting down against the 30-minute SLA."
      }
    },
    {
      value: "01",
      label: {
        vi: "Booking xác nhận",
        en: "Confirmed booking"
      },
      detail: {
        vi: "Đã có một booking hoàn tất sau khi proof được staff duyệt thủ công.",
        en: "One booking is complete after manual staff verification."
      }
    },
    {
      value: "PDF",
      label: {
        vi: "Tài liệu",
        en: "Documents"
      },
      detail: {
        vi: "Confirmation PDF và lịch sử xử lý được lưu sẵn trong portal.",
        en: "Confirmation PDFs and processing history are stored inside the portal."
      }
    }
  ],
  timeline: [
    {
      time: "08:40",
      title: {
        vi: "Yêu cầu đã nộp",
        en: "Request submitted"
      },
      description: {
        vi: "Khách gửi yêu cầu kiểm tra phòng cho cuối tuần tại chi nhánh trung tâm.",
        en: "The guest submitted a weekend availability check for the central branch."
      }
    },
    {
      time: "09:02",
      title: {
        vi: "Hold được tạo",
        en: "Hold created"
      },
      description: {
        vi: "Staff giữ một phòng superior và đặt expiry theo quy tắc phase 1.",
        en: "Staff held one superior room and set expiry using the phase 1 rules."
      }
    },
    {
      time: "09:18",
      title: {
        vi: "Proof upload",
        en: "Proof uploaded"
      },
      description: {
        vi: "Khách đã gửi chứng từ thanh toán và chờ xác minh thủ công.",
        en: "The guest uploaded payment proof and is waiting for manual verification."
      }
    }
  ]
} satisfies MemberDashboardCopy;
