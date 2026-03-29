# Deep analysis: Phase 6 + Phase 7 (structural analysis → narrative)

**Purpose:** Run the two final phases of the deep-dive pipeline in a single session, using all company data already collected in Phases 1–5. This file is the entry point when you want to re-run or upgrade the analysis and narrative for a company that already has `financials/`, `business/`, `announcements/`, and `market_perception/` populated.

This is the judgment-intensive half of the pipeline. If Phases 1–5 were run with a faster model, start here with a more capable one.

---

## Prerequisites

Before starting, confirm that the following files exist for the target company:

- `content/companies/<slug>/entity.yaml`
- `content/companies/<slug>/financials/*.yaml` (at least 2 quarters)
- `content/companies/<slug>/business/business.yaml`
- `content/companies/<slug>/announcements/announcements.yaml`
- `content/companies/<slug>/market_perception/market_perception.yaml`

If any of these are missing, run the appropriate upstream phase first. The quality of Phase 6 and 7 is entirely dependent on the quality of the input data.

---

## Phase 6 — Structural analysis

**Full instruction file:** [structural_analysis.md](./structural_analysis.md)

**Goal:** Produce original derived analysis that goes beyond what any summary of public sources can provide. This is the phase that distinguishes a filing recap from the output of a two-year company study.

### Step-by-step

**1. Start with the business model (required)**

Before computing anything, read `business/business.yaml` and `entity.yaml`. Understand:

- What does the company **own vs. rent vs. license**? This determines how to interpret every cost ratio, capex figure, and balance sheet line.
- What **stage** is the company in? A company in heavy buildout mode is expected to show high capex, high D&A, negative FCF. A mature operator showing the same metrics has a different problem.
- What are the **long-lived assets**? Some assets retain value for decades (land, grid connections, fabs, foundational IP). Others depreciate rapidly (GPUs, model weights, competitive features). This changes how you read the balance sheet and what "residual value" means.

**2. Load all company data**

Read in order:
1. `financials/*.yaml` — all available quarters
2. `business/business.yaml`
3. `announcements/announcements.yaml`
4. `market_perception/market_perception.yaml` — this is the consensus you are about to challenge

Then **open the actual filings** — not just the YAMLs. You need:
- Face statements (income statement, balance sheet, cash flow statement)
- Footnotes and notes to financial statements
- Depreciation schedules and accounting policies
- MD&A
- Earnings transcripts (management tone, analyst questions, deflections)

**3. Choose the most relevant analyses**

Do not run every analysis. Based on the business model and stage, select the 2–4 analyses that answer the key questions for this specific company:

| Business model | Most diagnostic analyses |
|---|---|
| Infrastructure (own-and-operate) | Operating leverage trajectory, asset residual value, funding bridge, milestone execution |
| Infrastructure (colocation/lease) | Lease obligation exposure, customer concentration, debt serviceability, margin at scale |
| Chips | Product cycle competitiveness, ASP and mix trends, inventory risk, R&D efficiency |
| Models | Training cost economics, inference cost trajectory, model obsolescence risk, compute dependency |
| Energy | Contracted vs. spot revenue mix, regulatory risk, asset utilization, long-term PPA economics |
| Applications | CAC vs. LTV, retention/churn economics, platform dependency risk, margin at scale |

If an analysis does not apply to this company, skip it. If an analysis is impossible due to missing data, state what is missing — that disclosure gap is itself a finding.

**4. Compute — and show the work**

For the analyses you chose, run the math:

- **Structural cost analysis:** (cost of revenue + D&A + SGA + R&D) / revenue for each quarter. Split structural vs. variable costs. Show the trend. Compute path to breakeven.
- **Cash flow quality decomposition:** OCF broken into net income + D&A + SBC + working capital changes. Check prepayment dependency. Compute FCF and capex intensity.
- **Capital structure stress test:** Net debt / revenue, net debt / EBITDA, interest burden / gross margin. Debt maturity. Funding gap. What-if: capital markets close for 12 months.
- **Unit economics:** Revenue per unit of capacity (MW, GPU-hour, chip, API call, seat — whichever applies). Pricing power trend. Contract payback period.
- **Disclosure quality:** Compare against 2–3 peers — financial granularity, operational transparency, guidance specificity, what management avoids.
- **Thesis destruction test:** State the bull case in one sentence. Identify the single assumption it depends on most. Test it with math. Then do the same for the bear case — sometimes the bears are wrong because they apply the wrong model.
- **Peer structural comparison:** Same cost structure ratios and capex intensity applied to 2–3 peers. Adjust for business model differences or explain why raw comparisons are misleading.

**5. Contextualize every finding through the business model lens**

Every computation must be framed through the business model. Do not present a ratio without explaining what it means given this company's model and stage:

- A cost ratio exceeding 100% means something different if the dominant cost is fixed D&A on owned long-lived assets vs. if it is variable compute costs.
- High capex is expected cost for a company in buildout mode creating owned long-lived assets. The same capex level in a company whose model does not produce owned assets signals something different.
- Heavy R&D may be the price of training a competitive foundation model or developing a next-generation chip architecture — or it may be capital consumed without durable output. Distinguish which.

**6. Maintain assumptions discipline (non-negotiable)**

- **Never fabricate a data point.** If a computation requires an input the company has not disclosed, state what is missing and what it costs the analysis.
- Label every output as: **Disclosed fact**, **Computable derivation** (show the formula), or **Assumption** (state why it is reasonable and what the sensitivity is).
- Use management's own implied targets when available — that is their math, not your guess.

**Phase 6 output:** Findings that feed directly into Phase 7. Every derived computation should appear in the narrative with the underlying math and the business model context.

---

## Phase 7 — Narrative

**Full instruction file:** [narrative.md](./narrative.md)

