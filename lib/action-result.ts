export type ActionResultKind = "error" | "success";

export function readSafeReturnTo(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return value.startsWith("/") ? value : null;
}

export function buildActionResultHref(
  returnTo: string,
  {
    kind,
    message
  }: {
    kind: ActionResultKind;
    message: string;
  }
) {
  const [pathname, hash = ""] = returnTo.split("#");
  const [basePath, query = ""] = pathname.split("?");
  const params = new URLSearchParams(query);

  params.set("actionStatus", kind);
  params.set("actionMessage", message);

  const nextQuery = params.toString();

  return `${basePath}${nextQuery ? `?${nextQuery}` : ""}${hash ? `#${hash}` : ""}`;
}
