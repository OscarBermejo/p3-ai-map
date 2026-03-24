/**
 * Flow metrics where "% of same-period revenue" is shown in the layer financial snapshot.
 * Excludes revenue itself, balance-sheet instants (cash, debt), and other stocks.
 */
export const FINANCIAL_METRIC_KEYS_PCT_OF_REVENUE: ReadonlySet<string> =
  new Set([
    "gross_profit",
    "operating_income",
    "net_income",
    "operating_cash_flow",
    "capital_expenditures_cash",
  ]);

/** Keys and labels aligned with quarter YAML `metrics` and layer comparison UI. */
export const FINANCIAL_METRIC_ROWS: { key: string; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "gross_profit", label: "Gross profit" },
  { key: "operating_income", label: "Operating income" },
  { key: "net_income", label: "Net income" },
  { key: "operating_cash_flow", label: "Operating cash flow" },
  { key: "capital_expenditures_cash", label: "CapEx (cash)" },
  { key: "cash_and_equivalents", label: "Cash & equivalents" },
  { key: "total_debt", label: "Total debt" },
];

export function formatMetricAmount(n: number | null | undefined): string {
  if (n == null) return "—";
  const neg = n < 0;
  const abs = Math.abs(n);
  let body: string;
  if (abs >= 1e12) body = `${(abs / 1e12).toFixed(2)}T`;
  else if (abs >= 1e9) body = `${(abs / 1e9).toFixed(2)}B`;
  else if (abs >= 1e6) body = `${(abs / 1e6).toFixed(1)}M`;
  else if (abs >= 1e3) body = `${(abs / 1e3).toFixed(0)}K`;
  else body = abs.toFixed(0);
  return neg ? `−$${body}` : `$${body}`;
}

/**
 * Percent of revenue for the same quarter (metric_value / revenue × 100).
 * Returns null if revenue is missing or zero, or metric is non-finite.
 */
export function formatPctVsRevenue(
  metricValue: number,
  revenue: number | null | undefined,
): string | null {
  if (revenue == null || !Number.isFinite(revenue) || revenue === 0) {
    return null;
  }
  if (!Number.isFinite(metricValue)) return null;
  const pct = (metricValue / revenue) * 100;
  const absPct = Math.abs(pct);
  const digits = absPct >= 100 ? 0 : 1;
  const rounded = Number(pct.toFixed(digits));
  const body = Math.abs(rounded).toFixed(digits);
  return rounded < 0 ? `−${body}%` : `${body}%`;
}
