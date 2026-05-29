type FbqFn = (cmd: string, event: string, params?: Record<string, unknown>) => void;

// Safe fbq caller — no-op if pixel not loaded or not on client
function trackMetaEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: FbqFn }).fbq;
  if (typeof fbq !== "function") return;
  fbq("track", event, params);
}

export function trackLead(params: {
  content_name: string;
  content_category: string;
  value: number | null;
  currency: string;
}) {
  trackMetaEvent("Lead", {
    content_name: params.content_name,
    content_category: params.content_category,
    value: params.value ?? 0,
    currency: params.currency
  });
}
