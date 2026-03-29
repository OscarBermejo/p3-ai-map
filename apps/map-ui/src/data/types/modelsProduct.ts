/** Flattened view of one product entry from a models-layer `business/business.yaml` for comparison tables. */
export type ModelsProductView = {
  name: string;
  vendor: string;
  modelFamily: string | null;
  weightsAccess: string | null;
  status: string | null;
  releaseDate: string | null;

  contextWindowTokens: number | null;
  contextWindowTokensNotes: string | null;

  qualityIndex: number | null;
  qualityIndexNotes: string | null;

  gpqaDiamond: number | null;
  gpqaDiamondNotes: string | null;

  sweBenchVerified: number | null;
  sweBenchVerifiedNotes: string | null;

  pricingSnapshotDate: string | null;
  inputPerMillionTokens: number | null;
  inputPerMillionTokensNotes: string | null;
  outputPerMillionTokens: number | null;
  outputPerMillionTokensNotes: string | null;

  qualityPerOutputDollar: number | null;
  qualityPerOutputDollarNotes: string | null;

  medianTtftMs: number | null;
  medianTtftMsNotes: string | null;
  outputTokensPerSecond: number | null;
  outputTokensPerSecondNotes: string | null;
};
