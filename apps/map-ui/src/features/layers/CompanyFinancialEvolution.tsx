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

/** Income-statement + operating cash flow only; overlaid on one chart (each series scaled to its own range). */
const OVERLAY_METRICS: { key: string; label: string; color: string }[] = [
  { key: "revenue", label: "Revenue", color: "#111827" },
  { key: "gross_profit", label: "Gross profit", color: "#2563eb" },
  { key: "operating_income", label: "Operating income", color: "#7c3aed" },
  { key: "net_income", label: "Net income", color: "#db2777" },
  { key: "operating_cash_flow", label: "Operating cash flow", color: "#059669" },
];

const CHART_W = 720;
const CHART_H = 220;
const CHART_PAD_X = 16;
const CHART_PAD_Y = 14;

type Segment = [number, number][];

type OverlaySeries = {
  key: string;
  label: string;
  color: string;
  segments: Segment[];
};

function buildSegmentsForSeries(
  values: (number | null)[],
  xAt: (i: number) => number,
  yAt: (v: number) => number,
): Segment[] {
  const segs: Segment[] = [];
  let cur: [number, number][] = [];
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v == null) {
      if (cur.length) {
        segs.push(cur);
        cur = [];
      }
      continue;
    }
    cur.push([xAt(i), yAt(v)]);
  }
  if (cur.length) segs.push(cur);
  return segs;
}

function CombinedOverlayChart({
  quarters,
}: {
  quarters: LatestQuarterView[];
}) {
  const { series, needMoreQuarters, noSeries } = useMemo(() => {
    if (quarters.length < 2) {
      return {
        series: [] as OverlaySeries[],
        needMoreQuarters: true,
        noSeries: false,
      };
    }

    const n = quarters.length;
    const innerW = CHART_W - CHART_PAD_X * 2;
    const innerH = CHART_H - CHART_PAD_Y * 2;
    const xAt = (i: number) =>
      CHART_PAD_X + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);

    const out: OverlaySeries[] = [];

    for (const { key, label, color } of OVERLAY_METRICS) {
      const values = quarters.map((q) => {
        const v = q.metrics[key];
        return typeof v === "number" && Number.isFinite(v) ? v : null;
      });
      const present = values.filter((v): v is number => v != null);
      if (present.length === 0) continue;

      let min = Math.min(...present);
      let max = Math.max(...present);
      if (min === max) {
        const d = Math.abs(min) * 0.05 || 1;
        min -= d;
        max += d;
      }
      const pad = (max - min) * 0.08 || 1;
      const yMin = min - pad;
      const yMax = max + pad;
      const rangeY = yMax - yMin || 1;
      const yAt = (v: number) =>
        CHART_PAD_Y + innerH - ((v - yMin) / rangeY) * innerH;

      const segments = buildSegmentsForSeries(values, xAt, yAt);
      out.push({ key, label, color, segments });
    }

    return {
      series: out,
      needMoreQuarters: false,
      noSeries: out.length === 0,
    };
  }, [quarters]);

  if (needMoreQuarters) {
    return (
      <div className="value-chain__spark value-chain__spark--empty value-chain__overlay-empty">
        One quarter in repo — add another filing to draw a trend line
      </div>
    );
  }

  if (noSeries) {
    return (
      <div className="value-chain__spark value-chain__spark--empty value-chain__overlay-empty">
        No numeric data for these metrics in the quarter files
      </div>
    );
  }

  return (
    <div className="value-chain__evolution-overlay">
      <svg
        className="value-chain__evolution-overlay-svg"
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        width="100%"
        height="auto"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Quarterly trends for revenue, gross profit, operating income, net income, and operating cash flow"
      >
        {series.map(({ key, color, segments }) => (
          <g key={key}>
            {segments.map((seg, si) => {
              if (seg.length === 1) {
                const [x, y] = seg[0]!;
                return (
                  <circle
                    key={si}
                    cx={x}
                    cy={y}
                    r={3.5}
                    fill={color}
                    className="value-chain__overlay-dot"
                  />
                );
              }
              const d = seg
                .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`)
                .join(" ");
              return (
                <path
                  key={si}
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className="value-chain__overlay-path"
                />
              );
            })}
          </g>
        ))}
      </svg>
      <ul className="value-chain__evolution-legend">
        {series.map(({ key, label, color }) => (
          <li key={key} className="value-chain__evolution-legend-item">
            <span
              className="value-chain__evolution-legend-swatch"
              style={{ backgroundColor: color }}
              aria-hidden
            />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

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

      <h5 className="value-chain__evolution-charts-title">
        Quarterly trends (combined)
      </h5>
      <p className="value-chain__evolution-charts-lede">
        Revenue, gross profit, operating income, net income, and operating cash
        flow on one chart. Each line uses its own vertical scale (min–max over
        the quarters shown) so shapes are visible; compare dollar amounts in
        the table above.
      </p>
      <CombinedOverlayChart quarters={quarters} />
      <ul className="value-chain__evolution-chart-axis" aria-hidden>
        {quarters.map((q) => (
          <li key={q.periodEnd}>{q.periodLabel}</li>
        ))}
      </ul>
    </div>
  );
}
