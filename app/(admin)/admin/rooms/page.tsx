import type { Metadata } from "next";

import { AdminRoomsPage } from "@/components/admin-rooms-page";
import { resolveLocale } from "@/lib/locale";
import { localize } from "@/lib/mock/i18n";
import { listBranches } from "@/lib/supabase/queries/branches";
import { listFloorsByBranchId } from "@/lib/supabase/queries/floors";
import { listRoomTypes } from "@/lib/supabase/queries/room-types";
import { listRoomsByBranchId } from "@/lib/supabase/queries/rooms";

type PageProps = {
  searchParams?: Promise<{
    branch?: string;
    floor?: string;
    lang?: string;
    room?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  return {
    title: localize(locale, { vi: "Quản lý phòng", en: "Room management" }),
    description: localize(locale, {
      vi: "Quản lý phòng vật lý và trạng thái thời gian thực.",
      en: "Manage physical rooms and live statuses."
    })
  };
}

export default async function AdminRoomsRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);
  const branches = await listBranches();
  const selectedBranch = branches.find((branch) => branch.id === resolvedSearchParams.branch) ?? branches[0] ?? null;
  const roomTypes = await listRoomTypes();
  const floors = selectedBranch ? await listFloorsByBranchId(selectedBranch.id) : [];
  const rooms = selectedBranch ? await listRoomsByBranchId(selectedBranch.id) : [];
  const roomViews = rooms.map((room) => {
    const floor = floors.find((item) => item.id === room.floor_id) ?? null;
    const roomType = roomTypes.find((item) => item.id === room.room_type_id) ?? null;

    return {
      ...room,
      display_status:
        room.status === "available"
          ? ("available" as const)
          : room.status === "booked"
            ? ("occupied" as const)
            : room.status === "held"
              ? ("cleaning" as const)
              : room.status === "maintenance"
                ? ("maintenance" as const)
                : ("blocked" as const),
      floor_code: floor?.code ?? room.floor_id,
      floor_label: locale === "en" ? floor?.name_en ?? room.floor_id : floor?.name_vi ?? room.floor_id,
      room_type_name_en: roomType?.name_en ?? room.room_type_id,
      room_type_name_vi: roomType?.name_vi ?? room.room_type_id
    };
  });

  const selectedFloorId = resolvedSearchParams.floor ?? floors[0]?.id ?? null;
  const selectedRoomId = resolvedSearchParams.room ?? roomViews.find((room) => room.floor_id === selectedFloorId)?.id ?? roomViews[0]?.id ?? null;
  const branchLabel = selectedBranch ? (locale === "en" ? selectedBranch.name_en : selectedBranch.name_vi) : locale === "en" ? "No branch selected" : "Chưa chọn chi nhánh";

  return (
    <AdminRoomsPage
      branchName={branchLabel}
      branchId={selectedBranch?.id ?? null}
      floorId={selectedFloorId}
      floors={floors}
      locale={locale}
      roomTypes={roomTypes}
      rooms={roomViews}
      selectedRoomId={selectedRoomId}
    />
  );
}
