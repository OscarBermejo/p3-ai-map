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
};

export type LatestQuarterView = {
  slug: string;
  periodLabel: string;
  periodEnd: string;
  currency: string;
  metrics: Record<string, number | null>;
};
