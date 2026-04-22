import Link from "next/link";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { PortalCard, PortalHelp } from "@/components/portal-ui";
import type { WorkflowDashboardData } from "@/lib/supabase/workflow.types";

type AdminDashboardProps = {
  canOperate: boolean;
  data: WorkflowDashboardData;
  locale: Locale;
  testEmailDefaultRecipient: string;
};

type AdminGlanceItem = {
  initials: string;
  label: string;
  detail: string;
  time: string;
  badge: string;
  badgeTone: "blue" | "gold" | "danger";
};

type MetricTone = "default" | "gold" | "warning";

const metricCards: Array<{
  detail: {
    en: string;
    vi: string;
  };
  icon: "bookings" | "payments" | "occupancy" | "pending";
  label: {
    en: string;
    vi: string;
  };
  value: string;
  tone: MetricTone;
  trend: {
    en: string;
    vi: string;
  };
}> = [
  {
    detail: {
      vi: "So với tuần trước",
      en: "vs last week"
    },
    icon: "bookings",
    label: {
      vi: "Tổng booking",
      en: "Total Bookings"
    },
    value: "142",
    tone: "default",
    trend: {
      vi: "+12%",
      en: "+12%"
    }
  },
  {
    detail: {
      vi: "So với tuần trước",
      en: "vs last week"
    },
    icon: "payments",
    label: {
      vi: "Doanh thu",
      en: "Revenue"
    },
    value: "$24,500",
    tone: "default",
    trend: {
      vi: "+8.4%",
      en: "+8.4%"
    }
  },
  {
    detail: {
      vi: "So với tuần trước",
      en: "vs last week"
    },
    icon: "occupancy",
    label: {
      vi: "Tỉ lệ lấp đầy",
      en: "Occupancy Rate"
    },
    value: "85%",
    tone: "gold",
    trend: {
      vi: "+2.1%",
      en: "+2.1%"
    }
  },
  {
    detail: {
      vi: "Cần xử lý",
      en: "Action required"
    },
    icon: "pending",
    label: {
      vi: "Yêu cầu chờ",
      en: "Pending Requests"
    },
    value: "12",
    tone: "warning",
    trend: {
      vi: "Cảnh báo",
      en: "Action required"
    }
  }
];

const trendBars = [
  { day: "Mon", value: 60, tone: "default" },
  { day: "Tue", value: 86, tone: "gold" },
  { day: "Wed", value: 42, tone: "default" },
  { day: "Thu", value: 73, tone: "default" },
  { day: "Fri", value: 90, tone: "accent" },
  { day: "Sat", value: 57, tone: "default" },
  { day: "Sun", value: 68, tone: "default" }
] as const;

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatReservationNights(startAt: string, endAt: string) {
  const diffMs = new Date(endAt).getTime() - new Date(startAt).getTime();
  const nights = Math.max(1, Math.round(diffMs / 86_400_000));
  return nights;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour12: false,
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function MetricGlyph({
  icon
}: {
  icon: "bookings" | "payments" | "occupancy" | "pending";
}) {
  if (icon === "payments") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 90 90">
        <rect height="50" rx="10" stroke="currentColor" strokeWidth="4" width="72" x="9" y="16" />
        <path d="M9 32h72" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
        <path d="M27 49h16" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
        <path d="M28 24h20" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      </svg>
    );
  }

  if (icon === "occupancy") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 90 90">
        <path
          d="M18 48c0-14 12-26 27-26s27 12 27 26v17H18V48Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <path d="M29 65V38h32v27" stroke="currentColor" strokeLinejoin="round" strokeWidth="4" />
        <path d="M36 48h18" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      </svg>
    );
  }

  if (icon === "pending") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 90 90">
        <rect height="58" rx="12" stroke="currentColor" strokeWidth="4" width="58" x="16" y="16" />
        <path d="M45 28v18l12 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        <path d="M66 66 76 76" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 90 90">
      <rect height="58" rx="12" stroke="currentColor" strokeWidth="4" width="58" x="16" y="16" />
      <path d="M16 36h58" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      <path d="M31 16v20M59 16v20" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      <path d="M31 47h10M31 60h18" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}

