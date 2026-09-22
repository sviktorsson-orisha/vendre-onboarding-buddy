/**
 * Shared money formatting.
 *
 * The store normally sends prices and totals as ready-made strings. When only a
 * raw number is available we must never print it directly: floating point
 * artefacts (8107.967999999999) would reach the UI.
 */
export function formatAmount(
  value: number,
  currency?: string | null,
  fractionDigits?: 0 | 2,
) {
  const rounded =
    fractionDigits === 0 ? Math.round(value) : Math.round(value * 100) / 100;
  const decimals = fractionDigits ?? (Number.isInteger(rounded) ? 0 : 2);
  try {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: currency || "SEK",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(rounded);
  } catch {
    return `${new Intl.NumberFormat("sv-SE", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(rounded)} kr`;
  }
}
