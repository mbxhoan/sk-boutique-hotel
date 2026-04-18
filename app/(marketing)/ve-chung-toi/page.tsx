import { redirect } from "next/navigation";

import { appendLocaleQuery, resolveLocale } from "@/lib/locale";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export default async function LegacyAboutUsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = resolveLocale(resolvedSearchParams.lang);

  redirect(appendLocaleQuery("/about-us", locale));
}
