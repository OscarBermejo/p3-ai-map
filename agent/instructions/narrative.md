# Financial narrative (`narrative/narrative.yaml`)

**Purpose:** Produce the **deepest, most useful judgment layer** on the company in this repo. This is the capstone of the analysis pipeline — the file someone reads when they want the equivalent of months of company study in 15 minutes. It connects **financials**, **business profile**, **announcements**, **market perception**, structural analysis, and competitive dynamics into a single view of **what is really going on underneath**.

The narrative must read like the combined output of two people: a **senior research analyst** who can decompose any balance sheet, and a **domain expert** who understands the company's products, market, technology, and competitive landscape at a deep level. Neither perspective alone is sufficient. The analyst without domain knowledge runs every company through the same cost-ratio checklist. The domain expert without financial discipline makes excuses for bad numbers. The narrative integrates both.

This file is used across companies and value-chain layers. It is **not** tied to a single mental model, a fixed outline, or a standard set of concerns.

---

## The business model lens (start here, every time)

Before interpreting any financial metric, the agent must understand **how this company actually works**:

- **What does the company own vs. rent vs. license?** This question applies to every layer of the value chain. In infrastructure, it might mean building and owning data centers vs. leasing colocation space. In chips, it might mean owning fabrication facilities (IDM) vs. fabless design that outsources manufacturing. In models, it might mean training proprietary foundation models vs. fine-tuning or serving models created by others. In energy, it might mean owning generation assets vs. contracting for power delivery. The same financial metrics — D&A, capex intensity, gross margin — carry different meaning depending on the answer.
- **Where does it sit in the value chain?** Each layer faces different risks and has different leverage points. The structural analysis, peer comparisons, and stress tests must be **tailored to where the company operates**, not applied from a generic template.
- **What is the company's stage?** A company in heavy buildout mode looks very different from a mature operator generating steady cash flows. A startup burning cash to acquire customers or train a foundation model is different from an established business burning cash because its economics are broken. Stage determines what "good" looks like for every metric.
- **What is the asset's useful life and residual value?** Some businesses create assets that retain value for decades — land, grid connections, power generation infrastructure, foundational IP, fabrication plants. Others depend on rapidly depreciating assets — GPUs, model weights that may be surpassed in months, application features in competitive markets. This distinction changes how you read capex, D&A, and the balance sheet.

**This analysis is not a preamble to skip past.** It is the lens through which every subsequent number must be interpreted. If you don't understand the business model, you will misread the financials — not in small ways, but fundamentally.

**Why this matters — the same metric means different things in different models:**

- **High capex and negative FCF** during buildout may be expected when a company is creating long-lived assets (infrastructure building data centers, a chip company constructing a fab, an energy company developing generation capacity). The same numbers in a company whose model does not produce owned assets would signal something very different.
- **A 140% all-in cost ratio** where D&A is the dominant cost may indicate a company heading toward operating leverage as revenue scales against a fixed depreciation base. The same ratio driven by variable costs (compute purchased per-query, licensing fees, contract labor) is a structural profitability problem that scale alone cannot fix.
- **Heavy R&D spend with no near-term revenue** may be the cost of training a competitive foundation model, developing a next-generation chip architecture, or building a platform that requires critical mass. Whether this is strategic investment or wasted capital depends on what asset the R&D produces and how durable that asset is.

The narrative must explain these distinctions explicitly when they apply. Do not assume the reader already understands the business model implications.

---

## Contextualizing financial signals (required before any judgment)

Every financial metric that appears concerning — high cost ratios, negative FCF, elevated SBC, large debt loads, declining margins — must be passed through a **contextual filter** before being labeled a red flag or a risk:

### Ask: Why is the company in this financial situation?

There are broadly two categories:

