# Structural analysis (adversarial deep dive)

**Purpose:** Go beyond consensus. This phase takes the raw data from financials, business profile, announcements, and market perception and asks: **what is this company structurally incapable of doing, what is management not telling you, and what would an investor who spent two years on this name know that a smart person reading the 10-Q for the first time would miss?**

This is not a summary layer. This is where you do **original math**, **challenge the bull case on its own terms**, **test whether the business model can ever work**, and **compare what this company shows you against what its peers show you**.

The output of this phase feeds directly into the narrative. Every finding here should appear — with the underlying math — in `narrative/narrative.yaml` sections.

---

## Start with the business model (required)

Before running any computation, understand how the company works:

- **What does the company own vs. rent vs. license?** This determines how to interpret every cost ratio, every capex figure, and every balance sheet line. The answer looks different in every layer: in infrastructure, it might be owning data centers vs. leasing colocation space; in chips, owning fabs vs. fabless design; in models, training proprietary foundation models vs. fine-tuning others'; in energy, owning generation assets vs. contracting for delivery; in applications, owning the platform and data vs. depending on third-party APIs. Two companies with identical cost ratios can have completely different economic substance depending on what they own.
- **What stage is the company in?** A company in heavy buildout mode will show metrics (high capex, high D&A, negative FCF, heavy R&D) that are structurally expected. A mature operator showing the same metrics has a different problem.
- **What are the long-lived assets?** Some assets retain value for decades — land, grid connections, fabrication plants, foundational IP, power infrastructure. Others depreciate rapidly — GPUs, model weights that may be surpassed in months, application features in competitive markets. This affects how you read the balance sheet and what "residual value" means.

**Why this matters for structural analysis:** The same cost ratio, the same capex intensity, the same debt level carry different implications depending on the business model. A cost ratio exceeding 100% of revenue means something fundamentally different for a company building owned long-lived assets (where the costs are front-loaded but the assets persist) than for a company whose costs are variable and recurring. The structural analysis must interpret, not just compute.

---

## When to use

- **Always** during a full deep dive (`company_deep_dive.md` Phase 6)
- Before writing or rewriting `narrative/narrative.yaml`
- After all data-collection phases (financials, business, announcements, market perception) are complete

---

## The analysis menu

The following sections describe the full menu of analyses available. **Not every analysis applies to every company.** The agent must choose which analyses are most revealing based on the company's business model, stage, and the questions that matter most.

**How to choose:** After understanding the business model, ask: "What are the 2-3 biggest questions about whether this company's strategy can work?" Then select the analyses that answer those questions. For example:

- **Infrastructure (own-and-operate)** → operating leverage trajectory, asset residual value, funding bridge, milestone execution
- **Infrastructure (colocation/lease-based)** → lease obligation exposure, customer concentration, debt serviceability, margin trajectory at scale
- **Chips** → product cycle competitiveness, ASP and mix trends, inventory risk, R&D efficiency (dollars per competitive product generation)
- **Models** → training cost economics (cost per run vs. expected revenue), inference cost trajectory, model obsolescence risk, compute dependency (own vs. rented)
- **Energy** → contracted vs. spot revenue mix, regulatory and permitting risk, asset utilization, long-term PPA economics
- **Applications** → customer acquisition cost vs. lifetime value, retention/churn economics, platform dependency risk, margin structure at scale

If an analysis genuinely does not apply, skip it. If an analysis is impossible due to missing data, say so explicitly — that disclosure gap is itself a finding.

### 1. Structural cost analysis

The most common way consensus gets a company wrong is by looking at revenue growth without asking whether the cost structure allows profitability **at any scale**.

**Core computations:**

- **Cost structure ratio:** (cost of revenue + D&A + SGA + R&D) / revenue. This is the "all-in operating cost burden." Compute for each available quarter and show the trend.
- **Structural vs. variable cost split:** Which costs scale roughly linearly with revenue (cost of revenue, variable D&A on depreciating assets that grow with capacity) vs. which are relatively fixed at current scale (D&A on existing asset base, base SGA, base R&D)? This split determines whether the company can "grow into" profitability or whether it needs a structural cost change.
- **Adjusted depreciation:** If the company uses an unusually short or long depreciation schedule for its asset class, recompute D&A using the industry-standard useful life. State the company's schedule, the standard, and the adjusted figure.
- **Gross margin after depreciation:** Compute gross profit minus D&A as a percentage of revenue to see the true "margin after using the assets."
- **Path to breakeven:** At current gross margin trends and operating cost structure, what revenue level produces operating breakeven? How realistic is that level?

**Business model context (required):** When presenting cost ratios, explain what is driving each cost line and how the business model affects the interpretation. The specific drivers differ by layer, but the principle is the same — identify whether costs are fixed (and can be leveraged with scale) or variable (and scale with revenue):

