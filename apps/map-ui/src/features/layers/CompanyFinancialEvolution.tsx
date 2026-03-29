import { useMemo } from "react";
import {
  FINANCIAL_METRIC_KEYS_PCT_OF_REVENUE,
  FINANCIAL_METRIC_ROWS,
  formatMetricAmount,
  formatPctVsRevenue,
} from "../../data/financialMetricFormat";
import type { LatestQuarterView } from "../../data/types/quarter";
import { PrimarySourcesList } from "./PrimarySourcesList";

type CompanyFinancialEvolutionProps = {
  history: LatestQuarterView[];
};

export function CompanyFinancialEvolution({
  history,
}: CompanyFinancialEvolutionProps) {
  const quarters = useMemo(
    () =>
      [...history].sort(
        (a, b) => Date.parse(a.periodEnd) - Date.parse(b.periodEnd),
      ),
    [history],
  );

  /** Unique URLs across quarter files, first-seen description wins (chronological order). */
  const mergedFinancialSources = useMemo(() => {
    const seen = new Map<string, string>();
    for (const q of quarters) {
      if (!q.sources?.length) continue;
      for (const row of q.sources) {
        const url = typeof row.url === "string" ? row.url.trim() : "";
        if (!url) continue;
        const description =
          typeof row.description === "string" ? row.description.trim() : "";
        if (!seen.has(url)) {
          seen.set(url, description || url);
        }
      }
    }
    return [...seen.entries()].map(([url, description]) => ({
      url,
      description,
    }));
  }, [quarters]);

  if (quarters.length === 0) return null;

  const currency = quarters[quarters.length - 1]?.currency ?? "USD";
  const latest = quarters[quarters.length - 1]!;

  return (
    <div className="value-chain__evolution">
      <p className="value-chain__metrics-note">
        {quarters.length} quarter{quarters.length === 1 ? "" : "s"} tracked (by
        period end). Latest: {latest.periodLabel} (end{" "}
        {latest.periodEnd}). Reporting currency {currency}.
      </p>

      <div className="value-chain__evolution-table-scroll">
        <table className="value-chain__evolution-table">
          <thead>
            <tr>
              <th scope="col" className="value-chain__evolution-metric-col">
                Metric
              </th>
              {quarters.map((q) => (
                <th key={q.periodEnd} scope="col">
                  <span className="value-chain__evolution-th-main">
                    {q.periodLabel}
                  </span>
                  <span className="value-chain__evolution-th-sub">
                    {q.periodEnd}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FINANCIAL_METRIC_ROWS.map(({ key, label }) => (
              <tr key={key}>
                <th scope="row">{label}</th>
                {quarters.map((q) => {
                  const v = q.metrics[key];
                  const num =
                    typeof v === "number" && Number.isFinite(v) ? v : null;
                  const revenueRaw = q.metrics.revenue;
                  const revenue =
                    typeof revenueRaw === "number" && Number.isFinite(revenueRaw)
                      ? revenueRaw
                      : null;
                  const pct =
                    FINANCIAL_METRIC_KEYS_PCT_OF_REVENUE.has(key) &&
                    num != null
                      ? formatPctVsRevenue(num, revenue)
                      : null;
                  return (
                    <td key={q.periodEnd}>
                      <span className="value-chain__evolution-cell-main">
                        {formatMetricAmount(num)}
                        {pct != null ? (
                          <span className="value-chain__fin-pct">
                            {" "}
                            ({pct})
                          </span>
                        ) : null}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PrimarySourcesList
        title="Primary sources (financials)"
        sources={mergedFinancialSources}
      />
    </div>
  );
}