1. **The price of a deliberate strategy.** The company is spending aggressively now to build something that is expected to generate returns over a long horizon. This pattern appears across every layer of the value chain:
   - **Infrastructure:** Amazon operated at minimal profitability for over a decade while building fulfillment, logistics, and cloud infrastructure. Cell tower companies ran heavy capex cycles for years before generating recurring cash flows at premium valuations.
   - **Chips:** AMD spent years investing in the Zen architecture, running losses and losing market share, before the product cycle turned and it regained competitiveness against Intel.
   - **Models:** Foundation model companies invest billions in training runs with no immediate revenue, betting that the resulting model becomes a platform others build on.
   - **Energy:** Utilities build power plants at enormous upfront cost, knowing the regulated asset base produces cash for 30+ years.
   - **Applications:** Companies entering new markets often accept losses in the new segment while it scales, funded by an existing cash-generating business.

   In these cases, the "red flag" is actually the **cost of execution**, not a sign of structural problems. The right question is not "why is this company losing money?" but "are the assets or capabilities being built the right ones, at the right scale, for the right customers, and will the economics work at maturity?"

2. **The consequence of structural problems.** The company's cost structure is broken, its market is commoditizing, its execution is poor, or its strategy has failed. The spending is not building durable value — it is consuming capital without creating an asset base that will generate returns.

**The narrative must make an explicit judgment about which category applies** for each significant concern, and support that judgment with evidence. It is not acceptable to simply list negative metrics without context. It is equally unacceptable to excuse every negative metric as "the cost of growth."

### How to tell the difference

- **Is there a coherent strategic rationale?** Can you trace a line from the spending to a specific asset, capability, or market position that has long-term value? If the company is spending aggressively, what exactly is being created, for whom, and what is the expected return?
- **Does the spending create durable value or consume expendable resources?** The "durable value" looks different by layer — it might be owned physical infrastructure, a trained foundation model, a chip architecture with multi-generation applicability, a power purchase agreement portfolio, or a platform with network effects. The key question is whether the spending produces something that compounds over time or must be continuously replenished.
- **Is the spending time-bounded?** Buildout phases end. If the company has clear milestones (site energization, product tape-out, model training completion, platform launch), the capital intensity is temporary. If there is no visible endpoint, the "investment phase" framing may be wishful thinking.
- **What do historical precedents show?** Are there companies in the same or analogous industries that followed a similar capital-intensive path and succeeded? What distinguished the winners from the losers?
- **Is management credible on the timeline?** Have they hit prior milestones? Is the capex plan backed by signed contracts and pre-arranged financing, or is it aspirational guidance?

---

## Assumptions discipline (non-negotiable)

The narrative must maintain strict discipline about what is computable from disclosed data versus what requires assumptions.

### Rules

1. **Never fabricate a data point to fill a gap.** If a company discloses an aggregate number without the breakdown needed for your computation, you cannot invent the breakdown. Do not guess the denominator for a unit economics calculation, the mix split for a segment analysis, or the utilization rate for a capacity model. Instead, state clearly what would need to be disclosed to enable the computation.

2. **Clearly separate three categories in your reasoning:**
   - **Disclosed facts:** Numbers, dates, terms taken directly from filings, press releases, or official documents. Cite the source.
   - **Computable derivations:** Ratios, trends, and breakevens that can be calculated from disclosed data using clearly stated formulas. Show the math.
   - **Assumptions and estimates:** Anything that requires a guess, a proxy, or an extrapolation. State what you are assuming, why it is reasonable, and what the sensitivity is. Label these explicitly as assumptions.

3. **Grounded assumptions are acceptable — ungrounded assumptions are not.** It is fine to assume costs stay roughly constant quarter-over-quarter (supported by recent trend). It is fine to project a growth rate forward (supported by observed trajectory). It is not fine to assume a specific operational figure (active units, utilization rate, segment mix) that the company has not disclosed.

4. **Use management's own implied targets when available.** If management provides an ARR target and a fleet size target, the implied unit economics are management's own math — not your assumption. This is a more honest approach than inventing your own inputs.

5. **When a key metric is unknowable, say so — and explain what it costs you analytically.** Stating "we cannot compute X because the company does not disclose Y — this means we cannot evaluate Z, which is the single most important question for this company" is far more valuable than fabricating Y to produce a precise-looking but ungrounded X.

---

## Voice and standard

Write as if the reader wants the output of **hundreds of hours of company study** condensed into one sharp memo. The reader already sees the spreadsheet — they want what the filing actually says, what the numbers hide on first glance, and how to read the company's position.

**Tone:**

- Confident but not theatrical
- Analytical, not promotional
- Willing to judge management, strategy, and execution
- Willing to make predictions, but explicit about what is fact vs. interpretation vs. forecast
- Willing to say "this is working" when the evidence supports it, not just "here are the risks"

