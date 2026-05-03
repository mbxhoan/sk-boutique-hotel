import type { LocalizedText } from "@/lib/mock/i18n";

type AdminManagementFeature = {
  detail: LocalizedText;
  title: LocalizedText;
};

type AdminManagementPageCopy = {
  badge: LocalizedText;
  description: LocalizedText;
  eyebrow: LocalizedText;
  features: AdminManagementFeature[];
  note: LocalizedText;
  title: LocalizedText;
};

export const adminManagementCopy = {
  accounts: {
    badge: {
      vi: "Quản lý tài khoản",
      en: "Account management"
    },
    description: {
      vi: "Danh sách tài khoản nội bộ, trạng thái hoạt động và lối vào cho các luồng mời, khóa, đặt lại mật khẩu.",
      en: "Internal account lists, activation status, and the entry point for invites, lockouts, and password resets."
    },
    eyebrow: {
      vi: "Tài khoản nội bộ",
      en: "Internal accounts"
    },
    features: [
      {
        title: {
          vi: "Tài khoản seed và người dùng thật",
          en: "Seed users and real users"
        },
        detail: {
          vi: "Hiện nền auth đang dùng user seed; sau này nối Supabase Auth và invite flow vào đúng menu này.",
          en: "The auth foundation currently uses seeded users; later this menu will host Supabase Auth and invite flows."
        }
      },
      {
        title: {
          vi: "Trạng thái hoạt động",
          en: "Account status"
        },
        detail: {
          vi: "Tạm khóa, kích hoạt lại, và theo dõi lần đăng nhập gần nhất khi dữ liệu thật sẵn sàng.",
          en: "Lock, reactivate, and review the latest sign-in activity once real data is connected."
        }
      },
      {
        title: {
          vi: "Gắn với khách hàng",
          en: "Customer mapping"
        },
        detail: {
          vi: "Tài khoản member có thể nối sang hồ sơ khách lưu trú để xem lịch sử request và booking.",
          en: "Member accounts can map to customer profiles to expose request and booking history."
        }
      }
    ],
    note: {
      vi: "Khi CRUD thật được bật, đây sẽ là nơi staff quản lý tài khoản nội bộ mà không đụng shell vận hành.",
      en: "When CRUD goes live, this is where staff will manage internal accounts without touching the operational shell."
    },
    title: {
      vi: "Quản lý tài khoản",
      en: "Manage accounts"
    }
  } satisfies AdminManagementPageCopy,
  contentPages: {
    badge: {
      vi: "Bài viết & trang",
      en: "Pages & posts"
    },
    description: {
      vi: "Nơi quản lý bài viết, trang nội dung, newsroom, và các khối public site đã được dựng theo content_pages.",
      en: "Manage posts, content pages, newsroom entries, and the public-site blocks built on content_pages."
    },
    eyebrow: {
      vi: "CMS nội dung",
      en: "Content CMS"
    },
    features: [
      {
        title: {
          vi: "Trang chủ và trang tĩnh",
          en: "Home and static pages"
        },
        detail: {
          vi: "Home /, giới thiệu, chi nhánh, và các page tĩnh sẽ edit từ một record có cấu trúc thay vì hard code.",
          en: "Home /, about, branches, and static pages will be edited from structured records instead of hard-coded content."
        }
      },
      {
        title: {
          vi: "Bài viết và newsroom",
          en: "Articles and newsroom"
        },
        detail: {
          vi: "Danh sách tin tức và detail bài viết sẽ có draft, review, publish theo VI/EN.",
          en: "News lists and article detail pages will support draft, review, and publish flows for VI/EN."
        }
      },
      {
        title: {
          vi: "SEO và nội dung song ngữ",
          en: "SEO and bilingual content"
        },
        detail: {
          vi: "Slug, title, meta description, và nội dung theo ngôn ngữ sẽ map cleanly sang Supabase.",
          en: "Slug, title, meta descriptions, and language-specific content will map cleanly to Supabase."
        }
      }
    ],
    note: {
      vi: "Hiện content public đã đọc từ Supabase trước; menu này sẽ là nơi bạn sửa và publish nội dung đó sau.",
      en: "Public content already reads from Supabase first; this menu will be the place to edit and publish it later."
    },
    title: {
      vi: "Bài viết & trang",
      en: "Pages & posts"
    }
  } satisfies AdminManagementPageCopy,
  roles: {
    badge: {
      vi: "Phân quyền",
      en: "Permissions"
    },
    description: {
      vi: "Bảng phân quyền nội bộ để tách system_admin, admin, manager và staff theo trách nhiệm thật.",
      en: "A permission matrix that separates system_admin, admin, manager, and staff by real-world responsibility."
    },
    eyebrow: {
      vi: "Vai trò nội bộ",
      en: "Internal roles"
    },
    features: [
      {
        title: {
          vi: "Role theo trách nhiệm",
          en: "Role by responsibility"
        },
        detail: {
          vi: "Mỗi role sẽ chỉ nhìn thấy đúng phạm vi thao tác như content, ảnh xác nhận thanh toán hay audit.",
          en: "Each role will only see the correct scope of action such as content, payment proof, or audit."
        }
      },
      {
        title: {
          vi: "Tách quyền nhạy cảm",
          en: "Sensitive permissions"
        },
        detail: {
          vi: "Phê duyệt nội dung, verify ảnh xác nhận thanh toán, hủy booking và sửa setting sẽ được kiểm soát rõ hơn.",
          en: "Content approval, proof verification, booking cancellations, and settings will be controlled more tightly."
        }
      },
      {
        title: {
          vi: "Sẵn cho RLS",
          en: "RLS-ready"
        },
        detail: {
          vi: "Menu này sẽ nối trực tiếp vào permission matrix và RLS khi chuyển hoàn toàn sang dữ liệu thật.",
          en: "This menu will connect directly to the permission matrix and RLS when the app fully switches to real data."
        }
      }
    ],
    note: {
      vi: "Phân quyền là lớp nền cho admin portal, nên tách riêng để sau này mapping sang Supabase policies không phải sửa shell.",
      en: "Permissions are the foundation of the admin portal, so they stay separate to keep future Supabase policy mapping shell-safe."
    },
    title: {
      vi: "Phân quyền",
      en: "Roles and permissions"
    }
  } satisfies AdminManagementPageCopy
} as const;

export type AdminManagementKey = keyof typeof adminManagementCopy;
export type { AdminManagementPageCopy, AdminManagementFeature };
