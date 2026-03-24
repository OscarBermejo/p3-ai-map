# IREN Ltd — financials (proposal)

## Fiscal calendar

Per **SEC EDGAR** issuer profile for CIK 0001878848, **fiscal year end is 30 June** (`Fiscal Year End: 0630` on the company’s filing index).

| Fiscal quarter | Approx. calendar period |
|----------------|-------------------------|
| Q1 | 1 Jul – 30 Sep |
| Q2 | 1 Oct – 31 Dec |
| Q3 | 1 Jan – 31 Mar |
| Q4 | 1 Apr – 30 Jun |

**Primary references used:** [SEC EDGAR company filings (CIK 0001878848)](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001878848&owner=include&count=40); [IREN investor hub](https://www.iren.com/investors) (earnings calendar / materials).

## Filename convention

Fiscal quarters: **`FYyyyy-Qn.yaml`** (e.g. `FY2026-Q2.yaml` for the quarter ended 31 December 2025).

Copy `_template.quarter.yaml` when opening a new period.

## Files in this proposal (evolution / trend)

| File | Fiscal period | Calendar quarter (approx.) |
|------|---------------|----------------------------|
| `FY2025-Q1.yaml` | FY2025 Q1 | Jul–Sep 2024 |
| `FY2025-Q2.yaml` | FY2025 Q2 | Oct–Dec 2024 |
| `FY2026-Q1.yaml` | FY2026 Q1 | Jul–Sep 2025 |
| `FY2026-Q2.yaml` | FY2026 Q2 | Oct–Dec 2025 |

**FY2025 Q3 and FY2025 Q4** (calendar Jan–Jun 2025) are **not** added here: EDGAR currently lists only **two** Form 10-Q filings for CIK 0001878848, and SEC **company facts** do not expose standalone three-month revenue/cost tags for those fiscal quarters under the same filer. Older periods may appear under predecessor names (e.g. Iris Energy Ltd) in EDGAR; extend this folder only when you have a primary filing and matching XBRL (or manual 10-Q lines) for those quarters.

Comparative quarters **FY2025 Q1–Q2** in the YAML above are taken from **comparative columns** in the two filed 10-Qs (accessions **0001878848-25-000081** and **0001878848-26-000015**), via `data.sec.gov` company facts.

## Sources

Every material number should be backed by `sources` (URL, document kind, optional excerpt) in the quarter YAML so proposed agent updates are reviewable against primaries.
