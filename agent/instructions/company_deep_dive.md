# Company deep dive (full-pipeline workflow)

**Purpose:** Produce the equivalent of **two years of company study in one session**. This file sequences every instruction file in the repo into a single end-to-end workflow that builds a complete, judgment-rich company profile from scratch — including **original derived financial analysis** that goes beyond what any summary of public sources provides.

The final output is a **narrative** that reads like a memo from someone who has lived inside this company — connecting financials, operations, products, market perception, competitive dynamics, structural analysis, and forward-looking signals into a single view of what matters, what doesn't, and where to look next. The narrative should contain insights that require original computation and cannot be found in any single public source.

---

## When to use this workflow

Use this workflow when:

- Adding a **new company** to the repo and you want the full picture, not just a scaffold
- **Refreshing** an existing company after earnings, a major announcement, or a competitive shift
- The user asks for a **complete analysis** or **deep dive**

For single-file tasks (just update financials, just add an announcement), use the task-specific instruction file directly.

**To re-run only Phase 6 and Phase 7** (e.g., with a more capable model after running Phases 1–5 with a faster one), use [deep_analysis_phase6_7.md](./deep_analysis_phase6_7.md).

---

## The pipeline

Each phase builds on the previous ones. Do not skip ahead — later phases are richer when earlier phases are complete.

### Phase 1 — Scaffold and identity (≈2 min)

**Goal:** Company exists in the repo with correct identity and links.

**Instruction file:** [company_add_company.md](./company_add_company.md)

1. Create company folder from `content/_meta/companies/_example/`
2. Fill `entity.yaml`: legal name, slug, ticker, CIK, fiscal year-end, IR links, press release index
3. Add `{ slug, layer }` to `content/_meta/company_index.yaml`

**Output:** A company folder with `entity.yaml` that the rest of the pipeline can reference.

**Skip if:** Company already exists in the repo.

### Phase 2 — Financials (≈5 min)

**Goal:** Structured, sourced financial metrics for the most recent 2–4 quarters.

**Instruction files:** [financials.md](./financials.md), [financials_workflows.md](./financials_workflows.md), [financials_sec_xbrl_concepts.md](./financials_sec_xbrl_concepts.md)

> **Private companies** (no SEC filing): substitute [financials_private.md](./financials_private.md) for the three files above. The YAML structure is the same; only the sourcing rules and data quality expectations differ.

1. Set up `financials/README.md` with fiscal calendar and naming conventions
2. Pull financials for the most recent 2–4 quarters from SEC filings and XBRL
3. Validate each quarter file with `scripts/validate_values_file.py`

**Output:** `financials/*.yaml` files with sourced metrics. These become the numerical backbone for everything that follows.

**Priority:** Start with the most recent quarter and work backward. Two quarters minimum for trend detection; four is ideal.

### Phase 3 — Business profile (≈5 min)

**Goal:** Layer-specific operational and strategic facts.

**Instruction files:** [business.md](./business.md), [business_workflows.md](./business_workflows.md)

1. Copy the correct layer template from `content/_meta/business_templates/`
2. Populate from filings, official IR, datasheets, and layer-specific Tier 1 sources
3. For chips: fill product-level specs, architecture, performance, benchmarks
4. For infrastructure: fill capacity triples, GPU counts, contracts, platform

**Output:** `business/business.yaml` with sourced operating facts. This tells you how the business actually works beyond the income statement.

### Phase 4 — Announcements (≈3 min)

**Goal:** Recent material events that affect the company thesis.

**Instruction file:** [announcements.md](./announcements.md)

1. Scan the company's press release index, SEC 8-K/6-K filings, and IR page
2. Capture the most recent 5–10 material announcements (deals, product launches, partnerships, leadership changes, regulatory items)
3. One event per row, multiple sources per event

**Output:** `announcements/announcements.yaml` with dated, sourced events. These provide the "what just happened" context that perception and narrative need.

### Phase 5 — Market perception (≈8 min)

**Goal:** How the market sees this company — consensus, debates, sentiment, competitive positioning, information asymmetries, and forward signals.

**Instruction file:** [market_perception.md](./market_perception.md)