**Goal:** A thesis-driven synthesis that reads like the output of two years of deep company study. Combines the financial rigor of a senior research analyst with the domain expertise of someone who deeply understands the company's products, market, and competitive landscape. Must incorporate all structural analysis from Phase 6.

### Step-by-step

**1. Start with the business model lens (same as Phase 6 — restate it in narrative form)**

Before writing any section, confirm you understand:
- What the company owns vs. rents vs. licenses
- Where it sits in the value chain
- What stage it is in
- What its assets look like and how long-lived they are

This is not a preamble to skip. It is the interpretive lens through which every metric must be read. The narrative must explain these distinctions to the reader.

**2. Identify 2–5 issuer-specific angles**

These are the angles worth writing about. They must be specific to this company — not a recycled "growth vs. costs vs. leverage" framework. At least one angle must be grounded in original derived analysis from Phase 6. Ask:

- What is the real story here — given this company's business model and stage?
- What does the derived math show that headline numbers hide?
- What matters most for the next 1–4 quarters?
- Where is the consensus probably wrong, and what is the math?
- What is this company genuinely good at? What has it earned — vs. what is still unproven?
- Which of the "red flags" are actually the expected cost of executing the strategy, and which are genuine risks?

**3. Contextualize before judging (required for every concerning metric)**

For every metric that looks problematic, determine:
- Is this the **price of a deliberate strategy** (buildout cost, expected R&D investment, front-loaded capex for long-lived assets)?
- Or is it the **consequence of structural problems** (broken cost structure, commoditizing market, execution failure)?

The narrative must make an explicit judgment about which category applies, supported by evidence. Listing negative metrics without context is not acceptable. Excusing every negative metric as "the cost of growth" is equally unacceptable.

**4. Draft custom sections**

Write `sections` with `id`s and `title`s that match the story of this specific company. Include actual numbers and formulas in the prose — not just conclusions.

Every strong narrative includes:

- **At least one section with original derived financial math** — cost structure ratios, adjusted metrics, cash flow decomposition, unit economics, or breakeven analysis. Show actual numbers and formulas. The reader should be able to verify the computation.
- **At least one structural finding interpreted through the business model lens** — not "cost ratio is X%" but "cost ratio is X% because [business model reason], which means [implication]."
- **At least one peer comparison that accounts for business model differences** — adjust the numbers or explain explicitly why raw comparisons are misleading.

**5. Required sections and structure**

```yaml
kind: financial_narrative
schema_version: 1
as_of: <ISO date>
based_on_financials:
  - period_end: <YYYY-MM-DD>
    file: financials/<filename>.yaml
central_questions:  # optional — only if a short hook sharpens the theme
  - <1-2 sentences capturing the essential tension>
sections:
  - id: <issuer-specific>
    title: <issuer-specific>
    body: |
      ...
  - id: conclusion
    title: <"Conclusion" or issuer-specific label>
    body: |
      ...
disclosure_gaps:
  - <what limits confidence or blocks stronger judgment>
sources:
  - url: <...>
    description: <"Direct from SEC filing:" / "Derived:" / "Primary source:" ...>
```

**6. Write the conclusion (required — `id: conclusion`)**

The conclusion is the best short expression of the thesis. It must:

- **Explain how to read this company right now** — the one-paragraph version of the entire narrative
- **State what the company is doing well** — with specific evidence. Not every company is broken. If it is executing its strategy as expected, say so and explain why the metrics support that reading.
- **Identify the genuine risks** — distinguished from expected costs of the strategy. A risk is something that could break the thesis. An expected cost is the price of executing the strategy. Both should appear, clearly labeled.
- **State where the consensus appears off** — grounded in derived analysis, not general contrarianism
- **List specific observable events** that would confirm or deny the thesis (not vague "if growth continues")
- **Acknowledge what remains unknown** — the gaps that bound confidence in any forward projection

**7. Validate**

Run `scripts/validate_values_file.py` on `narrative/narrative.yaml` before finalizing.

---

## Voice and tone

Write as if the reader wants the output of hundreds of hours of company study in one sharp memo. They already see the spreadsheet — they want what the filing actually says, what the numbers hide on first glance, and how to read the company's position.

- Confident but not theatrical
- Analytical, not promotional
- Willing to judge management, strategy, and execution
- Willing to make bounded, evidence-linked predictions
- Willing to say "this is working" when the evidence supports it — not just "here are the risks"

**Avoid:**
- Writing like a filing summary or repo documentation
- A rigid question-and-answer scaffold where every company mirrors the same prompts
- A conclusion that only restates section headings
- Generic worry lists without numbers or filing anchors
- Context-free "red flags" — every concerning metric must be interpreted through the business model and stage

---

## What this output is not

- **Not a filing recap.** Anyone can summarize a 10-Q. The value is in what is underneath.
- **Not a consensus restatement.** The narrative should engage with market perception — agree, disagree, or add nuance — not ignore it.
- **Not a generic template.** Do not force every company through the same sections, the same worries, or the same framing. The angles must be specific to this company.
- **Not a collection of fabricated data.** Never invent a data point that is not disclosed. State what is missing and what it costs the analysis.

---

## Quality check before finalizing

Before saving the narrative, verify:

- [ ] Business model is explained before any metrics are interpreted
- [ ] At least one section contains original derived math with formulas and actual numbers
- [ ] Every concerning metric is contextualized through the business model lens
- [ ] At least one peer comparison accounts for business model differences
- [ ] No data point is fabricated — gaps are stated explicitly
- [ ] The conclusion distinguishes genuine risks from expected strategy costs
- [ ] The conclusion lists specific observable events as thesis confirmers/deniers
- [ ] `scripts/validate_values_file.py` passes