function MetricCard({
  detail,
  icon,
  label,
  locale,
  tone,
  trend,
  value
}: {
  detail: { en: string; vi: string };
  icon: "bookings" | "payments" | "occupancy" | "pending";
  label: { en: string; vi: string };
  locale: Locale;
  tone: MetricTone;
  trend: { en: string; vi: string };
  value: string;
}) {
  return (
    <PortalCard className={`admin-dashboard__metric admin-dashboard__metric--${tone}`} tone={tone === "gold" ? "accent" : "default"}>
      <div className="admin-dashboard__metric-art" aria-hidden="true">
        <MetricGlyph icon={icon} />
      </div>
      <div className="admin-dashboard__metric-copy">
        <p className="admin-dashboard__metric-label">{label[locale]}</p>
        <p className="admin-dashboard__metric-value">{value}</p>
      </div>
      <p className={`admin-dashboard__metric-trend admin-dashboard__metric-trend--${tone}`}>
        {tone === "warning" ? "↘" : "↗"} {trend[locale]} {detail[locale]}
      </p>
    </PortalCard>
  );
}

function getGlanceItems(data: WorkflowDashboardData, locale: Locale): AdminGlanceItem[] {
  const recentReservations = data.recent_reservations.slice(0, 3);
  const recentRequests = data.availability_requests.slice(0, 1);

  const items: AdminGlanceItem[] = [
    {
      initials: "ES",
      label: "Eleanor Shellstrop",
      detail: "Deluxe Suite • 2 Nights",
      time: "14:00",
      badge: locale === "en" ? "Check In" : "Check In",
      badgeTone: "blue"
    },
    {
      initials: "CD",
      label: "Chidi Anagonye",
      detail: "Standard King",
      time: "11:00",
      badge: locale === "en" ? "Check Out" : "Check Out",
      badgeTone: "gold"
    },
    {
      initials: "TA",
      label: "Tahani Al-Jamil",
      detail: "Penthouse • Extra Towels",
      time: "",
      badge: locale === "en" ? "Request" : "Request",
      badgeTone: "danger"
    },
    {
      initials: "JM",
      label: "Jianyu Mendoza",
      detail: "Standard Twin • 4 Nights",
      time: "16:30",
      badge: locale === "en" ? "Check In" : "Check In",
      badgeTone: "blue"
    }
  ];

  const mapped: AdminGlanceItem[] = [];

  recentReservations.slice(0, 4).forEach((reservation, index) => {
    const fallback = items[index];

    mapped.push({
      initials: initialsFromName(reservation.customer_name),
      label: reservation.customer_name,
      detail: `${locale === "en" ? reservation.primary_room_type_name_en : reservation.primary_room_type_name_vi} • ${formatReservationNights(
        reservation.stay_start_at,
        reservation.stay_end_at
      )} ${locale === "en" ? "Nights" : "đêm"}`,
      time: formatTime(reservation.created_at),
      badge:
        reservation.status === "confirmed"
          ? locale === "en"
            ? "Check In"
            : "Check In"
          : reservation.status === "cancelled"
            ? locale === "en"
              ? "Cancelled"
              : "Đã hủy"
            : locale === "en"
              ? "Booking"
              : "Booking",
      badgeTone: reservation.status === "cancelled" ? "danger" : index % 2 === 0 ? "blue" : "gold"
    });

    if (fallback && index === 2 && recentRequests.length) {
      const request = recentRequests[0];
      mapped[index] = {
        initials: initialsFromName(request.contact_name),
        label: request.contact_name,
        detail: `${locale === "en" ? request.room_type_name_en : request.room_type_name_vi} • ${locale === "en" ? "Pending" : "Chờ xử lý"}`,
        time: "",
        badge: locale === "en" ? "Request" : "Request",
        badgeTone: "danger"
      };
    }
  });

  if (mapped.length < 4 && recentRequests.length > 0 && !mapped.some((item) => item.badge === "Request")) {
    const request = recentRequests[0];

    mapped.push({
      initials: initialsFromName(request.contact_name),
      label: request.contact_name,
      detail: `${locale === "en" ? request.room_type_name_en : request.room_type_name_vi} • ${locale === "en" ? "Pending" : "Chờ xử lý"}`,
      time: "",
      badge: locale === "en" ? "Request" : "Request",
      badgeTone: "danger"
    });
  }

  while (mapped.length < 4) {
    const fallback = items[mapped.length];

    if (!fallback) {
      break;
    }

    mapped.push(fallback);
  }

  return mapped.slice(0, 4);
}

