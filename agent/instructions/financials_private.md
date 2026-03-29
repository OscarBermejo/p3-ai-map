# Financial data for private companies (`financials_private.md`)

**Substitute this file for `financials.md` and `financials_workflows.md` when the company does not file with the SEC or an equivalent public regulator.**

Private companies (OpenAI, Anthropic, Scale AI, etc.) do not file 10-K/10-Q reports and have no XBRL data. This file defines: what sources to use instead, how to structure the YAML when data is sparse, how to handle estimates and ranges, and what additional private-company metadata belongs in the financials folder.

The 7-phase pipeline structure in `company_deep_dive.md` is unchanged. This file replaces only Phase 2 sourcing rules.

---

## What changes vs. public company financials

| Dimension | Public company | Private company |
|-----------|---------------|-----------------|
| Primary source | SEC 10-K/10-Q filings | Press reports, funding disclosures, voluntary company releases |
| Data precision | Exact figures (audited) | Often ranges; sometimes confirmed single-point from reliable press |
| Quarterly cadence | Required; structured | Rarely quarterly; often annual; sometimes "as of last round" only |
| XBRL API | Available | Not available |
| Validator | `validate_values_file.py` | Run if you have confirmed values; expect many nulls — that is correct |

---

## Source tiers for private company financial data

### Tier 1 — confirmed disclosures
Use these when available. Treat as reliable.

- **Voluntary company releases**: some private companies publish revenue milestones, ARR, or employee counts in official blog posts, press releases, or CEO letters. Cite the specific post URL.
- **Regulatory filings that do exist**: some private companies have public debt (bonds) requiring SEC filing, or operate in regulated jurisdictions (e.g., EU) with limited disclosure requirements. Check EDGAR for 424B filings, indenture-related filings, or Form D.
- **Fundraising disclosures**: Form D (SEC) for U.S. private placements discloses raise amount and sometimes investor count. Not P&L data, but confirms capital raised.
- **Audited financials shared with regulators**: occasionally disclosed in acquisition proceedings, government contract disclosures, or regulatory inquiries.

### Tier 2 — credible reported figures
Use when Tier 1 is unavailable. Always attribute the specific outlet and author.

- **The Information, Bloomberg, Reuters, WSJ, Financial Times**: investigative financial reporting with named sources. Treat revenue and valuation figures from these outlets as estimates, not facts — but they are the best available proxy.
- **PitchBook, CB Insights (paid database data)**: useful for funding round history and valuations. Note that round valuations are post-money and not operating metrics.
- **Investor/LP communications that leaked or were disclosed**: treat as Tier 2; flag that provenance is indirect.

### Tier 3 — estimates and inference
Use only when Tier 1 and Tier 2 are unavailable for a given metric. Label explicitly.

- **Analyst estimates**: revenue multiples applied to known ARR, headcount-based revenue estimates, or compute-cost-based revenue floor estimates. Show the derivation and state all assumptions.
- **Community triangulation**: aggregated from multiple independent reports. Label as Tier 3 consensus estimate.
- **Never use Tier 3 alone for a numerical claim** without explicitly flagging it as an estimate with stated assumptions.

---

## YAML structure rules for private companies

### Use the standard quarter template as the base

Copy `content/_meta/companies/_example/financials/_template.quarter.yaml`. The structure does not change. Private companies use the same keys.

**Differences:**
1. Most standard metrics will be `null` — this is correct and expected.
2. The `period` block may not map to quarters. Use the best available period end date and label it accordingly (see Period conventions below).
3. Add an `extended_metrics` block at the bottom for private-company-specific data points (funding, valuation) that have no home in the standard template.
4. Add a `data_quality` block to declare the overall reliability of the file.

### Confirmed values (single-point, Tier 1 or strong Tier 2)

Use the standard field directly, same as a public company. Cite the source in `sources[]`.

```yaml
revenue: 4000000000    # $4B ARR confirmed by Bloomberg (Jan 2026); cite source below
```

### Estimated ranges (Tier 2/3 or conflicting reports)

Set the standard field to `null`. Document the range in a `documentation` source entry.

```yaml
revenue: null    # see sources — estimated $3.5B–$4.5B ARR range (Tier 2)
```

In `sources[]`, add a documentation entry:

```yaml
- url: https://www.theinformation.com/articles/openai-revenue-2025
  kind: ir_html
  description: "Tier 2 reported: The Information (Jan 2026) reports OpenAI ARR at ~$4B as of Dec 2025. Bloomberg (Feb 2026) separately reported $3.7B–$4.5B range. No single confirmed figure; range $3.5B–$4.5B used as working estimate. Standard revenue field set to null pending confirmation."
  covers: [revenue]
  retrieved_at: "2026-03-29"
```

**Never pick the midpoint of a range and store it as a confirmed figure.** Doing so converts an estimate into a false-precision fact. Keep it null and document.

### When even a range is unavailable

Set to `null` and add a brief documentation entry explaining why:

```yaml
- url: null
  kind: documentation
  description: "gross_profit, operating_income, net_income: not disclosed by company; no credible press estimate available as of 2026-03-29. Cost structure inference is possible (see narrative) but would require fabricating a gross margin assumption not grounded in any source."
  covers: [gross_profit, operating_income, net_income]
  retrieved_at: "2026-03-29"
```

