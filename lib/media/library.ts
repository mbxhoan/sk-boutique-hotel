export type MediaReference = {
  assetSlug: string;
  collectionSlug: string;
  fallbackUrl: string | null;
};

export type MediaLookup = Record<string, string>;

export function buildMediaReference(collectionSlug: string, assetSlug: string, fallbackUrl?: string | null) {
  return `media://${collectionSlug}/${assetSlug}${fallbackUrl ? `|${fallbackUrl}` : ""}`;
}

export function isMediaReference(source: string | null | undefined) {
  return Boolean(source && source.startsWith("media://"));
}

export function parseMediaReference(source: string | null | undefined): MediaReference | null {
  if (!source || !isMediaReference(source)) {
    return null;
  }

  const [reference, fallbackUrl = ""] = source.slice("media://".length).split("|");
  const [collectionSlug, assetSlug] = reference.split("/");

  if (!collectionSlug || !assetSlug) {
    return null;
  }

  return {
    assetSlug,
    collectionSlug,
    fallbackUrl: fallbackUrl.length > 0 ? fallbackUrl : null
  };
}

function ensureLeadingSlash(path: string | null | undefined): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http") || trimmed.startsWith("/") || trimmed.startsWith("media://")) {
    return trimmed;
  }
  return `/${trimmed}`;
}

export function resolveMediaSource(source: string | null | undefined, lookup: MediaLookup) {
  if (!source) {
    return null;
  }

  const reference = parseMediaReference(source);

  if (!reference) {
    return ensureLeadingSlash(lookup[source] ?? source);
  }

  const key = `media://${reference.collectionSlug}/${reference.assetSlug}`;
  return ensureLeadingSlash(lookup[key] ?? reference.fallbackUrl ?? null);
}

export function buildMediaLookupKey(collectionSlug: string, assetSlug: string) {
  return `media://${collectionSlug}/${assetSlug}`;
}
