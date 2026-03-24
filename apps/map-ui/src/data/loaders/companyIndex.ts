import { parse } from "yaml";
import type { CompanyIndexFile, CompanyIndexRow } from "../types/companyIndex";
import rawCompanyIndex from "@repo/content/_meta/company_index.yaml?raw";

export function loadCompanyIndex(): CompanyIndexFile {
  return parse(rawCompanyIndex) as CompanyIndexFile;
}

export function getCompaniesByLayer(layer: string): CompanyIndexRow[] {
  const { companies } = loadCompanyIndex();
  return companies.filter((c) => c.layer === layer);
}