export function AdminDashboard({ data, locale }: AdminDashboardProps) {
  const glanceItems = getGlanceItems(data, locale);

  return (
    <div className="admin-page admin-dashboard">
      <div className="admin-dashboard__heading">
        <div className="admin-dashboard__title-block">
          <div className="admin-dashboard__title-row">
            <h1 className="admin-dashboard__title">{locale === "en" ? "Overview" : "Overview"}</h1>
            <PortalHelp content={locale === "en" ? "These metrics reflect the latest operational snapshot." : "Các chỉ số phản ánh snapshot vận hành mới nhất."} label="i" locale={locale} />
          </div>
        </div>

        <div className="admin-dashboard__period-switch" aria-label={locale === "en" ? "Period selector" : "Chọn khoảng thời gian"}>
          <button className="admin-dashboard__period-button admin-dashboard__period-button--active" type="button">
            {locale === "en" ? "Today" : "Today"}
          </button>
          <button className="admin-dashboard__period-button" type="button">
            {locale === "en" ? "7 Days" : "7 Days"}
          </button>
          <button className="admin-dashboard__period-button" type="button">
            {locale === "en" ? "30 Days" : "30 Days"}
          </button>
        </div>
      </div>

      <div className="admin-dashboard__metrics">
        {metricCards.map((metric) => (
          <MetricCard key={metric.label.en} locale={locale} {...metric} />
        ))}
      </div>

      <div className="admin-dashboard__body">
        <PortalCard className="admin-dashboard__chart-card">
          <div className="admin-dashboard__card-head">
            <h2 className="admin-dashboard__card-title">{locale === "en" ? "Occupancy Trends" : "Occupancy Trends"}</h2>
            <Link className="admin-dashboard__view-report" href={appendLocaleQuery("/admin/bookings", locale)}>
              <span>{locale === "en" ? "View Report" : "View Report"}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="admin-dashboard__chart">
            <div className="admin-dashboard__chart-y-axis" aria-hidden="true">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            <div className="admin-dashboard__chart-bars" aria-hidden="true">
              {trendBars.map((bar) => (
                <div className="admin-dashboard__chart-column" key={bar.day}>
                  <div className={`admin-dashboard__chart-bar admin-dashboard__chart-bar--${bar.tone}`} style={{ height: `${bar.value}%` }} />
                </div>
              ))}
            </div>
            <div className="admin-dashboard__chart-x-axis" aria-hidden="true">
              {trendBars.map((bar) => (
                <span key={bar.day}>{bar.day}</span>
              ))}
            </div>
          </div>
        </PortalCard>

        <PortalCard className="admin-dashboard__glance-card">
          <div className="admin-dashboard__card-head admin-dashboard__card-head--glance">
            <h2 className="admin-dashboard__card-title">{locale === "en" ? "At a Glance" : "At a Glance"}</h2>
            <span className="admin-dashboard__glance-chip">{locale === "en" ? "Today" : "Today"}</span>
          </div>

          <div className="admin-dashboard__glance-list">
            {glanceItems.map((item) => (
              <div className="admin-dashboard__glance-item" key={`${item.label}-${item.detail}`}>
                <div className={`admin-dashboard__glance-avatar admin-dashboard__glance-avatar--${item.badgeTone}`}>
                  {item.initials}
                </div>
                <div className="admin-dashboard__glance-copy">
                  <p className="admin-dashboard__glance-title">{item.label}</p>
                  <p className="admin-dashboard__glance-detail">{item.detail}</p>
                </div>
                <div className="admin-dashboard__glance-meta">
                  {item.time ? <span className="admin-dashboard__glance-time">{item.time}</span> : null}
                  <span className={`admin-dashboard__glance-badge admin-dashboard__glance-badge--${item.badgeTone}`}>{item.badge}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-dashboard__glance-footer">
            <Link className="admin-dashboard__view-all" href={appendLocaleQuery("/admin/bookings", locale)}>
              {locale === "en" ? "View All Activity" : "View All Activity"}
            </Link>
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
