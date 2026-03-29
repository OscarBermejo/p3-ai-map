/**
 * Entries from `business/business.yaml` `sources[]` (any depth).
 * Object rows use `url` + `description`; string rows become `description` and an optional `url` extracted from the text.
 */
export type BusinessSourceRow = {
  url?: string;
  description: string;
};

/** Flattened view of `content/companies/<slug>/business/business.yaml` for comparison tables. */
export type BusinessProfileView = {
  slug: string;
  asOf: string | null;
  capacityOnline: number | string | null;
  capacityOnlineNotes: string | null;
  capacityContracted: number | string | null;
  capacityContractedNotes: string | null;
  capacitySecured: number | string | null;
  capacitySecuredNotes: string | null;
  gpusOnline: number | string | null;
  gpusOnlineNotes: string | null;
  gpusContracted: number | string | null;
  gpusContractedNotes: string | null;
  gpusSecured: number | string | null;
  gpusSecuredNotes: string | null;
  contractsUsdOnline: number | string | null;
  contractsUsdOnlineNotes: string | null;
  dcCount: number | string | null;
  dcCountNotes: string | null;
  integrationModel: string | null;
  integrationModelNotes: string | null;
  offersManagedPlatform: boolean | null;
  offersManagedPlatformNotes: string | null;
};