- **Fixed costs that signal investment, not inefficiency:** D&A on owned long-lived assets (infrastructure), R&D amortization on completed chip designs or trained models, platform development costs that don't recur per customer.
- **Variable costs that define the structural floor:** Compute costs per inference query (models), manufacturing costs per chip (fabless — set by the foundry), energy costs per MW (generation), colocation rent per rack (leased infrastructure).
- If the cost ratio exceeds 100% but the dominant cost is fixed and the company is early in its revenue ramp, the **path to profitability is revenue growth against a largely fixed cost base**. If variable costs already exceed revenue, scale alone cannot fix the economics.

### 2. Cash flow quality decomposition

Operating cash flow is the most misleading headline number for capital-intensive companies. Decompose it.

**Core computations:**

- **OCF decomposition:** Net income + D&A + stock-based compensation + working capital changes (AR, AP, deferred revenue, accrued liabilities separately). Show which components drove the number.
- **Prepayment dependency:** If deferred revenue or customer prepayments are a material portion of OCF, compute OCF excluding them. Is the business funded by operations or by advance payments?
- **Free cash flow:** OCF minus capex. If FCF is negative, compute cash burn rate and runway.
- **Capex intensity:** Capex / revenue. For infrastructure, also capex / ARR or contracted revenue.
- **Working capital trend:** Sustainable or driven by one-time timing?

**Business model context (required):** Capex intensity must be interpreted through the business model lens.

- **Capex that creates long-lived assets** (20+ year infrastructure, fabrication plants, power generation) is front-loaded investment — the spending is temporary even if it dominates the current period. **Capex on rapidly depreciating assets** (GPUs with 4-year lives, model training runs that may be surpassed in months) implies a recurring replacement cycle, not a one-time buildout.
- **Prepayment quality varies.** Customer prepayments from a creditworthy counterparty for contracted deliveries are real cash tied to real obligations. Deferred revenue from annual subscription billing is a different signal. Both improve OCF, but the durability and risk profile differ.
- **Bridge businesses matter.** Positive OCF during a massive buildout may indicate a working cash-generating legacy business (mining funding an AI transition, legacy product lines funding a new architecture, existing customers funding a platform migration) — a structural advantage that reduces dependence on external capital.

### 3. Capital structure stress test

**Core computations:**

- **Net debt:** Total debt minus cash. Compute net debt / trailing revenue and net debt / EBITDA (if positive).
- **Interest burden:** Interest expense / revenue. Compare to gross margin.
- **Debt maturity profile:** When does debt come due? Covenant risks? Convertible note terms and dilution implications?
- **Funding gap:** Total planned capex minus (current cash + projected OCF). Express as a multiple of market cap and revenue.
- **What-if: capital markets close for 12 months.** Can the company continue? Must it cut capex? Does that break contracts?

**Business model context (required):** Debt levels must be read against the asset base and the revenue model.

- Debt backed by owned, appreciating assets (real estate, grid connections, fab capacity, long-term PPAs) is structurally different from debt backed only by future revenue expectations. The first has collateral value independent of the business thesis; the second depends entirely on execution.
- Convertible notes in a company with rising equity value are dilutive but accretive if the funded assets generate returns above the cost of capital. The analysis should compute the break-even share price where conversion becomes dilutive to existing shareholders.
- For capital-light models (fabless chips, SaaS applications, model API providers), even modest debt can be significant because the asset base is thin. For capital-heavy models (owned infrastructure, fabs, energy generation), higher absolute debt may be appropriate given the collateral.

### 4. Unit economics and pricing power

**Core computations (where data permits):**

- **Revenue per unit of capacity:** The "unit" depends on the layer — MW (infrastructure/energy), GPU or GPU-hour (compute), wafer starts or chips shipped (chips), API calls or tokens served (models/applications), seats or MAU (applications). Track trends over quarters.
- **Revenue per employee:** If disclosed.
- **Contract economics:** Implied annual revenue per contracted unit vs. capex per unit. Payback period.
- **Pricing power test:** Is revenue per unit increasing, flat, or declining? This is the most important signal for whether the company operates in a commoditizing market.

**Critical: assumptions discipline.** Unit economics computations often require a denominator that companies do not disclose with sufficient granularity (active vs. total GPUs, utilized vs. installed capacity, revenue-generating vs. total customers). When the denominator is not available:

- **Do not fabricate it.** Do not guess the active count when only the total or aggregate is disclosed.
- **Use management's own implied figures when available.** If management provides a revenue target and a capacity target, the implied unit economics are their math — not yours.
- **State what would need to be disclosed** to enable the computation, and explain what it costs the analysis.
- **Compute what IS computable.** Use the data you have at the granularity it is disclosed.

### 5. Disclosure quality assessment

This is a **comparative** analysis. Assess this company vs. 2-3 direct peers.

**Dimensions to compare:**

- **Financial granularity:** Segment revenue, customer concentration, contract-level economics, margin by business line — or only consolidated top-line?
- **Operational transparency:** Does the company disclose the building blocks behind its headline figures? (Active vs. total capacity, utilization rates, contract terms, per-unit economics, capex per deal, production yields, inference costs — whatever is relevant for the layer.) Or does it report only aggregate top-line numbers?
- **Guidance specificity:** Specific, falsifiable targets or vague directional language?
- **What management avoids:** What questions did analysts ask that management deflected? These are often the most important topics.

