import type { QuarterSourceRow } from "../financialMetricSources";

/** Subset of quarter YAML under `content/companies/<slug>/financials/*.yaml`. */
export type QuarterFile = {
  period?: {
    label?: string;
    end?: string;
    start?: string;
    fiscal_year?: number;
  };
  currency_reporting?: string;
  metrics?: Record<string, number | null>;
  sources?: QuarterSourceRow[];
};

export type LatestQuarterView = {
  slug: string;
  periodLabel: string;
  periodEnd: string;
  currency: string;
  metrics: Record<string, number | null>;
  /** Provenance rows from the quarter file; used to link metrics to SEC / IR URLs. */
  sources?: QuarterSourceRow[];
};
