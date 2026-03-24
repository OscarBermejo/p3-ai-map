/** Shape of `content/_meta/company_index.yaml` (parsed). */
export type CompanyIndexRow = {
  slug: string;
  layer: string;
};

export type CompanyIndexFile = {
  companies: CompanyIndexRow[];
};
