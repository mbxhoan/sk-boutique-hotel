import Link from "next/link";

import type { Locale } from "@/lib/locale";
import { appendLocaleQuery } from "@/lib/locale";
import { PortalCard, PortalHelp } from "@/components/portal-ui";
import type { WorkflowDashboardData } from "@/lib/supabase/workflow.types";

type AdminDashboardProps = {
  canOperate: boolean;
  data: WorkflowDashboardData;
  locale: Locale;
  range: "today" | "7d" | "30d";
  searchParams: Record<string, string | undefined>;
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

type DashboardRange = "today" | "7d" | "30d";

type DashboardMetricBlueprint = {
  detail: {
    en: string;
    vi: string;
  };
  icon: "bookings" | "payments" | "occupancy" | "pending";
  label: {
    en: string;
    vi: string;
  };
  tone: MetricTone;
  trend: {
    en: string;
    vi: string;
  };
  value: string;
};

type TrendBar = {
  day: {
    en: string;
    vi: string;
  };
  tone: "default" | "gold" | "accent";
  value: number;
};

const rangeLabels: Record<
  DashboardRange,
  {
    en: string;
    vi: string;
  }
> = {
  today: {
    vi: "Hôm nay",
    en: "Today"
  },
  "7d": {
    vi: "7 ngày",
    en: "7 Days"
  },
  "30d": {
    vi: "30 ngày",
    en: "30 Days"
  }
};

function buildRangeHref(searchParams: Record<string, string | undefined>, locale: Locale, range: DashboardRange) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  params.set("range", range);

  return appendLocaleQuery(`/admin${params.toString() ? `?${params.toString()}` : ""}`, locale);
}

function formatMoneyVnd(locale: Locale, value: number) {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0
  }).format(Math.max(0, value));

  return `${formatted} VND`;
}

function getVietnamStartOfDay(date = new Date()) {
  const offsetMs = 7 * 60 * 60 * 1000;
  const localDate = new Date(date.getTime() + offsetMs);
  const startUtc = Date.UTC(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate()) - offsetMs;

  return new Date(startUtc).getTime();
}