1. Read all company data from Phases 1–4 first — understand the disclosed reality before mapping perception
2. Gather Tier 1 analytical sources (SemiAnalysis, domain-expert blogs, conference material)
3. Read the most recent earnings transcript — note management tone, analyst questions, deflections
4. Survey Tier 2 (Seeking Alpha quality-filtered, tech press, sell-side summaries) for narratives and debates
5. Sample Tier 3 (X, Reddit, HN) for sentiment direction and emerging signals
6. Build competitive positioning: identify key peers, where this company wins/loses, switching costs, and order changers
7. Identify information asymmetries — where the market may be wrong and why
8. Cross-check: perception should capture what the market **adds** on top of disclosures, not restate the 10-K

**Output:** `market_perception/market_perception.yaml` with attributed, tiered evidence across all sections.

### Phase 6 — Structural analysis (≈10 min)

**Goal:** Original derived analysis that goes beyond what any summary of public sources can provide. This is the phase that separates a filing recap from the output of a two-year company study.

**Instruction file:** [structural_analysis.md](./structural_analysis.md)

1. **Start with the business model.** Before computing anything, understand what the company owns vs. rents, what stage it is in, and where it sits in the value chain. This determines which analyses matter most and how to interpret every metric.
2. With all data from Phases 1–5 in hand, open the actual filings (not just YAML) — you need footnotes, depreciation schedules, segment data
3. **Choose the most relevant analyses** from the structural_analysis.md menu based on the business model and the key questions for this company. The full menu includes: structural cost analysis, cash flow decomposition, capital structure stress test, unit economics, disclosure quality assessment, thesis destruction test, and peer structural comparison — but different companies need different emphasis.
4. **Compute** — do the math. Contextualize every finding through the business model lens. The same ratio means different things for different models at different stages.
5. **Maintain assumptions discipline** — never fabricate a data point that is not disclosed. When a computation requires an unavailable input, state what is missing and what it costs the analysis.
6. **Compare with peers** — but adjust for or explain business model differences. Raw ratio comparisons across companies with different models mislead more than they inform.
7. **Run the thesis destruction test** — take the bull case and the bear case, identify the weakest assumption in each, and test with math. Sometimes the bears are wrong because they apply the wrong model to the company.

**Output:** Findings flow directly into the narrative (Phase 7). Every derived computation should appear in narrative sections with the underlying math and the business model context that explains what the numbers mean.

**Why this phase exists:** Without it, the narrative reads like a well-organized version of what smart people on Twitter already know. With it, the narrative contains original derived analysis — the kind of work that takes a human analyst months of spreadsheet time.

### Phase 7 — Narrative (≈7 min) ← CAPSTONE

**Goal:** A thesis-driven synthesis that reads like the output of two years of deep company study, combining the financial rigor of a senior research analyst with the domain expertise of someone who deeply understands the company's products, market, and competitive landscape. Must incorporate the structural analysis from Phase 6.

**Instruction file:** [narrative.md](./narrative.md)

1. **Start with the business model lens.** Read everything from Phases 1–6 and understand how the company's model shapes every metric. The same numbers mean different things for different models.
2. Open the primary documents (SEC filings, earnings materials, footnotes) — don't synthesize from YAML alone
3. Identify the 2–5 issuer-specific angles that actually matter — what's non-obvious, what's changing, what the market is missing. These angles must be specific to THIS company, not a generic template.
4. Draft sections that include:
   - **Original derived financial math** from Phase 6 — contextualized through the business model lens (not just "cost ratio is X%" but "cost ratio is X% because [business model reason], which means Y")
   - **What the company is doing well** — with evidence. If a concerning metric is the expected cost of executing the company's strategy at its current stage, say so. Not every negative-looking metric is a red flag.
   - **Where the genuine risks lie** — distinguished from expected costs of the strategy. A risk is something that could break the thesis. An expected cost is the price of executing the strategy.
   - **Peer comparison that accounts for business model differences** — not raw ratio comparisons across fundamentally different models
   - Where the **market appears wrong** and the derived analysis shows why
