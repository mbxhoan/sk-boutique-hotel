export const DEFAULT_BOOKING_DEPOSIT_PERCENT = 20;

function normalizeAmount(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Number(Math.max(0, value).toFixed(2));
}

export function calculateDepositAmount({
  depositAmount,
  depositPercent = DEFAULT_BOOKING_DEPOSIT_PERCENT,
  totalAmount
}: {
  depositAmount?: number | null;
  depositPercent?: number | null;
  totalAmount: number;
}) {
  const normalizedTotal = normalizeAmount(totalAmount);
  const normalizedExplicitAmount = normalizeAmount(depositAmount);

  if (normalizedExplicitAmount > 0) {
    return normalizedTotal > 0 ? Math.min(normalizedExplicitAmount, normalizedTotal) : normalizedExplicitAmount;
  }

  const normalizedPercent = Math.min(100, Math.max(0, normalizeAmount(depositPercent)));

  if (normalizedTotal <= 0 || normalizedPercent <= 0) {
    return 0;
  }

  return Number(((normalizedTotal * normalizedPercent) / 100).toFixed(2));
}

export function calculateDepositPercentage({
  depositAmount,
  totalAmount
}: {
  depositAmount: number;
  totalAmount: number;
}) {
  const normalizedTotal = normalizeAmount(totalAmount);
  const normalizedDeposit = normalizeAmount(depositAmount);

  if (normalizedTotal <= 0 || normalizedDeposit <= 0) {
    return DEFAULT_BOOKING_DEPOSIT_PERCENT;
  }

  return Math.min(100, Math.max(0, Math.round((normalizedDeposit / normalizedTotal) * 100)));
}

export function calculateVerifiedDepositAmount(
  paymentRequests: Array<{
    amount: number;
    status: string;
  }>
) {
  return Number(
    paymentRequests
      .filter((paymentRequest) => paymentRequest.status === "verified")
      .reduce((sum, paymentRequest) => sum + normalizeAmount(paymentRequest.amount), 0)
      .toFixed(2)
  );
}

export function calculateRemainingBalance(totalAmount: number, verifiedDepositAmount: number) {
  return Number(Math.max(0, normalizeAmount(totalAmount) - normalizeAmount(verifiedDepositAmount)).toFixed(2));
}
