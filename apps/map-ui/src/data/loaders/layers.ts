import { parse } from "yaml";
import type { LayersFile } from "../types/layers";
import rawLayers from "@repo/content/_meta/layers.yaml?raw";

export function loadLayers(): LayersFile {
  const data = parse(rawLayers) as LayersFile;
  if (!data || !Array.isArray(data.layers)) {
    throw new Error("layers.yaml: expected `layers` array");
  }
  return data;
}