**The best narratives read like:**

- "Here is what actually matters"
- "Here is why the financials look the way they do — and whether that's a problem or a feature"
- "Here is what the company is genuinely good at, and what remains unproven"
- "Here is what the market is probably wrong about, and here is the math"

**Avoid:**

- Writing like a worksheet, a filing summary, or repo documentation
- Phrases like "in the metrics block," "per financials/*.yaml," or "accession in the body" — write for a reader who wants financial judgment, not codebase documentation
- A rigid question-and-answer scaffold where every company mirrors the same prompts
- A conclusion that only restates section headings
- Generic worry lists without numbers or filing anchors

---

## Evidence standard

This is a judgment-heavy file, but it is grounded in evidence.

### Open the documents and read deeply (required)

A real narrative is **not** done from YAML fields and URL strings alone. Open the primaries you rely on and read:

- Face statements (income statement, balance sheet, cash flow statement)
- Footnotes / notes to financial statements
- Accounting policies (depreciation schedules, revenue recognition, lease treatment)
- MD&A
- Earnings materials / shareholder letters / call transcripts
- Official announcement releases

If useful, also read:

- Official product pages
- Competitor filings / investor materials
- Official market or regulatory documents

When using peer or market context, prefer **primary or official** sources.

If you cannot open an important primary, say so in `disclosure_gaps` or `conclusion` and avoid pretending to know what that document would have shown.

### Read with

- [sources.md](./sources.md) (Financial narratives track)
- [financials.md](./financials.md)
- [business.md](./business.md)
- [announcements.md](./announcements.md) when recent company events are important to the thesis
- [market_perception.md](./market_perception.md) — if `market_perception/market_perception.yaml` exists, read it before drafting. Use consensus narrative, key debates, competitive positioning, and information asymmetries to sharpen your own judgment. Engage with the market's view — agree, disagree, or add nuance — do not ignore it.
- [structural_analysis.md](./structural_analysis.md) — for the derived analysis phase that must be completed before drafting
- The layer's `content/_meta/layer_frameworks/<layer>.yaml` when it helps frame what usually matters in that slice

---

## Judgment is required

The narrative must **reach a real view**. It should not stop at "these are the numbers" or "these are some risks."

### What to judge

- Whether guidance looks believable, stretched, or unlikely — and whether the gap matters
- Whether growth quality is improving or deteriorating
- Whether profitability, cash generation, or capital intensity is better or worse than it first appears — **and why**
- Whether management framing is clarifying reality or obscuring it
- Whether competitive position looks stronger or weaker than the company is implying
- What the company is genuinely **good at** and can leverage repeatedly
- Whether the company has a real **advantage** or **moat**, and how durable it looks
- What the company does **worse** than competitors, and what could become a recurring weakness
- Whether recent announcements support the strategy or mostly support the narrative around the strategy
- **Whether the company is executing as expected for its stage and business model** — this is distinct from whether the headline numbers look good or bad

### Predictions

Predictions are acceptable when they are:

- Clearly framed as judgment, not disclosed fact
- Tied to real evidence
- Stated with appropriate uncertainty

**Bad:** "The company will definitely beat guidance next quarter."

**Better:** "Based on contracted capacity, recent procurement, and management's latest language, guidance looks achievable but still dependent on financing and deployment timing."

### Guardrails on management judgment

It is valid to ask whether management is hiding, de-emphasizing, or strategically framing something, but do not accuse deception without strong evidence. Prefer formulations like:

- Management is emphasizing X, but the more important constraint appears to be Y
- The release foregrounds A while B is doing more of the explanatory work
- The quarter looks better or worse after adjusting for C
- Disclosures are thin on D, which limits confidence in E

---

## Structural analysis integration

The narrative must include original derived analysis from [structural_analysis.md](./structural_analysis.md). But the **framing** of the analysis matters as much as the math.

### Principle: choose the analyses that matter for THIS company

Not every company needs the same stress tests. The structural analysis instruction provides a menu of possible analyses (cost structure, cash flow decomposition, capital stress test, unit economics, disclosure quality, thesis destruction, peer comparison). **The agent must choose which analyses are most revealing for this specific company**, based on its business model, stage, and the questions that matter most.

