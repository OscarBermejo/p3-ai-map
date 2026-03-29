import { parse } from "yaml";
import type {
  BusinessProfileView,
  BusinessSourceRow,
} from "../types/businessProfile";

const rawModules = import.meta.glob(
  "../../../../../content/companies/*/business/business.yaml",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

function parseSlugFromPath(path: string): string | null {
  const m = path.match(/companies\/([^/]+)\/business\/business\.yaml$/);
  return m?.[1] ?? null;
}

function pickScalar(v: unknown): number | string | boolean | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return v;
  return null;
}

function bucketValue(
  root: Record<string, unknown>,
  section: string,
  bucket: string,
): number | string | null {
  const sec = root[section];
  if (!sec || typeof sec !== "object") return null;
  const b = (sec as Record<string, unknown>)[bucket];
  if (!b || typeof b !== "object") return null;
  const v = pickScalar((b as { value?: unknown }).value);
  return typeof v === "boolean" ? null : v;
}

function bucketNotes(
  root: Record<string, unknown>,
  section: string,
  bucket: string,
): string | null {
  const sec = root[section];
  if (!sec || typeof sec !== "object") return null;
  const b = (sec as Record<string, unknown>)[bucket];
  if (!b || typeof b !== "object") return null;
  const n = (b as { notes?: unknown }).notes;
  if (typeof n !== "string") return null;
  const t = n.trim();
  return t.length ? t : null;
}

/** First http(s) URL in a citation string (AMD-style inline links). */
function extractFirstUrlFromString(s: string): string | undefined {
  const m = s.match(/https?:\/\/[^\s\)\]"'<>]+/i);
  return m ? m[0] : undefined;
}

/**
 * Every `sources:` list in the YAML (root + per-bucket), merged with URL dedup.
 * Supports `{ url, description }` objects and plain strings (with optional inline URL).
 */
function parseBusinessSources(raw: string): BusinessSourceRow[] {
  let d: Record<string, unknown>;
  try {
    d = parse(raw) as Record<string, unknown>;
  } catch {
    return [];
  }
  const seen = new Set<string>();
  const out: BusinessSourceRow[] = [];

  function pushRow(row: BusinessSourceRow): void {
    const key = row.url ?? row.description;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(row);
  }

  function pushSourceArray(arr: unknown): void {
    if (!Array.isArray(arr)) return;
    for (const item of arr) {
      if (typeof item === "string") {
        const description = item.trim();
        if (!description.length) continue;
        const url = extractFirstUrlFromString(description);
        pushRow(url ? { url, description } : { description });
        continue;
      }
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const url = typeof o.url === "string" ? o.url.trim() : "";
      const description =
        typeof o.description === "string" ? o.description.trim() : "";
      if (url && description) {
        pushRow({ url, description });
      } else if (url) {
        pushRow({ url, description: description || url });
      } else if (description) {
        const inline = extractFirstUrlFromString(description);
        pushRow(
          inline ? { url: inline, description } : { description },
        );
      }
    }
  }

  function walk(node: unknown): void {
    if (node == null) return;
    if (Array.isArray(node)) {
      for (const el of node) walk(el);
      return;
    }
    if (typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    for (const [key, val] of Object.entries(o)) {
      if (key === "sources") {
        pushSourceArray(val);
      } else {
        walk(val);
      }
    }
  }

  walk(d);
  return out;
}

function parseProfile(slug: string, raw: string): BusinessProfileView | null {
  let d: Record<string, unknown>;
  try {
    d = parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }

  const dc = d.datacenters;
  let dcCount: number | string | null = null;
  let dcCountNotes: string | null = null;
  if (dc && typeof dc === "object") {
    const rc = (dc as {
      reported_count?: { value?: unknown; notes?: unknown };
    }).reported_count;
    const v = rc?.value;
    dcCount = typeof v === "number" || typeof v === "string" ? v : null;
    const n = rc?.notes;
    if (typeof n === "string") {
      const t = n.trim();
      dcCountNotes = t.length ? t : null;
    }
  }

  const integ = d.integration;
  let integrationModel: string | null = null;
  let integrationModelNotes: string | null = null;
  if (integ && typeof integ === "object") {
    const m = (integ as {
      model?: { value?: unknown; notes?: unknown };
    }).model;
    const v = m?.value;
    integrationModel = typeof v === "string" ? v : null;
    const n = m?.notes;
    if (typeof n === "string") {
      const t = n.trim();
      integrationModelNotes = t.length ? t : null;
    }
  }

  const plat = d.platform;
  let offersManagedPlatform: boolean | null = null;
  let offersManagedPlatformNotes: string | null = null;
  if (plat && typeof plat === "object") {
    const o = (plat as {
      offers_managed_platform?: { value?: unknown; notes?: unknown };
    }).offers_managed_platform;
    const v = o?.value;
    offersManagedPlatform = typeof v === "boolean" ? v : null;
    const n = o?.notes;
    if (typeof n === "string") {
      const t = n.trim();
      offersManagedPlatformNotes = t.length ? t : null;
    }
  }

  const asOf = d.as_of;
  return {
    slug,
    asOf: typeof asOf === "string" ? asOf : null,
    capacityOnline: bucketValue(d, "capacity", "online"),
    capacityOnlineNotes: bucketNotes(d, "capacity", "online"),
    capacityContracted: bucketValue(d, "capacity", "contracted"),
    capacityContractedNotes: bucketNotes(d, "capacity", "contracted"),
    capacitySecured: bucketValue(d, "capacity", "secured"),
    capacitySecuredNotes: bucketNotes(d, "capacity", "secured"),
    gpusOnline: bucketValue(d, "gpus", "online"),
    gpusOnlineNotes: bucketNotes(d, "gpus", "online"),
    gpusContracted: bucketValue(d, "gpus", "contracted"),
    gpusContractedNotes: bucketNotes(d, "gpus", "contracted"),
    gpusSecured: bucketValue(d, "gpus", "secured"),
    gpusSecuredNotes: bucketNotes(d, "gpus", "secured"),
    contractsUsdOnline: bucketValue(d, "contracts_usd", "online"),
    contractsUsdOnlineNotes: bucketNotes(d, "contracts_usd", "online"),
    dcCount,
    dcCountNotes,
    integrationModel,
    integrationModelNotes,
    offersManagedPlatform,
    offersManagedPlatformNotes,
  };
}

const { bySlug, businessSourcesBySlug } = (() => {
  const map = new Map<string, BusinessProfileView>();
  const sourcesMap = new Map<string, BusinessSourceRow[]>();
  for (const [path, raw] of Object.entries(rawModules)) {
    const slug = parseSlugFromPath(path);
    if (!slug) continue;
    const row = parseProfile(slug, raw);
    if (row) map.set(slug, row);
    const rows = parseBusinessSources(raw);
    if (rows.length > 0) sourcesMap.set(slug, rows);
  }
  return { bySlug: map, businessSourcesBySlug: sourcesMap };
})();

export function getBusinessProfileForSlug(
  slug: string,
): BusinessProfileView | null {
  return bySlug.get(slug) ?? null;
}

/** Root `sources` from `business/business.yaml` for the Business tab / provenance. */
export function getBusinessSourcesForSlug(slug: string): BusinessSourceRow[] {
  return businessSourcesBySlug.get(slug) ?? [];
}
