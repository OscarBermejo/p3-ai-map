import { useMemo } from "react";
import { collectSourceLinksForMetric } from "../../data/financialMetricSources";
import {
  FINANCIAL_METRIC_KEYS_PCT_OF_REVENUE,
  formatMetricAmount,
  formatPctVsRevenue,
} from "../../data/financialMetricFormat";
import { getFinancialSnapshotRowsForLayer } from "../../data/loaders/layerFramework";
import type { BusinessProfileView } from "../../data/types/businessProfile";
import type { ChipsProductView } from "../../data/types/chipsProduct";
import type { ModelsProductView } from "../../data/types/modelsProduct";
import type { LatestQuarterView } from "../../data/types/quarter";

type CompanyCol = { slug: string; displayName: string };

type LayerSummaryTablesProps = {
  /** Value-chain layer id (matches `layers.yaml` and `layer_frameworks/<id>.yaml`). */
  layerId: string;
  companies: CompanyCol[];
  quarters: Map<string, LatestQuarterView | null>;
  business: Map<string, BusinessProfileView | null>;
  chipsProducts?: ChipsProductView[];
  modelsProducts?: ModelsProductView[];
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

const CHIPS_PRODUCT_ROWS: {
  label: string;
  description: string | null;
  pick: (p: ChipsProductView) => number | string | null;
  pickNotes: (p: ChipsProductView) => string | null;
  format: "text" | "num" | "tflops" | "watts" | "gb" | "tb_s";
}[] = [
  {
    label: "Generation",
    description: "Vendor architecture generation name (e.g. Hopper, Blackwell, Rubin).",
    pick: (p) => p.generation,
    pickNotes: () => null,
    format: "text",
  },
  {
    label: "Status",
    description: "Product lifecycle stage: sampling, production, or end-of-life.",
    pick: (p) => p.status,
    pickNotes: () => null,
    format: "text",
  },
  {
    label: "Memory type",
    description: "High-bandwidth memory standard (e.g. HBM3, HBM3e, HBM4). Determines per-stack bandwidth and capacity.",
    pick: (p) => p.memoryType,
    pickNotes: (p) => p.memoryTypeNotes,
    format: "text",
  },
  {
    label: "Memory (GB)",
    description: "Total GPU memory capacity in gigabytes. Larger memory enables bigger models, batch sizes, and KV caches.",
    pick: (p) => p.memoryCapacityGb,
    pickNotes: (p) => p.memoryCapacityGbNotes,
    format: "gb",
  },
  {
    label: "Memory BW (TB/s)",
    description: "Peak memory bandwidth in terabytes per second. Key bottleneck for memory-bound inference workloads.",
    pick: (p) => p.memoryBandwidthTbS,
    pickNotes: (p) => p.memoryBandwidthTbSNotes,
    format: "tb_s",
  },
  {
    label: "FP8 (TFLOPS)",
    description: "Peak 8-bit floating-point throughput in tera-FLOPS. Primary metric for LLM training and inference. Check notes for dense vs. sparse.",
    pick: (p) => p.peakFlopsFp8Tflops,
    pickNotes: (p) => p.peakFlopsFp8TflopsNotes,
    format: "tflops",
  },
  {
    label: "FP16 (TFLOPS)",
    description: "Peak 16-bit (FP16/BF16) floating-point throughput in tera-FLOPS. Used in mixed-precision training workflows.",
    pick: (p) => p.peakFlopsFp16Tflops,
    pickNotes: (p) => p.peakFlopsFp16TflopsNotes,
    format: "tflops",
  },
  {
    label: "FP32 (TFLOPS)",
    description: "Peak 32-bit single-precision throughput in tera-FLOPS. Non-tensor-core performance; relevant for HPC and scientific workloads.",
    pick: (p) => p.peakFlopsFp32Tflops,
    pickNotes: (p) => p.peakFlopsFp32TflopsNotes,
    format: "tflops",
  },
  {
    label: "TDP (W)",
    description: "Thermal design power in watts — the maximum sustained power draw per GPU. Determines cooling requirements and rack density.",
    pick: (p) => p.tdpWatts,
    pickNotes: (p) => p.tdpWattsNotes,
    format: "watts",
  },
  {
    label: "FP8 FLOPS/W",
    description: "Energy efficiency: peak FP8 TFLOPS divided by TDP watts. Higher is better — directly affects operating cost per FLOP.",
    pick: (p) => p.flopsPerWattFp8,
    pickNotes: (p) => p.flopsPerWattFp8Notes,
    format: "num",
  },
  {
    label: "Interconnect",
    description: "GPU-to-GPU link technology and bandwidth within a node (e.g. NVLink, Infinity Fabric). Critical for multi-GPU model parallelism.",
    pick: (p) => p.interconnect,
    pickNotes: (p) => p.interconnectNotes,
    format: "text",
  },
  {
    label: "Training",
    description: "Workload fitness for model training: strong, competitive, limited, or not applicable.",
    pick: (p) => p.workloadTraining,
    pickNotes: (p) => p.workloadTrainingNotes,
    format: "text",
  },
  {
    label: "Inference",
    description: "Workload fitness for model inference: strong, competitive, limited, or not applicable.",
    pick: (p) => p.workloadInference,
    pickNotes: (p) => p.workloadInferenceNotes,
    format: "text",
  },
  {
    label: "Fine-tuning",
    description: "Workload fitness for model fine-tuning: strong, competitive, limited, or not applicable.",
    pick: (p) => p.workloadFineTuning,
    pickNotes: (p) => p.workloadFineTuningNotes,
    format: "text",
  },
];

function formatChipsCell(
  format: (typeof CHIPS_PRODUCT_ROWS)[number]["format"],
  v: number | string | null,
): string {
  if (v == null) return "—";
  if (typeof v === "string") return v.trim() || "—";
  switch (format) {
    case "tflops":
      return v.toLocaleString();
    case "watts":
      return `${v.toLocaleString()}W`;
    case "gb":
      return `${v} GB`;
    case "tb_s":
      return `${v} TB/s`;
    case "num":
      return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(2);
    default:
      return String(v);
  }
}

const MODELS_PRODUCT_ROWS: {
  label: string;
  description: string | null;
  pick: (p: ModelsProductView) => number | string | null;
  pickNotes: (p: ModelsProductView) => string | null;
  format: "text" | "num" | "usd_per_m" | "pct" | "ctx" | "ms" | "tps";
}[] = [
  {
    label: "Status",
    description: "Product lifecycle stage: preview, ga (generally available), or deprecated.",
    pick: (p) => p.status,
    pickNotes: () => null,
    format: "text",
  },
  {
    label: "Weights access",
    description: "Whether model weights are proprietary, released as open weights, or fully open source.",
    pick: (p) => p.weightsAccess,
    pickNotes: () => null,
    format: "text",
  },
  {
    label: "Context window",
    description: "Maximum input context in tokens.",
    pick: (p) => p.contextWindowTokens,
    pickNotes: (p) => p.contextWindowTokensNotes,
    format: "ctx",
  },
  {
    label: "Quality index",
    description: "Artificial Analysis composite quality score (0–100). Blends reasoning, coding, math, and instruction following. Higher = better overall model.",
    pick: (p) => p.qualityIndex,
    pickNotes: (p) => p.qualityIndexNotes,
    format: "num",
  },
  {
    label: "GPQA Diamond (%)",
    description: "% correct on GPQA Diamond (PhD-level science/reasoning). Random baseline ~25%. Key frontier reasoning signal.",
    pick: (p) => p.gpqaDiamond,
    pickNotes: (p) => p.gpqaDiamondNotes,
    format: "pct",
  },
  {
    label: "SWE-bench Verified (%)",
    description: "% of real GitHub issues resolved end-to-end. Best available coding/engineering benchmark.",
    pick: (p) => p.sweBenchVerified,
    pickNotes: (p) => p.sweBenchVerifiedNotes,
    format: "pct",
  },
  {
    label: "Input ($/M tokens)",
    description: "API price per million input tokens at standard (non-batch) tier. Snapshot date shown in notes.",
    pick: (p) => p.inputPerMillionTokens,
    pickNotes: (p) =>
      p.pricingSnapshotDate
        ? `Snapshot: ${p.pricingSnapshotDate}${p.inputPerMillionTokensNotes ? ` — ${p.inputPerMillionTokensNotes}` : ""}`
        : p.inputPerMillionTokensNotes,
    format: "usd_per_m",
  },
  {
    label: "Output ($/M tokens)",
    description: "API price per million output tokens — the primary cost driver for high-volume deployments.",
    pick: (p) => p.outputPerMillionTokens,
    pickNotes: (p) =>
      p.pricingSnapshotDate
        ? `Snapshot: ${p.pricingSnapshotDate}${p.outputPerMillionTokensNotes ? ` — ${p.outputPerMillionTokensNotes}` : ""}`
        : p.outputPerMillionTokensNotes,
    format: "usd_per_m",
  },
  {
    label: "Quality / output $",
    description: "Derived: quality_index ÷ output price per million tokens. Higher = better price-performance. Recomputed when pricing changes.",
    pick: (p) => p.qualityPerOutputDollar,
    pickNotes: (p) => p.qualityPerOutputDollarNotes,
    format: "num",
  },
  {
    label: "TTFT (ms)",
    description: "Median time to first token in milliseconds (Artificial Analysis). Drives perceived responsiveness in interactive apps.",
    pick: (p) => p.medianTtftMs,
    pickNotes: (p) => p.medianTtftMsNotes,
    format: "ms",
  },
  {
    label: "Output speed (t/s)",
    description: "Sustained output throughput in tokens per second (Artificial Analysis). Key for batch and agentic workloads.",
    pick: (p) => p.outputTokensPerSecond,
    pickNotes: (p) => p.outputTokensPerSecondNotes,
    format: "tps",
  },
];

function formatCtx(v: number | null): string {
  if (v == null) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
  if (v >= 1_000) return `${(v / 1_000).toLocaleString(undefined, { maximumFractionDigits: 0 })}K`;
  return v.toLocaleString();
}

function formatModelsCell(
  format: (typeof MODELS_PRODUCT_ROWS)[number]["format"],
  v: number | string | null,
): string {
  if (v == null) return "—";
  if (typeof v === "string") return v.trim() || "—";
  switch (format) {
    case "usd_per_m":
      return `$${v.toFixed(2)}`;
    case "pct":
      return `${v.toFixed(1)}%`;
    case "ctx":
      return formatCtx(v);
    case "ms":
      return `${v.toLocaleString()} ms`;
    case "tps":
      return `${v.toFixed(1)} t/s`;
    case "num":
      return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(2);
    default:
      return String(v);
  }
}

function formatVendorSlug(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function LayerSummaryTables({
  layerId,
  companies,
  quarters,
  business,
  chipsProducts,
  modelsProducts,
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

      {chipsProducts && chipsProducts.length > 0 ? (
        <section
          className="value-chain__summary-block"
          aria-labelledby="layer-biz-heading"
        >
          <h4 id="layer-biz-heading" className="value-chain__summary-title">
            Product comparison
          </h4>
          <p className="value-chain__summary-lede">
            Accelerator specs from{" "}
            <code className="value-chain__code">business/business.yaml</code>{" "}
            product entries across vendors. Hover values with a dotted underline
            to read notes.
          </p>
          <div className="value-chain__table-scroll value-chain__table-scroll--biz">
            <table className="value-chain__compare-table">
              <thead>
                <tr>
                  <th scope="col" className="value-chain__compare-sticky">
                    Spec
                  </th>
                  {chipsProducts.map((p) => (
                    <th key={`${p.vendor}-${p.name}`} scope="col">
                      {p.name}
                    </th>
                  ))}
                </tr>
                <tr className="value-chain__compare-subhead">
                  <td className="value-chain__compare-sticky">Vendor</td>
                  {chipsProducts.map((p) => (
                    <td key={`${p.vendor}-${p.name}`}>
                      {formatVendorSlug(p.vendor)}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CHIPS_PRODUCT_ROWS.map(
                  ({ label, description, pick, pickNotes, format }) => (
                    <tr key={label}>
                      <th
                        scope="row"
                        className="value-chain__compare-sticky"
                      >
                        {description ? (
                          <span
                            className="value-chain__biz-cell value-chain__biz-cell--has-note"
                            tabIndex={0}
                          >
                            <span className="value-chain__biz-cell-value">
                              {label}
                            </span>
                            <span
                              className="value-chain__biz-tooltip"
                              role="tooltip"
                            >
                              {description}
                            </span>
                          </span>
                        ) : (
                          label
                        )}
                      </th>
                      {chipsProducts.map((p) => {
                        const raw = pick(p);
                        const notes = pickNotes(p);
                        const text = formatChipsCell(format, raw);
                        if (notes) {
                          return (
                            <td key={`${p.vendor}-${p.name}`}>
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
                        return (
                          <td key={`${p.vendor}-${p.name}`}>{text}</td>
                        );
                      })}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : modelsProducts && modelsProducts.length > 0 ? (
        <section
          className="value-chain__summary-block"
          aria-labelledby="layer-biz-heading"
        >
          <h4 id="layer-biz-heading" className="value-chain__summary-title">
            Model comparison
          </h4>
          <p className="value-chain__summary-lede">
            Model specs and benchmarks from{" "}
            <code className="value-chain__code">business/business.yaml</code>{" "}
            product entries across vendors. Hover values with a dotted underline
            to read notes. Pricing snapshot dates are shown in notes — prices
            change frequently.
          </p>
          <div className="value-chain__table-scroll value-chain__table-scroll--biz">
            <table className="value-chain__compare-table">
              <thead>
                <tr>
                  <th scope="col" className="value-chain__compare-sticky">
                    Metric
                  </th>
                  {modelsProducts.map((p) => (
                    <th key={`${p.vendor}-${p.name}`} scope="col">
                      {p.name}
                    </th>
                  ))}
                </tr>
                <tr className="value-chain__compare-subhead">
                  <td className="value-chain__compare-sticky">Vendor</td>
                  {modelsProducts.map((p) => (
                    <td key={`${p.vendor}-${p.name}`}>
                      {formatVendorSlug(p.vendor)}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODELS_PRODUCT_ROWS.map(
                  ({ label, description, pick, pickNotes, format }) => (
                    <tr key={label}>
                      <th
                        scope="row"
                        className="value-chain__compare-sticky"
                      >
                        {description ? (
                          <span
                            className="value-chain__biz-cell value-chain__biz-cell--has-note"
                            tabIndex={0}
                          >
                            <span className="value-chain__biz-cell-value">
                              {label}
                            </span>
                            <span
                              className="value-chain__biz-tooltip"
                              role="tooltip"
                            >
                              {description}
                            </span>
                          </span>
                        ) : (
                          label
                        )}
                      </th>
                      {modelsProducts.map((p) => {
                        const raw = pick(p);
                        const notes = pickNotes(p);
                        const text = formatModelsCell(format, raw);
                        if (notes) {
                          return (
                            <td key={`${p.vendor}-${p.name}`}>
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
                        return (
                          <td key={`${p.vendor}-${p.name}`}>{text}</td>
                        );
                      })}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section
          className="value-chain__summary-block"
          aria-labelledby="layer-biz-heading"
        >
          <h4 id="layer-biz-heading" className="value-chain__summary-title">
            Business metrics
          </h4>
          <p className="value-chain__summary-lede">
            From{" "}
            <code className="value-chain__code">business/business.yaml</code>{" "}
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
                    return <td key={slug}>{b?.asOf ?? "—"}</td>;
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
      )}
    </div>
  );
}
