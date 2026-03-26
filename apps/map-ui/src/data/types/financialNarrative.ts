/** Parsed `content/companies/<slug>/narrative/narrative.yaml` for the detail panel. */

export type FinancialNarrativeSection = {
  id: string;
  title: string;
  body: string;
};

export type FinancialNarrativeSource = {
  url: string;
  description: string;
  kind?: string;
  retrievedAt?: string;
};

export type FinancialNarrativeView = {
  slug: string;
  asOf: string;
  basedOnFinancials: {
    file: string;
    periodEnd: string;
    periodLabel?: string;
  };
  businessProfileAsOf?: string | null;
  /** Questions this narrative tries to answer (grounded in data + primaries). */
  centralQuestions: string[];
  sections: FinancialNarrativeSection[];
  disclosureGaps?: string | null;
  sources: FinancialNarrativeSource[];
};
