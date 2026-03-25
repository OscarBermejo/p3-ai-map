import { parse } from "yaml";
import type { QuarterSourceRow } from "../financialMetricSources";
import type { LatestQuarterView, QuarterFile } from "../types/quarter";

function normalizeSources(raw: unknown): QuarterSourceRow[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: QuarterSourceRow[] = [];
  for (const item of raw) {
    if (item && typeof item === "object") {
      out.push(item as QuarterSourceRow);
    }
  }
  return out.length ? out : undefined;
}

// Paths are relative to this file (Vite), not the project root: map-ui/src/data/loaders → repo root = five ../
const rawModules = import.meta.glob(
  "../../../../../content/companies/*/financials/*.yaml",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

type ParsedRow = {
  slug: string;
  periodEndMs: number;
  periodLabel: string;
  periodEnd: string;
  currency: string;
  metrics: Record<string, number | null>;
  sources?: QuarterSourceRow[];
};

function parsePath(path: string): { slug: string; filename: string } | null {
  const m = path.match(/companies\/([^/]+)\/financials\/([^/]+\.yaml)$/);
  if (!m) return null;
  const [, slug, filename] = m;
  if (filename.startsWith("_template")) return null;
  return { slug, filename };
}

function collectParsed(): ParsedRow[] {
  const rows: ParsedRow[] = [];

  for (const [path, raw] of Object.entries(rawModules)) {
    const ids = parsePath(path);
    if (!ids) continue;

    let data: QuarterFile;
    try {
      data = parse(raw) as QuarterFile;
    } catch {
      continue;
    }

    const end = data.period?.end;
    if (!end) continue;

    const periodEndMs = Date.parse(end);
    if (Number.isNaN(periodEndMs)) continue;

    const metrics = data.metrics ?? {};
    const periodLabel =
      typeof data.period?.label === "string" && data.period.label.trim()
        ? data.period.label.trim()
        : ids.filename.replace(/\.yaml$/i, "");

    rows.push({
      slug: ids.slug,
      periodEndMs,
      periodLabel,
      periodEnd: end,
      currency: data.currency_reporting?.trim() || "USD",
      metrics,
      sources: normalizeSources(data.sources),
    });
  }

  return rows;
}

function rowToView(row: ParsedRow): LatestQuarterView {
  return {
    slug: row.slug,
    periodLabel: row.periodLabel,
    periodEnd: row.periodEnd,
    currency: row.currency,
    metrics: row.metrics,
    sources: row.sources,
  };
}

const { latestBySlug, historyBySlug } = (() => {
  const latest = new Map<string, LatestQuarterView>();
  const history = new Map<string, LatestQuarterView[]>();
  const rows = collectParsed();
  const byCompany = new Map<string, ParsedRow[]>();

  for (const row of rows) {
    const list = byCompany.get(row.slug) ?? [];
    list.push(row);
    byCompany.set(row.slug, list);
  }

  for (const [slug, list] of byCompany) {
    const sorted = [...list].sort(
      (a, b) => a.periodEndMs - b.periodEndMs,
    );
    history.set(
      slug,
      sorted.map(rowToView),
    );
    const best = sorted[sorted.length - 1]!;
    latest.set(slug, rowToView(best));
  }

  return { latestBySlug: latest, historyBySlug: history };
})();

export function getLatestQuarterForSlug(slug: string): LatestQuarterView | null {
  return latestBySlug.get(slug) ?? null;
}

/** All quarter files for `slug`, oldest → newest by `period.end`. */
export function getQuarterHistoryForSlug(slug: string): LatestQuarterView[] {
  return historyBySlug.get(slug) ?? [];
}
