export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Rounds to cents without floating point drift (0.1 + 0.2 style errors). */
export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function applyDiscount(amount: number, discount: number): number {
  return roundMoney(amount * (1 - discount));
}

export function bundleTotals(prices: number[], discount: number) {
  const full = roundMoney(prices.reduce((sum, p) => sum + p, 0));
  const total = roundMoney(prices.reduce((sum, p) => sum + applyDiscount(p, discount), 0));
  return { full, total, saved: roundMoney(full - total) };
}
