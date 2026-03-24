# Financials — Nebius Group N.V.

## Issuer profile

- **SEC CIK:** 0001513845 ([EDGAR search](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001513845)).
- **Listing:** NASDAQ **NBIS**; **foreign private issuer** — periodic reports are primarily **Form 6-K** and annual **Form 20-F** (not U.S. 10-Q/10-K). Use the **primary exhibit HTML/PDF** linked from each filing index for statement tables and iXBRL where present.
- **IR hub:** https://group.nebius.com/investor-hub

## Filename convention (this map)

- Use **calendar quarters:** `YYYY-Qn.yaml` (e.g. `2025-Q3.yaml`) unless you adopt an explicit fiscal label after confirming dates in IR or the 6-K/20-F.
- **Company facts JSON** (optional cross-check): `https://data.sec.gov/api/xbrl/companyfacts/CIK0001513845.json` — tagging and duration coverage may differ from U.S. domestic filers; prefer filing tables when in doubt.

## Quarter files (proposal)

| File | Period (calendar) | Primary Form 6-K accession |
|------|-------------------|----------------------------|
| `2025-Q1.yaml` | 2025-01-01 — 2025-03-31 | 0001104659-25-050975 (filed 2025-05-20) |
| `2025-Q2.yaml` | 2025-04-01 — 2025-06-30 | 0001104659-25-075028 (filed 2025-08-07) |
| `2025-Q3.yaml` | 2025-07-01 — 2025-09-30 | 0001104659-25-110831 (filed 2025-11-13) |
| `2025-Q4.yaml` | 2025-10-01 — 2025-12-31 | 0001104659-26-013946 (filed 2026-02-12) |

**Notes:** Q3 `operating_cash_flow` and `capital_expenditures_cash` are **derived** (nine months ended 2025-09-30 minus six months ended 2025-06-30) because the Q3 6-K cash flow statement is presented on a nine-month basis in the primary exhibit; inputs are cited from the Q3 and Q2 6-K Exhibit 99.1 tables. Where only **period-end share count** appears in the earnings release, `shares_outstanding_basic` uses that figure and `shares_outstanding_diluted` is **null** with documentation (Q1, Q2, Q4); Q3 uses **weighted-average** basic and diluted from Exhibit 99.2.

## Sources

Every material number needs `sources[]` with URL, kind, description, `retrieved_at`, and **`covers` / `supports_derivation_of`** / `documentation` for nulls per `agent/instructions/financials.md`.

Copy `_template.quarter.yaml` when adding a new period.
