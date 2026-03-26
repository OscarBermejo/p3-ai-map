import { useMemo } from "react";
import {
  FINANCIAL_METRIC_ROWS,
  formatMetricAmount,
} from "../../data/financialMetricFormat";
import type { LatestQuarterView } from "../../data/types/quarter";

type CompanyFinancialEvolutionProps = {
  history: LatestQuarterView[];
  displayName: string;
};

export function CompanyFinancialEvolution({
  history,
  displayName,
}: CompanyFinancialEvolutionProps) {
  const quarters = useMemo(
    () =>
      [...history].sort(
        (a, b) => Date.parse(a.periodEnd) - Date.parse(b.periodEnd),
      ),
    [history],
  );

  if (quarters.length === 0) return null;

  const currency = quarters[quarters.length - 1]?.currency ?? "USD";
  const latest = quarters[quarters.length - 1]!;

  return (
    <div className="value-chain__evolution">
      <h4 className="value-chain__metrics-heading">
        {displayName}{" "}
        <span className="value-chain__metrics-period">
          · Financial evolution
        </span>
      </h4>
      <p className="value-chain__metrics-note">
        {quarters.length} quarter file{quarters.length === 1 ? "" : "s"} in
        repo (by period end). Latest: {latest.periodLabel} (end{" "}
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
                  return (
                    <td key={q.periodEnd}>{formatMetricAmount(num)}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
