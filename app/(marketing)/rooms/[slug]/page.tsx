import { redirect } from "next/navigation";

import { buildRoomsHref, parseRoomsSearchParams } from "@/lib/room-routes";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RoomDetailRedirectPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = parseRoomsSearchParams((await searchParams) ?? undefined);

  redirect(
    buildRoomsHref({
      adults: resolvedSearchParams.adults,
      checkin: resolvedSearchParams.checkin,
      children: resolvedSearchParams.children,
      checkout: resolvedSearchParams.checkout,
      lang: resolvedSearchParams.lang,
      room: slug
    })
  );
}