### Period conventions for irregular reporting

Private companies rarely report quarterly. Use the period that best reflects the available data:

```yaml
period:
  label: "FY2025-ARR"       # Use a descriptive label, not a strict quarter label
  start: null               # null if period start is not known
  end: "2025-12-31"         # Best known as-of date for the data
  fiscal_year: 2025
  period_type: "annual_estimate"  # annual_estimate | funding_round | point_in_time | quarter
```

Add `period_type` as an extra field (the validator ignores unknown fields). Valid values:
- `annual_estimate` — revenue/metric covering approximately a full year
- `funding_round` — data disclosed at or tied to a specific funding round
- `point_in_time` — a snapshot (e.g., "ARR as of Q3 2025" without full-quarter financials)
- `quarter` — actual quarterly data (rare for private; use when genuinely available)

---

## Extended metrics block

Add this section after `sources[]` for private-company-specific data. These fields are not in the standard template and are not validated — they are supplemental.

```yaml
extended_metrics:
  # ── Funding and valuation (private-company-specific) ─────────────────────
  total_funding_raised_usd:
    value: null             # Cumulative capital raised across all rounds (USD).
    notes: null
    sources: []
  last_round_amount_usd:
    value: null             # Amount raised in the most recent disclosed round (USD).
    notes: null
    sources: []
  last_round_valuation_usd:
    value: null             # Post-money valuation at the most recent round (USD).
    notes: null
    sources: []
  last_round_date: null     # ISO date of the most recent disclosed funding round.
  last_round_type: null     # seed | series_a | series_b | ... | series_x | secondary | debt | strategic

  # ── Operating indicators (when disclosed or credibly reported) ────────────
  arr_usd:
    value: null             # Annual Recurring Revenue if reported (USD).
    notes: "Use for SaaS/API businesses where ARR is the primary revenue metric. Distinct from revenue if company has non-recurring components."
    sources: []
  monthly_burn_rate_usd:
    value: null             # Estimated monthly cash outflow (USD). Tier 2/3 only; flag clearly.
    notes: null
    sources: []
  cash_runway_months:
    value: null             # Estimated months of runway at current burn rate.
    notes: null
    sources: []
  headcount:
    value: null             # Total employee count (approximate; from LinkedIn, press reports, or company disclosure).
    notes: null
    sources: []
  revenue_per_employee_usd:
    value: null             # Derived: revenue / headcount (only if both are available as estimates). Label as derived estimate.
    notes: null
    sources: []
```

---

## data_quality block

Add this immediately before `extended_metrics`. It declares the overall reliability of the file so readers and downstream analysis know how much to trust the data.

```yaml
data_quality:
  overall: null             # high | medium | low | very_low
  confirmed_fields: []      # List of standard metric keys that have Tier 1 confirmed values.
  estimated_fields: []      # List of keys set to null with Tier 2/3 range documented in sources.
  unavailable_fields: []    # List of keys set to null with no credible estimate available.
  notes: null               # Free-text explanation of data quality constraints for this company/period.
```

**Rating guide:**
- `high` — most income statement metrics have Tier 1 or strong Tier 2 confirmed values
- `medium` — revenue confirmed or strongly estimated; most other metrics null or range-only
- `low` — only funding/valuation data available; operating metrics mostly null
- `very_low` — even revenue is Tier 3 estimate or unavailable; file exists primarily for structural context

---

## What to prioritize when data is scarce

Not all metrics are equally valuable for private-company analysis. Prioritize in this order:

1. **Revenue / ARR** — the most commonly disclosed or reported metric; essential for any financial comparison
2. **Funding history** (amount, valuation, date, type) — almost always available via Form D or press
3. **Headcount** — often estimable from LinkedIn; enables revenue-per-employee benchmarking
4. **Burn rate / runway** — occasionally reported; critical for runway analysis
5. **Gross margin** — rarely disclosed; estimate only if a credible Tier 2 source exists
6. **Operating income / net income** — almost never available; set null without comment

---

## Narrative and structural analysis implications

When filing `narrative/narrative.yaml` for a private company:

- **Phase 6 structural analysis will be thin.** You cannot compute cost structure ratios, FCF decomposition, or capital stress tests without a P&L. State this explicitly in `disclosure_gaps`.
- **Lean into what IS computable**: funding efficiency (ARR per dollar raised), burn multiple (net new ARR / net burn — if both available), headcount productivity, valuation multiples vs. public comps.
- **The narrative becomes more qualitative.** Market perception, competitive positioning, and product analysis carry more weight when financials are sparse. This is expected and should be stated, not apologized for.
- **Funding round history is a financial signal.** Round size, valuation step-up, investor composition, and time between rounds all contain information about trajectory and investor confidence. Use them.

---

## Transition to public filing

If a private company files publicly (IPO, S-1 registration, public debt offering), switch to the standard `financials.md` workflow immediately. S-1 filings contain multiple years of audited historical financials — backfill prior periods using the S-1 as the primary source and mark them as `confirmed` retroactively.