function formatTrendLabel(locale: Locale, range: DashboardRange, startAt: number) {
  const date = new Date(startAt);

  if (range === "today") {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh"
    }).format(date);
  }

  if (range === "7d") {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
      weekday: "short",
      timeZone: "Asia/Ho_Chi_Minh"
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "vi-VN", {
    day: "numeric",
    month: "numeric",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(date);
}

function buildTrendBars(reservations: WorkflowDashboardData["recent_reservations"], range: DashboardRange, locale: Locale): TrendBar[] {
  const now = Date.now();
  const rangeStart =
    range === "today"
      ? getVietnamStartOfDay()
      : range === "7d"
        ? getVietnamStartOfDay() - 6 * 86_400_000
        : getVietnamStartOfDay() - 29 * 86_400_000;
  const rangeDuration = Math.max(1, now - rangeStart);
  const bucketCount = 7;
  const bucketDuration = rangeDuration / bucketCount;
  const counts = Array.from({ length: bucketCount }, () => 0);

  for (const reservation of reservations) {
    const createdAt = new Date(reservation.created_at).getTime();

    if (!Number.isFinite(createdAt) || createdAt < rangeStart || createdAt > now) {
      continue;
    }

    const bucketIndex = Math.min(bucketCount - 1, Math.floor((createdAt - rangeStart) / bucketDuration));
    counts[bucketIndex] += 1;
  }

  const ranking = [...counts.entries()].sort((left, right) => {
    if (right[1] === left[1]) {
      return left[0] - right[0];
    }

    return right[1] - left[1];
  });
  const highestIndex = ranking[0]?.[0] ?? -1;
  const secondIndex = ranking[1]?.[0] ?? -1;
  const maxCount = Math.max(...counts, 0);

  return counts.map((count, index) => {
    const bucketStart = rangeStart + index * bucketDuration;

    return {
      day: {
        en: formatTrendLabel("en", range, bucketStart),
        vi: formatTrendLabel("vi", range, bucketStart)
      },
      tone: count > 0 && index === highestIndex ? "gold" : count > 0 && index === secondIndex ? "accent" : "default",
      value: maxCount > 0 && count > 0 ? Math.max(10, Math.round((count / maxCount) * 100)) : 0
    };
  });
}

function getStatValue(data: WorkflowDashboardData, labelEn: string) {
  return Number(data.stats.find((stat) => stat.label_en === labelEn)?.value ?? 0);
}

function getCollectedDepositAmount(reservation: WorkflowDashboardData["recent_reservations"][number]) {
  if (reservation.status !== "confirmed" && reservation.status !== "completed") {
    return 0;
  }

  const depositAmount = reservation.deposit_amount ?? 0;

  return Math.max(0, Math.min(depositAmount, reservation.total_amount ?? 0));
}

function getRemainingBalanceAmount(reservation: WorkflowDashboardData["recent_reservations"][number]) {
  return Math.max(0, (reservation.total_amount ?? 0) - getCollectedDepositAmount(reservation));
}

function buildMetricCards(data: WorkflowDashboardData, locale: Locale): DashboardMetricBlueprint[] {
  const confirmedReservations = data.recent_reservations.filter((reservation) => ["confirmed", "completed"].includes(reservation.status));
  const totalBookings = data.recent_reservations.length;
  const collectedDeposit = confirmedReservations.reduce((sum, reservation) => sum + getCollectedDepositAmount(reservation), 0);
  const remainingBalance = confirmedReservations.reduce((sum, reservation) => sum + getRemainingBalanceAmount(reservation), 0);
  const activeHolds = getStatValue(data, "Active holds");

  return [
    {
      detail: {
        vi: "Từ dữ liệu thật",
        en: "from live data"
      },
      icon: "bookings",
      label: {
        vi: "Booking gần đây",
        en: "Recent bookings"
      },
      tone: "default",
      trend: {
        vi: "Dữ liệu thật",
        en: "Live data"
      },
      value: new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
        maximumFractionDigits: 0
      }).format(totalBookings)
    },
    {
      detail: {
        vi: "từ booking đã xác nhận hoặc hoàn tất",
        en: "from confirmed or completed bookings"
      },
      icon: "payments",
      label: {
        vi: "Cọc đã thu",
        en: "Deposit collected"
      },
      tone: "default",
      trend: {
        vi: "VND",
        en: "VND"
      },
      value: formatMoneyVnd(locale, collectedDeposit)
    },
    {
      detail: {
        vi: "booking đã xác nhận hoặc hoàn tất nhưng chưa thu đủ",
        en: "confirmed or completed bookings still owing"
      },
      icon: "pending",
      label: {
        vi: "Còn phải thu",
        en: "Remaining balance"
      },
      tone: "warning",
      trend: {
        vi: "VND",
        en: "VND"
      },
      value: new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
        maximumFractionDigits: 0
      }).format(remainingBalance)
    },
    {
      detail: {
        vi: "Phòng đang được giữ",
        en: "Rooms currently held"
      },
      icon: "occupancy",
      label: {
        vi: "Hold đang mở",
        en: "Active holds"
      },
      tone: "gold",
      trend: {
        vi: "Queue vận hành",
        en: "Operational queue"
      },
      value: new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
        maximumFractionDigits: 0
      }).format(activeHolds)
    }
  ];
}

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
    <PortalCard className={`admin-dashboard__metric admin-dashboard__metric--${tone}`} tone="default">
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
  const requestBadge = locale === "en" ? "Request" : "Yêu cầu";
  const mapped: AdminGlanceItem[] = [];

  if (recentRequests.length > 0) {
    const request = recentRequests[0];

    mapped.push({
      initials: initialsFromName(request.contact_name),
      label: request.contact_name,
      detail: `${locale === "en" ? request.room_type_name_en : request.room_type_name_vi} • ${locale === "en" ? "Pending" : "Chờ xử lý"}`,
      time: "",
      badge: requestBadge,
      badgeTone: "danger"
    });
  }

  recentReservations.forEach((reservation) => {
    if (mapped.length >= 4) {
      return;
    }

    const badgeTone =
      reservation.status === "cancelled" ? "danger" : mapped.length % 2 === 0 ? "blue" : "gold";

    mapped.push({
      initials: initialsFromName(reservation.customer_name),
      label: reservation.customer_name,
      detail: `${locale === "en" ? reservation.primary_room_type_name_en : reservation.primary_room_type_name_vi} • ${formatReservationNights(
        reservation.stay_start_at,
        reservation.stay_end_at
      )} ${locale === "en" ? "nights" : "đêm"}`,
      time: formatTime(reservation.created_at),
      badge:
        reservation.status === "confirmed"
          ? locale === "en"
            ? "Check in"
            : "Nhận phòng"
          : reservation.status === "cancelled"
            ? locale === "en"
              ? "Cancelled"
              : "Đã hủy"
            : reservation.status === "pending_deposit"
              ? locale === "en"
                ? "Pending deposit"
                : "Chờ cọc"
              : reservation.status === "completed"
                ? locale === "en"
                  ? "Completed"
                  : "Hoàn tất"
                : reservation.status === "expired"
                  ? locale === "en"
                    ? "Expired"
                    : "Hết hạn"
                  : reservation.status === "draft"
                    ? locale === "en"
                      ? "Draft"
                      : "Nháp"
                    : locale === "en"
                      ? "Booking"
                      : "Booking",
      badgeTone
    });
  });

  while (mapped.length < 4) {
    mapped.push({
      initials: "--",
      label: locale === "en" ? "Waiting for live data" : "Đang chờ dữ liệu thật",
      detail: locale === "en" ? "No recent reservation has been synced yet." : "Chưa có booking gần đây được đồng bộ.",
      time: "",
      badge: locale === "en" ? "Pending" : "Đang chờ",
      badgeTone: "danger"
    });
  }

  return mapped.slice(0, 4);
}

