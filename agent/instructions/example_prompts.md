# Example prompts

Copy-paste these into a new agent session. Replace `<COMPANY>`, `<slug>`, and `<LAYER>` with your target before running.

---

## Full deep dive (new company)

```
Read agent/instructions/company_deep_dive.md and run the full pipeline for Intel.
Scaffold the company, pull financials for the last 4 quarters, build the chips
business profile, scan for recent announcements, build market perception, run the
structural analysis (cost structure, cash flow decomposition, capital stress test,
disclosure quality vs peers, thesis destruction test), and write the narrative.
Work through all seven phases in order. The narrative must include original derived
math that cannot be found in any single public source.
```

## Full deep dive (private company — models layer)

```
Read agent/instructions/company_deep_dive.md and run the full pipeline for XAI.
This is a PRIVATE company on the MODELS layer — follow these substitutions:
- Phase 2: use agent/instructions/financials_private.md instead of financials.md.
  Do NOT look for SEC filings or XBRL. Source financials from press reports (The
  Information, Bloomberg, WSJ), funding disclosures (Form D), and any voluntary
  company releases. Use null + documented range for unconfirmed metrics. Populate
  extended_metrics with funding history and ARR.
- Phase 3: use the models layer template (content/_meta/business_templates/models.yaml).
  Populate every current model variant as a separate products[] entry with benchmarks,
  pricing (snapshot_date required), latency from Artificial Analysis, and compute
  derived_efficiency ratios.
Work through all seven phases in order. The narrative must acknowledge data gaps
explicitly and focus original derived analysis on what IS available: funding efficiency,
valuation multiples vs public comps, model price-performance trajectory, and competitive
positioning vs Anthropic and Google.
```

## Full deep dive (existing company refresh)

```
Read agent/instructions/company_deep_dive.md and run a full refresh on Oracle.
Start by reading all existing files under content/companies/orracle/, then update
financials with the latest quarter, refresh market perception with current signal,
re-run the structural analysis with updated numbers, and rewrite the narrative as
the capstone. The narrative must include updated derived analysis.
```

## Post-earnings refresh

```
<COMPANY> just reported <QUARTER>. Read agent/instructions/company_deep_dive.md and
do a post-earnings refresh: add the new quarter to financials, update announcements
with anything material from the call, refresh market perception (especially consensus
shifts, new debates, and sentiment direction), re-run structural analysis with the
new quarter data, then rewrite the narrative. Show how the structural cost ratios,
cash flow quality, and capital structure changed quarter-over-quarter.
```

## Market perception only

```
Read agent/instructions/market_perception.md and populate
content/companies/<slug>/market_perception/market_perception.yaml. Gather the latest
from SemiAnalysis, the most recent earnings transcript, Seeking Alpha (quality-filtered),
and X/Reddit sentiment. Focus especially on information asymmetries and competitive
positioning vs <PEER_1> and <PEER_2>.
```

## Competitive deep-dive

```
Read agent/instructions/market_perception.md and focus specifically on the competitive
positioning section for <COMPANY>. I want a thorough comparison against <PEER_1>,
<PEER_2>, and <PEER_3>. Where does <COMPANY> genuinely win, where is the gap closing,
and what are the real switching costs?
```

## Narrative only (after other files are populated)

```
Read agent/instructions/narrative.md and agent/instructions/structural_analysis.md,
then write content/companies/<slug>/narrative/narrative.yaml. Read all existing files
first — financials, business, announcements, and market perception. Before drafting,
run the full structural analysis: compute cost structure ratios with adjusted
depreciation, decompose cash flow quality, stress-test the capital structure, compare
disclosure quality vs <PEER_1> and <PEER_2>, and run the thesis destruction test.
The narrative must include the derived math — show the numbers and formulas, not just
conclusions. Tell me where the consensus is specifically wrong and what observable
event would change the thesis.
```

## Structural analysis only (after financials and business are populated)

```
Read agent/instructions/structural_analysis.md and run the full structural analysis
for <COMPANY>. Open the actual filings (not just the YAML). Compute: (1) structural
cost ratios with adjusted depreciation, (2) cash flow quality decomposition — OCF
excluding prepayments, capex intensity, burn rate, (3) capital structure stress test
— net debt ratios, interest burden, funding gap, what-if capital markets close,
(4) unit economics — revenue per MW/GPU, contract economics, pricing power trend,
(5) disclosure quality vs <PEER_1> and <PEER_2> — what can you model vs what are
you taking on faith, (6) thesis destruction test — take the bull case, find the
weakest assumption, test it with math. Show all the numbers and formulas.
```

## Add a new company (scaffold only)

```
Read agent/instructions/company_add_company.md and scaffold <COMPANY> under
content/companies/<slug>/. Fill entity.yaml with CIK, ticker, fiscal calendar, IR
links. Add it to company_index.yaml under the <LAYER> layer.
```

---

## Tips

- **Always point to the instruction file** — that's where all the rules, source tiers, and quality standards live.
- **For the full pipeline**, say "work through all seven phases in order" so the agent doesn't skip to the narrative.
- **For structural analysis**, name the peers you want compared and emphasize "show the math." Without this, agents produce prose conclusions without the underlying computation.
- **For market perception**, name the sources you care about (SemiAnalysis, earnings transcript, etc.) to anchor on quality over quantity.
- **For the narrative**, emphasize "capstone," "connect the files," and "include derived analysis" — otherwise agents tend to treat it as a filing summary or a consensus recap.