5. **Maintain strict assumptions discipline** — never fabricate data points. Clearly separate disclosed facts, computable derivations, and assumptions.
6. End with a **conclusion** that integrates everything: how to read this company, what's working, what's risky, where consensus is off, what to watch, and what remains unknown.

**Output:** `narrative/narrative.yaml` — the capstone file. This is what someone reads when they have 15 minutes and want the equivalent of months of study. It must contain original analysis that cannot be found in any single public source.

---

## Phase dependencies

```
Phase 1 (scaffold) ──→ Phase 2 (financials)
                   ──→ Phase 3 (business)
                   ──→ Phase 4 (announcements)
                          ↓
                   Phase 5 (market perception)     ← reads Phases 2-4
                          ↓
                   Phase 6 (structural analysis)   ← reads Phases 2-5, opens filings
                          ↓
                   Phase 7 (narrative)              ← reads Phases 2-6
```

Phases 2, 3, and 4 can run in parallel after Phase 1. Phase 5 must follow 2–4. Phase 6 must follow 5. Phase 7 must follow all.

---

## Quality standard

The deep dive is only as good as the narrative it produces. A strong narrative should:

- **Start with the business model** — before interpreting any metric, explain how the company makes money, what it owns vs. rents, where it sits in the value chain, and what stage it is in. This lens determines how every number should be read.
- **Not read like a filing recap** — anyone can summarize a 10-Q. The value is in what's underneath.
- **Contain original derived analysis** — at least one section where you did math the reader cannot find in any single public source. Show the numbers and the formula.
- **Contextualize before judging** — for every concerning metric, explain WHY the company is there. Is it the expected cost of executing a deliberate strategy at this stage? Or is it the consequence of structural problems? The same ratio carries different implications depending on the business model and stage.
- **Surface what's working alongside risks** — not every company is broken. If the company is executing as expected for its stage and model, say so with evidence. Identify genuine risks (things that could break the thesis) separately from expected costs (the price of the strategy).
- **Never fabricate data** — if a computation requires an input that is not disclosed, state what is missing and what it costs the analysis. Do not invent numbers to fill gaps.
- **Compare peers through the business model lens** — raw ratio comparisons across companies with different models are misleading. Adjust or explain the differences.
- **Include the thesis destruction test** — but test both the bull AND bear cases. Sometimes the bears are wrong because they apply the wrong model to the company.
- **Connect multiple data sources** — financials + business + announcements + perception + structural analysis should appear in the same argument, not in separate silos.
- **Make predictions** (bounded, evidence-linked) — "based on X and Y, Z looks likely" is more useful than "there are risks and opportunities."
- **Be honest about gaps** — say what you don't know and what would change the thesis.

---

## Refresh workflow (existing company)

When refreshing rather than building from scratch, adapt the pipeline:

1. **Read existing files** — start from what's already in the repo
2. **Identify what changed** — new earnings, new announcement, competitive shift, sentiment move
3. **Update affected phases** — often just financials (new quarter) + market perception (new signal)
4. **Re-run structural analysis** — even if only financials changed, the derived computations may shift (cost ratios, breakeven, funding gap). Re-run at least the analyses affected by the new data.
5. **Rebuild the narrative** — even partial updates should produce a fresh narrative that reflects the current state and incorporates updated structural analysis

The narrative should always be **current**. If you update financials but the narrative still reflects last quarter's thesis and last quarter's derived analysis, the pipeline is incomplete.

---

## What this workflow replaces

Without this workflow, an agent would handle each file in isolation — financials without context, narrative without perception, perception without competitive grounding, and no original derived analysis. The result would be accurate but shallow: correct numbers with surface-level commentary that reads like a well-organized version of what's already on Twitter and Seeking Alpha.

This workflow forces the agent to build understanding **in layers**, the same way a human analyst does: first learn the numbers, then the business, then the events, then what others think, then **do original math that challenges and extends what others think**, then form a view that integrates everything. Each layer makes the next layer sharper. The structural analysis phase is what separates this from a summary — it is where the agent does the computational work that takes a human analyst months.

The goal is not automation. The goal is **compressed expertise** — the kind that produces insights you cannot find in any single public source.
