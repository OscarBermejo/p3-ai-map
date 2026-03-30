# xAI — Financials README

## Status
Private company (wholly-owned SpaceX subsidiary as of February 2026). No SEC 10-K/10-Q filings.
All financial data sourced from press reports (The Information, Bloomberg, Reuters, WSJ), funding
disclosures (SEC Form D), and voluntary company releases. Use `financials_private.md` sourcing rules.

## Fiscal calendar
xAI does not report on a public fiscal calendar. Period labels used in this folder are approximate
annual estimates anchored to the best available as-of dates from press reporting.

## Filename pattern
`FY<year>-annual.yaml` — full-year estimates tied to the nearest confirmed ARR/funding data point.

## Files
| File | Period | Period type | Data quality |
|------|--------|-------------|--------------|
| `FY2024-annual.yaml` | Jan–Dec 2024 | annual_estimate | low |
| `FY2025-annual.yaml` | Jan–Dec 2025 | annual_estimate | low |

## Revenue complexity note
xAI's revenue is split across two distinct business lines that merged in March 2025:

1. **xAI standalone** (before March 2025): API revenue + SuperGrok subscriptions. This is the
   "pure AI company" revenue line relevant for comparison to OpenAI and Anthropic.

2. **Combined xAI+X** (after March 2025): xAI standalone + X advertising + X Premium subscriptions.
   All ARR figures after March 2025 include X's ~$1B subscription ARR and significant ad revenue.
   Treat combined figures as a different business than pre-merger xAI for comparability purposes.

## Key ARR anchors (Tier 2 estimates)
- End-2024: ~$100M ARR (standalone xAI — API + SuperGrok)
- End-2025: ~$3.8B ARR (combined xAI+X)
- February 2026: X subscriptions alone hit $1B ARR
- Burn rate: ~$1B/month (The Information, 2026)

## Key funding events (Tier 1 — Form D / press disclosures)
| Date | Round | Amount | Post-money valuation |
|------|-------|--------|---------------------|
| Jan 2024 | Series A | $135M | ~$5B (est) |
| May 2024 | Series B | $6B | ~$24B |
| Dec 2024 | Series C | $6B | ~$50B |
| Mar 2025 | X merger | all-stock | $80B xAI / $33B X |
| Jul 2025 | Debt round | undisclosed | — |
| Oct 2025 | Debt round | undisclosed | — |
| Jan 2026 | Series E | $20B equity + $12.5B debt | $230B |
| Feb 2026 | SpaceX acquisition | — | $250B xAI |
