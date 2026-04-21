import type { LocalizedText } from "@/lib/mock/i18n";

export type AdminNavItem = {
  icon: "audit" | "branches" | "content" | "dashboard" | "media" | "operations" | "roles" | "users";
  href: string;
  label: LocalizedText;
};

export type AdminNavGroup = {
  label: LocalizedText;
  items: AdminNavItem[];
};

export type AdminStat = {
  detail: LocalizedText;
  label: LocalizedText;
  value: string;
};

export type AdminQueueItem = {
  detail: LocalizedText;
  status: LocalizedText;
  title: LocalizedText;
  code: string;
  tone: "ink" | "paper" | "gold";
};

export type AdminAuditItem = {
  detail: LocalizedText;
  title: LocalizedText;
  time: string;
};

export type AdminBranchItem = {
  detail: LocalizedText;
  status: LocalizedText;
  title: LocalizedText;
};

export type AdminDashboardCopy = {
  audit: AdminAuditItem[];
  branches: AdminBranchItem[];
  nav: AdminNavItem[];
  navGroups: AdminNavGroup[];
  queues: AdminQueueItem[];
  sections: {
    audit: {
      description: LocalizedText;
      eyebrow: LocalizedText;
      title: LocalizedText;
    };
    branches: {
      description: LocalizedText;
      eyebrow: LocalizedText;
      title: LocalizedText;
    };
    operations: {
      description: LocalizedText;
      eyebrow: LocalizedText;
      title: LocalizedText;
    };
    overview: {
      description: LocalizedText;
      eyebrow: LocalizedText;
      title: LocalizedText;
    };
  };
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
  stats: AdminStat[];
};

