import type { Metadata } from "next";

import { AdminRoomsPage } from "@/components/admin-rooms-page";
import { resolveLocale } from "@/lib/locale";
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
    title: locale === "en" ? "Room Management" : "Room Management",
    description:
      locale === "en"
        ? "Manage physical inventory and real-time room statuses."
        : "Quản lý inventory vật lý và trạng thái phòng thời gian thực."
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

  const sampleRoomTypes =
    roomTypes.length > 0
      ? roomTypes
      : [
          {
            id: "demo-room-type-1",
            name_en: "Deluxe King",
            name_vi: "Deluxe King"
          },
          {
            id: "demo-room-type-2",
            name_en: "Executive Suite",
            name_vi: "Executive Suite"
          }
        ];

  const sampleFloors =
    floors.length > 0
      ? floors
      : [
          {
            branch_id: selectedBranch?.id ?? "demo-branch",
            code: "Floor 1",
            created_at: new Date().toISOString(),
            id: "demo-floor-1",
            is_active: true,
            level_number: 1,
            name_en: "Floor 1",
            name_vi: "Floor 1",
            notes_en: "",
            notes_vi: "",
            sort_order: 1,
            updated_at: new Date().toISOString()
          },
          {
            branch_id: selectedBranch?.id ?? "demo-branch",
            code: "Floor 2",
            created_at: new Date().toISOString(),
            id: "demo-floor-2",
            is_active: true,
            level_number: 2,
            name_en: "Floor 2",
            name_vi: "Floor 2",
            notes_en: "",
            notes_vi: "",
            sort_order: 2,
            updated_at: new Date().toISOString()
          },
          {
            branch_id: selectedBranch?.id ?? "demo-branch",
            code: "Penthouse",
            created_at: new Date().toISOString(),
            id: "demo-floor-3",
            is_active: true,
            level_number: 3,
            name_en: "Penthouse",
            name_vi: "Penthouse",
            notes_en: "",
            notes_vi: "",
            sort_order: 3,
            updated_at: new Date().toISOString()
          }
        ];

  const sampleRooms =
      rooms.length > 0
      ? rooms.map((room) => ({
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
          floor_code: sampleFloors.find((floor) => floor.id === room.floor_id)?.code ?? sampleFloors[0].code,
          floor_label: sampleFloors.find((floor) => floor.id === room.floor_id)?.name_en ?? sampleFloors[0].name_en,
          room_type_name_en: sampleRoomTypes.find((roomType) => roomType.id === room.room_type_id)?.name_en ?? sampleRoomTypes[0].name_en,
          room_type_name_vi: sampleRoomTypes.find((roomType) => roomType.id === room.room_type_id)?.name_vi ?? sampleRoomTypes[0].name_vi
        }))
      : [
          {
            branch_id: selectedBranch?.id ?? "demo-branch",
            code: "101",
            created_at: new Date().toISOString(),
            display_status: "available" as const,
            floor_code: sampleFloors[0].code,
            floor_id: sampleFloors[0].id,
            floor_label: sampleFloors[0].name_en,
            id: "demo-room-101",
            is_active: true,
            notes_en: "Deluxe King",
            notes_vi: "Deluxe King",
            room_type_id: sampleRoomTypes[0].id,
            room_type_name_en: sampleRoomTypes[0].name_en,
            room_type_name_vi: sampleRoomTypes[0].name_vi,
            status: "available" as const,
            updated_at: new Date().toISOString()
          },
          {
            branch_id: selectedBranch?.id ?? "demo-branch",
            code: "102",
            created_at: new Date().toISOString(),
            display_status: "occupied" as const,
            floor_code: sampleFloors[0].code,
            floor_id: sampleFloors[0].id,
            floor_label: sampleFloors[0].name_en,
            id: "demo-room-102",
            is_active: true,
            notes_en: "Occupied by John Doe",
            notes_vi: "Occupied by John Doe",
            room_type_id: sampleRoomTypes[0].id,
            room_type_name_en: sampleRoomTypes[0].name_en,
            room_type_name_vi: sampleRoomTypes[0].name_vi,
            status: "booked" as const,
            updated_at: new Date().toISOString()
          },
          {
            branch_id: selectedBranch?.id ?? "demo-branch",
            code: "103",
            created_at: new Date().toISOString(),
            display_status: "occupied" as const,
            floor_code: sampleFloors[0].code,
            floor_id: sampleFloors[0].id,
            floor_label: sampleFloors[0].name_en,
            id: "demo-room-103",
            is_active: true,
            notes_en: "Executive Suite",
            notes_vi: "Executive Suite",
            room_type_id: sampleRoomTypes[1]?.id ?? sampleRoomTypes[0].id,
            room_type_name_en: sampleRoomTypes[1]?.name_en ?? sampleRoomTypes[0].name_en,
            room_type_name_vi: sampleRoomTypes[1]?.name_vi ?? sampleRoomTypes[0].name_vi,
            status: "booked" as const,
            updated_at: new Date().toISOString()
          },
          {
            branch_id: selectedBranch?.id ?? "demo-branch",
            code: "104",
            created_at: new Date().toISOString(),
            display_status: "cleaning" as const,
            floor_code: sampleFloors[0].code,
            floor_id: sampleFloors[0].id,
            floor_label: sampleFloors[0].name_en,
            id: "demo-room-104",
            is_active: true,
            notes_en: "Cleaning",
            notes_vi: "Cleaning",
            room_type_id: sampleRoomTypes[0].id,
            room_type_name_en: sampleRoomTypes[0].name_en,
            room_type_name_vi: sampleRoomTypes[0].name_vi,
            status: "held" as const,
            updated_at: new Date().toISOString()
          },
          {
            branch_id: selectedBranch?.id ?? "demo-branch",
            code: "105",
            created_at: new Date().toISOString(),
            display_status: "available" as const,
            floor_code: sampleFloors[1]?.code ?? sampleFloors[0].code,
            floor_id: sampleFloors[1]?.id ?? sampleFloors[0].id,
            floor_label: sampleFloors[1]?.name_en ?? sampleFloors[0].name_en,
            id: "demo-room-105",
            is_active: true,
            notes_en: "Deluxe King",
            notes_vi: "Deluxe King",
            room_type_id: sampleRoomTypes[0].id,
            room_type_name_en: sampleRoomTypes[0].name_en,
            room_type_name_vi: sampleRoomTypes[0].name_vi,
            status: "available" as const,
            updated_at: new Date().toISOString()
          },
          {
            branch_id: selectedBranch?.id ?? "demo-branch",
            code: "106",
            created_at: new Date().toISOString(),
            display_status: "maintenance" as const,
            floor_code: sampleFloors[2]?.code ?? sampleFloors[0].code,
            floor_id: sampleFloors[2]?.id ?? sampleFloors[0].id,
            floor_label: sampleFloors[2]?.name_en ?? sampleFloors[0].name_en,
            id: "demo-room-106",
            is_active: true,
            notes_en: "Maintenance",
            notes_vi: "Maintenance",
            room_type_id: sampleRoomTypes[0].id,
            room_type_name_en: sampleRoomTypes[0].name_en,
            room_type_name_vi: sampleRoomTypes[0].name_vi,
            status: "maintenance" as const,
            updated_at: new Date().toISOString()
          }
        ];

  const roomViews = sampleRooms.map((room) => {
    const floor = sampleFloors.find((item) => item.id === room.floor_id) ?? sampleFloors[0];
    const roomType = sampleRoomTypes.find((item) => item.id === room.room_type_id) ?? sampleRoomTypes[0];

    return {
      ...room,
      floor_code: room.floor_code ?? floor?.code ?? "Floor 1",
      floor_label: room.floor_label ?? floor?.name_en ?? floor?.code ?? "Floor 1",
      room_type_name_en: roomType?.name_en ?? "Deluxe King",
      room_type_name_vi: roomType?.name_vi ?? "Deluxe King"
    };
  });

  const selectedFloorId = resolvedSearchParams.floor ?? sampleFloors[0].id;
  const selectedRoomId = resolvedSearchParams.room ?? roomViews.find((room) => room.floor_id === selectedFloorId)?.id ?? roomViews[0]?.id ?? null;

  return (
    <AdminRoomsPage
      branchName={selectedBranch ? (locale === "en" ? selectedBranch.name_en : selectedBranch.name_vi) : "Central Branch"}
      floorId={selectedFloorId}
      floors={sampleFloors}
      locale={locale}
      roomTypes={sampleRoomTypes}
      rooms={roomViews}
      selectedRoomId={selectedRoomId}
    />
  );
}
