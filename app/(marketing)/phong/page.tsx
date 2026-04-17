import { redirect } from "next/navigation";

import { buildRoomsHref, parseRoomsSearchParams } from "@/lib/room-routes";
import { resolveLocale } from "@/lib/locale";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyRoomsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = parseRoomsSearchParams((await searchParams) ?? undefined);
  const locale = resolveLocale(resolvedSearchParams.lang);

  redirect(
    buildRoomsHref({
      adults: resolvedSearchParams.adults,
      checkin: resolvedSearchParams.checkin,
      children: resolvedSearchParams.children,
      checkout: resolvedSearchParams.checkout,
      lang: locale,
      room: resolvedSearchParams.room
    })
  );
}