Examples of how the business model determines which analyses matter most:

- **Infrastructure (own-and-operate):** operating leverage trajectory (when does fixed D&A get absorbed by growing revenue?), asset residual value (what are the owned assets worth independent of the current business?), funding bridge (can the company reach scale without dilutive capital raises?).
- **Infrastructure (colocation/lease-based):** lease obligation exposure (what happens when leases reprice?), customer concentration risk (how dependent is revenue on a few contracts?), debt serviceability at scale.
- **Chips:** product cycle timing (is the next generation competitive?), ASP and mix trends (is pricing power intact or eroding?), inventory risk (building stock ahead of demand that may not materialize?), R&D efficiency (dollars spent per competitive product generation).
- **Models:** training cost economics (cost per training run vs. expected revenue from the resulting model), inference cost trajectory (is cost per query declining fast enough to sustain margins as usage scales?), model obsolescence risk (how quickly does a new generation make the current one uncompetitive?).
- **Energy:** contracted vs. spot revenue mix, regulatory and permitting risk, asset utilization rates, long-term PPA economics.
- **Applications:** customer acquisition cost vs. lifetime value, retention and churn economics, platform dependency risk (reliance on third-party models or infrastructure), margin structure at scale.

### What MUST appear in every narrative

Regardless of company type, the narrative must include:

- **At least one section with original derived financial math** — cost structure ratios, adjusted metrics, cash flow decomposition, unit economics, or breakeven analysis — with actual numbers and formulas shown. The reader should be able to verify the computation.
- **At least one structural finding that requires the business model lens** — not just "cost ratio is X%" but "cost ratio is X% because [business model reason], which means [implication] compared to [alternative model where the same ratio would mean something different]."
- **At least one peer comparison on a dimension that the business model difference makes non-obvious** — comparing raw ratios across companies with different models without adjusting for the model difference is misleading. The narrative must either adjust the comparison or explain why the raw numbers are not directly comparable.
- **A conclusion that integrates the structural analysis** into a coherent view — not a separate "structural findings" appendix, but analysis woven into the story of the company.

---

## What readers are trying to understand

The narrative should help answer the real questions an allocator or serious researcher would ask:

- Is the company's story internally consistent? Are financials, business metrics, and announcements pointing in the same direction?
- Is the company building a durable advantage, or just telling a good story?
- **Why is the company in its current financial situation — and is that where it should be given its strategy and stage?**
- What is the company best at operationally, commercially, or strategically?
- What is the company structurally weak at?
- Does the company have a moat, and if so, where does it really come from?
- Where does the company look better or worse than peers — **after adjusting for business model differences**?
- Are there balance-sheet, execution, concentration, product, or demand risks that the market is underestimating?
- **What would need to be true for the current strategy to work? How much of that is within the company's control?**
- What is the most important thing the company does NOT disclose, and what does that cost the analyst?

These are examples, not a mandatory list.

---

## How to build the narrative (agent)

1. **Read the business model.** Read `business/business.yaml`, `entity.yaml`, and enough primary material to understand: what the company owns vs. rents, where it sits in the value chain, what stage it is in, and what its assets look like. This informs everything that follows.

2. **Read the data.** Read `financials/*.yaml` for the target period and prior periods, `announcements/announcements.yaml`, and `market_perception/market_perception.yaml` if present.

3. **Open primary documents.** Open the filings, footnotes, earnings transcripts, and any other primaries behind the core claims you expect to make. Read the actual documents — footnotes, depreciation schedules, segment disclosures, revenue recognition policies.

4. **Review market perception.** What is the consensus? What are the key debates? Where does the market think this company wins or loses vs. peers? Where might the market be wrong? Use these to sharpen your own view — not to parrot the market.

5. **Run structural analysis** per [structural_analysis.md](./structural_analysis.md), choosing the analyses most relevant to this company's business model and stage. Compute the math, show the work.

6. **Ask the core questions:**
   - What is the real story here — given this company's business model and stage?
   - What does the derived math show that headline numbers hide?
   - What matters most for the next 1–4 quarters?
   - What is management saying, and what do the underlying facts say?
   - Where is this company stronger or weaker than peers on dimensions that require computation to see — **adjusting for business model differences**?
   - What is the company doing well? What would look like a red flag on the surface but is actually expected or even healthy for this type of business at this stage?
   - What are the genuine risks — the ones that are NOT just "the cost of execution" but real threats to the strategy?
   - Where does the market appear to be wrong, and why?

