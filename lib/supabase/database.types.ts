export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type RowTimestampFields = {
  created_at: string;
  updated_at: string;
};

type StandardInsert<Row extends Record<string, unknown>> = Partial<Row>;
type StandardUpdate<Row extends Record<string, unknown>> = Partial<Row>;

export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          address_line1: string;
          address_line2: string | null;
          city: string;
          code: string;
          country: string;
          created_at: string;
          district: string;
          email: string | null;
          hero_image_path: string | null;
          highlights_en: string[];
          highlights_vi: string[];
          id: string;
          is_active: boolean;
          map_url: string | null;
          name_en: string;
          name_vi: string;
          phone: string | null;
          seo_description_en: string;
          seo_description_vi: string;
          seo_title_en: string;
          seo_title_vi: string;
          slug: string;
          sort_order: number;
          story_en: string;
          story_vi: string;
          summary_en: string;
          summary_vi: string;
          timezone: string;
          updated_at: string;
        } & RowTimestampFields;
        Insert: StandardInsert<{
          address_line1: string;
          address_line2: string | null;
          city: string;
          code: string;
          country: string;
          district: string;
          email: string | null;
          hero_image_path: string | null;
          highlights_en: string[];
          highlights_vi: string[];
          id: string;
          is_active: boolean;
          map_url: string | null;
          name_en: string;
          name_vi: string;
          phone: string | null;
          seo_description_en: string;
          seo_description_vi: string;
          seo_title_en: string;
          seo_title_vi: string;
          slug: string;
          sort_order: number;
          story_en: string;
          story_vi: string;
          summary_en: string;
          summary_vi: string;
          timezone: string;
        } & RowTimestampFields>;
        Update: StandardUpdate<{
          address_line1: string;
          address_line2: string | null;
          city: string;
          code: string;
          country: string;
          district: string;
          email: string | null;
          hero_image_path: string | null;
          highlights_en: string[];
          highlights_vi: string[];
          id: string;
          is_active: boolean;
          map_url: string | null;
          name_en: string;
          name_vi: string;
          phone: string | null;
          seo_description_en: string;
          seo_description_vi: string;
          seo_title_en: string;
          seo_title_vi: string;
          slug: string;
          sort_order: number;
          story_en: string;
          story_vi: string;
          summary_en: string;
          summary_vi: string;
          timezone: string;
        } & RowTimestampFields>;
        Relationships: [];
      };
      floors: {
        Row: {
          branch_id: string;
          code: string;
          created_at: string;
          id: string;
          is_active: boolean;
          level_number: number;
          name_en: string;
          name_vi: string;
          notes_en: string;
          notes_vi: string;
          sort_order: number;
          updated_at: string;
        } & RowTimestampFields;
        Insert: StandardInsert<{
          branch_id: string;
          code: string;
          id: string;
          is_active: boolean;
          level_number: number;
          name_en: string;
          name_vi: string;
          notes_en: string;
          notes_vi: string;
          sort_order: number;
        } & RowTimestampFields>;
        Update: StandardUpdate<{
          branch_id: string;
          code: string;
          id: string;
          is_active: boolean;
          level_number: number;
          name_en: string;
          name_vi: string;
          notes_en: string;
          notes_vi: string;
          sort_order: number;
        } & RowTimestampFields>;
        Relationships: [
          {
            foreignKeyName: "floors_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          }
        ];
      };
      room_types: {
        Row: {
          base_price: number;
          code: string;
          cover_image_path: string | null;
          created_at: string;
          description_en: string;
          description_vi: string;
          highlights_en: string[];
          highlights_vi: string[];
          id: string;
          is_active: boolean;
          manual_override_price: number | null;
          name_en: string;
          name_vi: string;
          occupancy_adults: number;
          occupancy_children: number;
          seo_description_en: string;
          seo_description_vi: string;
          seo_title_en: string;
          seo_title_vi: string;
          show_public_price: boolean;
          slug: string;
          sort_order: number;
          size_sqm: number | null;
          story_en: string;
          story_vi: string;
          summary_en: string;
          summary_vi: string;
          updated_at: string;
          weekend_surcharge: number;
          bed_type: string;
        } & RowTimestampFields;
        Insert: StandardInsert<{
          base_price: number;
          bed_type: string;
          code: string;
          cover_image_path: string | null;
          description_en: string;
          description_vi: string;
          highlights_en: string[];
          highlights_vi: string[];
          id: string;
          is_active: boolean;
          manual_override_price: number | null;
          name_en: string;
          name_vi: string;
          occupancy_adults: number;
          occupancy_children: number;
          seo_description_en: string;
          seo_description_vi: string;
          seo_title_en: string;
          seo_title_vi: string;
          show_public_price: boolean;
          slug: string;
          sort_order: number;
          size_sqm: number | null;
          story_en: string;
          story_vi: string;
          summary_en: string;
          summary_vi: string;
          weekend_surcharge: number;
        } & RowTimestampFields>;
        Update: StandardUpdate<{
          base_price: number;
          bed_type: string;
          code: string;
          cover_image_path: string | null;
          description_en: string;
          description_vi: string;
          highlights_en: string[];
          highlights_vi: string[];
          id: string;
          is_active: boolean;
          manual_override_price: number | null;
          name_en: string;
          name_vi: string;
          occupancy_adults: number;
          occupancy_children: number;
          seo_description_en: string;
          seo_description_vi: string;
          seo_title_en: string;
          seo_title_vi: string;
          show_public_price: boolean;
          slug: string;
          sort_order: number;
          size_sqm: number | null;
          story_en: string;
          story_vi: string;
          summary_en: string;
          summary_vi: string;
          weekend_surcharge: number;
        } & RowTimestampFields>;
        Relationships: [];
      };
      rooms: {
        Row: {
          branch_id: string;
          code: string;
          created_at: string;
          floor_id: string;
          id: string;
          is_active: boolean;
          notes_en: string;
          notes_vi: string;
          room_type_id: string;
          status: Database["public"]["Enums"]["room_status"];
          updated_at: string;
        } & RowTimestampFields;
        Insert: StandardInsert<{
          branch_id: string;
          code: string;
          floor_id: string;
          id: string;
          is_active: boolean;
          notes_en: string;
          notes_vi: string;
          room_type_id: string;
          status: Database["public"]["Enums"]["room_status"];
        } & RowTimestampFields>;
        Update: StandardUpdate<{
          branch_id: string;
          code: string;
          floor_id: string;
          id: string;
          is_active: boolean;
          notes_en: string;
          notes_vi: string;
          room_type_id: string;
          status: Database["public"]["Enums"]["room_status"];
        } & RowTimestampFields>;
        Relationships: [
          {
            foreignKeyName: "rooms_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rooms_floor_id_fkey";
            columns: ["floor_id"];
            isOneToOne: false;
            referencedRelation: "floors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rooms_room_type_id_fkey";
            columns: ["room_type_id"];
            isOneToOne: false;
            referencedRelation: "room_types";
            referencedColumns: ["id"];
          }
        ];
      };
      customers: {
        Row: {
          auth_user_id: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          last_seen_at: string | null;
          marketing_consent: boolean;
          marketing_consent_at: string | null;
          marketing_consent_source: string | null;
          notes: string;
          phone: string | null;
          preferred_locale: "vi" | "en";
          source: string;
          updated_at: string;
        } & RowTimestampFields;
        Insert: StandardInsert<{
          auth_user_id: string | null;
          email: string;
          full_name: string;
          id: string;
          last_seen_at: string | null;
          marketing_consent: boolean;
          marketing_consent_at: string | null;
          marketing_consent_source: string | null;
          notes: string;
          phone: string | null;
          preferred_locale: "vi" | "en";
          source: string;
        } & RowTimestampFields>;
        Update: StandardUpdate<{
          auth_user_id: string | null;
          email: string;
          full_name: string;
          id: string;
          last_seen_at: string | null;
          marketing_consent: boolean;
          marketing_consent_at: string | null;
          marketing_consent_source: string | null;
          notes: string;
          phone: string | null;
          preferred_locale: "vi" | "en";
          source: string;
        } & RowTimestampFields>;
        Relationships: [];
      };
    };
    Enums: {
      room_status: "available" | "held" | "booked" | "blocked" | "maintenance";
    };
    Functions: Record<string, never>;
    Views: Record<string, never>;
  };
}

export type Tables = Database["public"]["Tables"];
export type TableRow<TableName extends keyof Tables> = Tables[TableName]["Row"];
export type TableInsert<TableName extends keyof Tables> = Tables[TableName]["Insert"];
export type TableUpdate<TableName extends keyof Tables> = Tables[TableName]["Update"];
export type BranchRow = TableRow<"branches">;
export type FloorRow = TableRow<"floors">;
export type RoomTypeRow = TableRow<"room_types">;
export type RoomRow = TableRow<"rooms">;
export type CustomerRow = TableRow<"customers">;
export type BranchInsert = TableInsert<"branches">;
export type FloorInsert = TableInsert<"floors">;
export type RoomTypeInsert = TableInsert<"room_types">;
export type RoomInsert = TableInsert<"rooms">;
export type CustomerInsert = TableInsert<"customers">;
export type BranchUpdate = TableUpdate<"branches">;
export type FloorUpdate = TableUpdate<"floors">;
export type RoomTypeUpdate = TableUpdate<"room_types">;
export type RoomUpdate = TableUpdate<"rooms">;
export type CustomerUpdate = TableUpdate<"customers">;
export type RoomStatus = Database["public"]["Enums"]["room_status"];
