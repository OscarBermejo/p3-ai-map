# Google TPU — Financials

## Shared filings notice

The legal and reporting entity for this profile is **Alphabet Inc.** (CIK 0001652044, GOOGL / GOOG),
which is identical to the **google-deepmind** profile. Both profiles draw from the same set of
Alphabet consolidated SEC filings (10-K, 10-Q) and earnings releases.

The quarterly YAML files in this directory are **copies** of the files under
`content/companies/google-deepmind/financials/`, with headers and `extended_notes` adjusted to
reflect the chips-layer framing of this profile. All underlying metric values, derivation logic,
and source citations remain identical to the google-deepmind files.

**Sync rule:** If Alphabet consolidated figures are updated in google-deepmind, the same updates
must be applied here. Either copy forward both sets simultaneously, or note the divergence clearly.

---

## Fiscal calendar

| Period | Start | End | Filename |
|--------|-------|-----|----------|
| Q1 2025 | Jan 1, 2025 | Mar 31, 2025 | FY2025-Q1.yaml |
| Q2 2025 | Apr 1, 2025 | Jun 30, 2025 | FY2025-Q2.yaml |
| Q3 2025 | Jul 1, 2025 | Sep 30, 2025 | FY2025-Q3.yaml |
| Q4 2025 | Oct 1, 2025 | Dec 31, 2025 | FY2025-Q4.yaml |

Alphabet uses a calendar fiscal year (January 1 – December 31). Files follow `FY{year}-Q{n}.yaml`.

---

## What these financials show — and what they do not

### Disclosed

- **Alphabet consolidated** revenue, operating income, net income, capex, cash flows, and balance sheet.
- **Google Cloud segment** revenue and operating income (in `extended_notes`) — the nearest commercial proxy for AI infrastructure traction.

### Not disclosed by Alphabet

- TPU-specific revenue — **not broken out in any Alphabet filing**.
- TPU hardware unit economics (cost per chip, gross margin on TPU pods) — **not disclosed**.
- Capex attribution to TPU hardware vs. land / building / networking — **not disclosed**.
- Google Cloud TPU-on-demand revenue as a share of total Google Cloud revenue — **not disclosed**.
- Internal transfer pricing between TPU supply and Google Search / Ads workloads — **not disclosed**.

**Analytical implication:** Quantitative TPU analysis must rely on Alphabet consolidated capex
(a reliable capex trajectory signal), Google Cloud segment revenue (a proxy for external TPU demand),
and third-party estimates. Any TPU-specific unit economics attribution is an analyst estimate, not
a disclosed fact, and must be labeled as such.

---

## Primary sources

- Alphabet quarterly earnings releases: https://abc.xyz/investor/
- SEC XBRL company facts: https://data.sec.gov/api/xbrl/companyfacts/CIK0001652044.json
- SEC EDGAR filing index: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001652044&type=10-K&dateb=&owner=include&count=10