**Why this matters beyond "transparency scores":** Disclosure gaps constrain the precision of every other analysis. If a company does not break out active vs. total capacity, you cannot compute unit economics. If it does not disclose segment margins, you cannot assess which business lines create vs. destroy value. The disclosure assessment should explicitly state what each gap prevents you from analyzing — not just rate transparency on a scale.

### 6. Thesis destruction test

Take the strongest bull case and try to destroy it with disclosed evidence. Then do the same for the bear case.

**Framework:**

- **State the bull case** in one sentence
- **Identify the single assumption the bull case most depends on**
- **Test that assumption with math:** What has to be true for it to work? Compare to what is disclosed.
- **Identify what would falsify it:** Specific, observable events (not "if growth slows" but "if Q3 revenue is below $X, implying contracted capacity is not converting")
- **Test the bear case with the same rigor:** Sometimes the bears are applying the wrong model. If the bear case rests on cost ratios that are expected for this business model at this stage, or on comparisons to companies with fundamentally different models, the bear case may be wrong for the wrong reasons. State this explicitly.

### 7. Peer structural comparison

Go beyond competitive positioning to **structural financial comparison** with 2-3 direct peers.

**Core comparisons:**

- Cost structure ratios (same computation as #1, applied to each peer)
- Capex intensity
- Cash flow quality
- Interest burden
- Disclosure quality (side-by-side)

**Business model context (required):** Raw ratio comparisons across companies with different business models are misleading. The peer comparison must either:

1. **Adjust for business model differences** — e.g., adding estimated lease costs to make a leasing model comparable to an ownership model's D&A, or adjusting for foundry costs in a fabless vs. IDM comparison, or
2. **Explain why the numbers are not directly comparable** — and what the comparison actually tells you after accounting for the model difference.

"Company A's cost ratio is 115% vs. Company B at 144%" is incomplete if A leases its capacity and B owns it. The costs appear in different lines but the economic substance may be similar. State where the costs sit, why, and what the comparison looks like after adjustment.

---

## How to work

1. **Understand the business model first.** Read `business/business.yaml`, `entity.yaml`, and enough primary material to know what the company owns, what stage it's in, and where it sits in the value chain.
2. Read `financials/*.yaml` for all available quarters. Open the actual filings for footnotes, depreciation schedules, and segment data.
3. Read `market_perception/market_perception.yaml` for the consensus you're about to challenge.
4. **Choose the most relevant analyses** from the menu above based on the business model and the key questions.
5. **Compute** — do the math. Use actual numbers from filings. Show your work. **Contextualize** every finding through the business model lens.
6. **Compare** — pull equivalent numbers for 2-3 peers. Adjust or explain business model differences.
7. **Conclude** — for each analysis, state what you found and what it means given the business model. If the math shows a concerning metric is actually expected for this type of company at this stage, say so. If it shows a genuine structural problem, say that. The goal is truth — not alarmism and not excuse-making.

---

## What this phase must NOT do

- **Do not present derived figures as disclosed figures.** Every computation must be labeled as derived and show the formula.
- **Do not manufacture precision.** If you're estimating, say so and state the assumptions. **Never fabricate a data point** that is not disclosed — state what is missing and what it costs the analysis.
- **Do not be contrarian for its own sake.** If the consensus is correct, the analysis should show that. The goal is truth, not a hot take.
- **Do not skip the math.** Prose arguments without numbers ("the cost structure seems unsustainable") are worthless. Show the ratio. Show the trend. Show the peer comparison.
- **Do not present numbers without business model context.** A ratio without interpretation is a spreadsheet, not analysis. Every significant finding must be framed through the lens of the company's model and stage.
- **Do not apply a generic checklist uniformly.** Different companies need different stress tests. The critical analyses for a chipmaker (product cycle, ASP trends, inventory) are different from those for an infrastructure builder (asset utilization, power conversion, funding bridge) or a model company (training costs, inference economics, obsolescence risk). Choose the analyses that matter for THIS company.

---

## Evidence standard

Same as [sources.md](./sources.md). Every derived computation must cite the input figures and where they came from. Use `Derived:` provenance in the narrative's `sources[]` when these findings appear in the narrative.

When citing peer data that is not in the repo, use the same source hierarchy: filing first, then XBRL, then Tier 1 analytical.

---

## Integration with the narrative

The structural analysis is not a separate output file. Its findings are woven into `narrative/narrative.yaml` sections. The narrative should include:

- **At least one section** with original derived financial math (cost structure, cash flow decomposition, or capital structure stress test) with actual numbers — **contextualized by business model**
- **At least one structural finding** that is interpreted through the business model lens — not just "cost ratio is X%" but "cost ratio is X% because [model reason], which means [implication]"
- **At least one peer comparison** that accounts for business model differences — either adjusted numerically or with explicit explanation of why raw comparisons are misleading
- **A conclusion** that states where the consensus is wrong or right, grounded in the analysis — and that distinguishes between genuine risks and expected costs of the company's strategy
