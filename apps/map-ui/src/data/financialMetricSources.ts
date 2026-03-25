/**
 * Resolve validation links from quarter YAML `sources[]` using `covers` and
 * `supports_derivation_of` (same idea as scripts/validate_values_file.py).
 */

export type QuarterSourceRow = {
  url?: string;
  kind?: string;
  description?: string;
  covers?: unknown;
  supports_derivation_of?: unknown;
};

export type MetricSourceLink = {
  url: string;
  description: string;
  kind: string;
};

function asStringList(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) {
    return v.filter((x): x is string => typeof x === "string");
  }
  if (typeof v === "string") return [v];
  return [];
}

/** Lower number = show first (prefer human-readable filings over JSON API). */
const KIND_PRIORITY: Record<string, number> = {
  sec_10q: 0,
  sec_10k: 1,
  sec_6k: 2,
  sec_20f: 3,
  sec_8k: 4,
  /** EDGAR Archives .htm / index built from CIK + accession parsed out of company-facts citations */
  sec_edgar_derived: 0,
  ir_portal: 5,
  sec_companyfacts_json: 6,
  documentation: 7,
};

function kindRank(kind: string | undefined): number {
  if (!kind) return 99;
  return KIND_PRIORITY[kind] ?? 50;
}

/** Primary exhibit `.htm` (not filing index). */
function isPrimaryExhibitHtm(url: string): boolean {
  return /\.htm$/i.test(url) && !/-index\.htm$/i.test(url);
}

function collectRowsForMetric(
  metricKey: string,
  sources: QuarterSourceRow[],
  mode: "covers" | "supports",
): MetricSourceLink[] {
  const out: MetricSourceLink[] = [];

  for (const row of sources) {
    const url = typeof row.url === "string" ? row.url.trim() : "";
    if (!url) continue;

    const covers = asStringList(row.covers);
    const supports = asStringList(row.supports_derivation_of);

    if (mode === "covers") {
      if (!covers.includes(metricKey)) continue;
    } else {
      if (!supports.includes(metricKey)) continue;
    }

    const kind = typeof row.kind === "string" ? row.kind : "";
    const description =
      typeof row.description === "string" ? row.description.trim() : "";

    out.push(
      substituteCompanyFactsJsonWithEdgarFiling({ url, description, kind }),
    );
  }

  return out;
}

function finalizeLinks(matches: MetricSourceLink[]): MetricSourceLink[] {
  const byUrl = new Map<string, MetricSourceLink>();
  for (const m of matches) {
    if (!byUrl.has(m.url)) byUrl.set(m.url, m);
  }

  const deduped = [...byUrl.values()];
  deduped.sort((a, b) => {
    const r = kindRank(a.kind) - kindRank(b.kind);
    if (r !== 0) return r;
    const pa = isPrimaryExhibitHtm(a.url) ? 0 : 1;
    const pb = isPrimaryExhibitHtm(b.url) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return a.url.localeCompare(b.url);
  });

  /** One human-readable verification link per cell (direct `covers` preferred over derivation legs). */
  return deduped.length > 0 ? [deduped[0]!] : [];
}

/** SEC company facts API URL → numeric CIK for Archives path (no leading zeros). */
export function parseCikFromCompanyFactsUrl(url: string): number | null {
  const m = url.match(/companyfacts\/CIK(\d+)\.json/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** SEC accession `0001234567-12-345678` from YAML description text. */
const RE_ACCESSION = /\b(\d{10}-\d{2}-\d{6})\b/;

export function parseAccessionFromDescription(description: string): string | null {
  const prefer = description.match(
    /\baccession\s+(\d{10}-\d{2}-\d{6})\b/i,
  );
  if (prefer?.[1]) return prefer[1];
  const any = description.match(RE_ACCESSION);
  return any?.[1] ?? null;
}

/** Primary document `foo.htm` from phrases like "primary document iren-20251231.htm". */
export function parsePrimaryDocumentFromDescription(
  description: string,
): string | null {
  const m = description.match(
    /\bprimary\s+document\s+([A-Za-z0-9][A-Za-z0-9.-]*\.htm)\b/i,
  );
  return m?.[1]?.trim() ?? null;
}

/**
 * If link is SEC company facts JSON and description cites accession + CIK in URL,
 * replace with EDGAR Archives primary .htm or filing index (human-readable).
 */
export function substituteCompanyFactsJsonWithEdgarFiling(
  link: MetricSourceLink,
): MetricSourceLink {
  const isFacts =
    link.kind === "sec_companyfacts_json" ||
    link.url.includes("data.sec.gov/api/xbrl/companyfacts/");
  if (!isFacts) return link;

  const cik = parseCikFromCompanyFactsUrl(link.url);
  if (cik == null) return link;

  const accession = parseAccessionFromDescription(link.description);
  if (!accession) return link;

  const accNoDash = accession.replace(/-/g, "");
  const base = `https://www.sec.gov/Archives/edgar/data/${cik}/${accNoDash}`;
  const primary = parsePrimaryDocumentFromDescription(link.description);
  const filingUrl = primary
    ? `${base}/${primary}`
    : `${base}/${accession}-index.htm`;

  return {
    url: filingUrl,
    kind: "sec_edgar_derived",
    description: link.description,
  };
}

/**
 * A single verification link for `metricKey`: prefer rows where `covers` lists the metric
 * (the row that directly proves the table value). If none, fall back to `supports_derivation_of`
 * (e.g. YAML only cites legs). JSON company facts URLs become EDGAR .htm / index when possible.
 */
export function collectSourceLinksForMetric(
  metricKey: string,
  sources: QuarterSourceRow[] | undefined,
): MetricSourceLink[] {
  if (!sources?.length) return [];

  let matches = collectRowsForMetric(metricKey, sources, "covers");
  if (matches.length === 0) {
    matches = collectRowsForMetric(metricKey, sources, "supports");
  }

  return finalizeLinks(matches);
}
