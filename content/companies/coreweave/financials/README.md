# Financials — CoreWeave, Inc.

## Issuer profile

- **SEC CIK:** 0001769628 ([EDGAR search](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001769628)).
- **Listing:** NASDAQ **CRWV**; **U.S. domestic issuer** — periodic reports are **Form 10-Q** and **Form 10-K**.
- **IR:** https://investors.coreweave.com/

## Filename convention (this map)

- **Calendar quarters:** `YYYY-Qn.yaml` (periods align with calendar quarter ends on the statements).
- **Company facts JSON** (primary numeric pull for this map): `https://data.sec.gov/api/xbrl/companyfacts/CIK0001769628.json` — cite tag names, date ranges, and accessions in each file’s `sources[]`.

## Quarter files

| File | Period (calendar) | Primary Form | Accession |
|------|---------------------|--------------|-----------|
| `2025-Q1.yaml` | 2025-01-01 — 2025-03-31 | 10-Q | 0001769628-25-000014 |
| `2025-Q2.yaml` | 2025-04-01 — 2025-06-30 | 10-Q | 0001769628-25-000041 |
| `2025-Q3.yaml` | 2025-07-01 — 2025-09-30 | 10-Q | 0001769628-25-000062 |
| `2025-Q4.yaml` | 2025-10-01 — 2025-12-31 | 10-K + Q3 10-Q | 0001769628-26-000104; 0001769628-25-000062 |

**Notes:** **Q4** income-statement and cash-flow lines that appear only as **full-year** and **nine-month year-to-date** facts are **derived** as FY minus nine months (same approach as other U.S. filers in this repo). **Selling, general & administrative** is **GeneralAndAdministrativeExpense + SellingAndMarketingExpense** in the API (derived; see each quarter file). **interest_income** and **other_income_expense_net** are **null** where the API provides **InterestExpenseDebt** and **InterestIncomeExpenseNonoperatingNet** but no clean split into those template fields. **Q4** `shares_outstanding_basic` is **Class A shares outstanding** from the consolidated balance sheet (millions in the filing table → whole shares); **shares_outstanding_diluted** is **null** (no discrete Q4 weighted-average diluted fact in the API).

## Sources

Every material number needs `sources[]` with URL, kind, description, `retrieved_at`, and **`covers` / `supports_derivation_of` / `documentation`** for nulls per `agent/instructions/financials.md`.
