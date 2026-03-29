import { parse } from "yaml";
import type { ModelsProductView } from "../types/modelsProduct";

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

type Leaf = { value?: unknown; notes?: unknown };

function leafNum(obj: unknown): number | null {
  const v = (obj as Leaf | undefined)?.value;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function leafStr(obj: unknown): string | null {
  const v = (obj as Leaf | undefined)?.value;
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

function leafNotes(obj: unknown): string | null {
  const n = (obj as Leaf | undefined)?.notes;
  if (typeof n !== "string") return null;
  const t = n.trim();
  return t.length > 0 ? t : null;
}

function dig(root: unknown, ...keys: string[]): unknown {
  let cur = root;
  for (const k of keys) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

function parseProduct(
  vendor: string,
  p: Record<string, unknown>,
): ModelsProductView | null {
  const name = p.name;
  if (typeof name !== "string" || name.trim().length === 0) return null;

  return {
    name: name.trim(),
    vendor,
    modelFamily: typeof p.model_family === "string" ? p.model_family : null,
    weightsAccess: typeof p.weights_access === "string" ? p.weights_access : null,
    status: typeof p.status === "string" ? p.status : null,
    releaseDate: typeof p.release_date === "string" ? p.release_date : null,

    contextWindowTokens: leafNum(dig(p, "capabilities", "context_window_tokens")),
    contextWindowTokensNotes: leafNotes(dig(p, "capabilities", "context_window_tokens")),

    qualityIndex: leafNum(dig(p, "benchmarks", "quality_index")),
    qualityIndexNotes: leafNotes(dig(p, "benchmarks", "quality_index")),

    gpqaDiamond: leafNum(dig(p, "benchmarks", "gpqa_diamond")),
    gpqaDiamondNotes: leafNotes(dig(p, "benchmarks", "gpqa_diamond")),

    sweBenchVerified: leafNum(dig(p, "benchmarks", "swe_bench_verified")),
    sweBenchVerifiedNotes: leafNotes(dig(p, "benchmarks", "swe_bench_verified")),

    pricingSnapshotDate: (() => {
      const pricing = dig(p, "pricing");
      if (pricing == null || typeof pricing !== "object") return null;
      const d = (pricing as Record<string, unknown>).snapshot_date;
      return typeof d === "string" ? d : null;
    })(),
    inputPerMillionTokens: leafNum(dig(p, "pricing", "input_per_million_tokens")),
    inputPerMillionTokensNotes: leafNotes(dig(p, "pricing", "input_per_million_tokens")),
    outputPerMillionTokens: leafNum(dig(p, "pricing", "output_per_million_tokens")),
    outputPerMillionTokensNotes: leafNotes(dig(p, "pricing", "output_per_million_tokens")),

    qualityPerOutputDollar: leafNum(dig(p, "derived_efficiency", "quality_per_output_dollar")),
    qualityPerOutputDollarNotes: leafNotes(dig(p, "derived_efficiency", "quality_per_output_dollar")),

    medianTtftMs: leafNum(dig(p, "latency", "median_ttft_ms")),
    medianTtftMsNotes: leafNotes(dig(p, "latency", "median_ttft_ms")),
    outputTokensPerSecond: leafNum(dig(p, "latency", "output_tokens_per_second")),
    outputTokensPerSecondNotes: leafNotes(dig(p, "latency", "output_tokens_per_second")),
  };
}

const allProducts: ModelsProductView[] = (() => {
  const out: ModelsProductView[] = [];
  for (const [path, raw] of Object.entries(rawModules)) {
    const slug = parseSlugFromPath(path);
    if (!slug) continue;
    let d: Record<string, unknown>;
    try {
      d = parse(raw) as Record<string, unknown>;
    } catch {
      continue;
    }
    if (d.layer !== "models") continue;
    const products = d.products;
    if (!Array.isArray(products)) continue;
    for (const p of products) {
      if (!p || typeof p !== "object") continue;
      const view = parseProduct(slug, p as Record<string, unknown>);
      if (view) out.push(view);
    }
  }
  return out;
})();

export function getAllModelsProducts(): ModelsProductView[] {
  return allProducts;
}
