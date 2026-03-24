import { parse } from "yaml";
import { FINANCIAL_METRIC_ROWS } from "../financialMetricFormat";

const rawModules = import.meta.glob(
  "../../../../../content/_meta/layer_frameworks/*.yaml",
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

export type FinancialSnapshotRow = { key: string; label: string };

function layerIdFromFrameworkPath(path: string): string | null {
  const m = path.match(/layer_frameworks\/([^/]+)\.yaml$/i);
  return m?.[1] ?? null;
}

/**
 * Ordered financial snapshot rows for a value-chain layer.
 * Reads `financial_snapshot` from `content/_meta/layer_frameworks/<layerId>.yaml`.
 * If the file is missing or has no valid rows, falls back to `FINANCIAL_METRIC_ROWS`.
 */
export function getFinancialSnapshotRowsForLayer(
  layerId: string,
): FinancialSnapshotRow[] {
  const match = Object.entries(rawModules).find(
    ([p]) => layerIdFromFrameworkPath(p) === layerId,
  );
  if (!match) {
    return [...FINANCIAL_METRIC_ROWS];
  }
  const [, raw] = match;
  try {
    const data = parse(raw) as {
      financial_snapshot?: { key?: unknown; label?: unknown }[];
    };
    const rows = data.financial_snapshot;
    if (!Array.isArray(rows) || rows.length === 0) {
      return [...FINANCIAL_METRIC_ROWS];
    }
    const out: FinancialSnapshotRow[] = [];
    for (const r of rows) {
      if (
        r &&
        typeof r.key === "string" &&
        r.key.length > 0 &&
        typeof r.label === "string" &&
        r.label.length > 0
      ) {
        out.push({ key: r.key, label: r.label });
      }
    }
    return out.length > 0 ? out : [...FINANCIAL_METRIC_ROWS];
  } catch {
    return [...FINANCIAL_METRIC_ROWS];
  }
}
