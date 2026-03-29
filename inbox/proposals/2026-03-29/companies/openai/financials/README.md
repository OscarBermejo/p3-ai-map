# OpenAI — Financials README

## Private company — sourcing rules

OpenAI is a private company. There are no SEC 10-K/10-Q filings and no XBRL data.
All financial data is sourced per `agent/instructions/financials_private.md`.

**Primary sources used:**
- The Information (investigative financial reporting)
- Bloomberg, Reuters, WSJ (revenue and funding milestones)
- SEC Form D filings (funding round amounts)
- OpenAI voluntary disclosures (CFO statements, blog posts)

## Reporting conventions

OpenAI does not report quarterly results publicly. Available financial snapshots are:
- Annual revenue / ARR milestones disclosed via press or voluntary CEO/CFO statements
- H1 partial-year figures that leaked via The Information (2025)
- Funding round disclosures (Form D; amounts confirmed)

## Fiscal calendar

OpenAI's fiscal year runs January 1 – December 31 (calendar year).

## File naming

| Filename | Period | Notes |
|---|---|---|
| `FY2024-annual.yaml` | CY2024 | Tier 2 confirmed annual revenue |
| `FY2025-H1.yaml` | Jan–Jun 2025 | Partial-year P&L from The Information (2025) |
| `FY2025-annual.yaml` | CY2025 | Full-year ARR from CFO + The Information |

## Key caveats

- Revenue figures represent "annualized run rate" (ARR) unless explicitly noted as actual recognized revenue.
  ARR is the current monthly pace × 12; actual recognized revenue will differ.
- The FY2025 full-year recognized revenue (~$13B) comes from a single credible Tier 2 source (The Information / CBInsights).
  The CFO stated "annualized revenue crossed $20B" in January 2026 — that is an ARR figure, not FY2025 recognized revenue.
- Gross margin, operating income, and net income are not disclosed and cannot be reliably estimated.
  H1 2025 net loss of $13.5B was reported by The Information (leak from internal document).
- Microsoft revenue share: OpenAI pays Microsoft 20% of total revenue through 2032 (The Information, confirmed Oct 2025).
  This is a material cost of revenue item not separately broken out in any public source.
