import { useMemo } from "react";
import { collectSourceLinksForMetric } from "../../data/financialMetricSources";
import {
  FINANCIAL_METRIC_KEYS_PCT_OF_REVENUE,
  formatMetricAmount,
  formatPctVsRevenue,
} from "../../data/financialMetricFormat";
import { getFinancialSnapshotRowsForLayer } from "../../data/loaders/layerFramework";
import type { BusinessProfileView } from "../../data/types/businessProfile";
import type { LatestQuarterView } from "../../data/types/quarter";

type CompanyCol = { slug: string; displayName: string };

type LayerSummaryTablesProps = {
  /** Value-chain layer id (matches `layers.yaml` and `layer_frameworks/<id>.yaml`). */
  layerId: string;
  companies: CompanyCol[];
  quarters: Map<string, LatestQuarterView | null>;
  business: Map<string, BusinessProfileView | null>;
};

const BUSINESS_ROWS: {
  label: string;
  pick: (p: BusinessProfileView) => number | string | boolean | null;
  pickNotes: (p: BusinessProfileView) => string | null;
  format: "mw" | "usd" | "text" | "bool" | "count";
}[] = [
  {
    label: "Capacity online (MW)",
    pick: (p) => p.capacityOnline,
    pickNotes: (p) => p.capacityOnlineNotes,
    format: "mw",
  },
  {
    label: "Capacity contracted (MW)",
    pick: (p) => p.capacityContracted,
    pickNotes: (p) => p.capacityContractedNotes,
    format: "mw",
  },
  {
    label: "Capacity secured / pipeline (MW)",
    pick: (p) => p.capacitySecured,
    pickNotes: (p) => p.capacitySecuredNotes,
    format: "mw",
  },
  {
    label: "GPUs online",
    pick: (p) => p.gpusOnline,
    pickNotes: (p) => p.gpusOnlineNotes,
    format: "count",
  },
  {
    label: "GPUs contracted / on order",
    pick: (p) => p.gpusContracted,
    pickNotes: (p) => p.gpusContractedNotes,
    format: "count",
  },
  {
    label: "GPUs secured (targets)",
    pick: (p) => p.gpusSecured,
    pickNotes: (p) => p.gpusSecuredNotes,
    format: "count",
  },
  {
    label: "Cloud ARR in service (USD)",
    pick: (p) => p.contractsUsdOnline,
    pickNotes: (p) => p.contractsUsdOnlineNotes,
    format: "usd",
  },
  {
    label: "Data centers (reported count)",
    pick: (p) => p.dcCount,
    pickNotes: (p) => p.dcCountNotes,
    format: "count",
  },
  {
    label: "Integration model",
    pick: (p) => p.integrationModel,
    pickNotes: (p) => p.integrationModelNotes,
    format: "text",
  },
  {
    label: "Managed AI platform",
    pick: (p) => p.offersManagedPlatform,
    pickNotes: (p) => p.offersManagedPlatformNotes,
    format: "bool",
  },
];

function formatMw(v: number | string | null): string {
  if (v == null) return "—";
  if (typeof v === "string") return v.trim() || "—";
  return `${v} MW`;
}

function formatCount(v: number | string | null): string {
  if (v == null) return "—";
  if (typeof v === "string") return v.trim() || "—";
  return v.toLocaleString();
}

