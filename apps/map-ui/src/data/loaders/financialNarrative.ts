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

/** Single-object shape, or an array of periods (use the first entry with file + period_end). */
function normalizeBasedOnFinancials(bof: unknown): {
  file: string;
  periodEnd: string;
  periodLabel?: string;
} | null {
  if (bof == null || typeof bof !== "object") return null;

  const pick = (row: Record<string, unknown>) => {
    const file = typeof row.file === "string" ? row.file.trim() : "";
    const periodEnd =
      typeof row.period_end === "string" ? row.period_end.trim() : "";
    if (!file || !periodEnd) return null;
    const periodLabel =
      typeof row.period_label === "string"
        ? row.period_label.trim()
        : undefined;
    return { file, periodEnd, periodLabel };
  };

  if (Array.isArray(bof)) {
    for (const item of bof) {
      if (!item || typeof item !== "object") continue;
      const row = pick(item as Record<string, unknown>);
      if (row) return row;
    }
    return null;
  }

  return pick(bof as Record<string, unknown>);
}

function parseNarrative(slug: string, raw: string): FinancialNarrativeView | null {
  let d: Record<string, unknown>;
  try {
    d = parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (d.kind !== "financial_narrative") return null;

  const based = normalizeBasedOnFinancials(d.based_on_financials);
  if (!based) return null;
  const { file, periodEnd, periodLabel } = based;

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

  let businessProfileAsOf: string | null | undefined;
  if (d.business_profile_as_of === null) businessProfileAsOf = null;
  else if (typeof d.business_profile_as_of === "string")
    businessProfileAsOf = d.business_profile_as_of.trim();

  let disclosureGaps: string | null | undefined;
  if (d.disclosure_gaps === null) disclosureGaps = null;
  else if (typeof d.disclosure_gaps === "string") {
    const t = d.disclosure_gaps.trim();
    disclosureGaps = t.length ? t : null;
  } else if (Array.isArray(d.disclosure_gaps)) {
    const parts: string[] = [];
    for (const item of d.disclosure_gaps) {
      if (typeof item === "string") {
        const t = item.trim();
        if (t.length) parts.push(`- ${t}`);
      }
    }
    disclosureGaps = parts.length ? parts.join("\n") : null;
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
      ...(periodLabel !== undefined ? { periodLabel } : {}),
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
