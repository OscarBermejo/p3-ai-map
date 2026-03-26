import { parse } from "yaml";
import type { FinancialNarrativeView } from "../types/financialNarrative";

/** Use `@repo` (repo root) so new `content/companies/<slug>/narrative/` files resolve reliably; restart dev after adding one. */
const rawModules = import.meta.glob(
  "@repo/content/companies/*/narrative/narrative.yaml",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

function parseSlugFromPath(path: string): string | null {
  const m = path.match(/companies\/([^/]+)\/narrative\/narrative\.yaml(?:\?.*)?$/);
  return m?.[1] ?? null;
}

function parseNarrative(slug: string, raw: string): FinancialNarrativeView | null {
  let d: Record<string, unknown>;
  try {
    d = parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (d.kind !== "financial_narrative") return null;

  const bof = d.based_on_financials;
  if (!bof || typeof bof !== "object") return null;
  const bf = bof as Record<string, unknown>;
  const file = typeof bf.file === "string" ? bf.file : "";
  const periodEnd = typeof bf.period_end === "string" ? bf.period_end : "";
  if (!file.trim() || !periodEnd.trim()) return null;

  const sectionsRaw = d.sections;
  const sections: FinancialNarrativeView["sections"] = [];
  if (Array.isArray(sectionsRaw)) {
    for (const s of sectionsRaw) {
      if (!s || typeof s !== "object") continue;
      const o = s as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id.trim() : "";
      const title = typeof o.title === "string" ? o.title.trim() : "";
      const body = typeof o.body === "string" ? o.body : "";
      if (id && title) sections.push({ id, title, body });
    }
  }
  if (sections.length === 0) return null;

  const asOf = typeof d.as_of === "string" ? d.as_of.trim() : "";
  if (!asOf) return null;

  const sourcesRaw = d.sources;
  const sources: FinancialNarrativeView["sources"] = [];
  if (Array.isArray(sourcesRaw)) {
    for (const src of sourcesRaw) {
      if (!src || typeof src !== "object") continue;
      const o = src as Record<string, unknown>;
      const url = typeof o.url === "string" ? o.url.trim() : "";
      const description =
        typeof o.description === "string" ? o.description.trim() : "";
      if (!url || !description) continue;
      const kind = typeof o.kind === "string" ? o.kind : undefined;
      const retrievedAt =
        typeof o.retrieved_at === "string" ? o.retrieved_at : undefined;
      sources.push({ url, description, kind, retrievedAt });
    }
  }

  const periodLabel =
    typeof bf.period_label === "string" ? bf.period_label.trim() : undefined;
  let businessProfileAsOf: string | null | undefined;
  if (d.business_profile_as_of === null) businessProfileAsOf = null;
  else if (typeof d.business_profile_as_of === "string")
    businessProfileAsOf = d.business_profile_as_of.trim();

  let disclosureGaps: string | null | undefined;
  if (d.disclosure_gaps === null) disclosureGaps = null;
  else if (typeof d.disclosure_gaps === "string") {
    const t = d.disclosure_gaps.trim();
    disclosureGaps = t.length ? t : null;
  }

  const centralQuestions: string[] = [];
  const cq = d.central_questions;
  if (Array.isArray(cq)) {
    for (const q of cq) {
      if (typeof q === "string") {
        const t = q.trim();
        if (t.length) centralQuestions.push(t);
      }
    }
  }

  return {
    slug,
    asOf,
    basedOnFinancials: {
      file,
      periodEnd,
      periodLabel,
    },
    businessProfileAsOf,
    centralQuestions,
    sections,
    disclosureGaps,
    sources,
  };
}

const bySlug = (() => {
  const map = new Map<string, FinancialNarrativeView>();
  for (const [path, raw] of Object.entries(rawModules)) {
    const slug = parseSlugFromPath(path);
    if (!slug) continue;
    const row = parseNarrative(slug, raw);
    if (row) map.set(slug, row);
  }
  return map;
})();

export function getFinancialNarrativeForSlug(
  slug: string,
): FinancialNarrativeView | null {
  return bySlug.get(slug) ?? null;
}