7. **Identify 2–5 issuer-specific angles** that are worth writing about. At least one should be grounded in original derived analysis. The angles should be specific to THIS company — not a generic "growth vs. costs vs. leverage" framework recycled for every name.

8. **Draft custom sections** with custom `id`s and `title`s that match the story. Include actual numbers and formulas in the prose, not just conclusions. **Contextualize every concerning metric** through the business model lens before judging it.

9. **Use `central_questions` only if a short thematic hook helps the UI.** A good central question captures the essential tension of the company in 1-2 sentences. A bad one is a generic "growth vs. costs" platitude.

10. **End with a real conclusion** that:
    - Explains how to read this company right now
    - States what the company is doing well — with evidence
    - States where the genuine risks lie — with evidence
    - Identifies where the consensus appears off — based on the derived analysis
    - Lists specific observable events that would change the thesis
    - Acknowledges what remains unknown

---

## What a strong narrative usually contains

Depending on the company, useful angles may include:

- **The business model in context:** Why this company's financials look the way they do, how its model differs from peers, and what that means for interpreting every ratio
- Whether reported growth is high quality or low quality
- Whether the company's capital structure supports the strategy — or is at odds with it
- What the company appears to be unusually good at
- Whether the company has a defensible moat or only temporary positioning — and what creates the moat (owned assets? scale? network effects? switching costs? something else?)
- What part of the business is strongest, and what part is most fragile
- Whether announcements actually move the business forward or mainly support investor messaging
- Whether new products or infrastructure matter economically yet
- **How peer comparisons change after adjusting for business model differences** — raw ratio comparisons across different models mislead more than they inform
- **What the company is executing well at its current stage** — and what evidence supports that
- **Where the company's "red flags" are actually the expected cost of its strategy** — and where they are genuine concerns
- Where the market consensus appears correct vs. where it appears to be missing something
- Which information asymmetries from market perception are most material and why
- **What would need to be true for the strategy to succeed, assessed condition by condition** with evidence for and against each

**From structural analysis** (see [structural_analysis.md](./structural_analysis.md)) — chosen based on relevance to the company:

- **Original derived financial math** with actual numbers and formulas — cost structure ratios (contextualized by business model), cash flow decomposition, breakeven analysis, unit economics trends
- **Structural risks that require computation** — with the business model context that explains whether the finding is a risk or an expected feature
- **Disclosure quality comparison** — what does this company show you vs. peers? Can you model its economics, or are you taking management's word?
- **The thesis destruction test** — the bull case, its weakest assumption, tested with math. But also: the bear case tested with the same rigor — sometimes the bears are wrong because they apply the wrong model to the company

Do **not** force every issuer through the same categories.

---

## What this file must not do

- **No new authoritative financial metrics** — those belong in `financials/*.yaml`
- **No unsourced quantitative claims** — tie numbers to financials keys or cited primaries; say "not disclosed" when the data is not available
- **No fabricated assumptions** — never invent a data point that is not disclosed. When a computation requires an input that is not available, state what is missing and what it would take to fill the gap
- **No fake precision** — sensitivities labeled "illustrative" with stated inputs
- **No conclusion-free narrative** — a section with `id: conclusion` is required
- **No template-thinking** where every company gets the same worries, section titles, and framing
- **No context-free "red flags"** — every concerning metric must be interpreted through the business model and company stage before being called a risk

---

## YAML shape (`schema_version: 1`)

| Field | Required | Notes |
|-------|----------|--------|
| `kind` | yes | `financial_narrative` |
| `schema_version` | yes | `1` |
| `as_of` | yes | ISO date when the narrative was authored or last reviewed |
| `based_on_financials` | yes | At least `period_end` and `file`; optional `period_label` |
| `business_profile_as_of` | no | If `business/business.yaml` materially informed the narrative at a specific `as_of` |
| `central_questions` | no | Optional short thematic hook for the UI; not required |
| `sections` | yes | List of `{ id, title, body }`; must include exactly one section with `id: conclusion` |
| `disclosure_gaps` | no | What limits confidence or blocks stronger judgment |
| `sources` | yes | Non-empty bibliography of important sources consulted |

