import type { LocalizedText } from "@/lib/mock/i18n";

export type ActionResultKind = "error" | "success";
export type ActionResultMessage = string | LocalizedText;

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
    message: ActionResultMessage;
  }
) {
  const [pathname, hash = ""] = returnTo.split("#");
  const [basePath, query = ""] = pathname.split("?");
  const params = new URLSearchParams(query);

  params.set("actionStatus", kind);

  if (typeof message === "string") {
    params.set("actionMessage", message);
  } else {
    params.set("actionMessage", message.en);
    params.set("actionMessageVi", message.vi);
    params.set("actionMessageEn", message.en);
  }

  const nextQuery = params.toString();

  return `${basePath}${nextQuery ? `?${nextQuery}` : ""}${hash ? `#${hash}` : ""}`;
}
