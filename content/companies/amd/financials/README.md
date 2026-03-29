# AMD Financials

## Fiscal calendar

AMD fiscal year ends on the last Saturday of December.

| Fiscal year | FY end date   | 10-K accession          |
|-------------|---------------|-------------------------|
| FY2025      | 2025-12-27    | 0000002488-26-000018    |
| FY2024      | 2024-12-28    | 0000002488-25-000012    |

## Quarter naming convention

Files use `FYyyyy-Qn.yaml` pattern (e.g., `FY2025-Q4.yaml`).

| File            | Period end   | Filing type | SEC accession            |
|-----------------|--------------|-------------|--------------------------|
| FY2025-Q4.yaml  | 2025-12-27   | 10-K        | 0000002488-26-000018     |
| FY2025-Q3.yaml  | 2025-09-27   | 10-Q        | 0000002488-25-000166     |
| FY2025-Q2.yaml  | 2025-06-28   | 10-Q        | 0000002488-25-000108     |
| FY2025-Q1.yaml  | 2025-03-29   | 10-Q        | 0000002488-25-000047     |

## CIK

`0000002488`

## SEC filing index

https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000002488&type=10-&owner=include&count=20

## Notes

- AMD reports in USD millions. YAML stores values in millions unless noted.
- D&A from COGS (amortization of acquisition-related intangibles) is reported as a separate line item in the income statement. The `depreciation_and_amortization` key captures this plus additional D&A from the cash flow statement.
- AMD segments: Data Center, Client and Gaming, Embedded, All Other.
- ZT Systems manufacturing business was classified as discontinued operations in FY2025; divested to Sanmina in Q4 FY2025.