function metricNumber(
  metrics: Record<string, number | null> | undefined,
  key: string,
): number | null {
  const n = metrics?.[key];
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function formatBusinessCell(
  format: (typeof BUSINESS_ROWS)[number]["format"],
  v: number | string | boolean | null,
): string {
  if (v == null) return "—";
  switch (format) {
    case "bool":
      return typeof v === "boolean" ? (v ? "Yes" : "No") : "—";
    case "usd":
      return typeof v === "number" ? formatMetricAmount(v) : String(v);
    case "mw":
      return formatMw(
        typeof v === "boolean" ? null : v as number | string | null,
      );
    case "count":
      return formatCount(
        typeof v === "boolean" ? null : v as number | string | null,
      );
    default:
      return typeof v === "string" ? v : String(v);
  }
}

export function LayerSummaryTables({
  layerId,
  companies,
  quarters,
  business,
}: LayerSummaryTablesProps) {
  const financialRows = useMemo(
    () => getFinancialSnapshotRowsForLayer(layerId),
    [layerId],
  );

  if (companies.length === 0) return null;

  return (
    <div className="value-chain__layer-summaries">
      <section
        className="value-chain__summary-block"
        aria-labelledby="layer-fin-heading"
      >
        <h4 id="layer-fin-heading" className="value-chain__summary-title">
          Financial snapshot
        </h4>
        <p className="value-chain__summary-lede">
          Latest quarter on file for each company in this layer, with the same
          headline metrics side by side. Open the link beside a number for the
          cited source; open a company name for history charts.
        </p>
        <div className="value-chain__table-scroll">
          <table className="value-chain__compare-table">
            <thead>
              <tr>
                <th scope="col" className="value-chain__compare-sticky">
                  Metric
                </th>
                {companies.map(({ slug, displayName }) => (
                  <th key={slug} scope="col">
                    {displayName}
                  </th>
                ))}
              </tr>
              <tr className="value-chain__compare-subhead">
                <td className="value-chain__compare-sticky">Period</td>
                {companies.map(({ slug }) => {
                  const q = quarters.get(slug);
                  return (
                    <td key={slug}>
                      {q ? (
                        <>
                          {q.periodLabel}
                          <span className="value-chain__compare-sub">
                            {" "}
                            (end {q.periodEnd})
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {financialRows.map(({ key, label }) => (
                <tr key={key}>
                  <th scope="row" className="value-chain__compare-sticky">
                    {label}
                  </th>
                  {companies.map(({ slug }) => {
                    const q = quarters.get(slug);
                    const m = q?.metrics;
                    const num = metricNumber(m, key);
                    const revenue = metricNumber(m, "revenue");
                    const pct =
                      FINANCIAL_METRIC_KEYS_PCT_OF_REVENUE.has(key) &&
                      num != null
                        ? formatPctVsRevenue(num, revenue)
                        : null;
                    const srcLinks = q?.sources?.length
                      ? collectSourceLinksForMetric(key, q.sources)
                      : [];
                    return (
                      <td key={slug}>
                        <span className="value-chain__fin-cell">
                          <span className="value-chain__fin-cell-main">
                            {formatMetricAmount(num)}
                            {pct != null ? (
                              <span className="value-chain__fin-pct">
                                {" "}
                                ({pct})
                              </span>
                            ) : null}
                          </span>
                          {srcLinks.length > 0 ? (
                            <span className="value-chain__fin-sources">
                              {srcLinks.map((link, i) => {
                                const aria =
                                  link.description.length > 0
                                    ? link.description.slice(0, 240)
                                    : `Source ${i + 1} for ${label} (new tab)`;
                                return (
                                  <a
                                    key={`${link.url}-${i}`}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="value-chain__fin-source-link"
                                    title={link.description || undefined}
                                    aria-label={aria}
                                  >
                                    <span
                                      className="value-chain__fin-source-icon"
                                      aria-hidden
                                    >
                                      ↗
                                    </span>
                                  </a>
                                );
                              })}
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
      </section>

      <section
        className="value-chain__summary-block"
        aria-labelledby="layer-biz-heading"
      >
        <h4 id="layer-biz-heading" className="value-chain__summary-title">
          Business metrics
        </h4>
        <p className="value-chain__summary-lede">
          From <code className="value-chain__code">business/business.yaml</code>{" "}
          per company (profile fields vary by issuer disclosure). Hover values
          with a dotted underline to read the YAML{" "}
          <code className="value-chain__code">notes</code> for that bucket.
        </p>
        <div className="value-chain__table-scroll value-chain__table-scroll--biz">
          <table className="value-chain__compare-table">
            <thead>
              <tr>
                <th scope="col" className="value-chain__compare-sticky">
                  Field
                </th>
                {companies.map(({ slug, displayName }) => (
                  <th key={slug} scope="col">
                    {displayName}
                  </th>
                ))}
              </tr>
              <tr className="value-chain__compare-subhead">
                <td className="value-chain__compare-sticky">As of</td>
                {companies.map(({ slug }) => {
                  const b = business.get(slug);
                  return (
                    <td key={slug}>{b?.asOf ?? "—"}</td>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {BUSINESS_ROWS.map(({ label, pick, pickNotes, format }) => (
                <tr key={label}>
                  <th scope="row" className="value-chain__compare-sticky">
                    {label}
                  </th>
                  {companies.map(({ slug }) => {
                    const b = business.get(slug);
                    const raw = b ? pick(b) : null;
                    const notes = b ? pickNotes(b) : null;
                    const text = formatBusinessCell(format, raw);
                    if (notes) {
                      return (
                        <td key={slug}>
                          <span
                            className="value-chain__biz-cell value-chain__biz-cell--has-note"
                            tabIndex={0}
                          >
                            <span className="value-chain__biz-cell-value">
                              {text}
                            </span>
                            <span
                              className="value-chain__biz-tooltip"
                              role="tooltip"
                            >
                              {notes}
                            </span>
                          </span>
                        </td>
                      );
                    }
                    return <td key={slug}>{text}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