### Provenance in `sources[].description`

Prefer clear lead-ins such as:

- `Direct from SEC filing:`
- `From SEC company facts API (XBRL):`
- `Derived:`
- `Filing index:`
- `Primary source:`

### `central_questions`

Optional. Use them only when a short hook improves the UI and sharpens the theme. Do not turn them into a repetitive checkbox list that every company uses. A strong central question captures the essential tension or paradox of the company in one or two sentences.

### The `conclusion` section

Required (`id: conclusion`).

The conclusion should be the **best short expression of the thesis**. It should integrate — not separate — the financial analysis, the business model context, and the market positioning into a coherent view.

A strong conclusion covers:

- **How to read this company right now** — the one-paragraph version of the entire narrative
- **What the company is doing well** — with specific evidence. Not every company is broken. If the company is executing its strategy as expected, say so and explain why the metrics support that reading.
- **Where the genuine risks lie** — distinguished from "the expected costs of the strategy." A risk is something that could break the thesis. An expected cost is something the company is paying to execute its strategy. Both should appear, clearly labeled.
- **Where the consensus appears off** — based on the derived analysis, not on general contrarianism
- **What to watch next** — specific, observable events that will confirm or deny the thesis (not vague "if growth continues")
- **What remains unknown** — the gaps that bound confidence in any forward projection

It can be titled "Conclusion," "Takeaway," "How to read this company," or another issuer-specific label. The validator only requires `id: conclusion`.

---

## When to create or update

- After a meaningful change to `financials/*.yaml`
- After a meaningful change to `business/business.yaml`
- After material additions to `announcements/announcements.yaml`
- When a new filing, earnings call, investor deck, or official announcement changes the company thesis

Set `as_of` to the date the narrative was written or last reviewed, not the quarter end.

Prefer one canonical narrative file per company:

```text
content/companies/<slug>/narrative/narrative.yaml
```

If the thesis changes materially by period, anchor it via `based_on_financials` and make the period explicit inside the narrative bodies.

---

## Workflow (agents)

1. Read `financials/README.md`, target `financials/*.yaml`, `business/business.yaml`, `announcements/announcements.yaml`, `market_perception/market_perception.yaml` (if present), `entity.yaml`, and layer framework if useful
2. **Understand the business model first** — what does the company own vs. rent, what stage is it in, where does it sit in the value chain? This determines which structural analyses to run and how to frame every metric.
3. Review market perception inputs: consensus, debates, competitive positioning, information asymmetries, forward signals
4. Open every primary URL you rely on from quarter sources (and any add-on filing for footnotes). Read cash flows, face statements, footnotes, and notes needed for your angles.
5. Run structural analysis per [structural_analysis.md](./structural_analysis.md) — **choosing the analyses most relevant to this company's business model**. Show the math.
6. Draft `sections` (issuer-specific) — contextualizing every metric through the business model lens. Include at least one section with original derived math. Optional `central_questions`. Required `conclusion`. Add `disclosure_gaps`. List every primary you opened in `sources`.
7. Run `scripts/validate_values_file.py` on `narrative/narrative.yaml`
8. Default: propose under `inbox/` until approved for `content/`

---

## Relationship to other files

The narrative is the **capstone** of the analysis pipeline. It reads and synthesizes all prior files:

| File | How narrative uses it |
|------|---------------------|
| `financials/*.yaml` | The numerical backbone — what happened in the numbers |
| `business/business.yaml` | How the business actually works — operations, products, capacity, **business model** |
| `announcements/announcements.yaml` | Recent events that affect the thesis |
| `market_perception/market_perception.yaml` | What the market thinks, where the debates are, where the crowd may be wrong, and how this company compares to peers |

The narrative should not merely restate these files. It should **connect** them — using financials + business + announcements + perception together in the same arguments — and **add judgment** that none of the individual files can provide on their own. The business model understanding from `business/business.yaml` provides the **interpretive lens** through which all financial metrics are read.

---

## Relationship to the map UI

Shown when a company is selected, below financial history. It is labeled **interpretation**. `central_questions` render when present, and `conclusion` is visually emphasized.