export const adminDashboardCopy = {
  audit: [
    {
      detail: {
        vi: "Action nhạy cảm được ghi lại cùng user và branch scope.",
        en: "Sensitive actions are recorded with user and branch scope."
      },
      title: {
        vi: "Payment proof verified",
        en: "Payment proof verified"
      },
      time: "09:44"
    },
    {
      detail: {
        vi: "Content hero đã được duyệt trước khi lên public site.",
        en: "Hero content approved before publishing to the public site."
      },
      title: {
        vi: "Homepage content approved",
        en: "Homepage content approved"
      },
      time: "10:05"
    },
    {
      detail: {
        vi: "Một hold sắp hết hạn đã được staff nhắc xử lý.",
        en: "An expiring hold was flagged for staff follow-up."
      },
      title: {
        vi: "Hold expiry reminder",
        en: "Hold expiry reminder"
      },
      time: "10:16"
    }
  ],
  branches: [
    {
      detail: {
        vi: "28 phòng đang sellable, 2 phòng maintenance.",
        en: "28 sellable rooms, 2 maintenance rooms."
      },
      status: {
        vi: "Ổn định",
        en: "Stable"
      },
      title: {
        vi: "Central Branch",
        en: "Central Branch"
      }
    },
    {
      detail: {
        vi: "Sẵn cho room type showcase và branch-specific offers.",
        en: "Ready for room type showcases and branch-specific offers."
      },
      status: {
        vi: "Hoạt động",
        en: "Active"
      },
      title: {
        vi: "Riverside Branch",
        en: "Riverside Branch"
      }
    }
  ],
  nav: [
    {
      icon: "dashboard",
      href: "#overview",
      label: {
        vi: "Tổng quan",
        en: "Overview"
      }
    },
    {
      icon: "operations",
      href: "#requests",
      label: {
        vi: "Vận hành",
        en: "Operations"
      }
    },
    {
      icon: "branches",
      href: "#branches",
      label: {
        vi: "Chi nhánh",
        en: "Branches"
      }
    },
    {
      icon: "audit",
      href: "#audit",
      label: {
        vi: "Audit log",
        en: "Audit log"
      }
    }
  ],
  navGroups: [
    {
      label: {
        vi: "Vận hành",
        en: "Operations"
      },
      items: [
        {
          icon: "dashboard",
          href: "#overview",
          label: {
            vi: "Tổng quan",
            en: "Overview"
          }
        },
        {
          icon: "operations",
          href: "#requests",
          label: {
            vi: "Vận hành",
            en: "Operations"
          }
        },
        {
          icon: "branches",
          href: "#branches",
          label: {
            vi: "Chi nhánh",
            en: "Branches"
          }
        },
        {
          icon: "audit",
          href: "#audit",
          label: {
            vi: "Audit log",
            en: "Audit log"
          }
        }
      ]
    },
    {
      label: {
        vi: "Quản trị",
        en: "Administration"
      },
      items: [
        {
          icon: "users",
          href: "/admin/accounts",
          label: {
            vi: "Tài khoản",
            en: "Accounts"
          }
        },
        {
          icon: "roles",
          href: "/admin/roles",
          label: {
            vi: "Phân quyền",
            en: "Roles"
          }
        }
      ]
    },
    {
      label: {
        vi: "Nội dung",
        en: "Content"
      },
      items: [
        {
          icon: "content",
          href: "/admin/content-pages",
          label: {
            vi: "Bài viết & trang",
            en: "Pages & posts"
          }
        },
        {
          icon: "media",
          href: "/admin/media",
          label: {
            vi: "Media",
            en: "Media"
          }
        }
      ]
    }
  ],
  queues: [
    {
      code: "AV-2604-11",
      detail: {
        vi: "Yêu cầu kiểm tra phòng cho 2 đêm cuối tuần, branch trung tâm.",
        en: "Weekend availability check for two nights at the central branch."
      },
      status: {
        vi: "Cần phản hồi",
        en: "Needs response"
      },
      title: {
        vi: "Availability request",
        en: "Availability request"
      },
      tone: "ink"
    },
    {
      code: "HOLD-2604-22",
      detail: {
        vi: "Hold sắp hết hạn, khách đã upload proof nhưng chưa verify xong.",
        en: "Hold is expiring soon; the guest uploaded proof but verification is still pending."
      },
      status: {
        vi: "Sắp hết hạn",
        en: "Expiring soon"
      },
      title: {
        vi: "Hold queue",
        en: "Hold queue"
      },
      tone: "gold"
    },
    {
      code: "PAY-2604-03",
      detail: {
        vi: "Proof upload đã tới inbox staff và chờ confirm thủ công.",
        en: "Proof upload landed in the staff inbox and is waiting for manual confirmation."
      },
      status: {
        vi: "Chờ kiểm tra",
        en: "Awaiting review"
      },
      title: {
        vi: "Payment verification",
        en: "Payment verification"
      },
      tone: "paper"
    }
  ],
  sections: {
    audit: {
      description: {
        vi: "Audit log cần làm rõ người làm, thời điểm làm, và bối cảnh branch để tiện truy vết.",
        en: "Audit logs should make the actor, timestamp, and branch context obvious for traceability."
      },
      eyebrow: {
        vi: "Truy vết vận hành",
        en: "Operational trace"
      },
      title: {
        vi: "Nhật ký gần nhất",
        en: "Latest audit trail"
      }
    },
    branches: {
      description: {
        vi: "Mỗi branch card nên gợi ý trạng thái sellable room, maintenance room và mức độ hoạt động.",
        en: "Each branch card should hint at sellable rooms, maintenance rooms, and overall operating health."
      },
      eyebrow: {
        vi: "Chi nhánh",
        en: "Branches"
      },
      title: {
        vi: "Snapshot vận hành",
        en: "Operating snapshot"
      }
    },
    operations: {
      description: {
        vi: "Queue nên chia theo request, hold và payment để staff nhìn là biết ưu tiên nào trước.",
        en: "Queues should split requests, holds, and payments so staff can see the priority order instantly."
      },
      eyebrow: {
        vi: "Queue vận hành",
        en: "Operations queue"
      },
      title: {
        vi: "Công việc đang chờ",
        en: "Items waiting for action"
      }
    },
    overview: {
      description: {
        vi: "Tổng quan admin phải nói ngay được hôm nay có bao nhiêu request, hold, proof và audit event.",
        en: "The admin overview should immediately show today's request, hold, proof, and audit counts."
      },
      eyebrow: {
        vi: "Admin console",
        en: "Admin console"
      },
      title: {
        vi: "Vận hành hôm nay",
        en: "Today's operations"
      }
    }
  },
  shell: {
    actions: {
      primary: {
        href: "#requests",
        label: {
          vi: "Mở queue",
          en: "Open queue"
        }
      },
      secondary: {
        href: "#audit",
        label: {
          vi: "Xem audit",
          en: "View audit"
        }
      }
    },
    badge: {
      vi: "Admin console",
      en: "Admin console"
    },
    bullets: [
      {
        vi: "Không có instant booking, chỉ có manual booking và verification rõ ràng.",
        en: "No instant booking, only clear manual booking and verification."
      },
      {
        vi: "Branch scope, content approval, payment proof và audit log phải nhìn thấy ngay.",
        en: "Branch scope, content approval, payment proof, and audit logs must stay visible."
      },
      {
        vi: "Mọi panel đều chuẩn bị để sau này map sang Supabase thật mà không đổi shell.",
        en: "Every panel is ready to map to real Supabase data later without changing the shell."
      }
    ],
    description: {
      vi: "Admin area này ưu tiên tốc độ xử lý request, hold, payment proof và content approval hơn là sự phô diễn UI.",
      en: "This admin area prioritizes request handling, holds, payment proof, and content approval over flashy UI."
    },
    eyebrow: {
      vi: "Vận hành nội bộ",
      en: "Internal operations"
    },
    title: {
      vi: "Queue rõ, audit rõ, xử lý nhanh.",
      en: "Clear queues, clear audit, fast actions."
    }
  },
  stats: [
    {
      value: "12",
      label: {
        vi: "Request mở",
        en: "Open requests"
      },
      detail: {
        vi: "Đang có availability request cần staff xử lý thủ công.",
        en: "Availability requests are waiting for manual staff handling."
      }
    },
    {
      value: "05",
      label: {
        vi: "Hold sắp hết hạn",
        en: "Expiring holds"
      },
      detail: {
        vi: "Các hold này cần được kiểm tra trước khi expiry chạm.",
        en: "These holds need review before expiry hits."
      }
    },
    {
      value: "08",
      label: {
        vi: "Proof chờ duyệt",
        en: "Proofs pending"
      },
      detail: {
        vi: "Payment proof đã upload nhưng vẫn chờ staff verify.",
        en: "Payment proofs were uploaded and are still waiting for staff verification."
      }
    },
    {
      value: "24",
      label: {
        vi: "Audit event",
        en: "Audit events"
      },
      detail: {
        vi: "Những hành động nhạy cảm trong ngày đã sẵn sàng để truy vết.",
        en: "Sensitive actions for the day are ready for traceability."
      }
    }
  ]
} satisfies AdminDashboardCopy;
