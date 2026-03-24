/** Shape of `content/_meta/layers.yaml` (parsed). */
export type LayerRow = {
  id: string;
  title: string;
};

export type LayersFile = {
  layers: LayerRow[];
};
