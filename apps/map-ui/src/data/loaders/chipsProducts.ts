import { parse } from "yaml";
import type { ChipsProductView } from "../types/chipsProduct";

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
): ChipsProductView | null {
  const name = p.name;
  if (typeof name !== "string" || name.trim().length === 0) return null;

  return {
    name: name.trim(),
    vendor,
    generation: typeof p.generation === "string" ? p.generation : null,
    status: typeof p.status === "string" ? p.status : null,

    memoryType: leafStr(dig(p, "architecture", "memory_type")),
    memoryTypeNotes: leafNotes(dig(p, "architecture", "memory_type")),
    memoryCapacityGb: leafNum(dig(p, "architecture", "memory_capacity_gb")),
    memoryCapacityGbNotes: leafNotes(dig(p, "architecture", "memory_capacity_gb")),
    memoryBandwidthTbS: leafNum(dig(p, "architecture", "memory_bandwidth_tb_s")),
    memoryBandwidthTbSNotes: leafNotes(dig(p, "architecture", "memory_bandwidth_tb_s")),

    tdpWatts: leafNum(dig(p, "performance", "tdp_watts")),
    tdpWattsNotes: leafNotes(dig(p, "performance", "tdp_watts")),
    peakFlopsFp8Tflops: leafNum(dig(p, "performance", "peak_flops_fp8_tflops")),
    peakFlopsFp8TflopsNotes: leafNotes(dig(p, "performance", "peak_flops_fp8_tflops")),
    peakFlopsFp16Tflops: leafNum(dig(p, "performance", "peak_flops_fp16_tflops")),
    peakFlopsFp16TflopsNotes: leafNotes(dig(p, "performance", "peak_flops_fp16_tflops")),
    peakFlopsFp32Tflops: leafNum(dig(p, "performance", "peak_flops_fp32_tflops")),
    peakFlopsFp32TflopsNotes: leafNotes(dig(p, "performance", "peak_flops_fp32_tflops")),

    flopsPerWattFp8: leafNum(dig(p, "efficiency", "flops_per_watt_fp8")),
    flopsPerWattFp8Notes: leafNotes(dig(p, "efficiency", "flops_per_watt_fp8")),

    interconnect: leafStr(dig(p, "architecture", "interconnect")),
    interconnectNotes: leafNotes(dig(p, "architecture", "interconnect")),

    workloadTraining: leafStr(dig(p, "workload_fit", "training")),
    workloadTrainingNotes: leafNotes(dig(p, "workload_fit", "training")),
    workloadInference: leafStr(dig(p, "workload_fit", "inference")),
    workloadInferenceNotes: leafNotes(dig(p, "workload_fit", "inference")),
    workloadFineTuning: leafStr(dig(p, "workload_fit", "fine_tuning")),
    workloadFineTuningNotes: leafNotes(dig(p, "workload_fit", "fine_tuning")),
  };
}

const allProducts: ChipsProductView[] = (() => {
  const out: ChipsProductView[] = [];
  for (const [path, raw] of Object.entries(rawModules)) {
    const slug = parseSlugFromPath(path);
    if (!slug) continue;
    let d: Record<string, unknown>;
    try {
      d = parse(raw) as Record<string, unknown>;
    } catch {
      continue;
    }
    if (d.layer !== "chips") continue;
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

export function getAllChipsProducts(): ChipsProductView[] {
  return allProducts;
}

/** Products from this company's chips-layer `business.yaml` (`vendor` field stores company slug). */
export function getChipsProductsForSlug(slug: string): ChipsProductView[] {
  return allProducts.filter((p) => p.vendor === slug);
}
