# Company deep dive (full-pipeline workflow)

**Purpose:** Produce the equivalent of **two years of company study in one session**. This file sequences every instruction file in the repo into a single end-to-end workflow that builds a complete, judgment-rich company profile from scratch.

The final output is a **narrative** that reads like a memo from someone who has lived inside this company — connecting financials, operations, products, market perception, competitive dynamics, and forward-looking signals into a single view of what matters, what doesn't, and where to look next.

---

## When to use this workflow

Use this workflow when:

- Adding a **new company** to the repo and you want the full picture, not just a scaffold
- **Refreshing** an existing company after earnings, a major announcement, or a competitive shift
- The user asks for a **complete analysis** or **deep dive**

For single-file tasks (just update financials, just add an announcement), use the task-specific instruction file directly.

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

### Phase 6 — Narrative (≈7 min) ← CAPSTONE

**Goal:** A thesis-driven synthesis that reads like the output of two years of deep company study.

**Instruction file:** [narrative.md](./narrative.md)

1. Read **everything** from Phases 1–5: financials, business profile, announcements, and market perception
2. Open the primary documents (SEC filings, earnings materials, footnotes) — don't synthesize from YAML alone
3. Identify the 2–5 issuer-specific angles that actually matter — what's non-obvious, what's changing, what the market is missing
4. Draft sections that connect:
   - What the **numbers** say (from financials)
   - How the **business actually works** (from business profile)
   - What **just happened** (from announcements)
   - What the **market thinks** and where it may be **wrong** (from market perception)
   - How this company **compares to peers** (from competitive positioning)
5. End with a **conclusion** that answers: how should someone think about this company right now? What matters most? What is the market missing? What would change the thesis?

**Output:** `narrative/narrative.yaml` — the capstone file. This is what someone reads when they have 15 minutes and want the equivalent of months of study.

---

## Phase dependencies

```
Phase 1 (scaffold) ──→ Phase 2 (financials)
                   ──→ Phase 3 (business)
                   ──→ Phase 4 (announcements)
                          ↓
                   Phase 5 (market perception) ← reads Phases 2-4
                          ↓
                   Phase 6 (narrative)         ← reads Phases 2-5
```

Phases 2, 3, and 4 can run in parallel after Phase 1. Phase 5 must follow 2–4. Phase 6 must follow all.

---

## Quality standard

The deep dive is only as good as the narrative it produces. A strong narrative should:

- **Not read like a filing recap** — anyone can summarize a 10-Q. The value is in what's underneath.
- **Connect multiple data sources** — financials + business + announcements + perception should appear in the same argument, not in separate silos.
- **Include competitive context** — the reader should understand not just "is this company good" but "is this company better than the alternatives by enough to matter."
- **Surface information asymmetries** — the most valuable insight is often "here is what the market believes, here is what the evidence suggests, and here is why the gap exists."
- **Make predictions** (bounded, evidence-linked) — "based on X and Y, Z looks likely" is more useful than "there are risks and opportunities."
- **Be honest about gaps** — say what you don't know and what would change the thesis.

---

## Refresh workflow (existing company)

When refreshing rather than building from scratch, adapt the pipeline:

1. **Read existing files** — start from what's already in the repo
2. **Identify what changed** — new earnings, new announcement, competitive shift, sentiment move
3. **Update affected phases** — often just financials (new quarter) + market perception (new signal) + narrative (new synthesis)
4. **Rebuild the narrative** — even partial updates should produce a fresh narrative that reflects the current state

The narrative should always be **current**. If you update financials but the narrative still reflects last quarter's thesis, the pipeline is incomplete.

---

## What this workflow replaces

Without this workflow, an agent would handle each file in isolation — financials without context, narrative without perception, perception without competitive grounding. The result would be accurate but shallow: correct numbers with surface-level commentary.

This workflow forces the agent to build understanding **in layers**, the same way a human analyst does: first learn the numbers, then the business, then the events, then what others think, then form a view. Each layer makes the next layer sharper.

The goal is not automation. The goal is **compressed expertise**.
