import type { Locale } from "@/lib/locale";
import { localeQueryKey } from "@/lib/locale";

export const roomsRoute = "/rooms";
export const legacyRoomsRoute = "/phong";

export type RoomsSearchState = {
  adults?: number;
  checkin?: string;
  children?: number;
  checkout?: string;
  lang?: Locale;
  room?: string;
};

export type RoomsSearchParams = Record<string, string | string[] | undefined>;

export function buildRoomsHref(state: RoomsSearchState = {}) {
  const params = new URLSearchParams();

  if (state.checkin) {
    params.set("checkin", state.checkin);
  }

  if (state.checkout) {
    params.set("checkout", state.checkout);
  }

  if (typeof state.adults === "number") {
    params.set("adults", String(state.adults));
  }

  if (typeof state.children === "number") {
    params.set("children", String(state.children));
  }

  if (state.room) {
    params.set("room", state.room);
  }

  if (state.lang === "en") {
    params.set(localeQueryKey, "en");
  }

  const query = params.toString();

  return query ? `${roomsRoute}?${query}` : roomsRoute;
}

export function buildRoomDetailHref(roomSlug: string, state: RoomsSearchState = {}) {
  return buildRoomsHref({
    ...state,
    room: roomSlug
  });
}

function pickFirst(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseOptionalNumber(value: string | string[] | undefined) {
  const raw = pickFirst(value);

  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseRoomsSearchParams(searchParams?: RoomsSearchParams): RoomsSearchState {
  if (!searchParams) {
    return {};
  }

  const lang = pickFirst(searchParams.lang) === "en" ? "en" : undefined;

  return {
    adults: parseOptionalNumber(searchParams.adults),
    checkin: pickFirst(searchParams.checkin),
    children: parseOptionalNumber(searchParams.children),
    checkout: pickFirst(searchParams.checkout),
    lang,
    room: pickFirst(searchParams.room)
  };
}

export function normalizeRoomHref(href: string, locale?: Locale) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }

  const url = new URL(href, "https://sk-boutique-hotel.local");

  if (url.pathname === legacyRoomsRoute) {
    url.pathname = roomsRoute;
  } else if (url.pathname.startsWith(`${legacyRoomsRoute}/`)) {
    const roomSlug = url.pathname.slice(`${legacyRoomsRoute}/`.length);

    url.pathname = roomsRoute;
    if (roomSlug) {
      url.searchParams.set("room", roomSlug);
    }
  }

  if (locale === "en") {
    url.searchParams.set(localeQueryKey, "en");
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
