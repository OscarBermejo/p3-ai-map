# NVIDIA Corporation — financials

## Fiscal calendar

Per **SEC EDGAR** issuer profile for CIK 0001045810, **fiscal year end is late January** (last Sunday of January).

| Fiscal quarter | Approx. calendar period |
|----------------|-------------------------|
| Q1 | late Jan – late Apr |
| Q2 | late Apr – late Jul |
| Q3 | late Jul – late Oct |
| Q4 | late Oct – late Jan |

NVIDIA's fiscal year label runs one ahead of the calendar year in which it starts (e.g. FY2026 began January 2025).

**Primary references used:** [SEC EDGAR company filings (CIK 0001045810)](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001045810&owner=include&count=40); [NVIDIA Investor Relations](https://investor.nvidia.com).

## Filename convention

Fiscal quarters: **`FYyyyy-Qn.yaml`** (e.g. `FY2026-Q4.yaml` for the quarter ended late January 2026).

Copy `_template.quarter.yaml` when opening a new period.

## Files

| File | Fiscal period | Calendar quarter (approx.) |
|------|---------------|----------------------------|
| `FY2026-Q1.yaml` | FY2026 Q1 | Jan–Apr 2025 |
| `FY2026-Q2.yaml` | FY2026 Q2 | Apr–Jul 2025 |
| `FY2026-Q3.yaml` | FY2026 Q3 | Jul–Oct 2025 |
| `FY2026-Q4.yaml` | FY2026 Q4 | Oct 2025–Jan 2026 |

**Cash flow note:** NVIDIA's 10-Qs report cash flow statements YTD. Q1 is a clean single-quarter value. Q2 and Q3 standalone figures are derived (6M_YTD − Q1, 9M_YTD − 6M_YTD). Q4 is derived from FY total minus 9M_YTD. Derivations are documented in each file's `sources`.

**Capex note:** NVIDIA uses `PaymentsToAcquireProductiveAssets` (not `PaymentsToAcquirePropertyPlantAndEquipment`), which includes PP&E and intangible assets. This maps to `capital_expenditures_cash` in the template.

## Sources

Every material number should be backed by `sources` (URL, document kind, optional excerpt) in the quarter YAML so proposed agent updates are reviewable against primaries.
