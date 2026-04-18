const hiddenExactPaths = new Set([
  "/thuong-hieu",
  "/uu-dai",
  "/dich-vu",
  "/lien-he",
  "/ho-tro",
  "/tuyen-dung"
]);

const hiddenPathPrefixes = ["/tin-tuc", "/phong"];

function normalizePathname(href: string) {
  try {
    return new URL(href, "https://sk-boutique-hotel.local").pathname;
  } catch {
    return href.startsWith("/") ? href : `/${href}`;
  }
}

export function isTemporarilyHiddenHref(href: string) {
  const pathname = normalizePathname(href);

  if (hiddenExactPaths.has(pathname)) {
    return true;
  }

  return hiddenPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isTemporarilyHiddenSlug(slug: string) {
  return isTemporarilyHiddenHref(`/${slug.replace(/^\/+/, "")}`);
}