export function AdminDashboard({ data, locale, range, searchParams }: AdminDashboardProps) {
  const glanceItems = getGlanceItems(data, locale);
  const metricCards = buildMetricCards(data, locale);
  const trendBars = buildTrendBars(data.recent_reservations, range, locale);
  const currentRangeLabel = rangeLabels[range][locale];
  const activeRequestId = searchParams.request ?? null;

  return (
    <div className="admin-page admin-dashboard">
      <div className="admin-dashboard__heading">
        <div className="admin-dashboard__title-block">
          <div className="admin-dashboard__title-row">
            <h1 className="admin-dashboard__title">{locale === "en" ? "Overview" : "Tổng quan"}</h1>
            <PortalHelp
              content={
                locale === "en"
                  ? "These metrics reflect the latest operational snapshot."
                  : "Các chỉ số phản ánh snapshot vận hành mới nhất."
              }
              label="i"
              locale={locale}
            />
          </div>
          {activeRequestId ? (
            <p className="admin-dashboard__note">
              {locale === "en"
                ? "A request is selected. Scroll to Requests & holds to review room suggestions, then convert it to a hold or reservation."
                : "Đã chọn sẵn một request. Kéo xuống mục Requests & holds để xem gợi ý phòng, rồi chuyển sang hold hoặc reservation."}
            </p>
          ) : null}
        </div>

        <div className="admin-dashboard__period-switch" aria-label={locale === "en" ? "Period selector" : "Chọn khoảng thời gian"}>
          {( ["today", "7d", "30d"] as const ).map((item) => {
            const active = range === item;

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`admin-dashboard__period-button${active ? " admin-dashboard__period-button--active" : ""}`}
                href={buildRangeHref(searchParams, locale, item)}
                key={item}
              >
                {rangeLabels[item][locale]}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="admin-dashboard__metrics">
        {metricCards.map((metric) => (
          <MetricCard key={`${metric.label.en}-${metric.value}`} locale={locale} {...metric} />
        ))}
      </div>

      <div className="admin-dashboard__body">
        <PortalCard className="admin-dashboard__chart-card">
          <div className="admin-dashboard__card-head">
            <h2 className="admin-dashboard__card-title">{locale === "en" ? "Booking Trends" : "Xu hướng booking"}</h2>
            <Link className="admin-dashboard__view-report" href={appendLocaleQuery("/admin/bookings", locale)}>
              <span>{locale === "en" ? "View Report" : "Xem báo cáo"}</span>
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
                <div className="admin-dashboard__chart-column" key={bar.day.en}>
                  <div className={`admin-dashboard__chart-bar admin-dashboard__chart-bar--${bar.tone}`} style={{ height: `${bar.value}%` }} />
                </div>
              ))}
            </div>
            <div className="admin-dashboard__chart-x-axis" aria-hidden="true">
              {trendBars.map((bar) => (
                <span key={bar.day.en}>{bar.day[locale]}</span>
              ))}
            </div>
          </div>
        </PortalCard>

        <PortalCard className="admin-dashboard__glance-card">
          <div className="admin-dashboard__card-head admin-dashboard__card-head--glance">
            <h2 className="admin-dashboard__card-title">{locale === "en" ? "At a Glance" : "Tóm tắt nhanh"}</h2>
            <span className="admin-dashboard__glance-chip">{currentRangeLabel}</span>
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
              {locale === "en" ? "View All Activity" : "Xem toàn bộ hoạt động"}
            </Link>
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
