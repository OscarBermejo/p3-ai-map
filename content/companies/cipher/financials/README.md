# Cipher Digital Inc. — financials (proposal)

## Fiscal calendar

Per **SEC EDGAR** submissions data for CIK **0001819989**, **fiscal year end is 31 December** (`fiscalYearEnd: 1231`).

| Fiscal quarter | Approx. calendar period |
|----------------|-------------------------|
| Q1 | 1 Jan – 31 Mar |
| Q2 | 1 Apr – 30 Jun |
| Q3 | 1 Jul – 30 Sep |
| Q4 | 1 Oct – 31 Dec |

**Primary references used:** [SEC EDGAR company filings (CIK 0001819989)](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001819989&owner=include&count=40); [Cipher investor relations](https://investors.ciphermining.com/).

## Filename convention

Fiscal quarters: **`FYyyyy-Qn.yaml`** (e.g. `FY2025-Q3.yaml` for the quarter ended 30 September 2025).

Copy `_template.quarter.yaml` when opening a new period.

## Files in this proposal (evolution / trend)

| File | Fiscal period | Primary Form | Filing date |
|------|---------------|--------------|-------------|
| `FY2025-Q1.yaml` | FY2025 Q1 (ended 2025-03-31) | 10-Q accession 0001819989-25-000037 | 2025-05-06 |
| `FY2025-Q2.yaml` | FY2025 Q2 (ended 2025-06-30) | 10-Q accession 0001819989-25-000081 | 2025-08-07 |
| `FY2025-Q3.yaml` | FY2025 Q3 (ended 2025-09-30) | 10-Q accession 0001819989-25-000112 | 2025-11-03 |
| `FY2025-Q4.yaml` | FY2025 Q4 (ended 2025-12-31) | 10-K accession 0001819989-26-000009 + Q3 10-Q for YTD inputs | 2026-02-24 (10-K) |

**Method notes (aligned with IREN / Nebius style):**

- **Q2 and Q3** `operating_cash_flow` and `capital_expenditures_cash` are **derived** from successive year-to-date tags on consecutive 10-Qs (six minus three months; nine minus six months), where the cash flow statement is on a YTD basis in structured data.
- **Q4** income-statement and cash-flow lines are **derived** as **full fiscal year 2025** (Form 10-K) **minus nine months ended 2025-09-30** (Q3 10-Q accession 0001819989-25-000112), per `data.sec.gov` company facts duration facts. **Q4** `shares_outstanding_basic` uses **CommonStockSharesOutstanding** at **2025-12-31** (period end); `shares_outstanding_diluted` is **null** with documentation (no separate Q4-only diluted weighted average in facts).
- **Q1** `total_debt` uses **ShortTermBorrowings** at 2025-03-31 as a proxy; **DebtInstrumentCarryingAmount** is absent for that quarter-end in company facts — see quarter YAML `sources`.

Metrics are taken from **`https://data.sec.gov/api/xbrl/companyfacts/CIK0001819989.json`** unless noted; reconcile to face financial statements when in doubt.

## Sources

Every material number should be backed by `sources` (URL, document kind, optional excerpt) in the quarter YAML so proposed agent updates are reviewable against primaries.
