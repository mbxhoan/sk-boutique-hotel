import type { AuditLogRow } from "@/lib/supabase/database.types";
import { listBranches } from "@/lib/supabase/queries/branches";
import { getAvailabilityRequestById } from "@/lib/supabase/queries/availability-requests";
import { listAuditLogs } from "@/lib/supabase/queries/audit-logs";
import { getReservationById } from "@/lib/supabase/queries/reservations";

export type AdminNotificationIcon = "booking" | "payment" | "system" | "warning";
export type AdminNotificationTone = "accent" | "danger" | "neutral" | "soft";

export type AdminNotificationItem = {
  action: string;
  body_en: string;
  body_vi: string;
  branch_name_en: string | null;
  branch_name_vi: string | null;
  happened_at: string;
  href: string;
  icon: AdminNotificationIcon;
  id: string;
  title_en: string;
  title_vi: string;
  tone: AdminNotificationTone;
};

type LoadAdminNotificationsOptions = {
  branchId?: string | null;
  limit?: number;
};

function readMetadataString(log: AuditLogRow, key: string) {
  const metadata = log.metadata;

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function buildReferenceLabel({
  bookingCode,
  requestCode
}: {
  bookingCode: string | null;
  requestCode: string | null;
}) {
  if (bookingCode) {
    return bookingCode;
  }

  if (requestCode) {
    return requestCode;
  }

  return null;
}

function resolveNotificationTone(action: string): AdminNotificationTone {
  if (
    action.includes("cancelled") ||
    action.includes("rejected") ||
    action.includes("expired") ||
    action.includes(".status.rejected")
  ) {
    return "danger";
  }

  if (
    action.includes("confirmed") ||
    action.includes("verified") ||
    action.includes("completed")
  ) {
    return "accent";
  }

  if (
    action.includes("payment_proof_uploaded") ||
    action.includes("payment_request") ||
    action.includes("availability_request")
  ) {
    return "soft";
  }

  return "neutral";
}

function resolveNotificationIcon(action: string, tone: AdminNotificationTone): AdminNotificationIcon {
  if (tone === "danger") {
    return "warning";
  }

  if (action.includes("payment")) {
    return "payment";
  }

  if (action.includes("availability_request") || action.includes("reservation")) {
    return "booking";
  }

  return "system";
}

function buildNotificationCopy(
  log: AuditLogRow,
  {
    bookingCode,
    requestCode
  }: {
    bookingCode: string | null;
    requestCode: string | null;
  }
) {
  const referenceLabel = buildReferenceLabel({ bookingCode, requestCode });
  const referenceSuffix = referenceLabel ? ` ${referenceLabel}` : "";

  switch (log.action) {
    case "availability_request.confirmed":
      return {
        body_en: "Room availability was confirmed and the deposit QR was issued for guest follow-up.",
        body_vi: "Admin đã chốt phòng, chuyển yêu cầu thành booking chờ cọc và phát hành QR cọc cho khách.",
        title_en: `Booking confirmed${referenceSuffix}`,
        title_vi: `Đã chốt booking${referenceSuffix}`
      };
    case "payment_request_created":
    case "payment_request.reissued":
      return {
        body_en: "A new VietQR deposit request is ready and can be shared again with the guest.",
        body_vi: "Hệ thống đã tạo QR cọc VietQR mới và sẵn sàng gửi lại cho khách.",
        title_en: `Deposit QR issued${referenceSuffix}`,
        title_vi: `Đã phát hành QR cọc${referenceSuffix}`
      };
    case "payment_request.deposit_email_resent":
    case "payment_request.notification_sent":
      return {
        body_en: "The latest booking confirmation and deposit instructions were sent from the admin portal.",
        body_vi: "Email xác nhận booking hoặc thông báo trên app đã được gửi lại cho khách từ admin portal.",
        title_en: `Confirmation sent${referenceSuffix}`,
        title_vi: `Đã gửi xác nhận${referenceSuffix}`
      };
    case "payment_proof_uploaded":
      return {
        body_en: "A payment proof was uploaded and is waiting for staff review.",
        body_vi: "Khách đã tải lên ảnh xác nhận thanh toán và đang chờ admin kiểm tra.",
        title_en: `Deposit proof uploaded${referenceSuffix}`,
        title_vi: `Khách đã gửi ảnh xác nhận thanh toán${referenceSuffix}`
      };
    case "payment_request_verified":
      return {
        body_en: "The deposit was verified manually and the booking is now fully confirmed.",
        body_vi: "Admin đã xác nhận nhận cọc thủ công và booking đã chuyển sang trạng thái xác nhận.",
        title_en: `Deposit confirmed${referenceSuffix}`,
        title_vi: `Đã xác nhận cọc${referenceSuffix}`
      };
    case "payment_request_rejected":
      return {
        body_en: "The uploaded proof did not pass review and follow-up is still required.",
        body_vi: "Ảnh xác nhận thanh toán chưa đạt yêu cầu kiểm tra và cần xử lý tiếp với khách.",
        title_en: `Deposit proof rejected${referenceSuffix}`,
        title_vi: `Đã từ chối ảnh xác nhận thanh toán${referenceSuffix}`
      };
    case "reservation.cancelled":
      return {
        body_en: "The booking was cancelled by the operations team and the room allocation was released.",
        body_vi: "Booking đã bị hủy và hệ thống đã giải phóng phân phòng liên quan.",
        title_en: `Booking cancelled${referenceSuffix}`,
        title_vi: `Booking đã hủy${referenceSuffix}`
      };
    case "reservation.completed":
      return {
        body_en: "The stay lifecycle was closed and the booking was marked as completed.",
        body_vi: "Booking đã được chốt hoàn tất trong hệ thống vận hành.",
        title_en: `Booking completed${referenceSuffix}`,
        title_vi: `Booking hoàn tất${referenceSuffix}`
      };
    default:
      if (log.action.startsWith("availability_request.status.")) {
        const status = log.action.replace("availability_request.status.", "");
        const statusLabelEn = status === "quoted" ? "received" : status.replaceAll("_", " ");
        const statusLabelVi =
          status === "rejected"
            ? "đã từ chối"
            : status === "closed"
              ? "đã đóng"
              : status === "quoted"
                ? "đã tiếp nhận"
                : status === "in_review"
                  ? "đang xử lý"
                  : "đã cập nhật";

        return {
          body_en: "The availability request status changed in the admin workflow.",
          body_vi: "Trạng thái yêu cầu booking đã được cập nhật trong quy trình xử lý admin.",
          title_en: `Request ${statusLabelEn}${referenceSuffix}`,
          title_vi: `Yêu cầu ${statusLabelVi}${referenceSuffix}`
        };
      }

      return {
        body_en: log.summary,
        body_vi: log.summary,
        title_en: referenceLabel ? `Operational update ${referenceLabel}` : "Operational update",
        title_vi: referenceLabel ? `Cập nhật vận hành ${referenceLabel}` : "Cập nhật vận hành"
      };
  }
}

export async function loadAdminNotifications(
  options: LoadAdminNotificationsOptions = {}
): Promise<AdminNotificationItem[]> {
  const auditLogs = await listAuditLogs({
    branchId: options.branchId ?? undefined,
    limit: options.limit ?? 14
  });

  if (!auditLogs.length) {
    return [];
  }

  const reservationIds = Array.from(
    new Set(auditLogs.map((log) => log.reservation_id).filter((value): value is string => Boolean(value)))
  );
  const availabilityRequestIds = Array.from(
    new Set(
      auditLogs
        .map((log) => log.availability_request_id)
        .filter((value): value is string => Boolean(value))
    )
  );

  const [branches, reservations, requests] = await Promise.all([
    listBranches(),
    Promise.all(reservationIds.map((reservationId) => getReservationById(reservationId))),
    Promise.all(availabilityRequestIds.map((requestId) => getAvailabilityRequestById(requestId)))
  ]);

  const branchMap = Object.fromEntries(branches.map((branch) => [branch.id, branch]));
  const reservationMap = Object.fromEntries(
    reservations.filter(Boolean).map((reservation) => [reservation!.id, reservation!])
  );
  const requestMap = Object.fromEntries(
    requests.filter(Boolean).map((request) => [request!.id, request!])
  );

  return auditLogs.map((log) => {
    const reservation =
      (log.reservation_id ? reservationMap[log.reservation_id] ?? null : null) ??
      (log.entity_type === "reservation" && log.entity_id ? reservationMap[log.entity_id] ?? null : null);
    const availabilityRequest =
      (log.availability_request_id ? requestMap[log.availability_request_id] ?? null : null) ??
      (log.entity_type === "availability_request" && log.entity_id ? requestMap[log.entity_id] ?? null : null);
    const bookingCode = reservation?.booking_code ?? readMetadataString(log, "booking_code");
    const requestCode = availabilityRequest?.request_code ?? null;
    const tone = resolveNotificationTone(log.action);
    const icon = resolveNotificationIcon(log.action, tone);
    const copy = buildNotificationCopy(log, { bookingCode, requestCode });
    const branch = log.branch_id ? branchMap[log.branch_id] ?? null : null;
    const hrefCode = bookingCode ?? requestCode;

    return {
      action: log.action,
      body_en: copy.body_en,
      body_vi: copy.body_vi,
      branch_name_en: branch?.name_en ?? null,
      branch_name_vi: branch?.name_vi ?? null,
      happened_at: log.happened_at,
      href: hrefCode ? `/admin/bookings/${hrefCode}` : "/admin",
      icon,
      id: log.id,
      title_en: copy.title_en,
      title_vi: copy.title_vi,
      tone
    } satisfies AdminNotificationItem;
  });
}
