# Market perception (`market_perception/market_perception.yaml`)

**Purpose:** Capture how the market **currently sees** a company — the consensus narrative, key debates, sentiment signals, and information asymmetries — using sources **beyond** SEC filings and official IR. This is the layer that tells you what the investing and technical communities believe, what they are arguing about, and where the crowd may be wrong.

This file complements `narrative/narrative.yaml` (which is filing-driven judgment) by adding **external signal**: what analysts write, what technical communities discuss, what social platforms amplify, and where perception diverges from disclosed reality.

## What this file should help answer

- What is the **consensus narrative** about this company right now?
- What are the **key debates** the market is actively arguing about?
- Where might the market be **wrong** — either too bullish or too bearish — and why?
- What are **leading indicators** from technical or community sources that mainstream investors have not priced in?
- Is sentiment **shifting** — and in what direction?
- What does the **smart money** (deep technical analysts, domain experts) see that generalist coverage misses?

## What this file must not do

- **Replace** `financials/*.yaml` or `narrative/narrative.yaml` — this file is perception, not authoritative financial data or filing-based judgment
- **Predict stock prices** or make investment recommendations
- **Present unverified claims as facts** — always attribute and label the source tier
- **Chase noise** — a single Reddit post or viral tweet is signal only when corroborated by substance

---

## Source tiers

Market perception uses a broader source set than other files. Sources are grouped into three tiers with different trust levels and handling rules.

### Tier 1 — deep technical / analytical (highest trust)

High-quality, expert-level analysis with demonstrated domain knowledge. These sources invest significant effort per piece and have track records of accuracy.

| Source type | Examples | What to extract |
|-------------|----------|-----------------|
| **Specialist research** | SemiAnalysis, Fabricated Knowledge, Dylan Patel's work | Supply chain dynamics, architecture deep-dives, pricing analysis, competitive positioning |
| **Earnings transcripts** | Company earnings calls (official transcripts via IR or SEC) | Management tone, analyst questions, forward guidance language, what management avoids answering |
| **Conference presentations** | Hot Chips, GTC, ISSCC presentations and Q&A | Technical roadmap signals, competitive benchmarks, architecture direction |
| **Domain-expert blogs** | Benedict Evans, Stratechery (Ben Thompson), Elad Gil, Lillian Weng | Market structure, strategic positioning, technology trend analysis |

Earnings transcripts are **Tier 1 primary** — they are company-controlled and filed or officially published. The others are Tier 1 analytical: expert-produced, typically paywalled or subscription-based, with reputational accountability.

### Tier 2 — curated analytical (moderate trust, requires labeling)

Published analysis with editorial standards but variable quality. Useful for sentiment mapping and debate identification, but individual pieces must be evaluated.

| Source type | Examples | What to extract | Handling |
|-------------|----------|-----------------|----------|
| **Curated platforms** | Seeking Alpha, Motley Fool premium | Bull/bear thesis framing, sentiment distribution, variant perception | Filter aggressively — only cite pieces with substantive analysis, not promotional content. Note the author, not just the platform. |
| **Established tech press** | The Information, Bloomberg Technology, Ars Technica, AnandTech (archive) | Product analysis, supply chain reporting, competitive context | Treat factual claims cautiously; useful for framing market narratives |
| **Sell-side research** (when accessible) | Bank/broker research notes | Consensus estimates, target prices, rating distributions, key model assumptions | **Do not reproduce proprietary content.** Record: rating distribution (% buy/hold/sell), consensus price target range, key debate points. Cite the firm name and date; do not copy or closely paraphrase copyrighted text. |

**Seeking Alpha quality filter:** Seeking Alpha is open-contribution. Before citing any SA article:

1. Check the author's track record (articles written, reader ratings, consistency)
2. Verify any quantitative claims against primary sources
3. Cite the specific author, not just "Seeking Alpha"
4. Prefer SA articles that add genuine analytical value (variant perception, deep-dive into a neglected metric, contrarian thesis with evidence) over articles that recap consensus

### Tier 3 — social / community (lowest trust, corroboration required)

High-noise sources useful for **sentiment detection** and **early signal**, never for factual claims.

| Source type | Examples | What to extract | Handling |
|-------------|----------|-----------------|----------|
| **X (Twitter)** | Company executives, domain-expert accounts, investor accounts | Sentiment shifts, early product/deal signals, management framing outside formal channels | Only cite when corroborated by Tier 1/2 or when the post itself is the primary signal (e.g. CEO announcement). Note account credibility. |
| **Reddit** | r/hardware, r/MachineLearning, r/nvidia, r/datacenter, r/wallstreetbets (sentiment only) | Community technical assessments, grassroots demand signals, deployment experience, sentiment extremes | Useful for **direction** of sentiment, not individual claims. Summarize thread consensus, not single comments. Label as community sentiment. |
| **HackerNews** | Technical discussion threads | Developer/engineer sentiment, technical credibility assessment | Same handling as Reddit: thread-level signal, not individual comments |

**Social filtering rules:**

- Never cite an anonymous social post as the sole evidence for a factual claim
- Distinguish **official company accounts** (Tier 1) from **employee accounts** (context only) from **third-party commentary** (Tier 3)
- Volume and direction of discussion can be signal even when individual posts are noisy
- Watch for astroturfing, coordinated campaigns, and bot activity — note when sentiment feels inorganic

---

## What to capture

The market perception file is structured around six areas. Not every area will have signal for every company in every update cycle.

### 1. Consensus narrative

What does the market broadly believe about this company right now?

- The dominant bull thesis
- The dominant bear thesis
- Key assumptions embedded in the consensus (growth rate, market share, margin trajectory)
- How the consensus has shifted over the past 1–2 quarters

### 2. Key debates

What are the market's open questions — the things bulls and bears actively disagree on?

Each debate should capture:

- The question or tension
- The bull case (with source attribution)
- The bear case (with source attribution)
- What evidence would resolve it
- Your assessment of where the weight of evidence currently leans (clearly labeled as interpretation)

Good debates are **specific** and **resolvable** — "Will NVIDIA maintain data center margins above 70% through 2026?" is better than "Is NVIDIA a good company?"

### 3. Sentiment signals

Quantitative or semi-quantitative measures of market mood:

- Sell-side rating distribution (buy/hold/sell counts and consensus target range — **do not reproduce proprietary content**, only summary statistics)
- Sentiment direction on social/community platforms (improving, stable, deteriorating)
- Notable sentiment shifts or inflection points
- Contrarian positions gaining traction

### 4. Information asymmetries

This is the most valuable section. Where might the market be wrong?

Types of asymmetry to look for:

- **Underappreciated strengths**: capabilities, moats, or tailwinds the market is not pricing
- **Hidden risks**: concentration, supply chain fragility, competitive threats, execution gaps the market is ignoring
- **Misunderstood dynamics**: cases where the market narrative is based on a flawed mental model
- **Timing disconnects**: the market is directionally right but wrong about when something will matter

Each asymmetry should include:

- What the market believes (with source)
- What the evidence suggests instead (with source)
- Why the gap exists (complexity, recency, attention)
- What would close the gap (catalyst, filing, product launch)

### 5. Competitive positioning

How does this company compare to its closest peers on the dimensions that actually matter? Someone who has studied a company for two years doesn't just know the company — they know the competitive landscape cold.

This section should capture:

- **Key peers** (2–4 companies that compete most directly in this layer)
- **Where this company wins** — the dimensions where it has a genuine, durable advantage
- **Where the gap is closing** — competitive advantages that are eroding, with evidence
- **Where this company loses** — dimensions where peers are objectively stronger
- **Switching costs and lock-in** — what keeps customers with this vendor vs. what makes switching feasible
- **What would change the competitive order** — a specific product launch, pricing move, technology shift, or regulatory change that could reshuffle rankings

Focus on the dimensions that **actually drive customer decisions and economic outcomes** in this layer, not generic strategy-framework comparisons. For chips that might be performance-per-dollar, software ecosystem, supply availability, and total cost of ownership at rack scale. For infrastructure it might be power cost, permitting speed, customer concentration, and interconnect density.

Use peer data from their own `business/business.yaml` and `financials/*.yaml` when available in the repo. When peer data is not in the repo, use the same source tiers as the rest of market perception — prefer Tier 1 analytical (SemiAnalysis, vendor datasheets, MLPerf) for hard comparisons, Tier 2 for competitive framing.

### 6. Forward signals

Leading indicators that have not yet been absorbed into consensus:

- Technical community assessments of unreleased products
- Supply chain signals (lead times, allocation changes, yield data)
- Hiring patterns, patent activity, or partnership signals
- Regulatory or policy developments with underappreciated impact
- Customer adoption signals from deployment communities

---

## Evidence standard

Market perception is inherently softer than filing-based work, but it still requires rigor:

1. **Always attribute.** Every claim must trace to a source with tier, author/account, date, and URL.
2. **Label interpretation.** Separate "SemiAnalysis argues X" from "I assess X based on the following evidence."
3. **Triangulate.** A claim supported by one Tier 3 source is a data point. A claim supported by Tier 1 analysis + Tier 2 confirmation + Tier 3 community signal is meaningful.
4. **Date everything.** Perception is perishable. Every signal should have a date; the file-level `as_of` must be current.
5. **Admit gaps.** If you cannot find credible bear arguments, say so — do not fabricate balance for its own sake. If a debate is genuinely one-sided, explain why.

---

## Voice and standard

Write as if briefing a portfolio manager who has already read the filings but wants to know **what the market thinks** before forming their own view.

The tone should be:

- observational, not promotional — you are mapping perception, not endorsing it
- specific — "SemiAnalysis estimates CoWoS capacity at X wafers/month, implying Y" beats "some analysts think supply is tight"
- honest about confidence — clearly separate well-sourced claims from directional signals from noise
- willing to say "the market appears wrong here" when evidence supports it, but explicit about the basis

---

## When to create or update

- After **earnings** — consensus narrative and debates shift with each quarterly report
- After **major product announcements** or competitive moves
- After **significant sentiment shifts** on analytical or social platforms
- At least **quarterly** for actively covered companies
- When a previously identified information asymmetry is **resolved** (the market caught up, or the thesis was wrong)

Set `as_of` to the date this perception file was authored or last reviewed.

Prefer one canonical file per company:

```text
content/companies/<slug>/market_perception/market_perception.yaml
```

---

## How to build the file (agent)

1. **Read existing company data first** — `entity.yaml`, `financials/*.yaml`, `business/business.yaml`, `narrative/narrative.yaml` if present. Understand the disclosed reality before mapping perception.
2. **Gather Tier 1 analytical sources** — find the latest SemiAnalysis, domain-expert, and conference material relevant to this company.
3. **Review earnings transcript** — read the most recent earnings call transcript. Note management tone, analyst questions, and what management avoids or deflects.
4. **Survey Tier 2 sources** — scan Seeking Alpha (filter by quality), tech press, and any accessible sell-side summaries for the dominant narratives and debates.
5. **Sample Tier 3 sentiment** — check X, Reddit, and HackerNews for community sentiment direction and any emerging signals.
6. **Synthesize** — identify the consensus, the key debates, the sentiment direction, and most importantly the information asymmetries.
7. **Draft the YAML** — populate each section with attributed, dated evidence.
8. **Cross-check against filings** — verify that your "consensus narrative" is not just restating what the 10-K says. Perception should capture what the **market adds** on top of disclosures.

---

## Relationship to other files

| File | Relationship |
|------|-------------|
| `financials/*.yaml` | Provides the disclosed numbers that perception reacts to |
| `business/business.yaml` | Provides the operational facts that perception interprets |
| `narrative/narrative.yaml` | Filing-driven judgment — market perception adds external signal on top |
| `announcements/announcements.yaml` | Events that trigger perception shifts |

Market perception should **reference** these files when grounding claims but should not duplicate their content. The value is in what the market adds, distorts, or misses relative to disclosures.

---

## YAML shape (`schema_version: 1`)

| Field | Required | Notes |
|-------|----------|-------|
| `kind` | yes | `market_perception` |
| `schema_version` | yes | `1` |
| `as_of` | yes | ISO date: perception authored/reviewed |
| `company` | yes | Company slug |
| `layer` | yes | Value-chain layer id |
| `consensus_narrative` | yes | `{ summary, bull_thesis, bear_thesis, embedded_assumptions[], narrative_shift }` |
| `key_debates` | yes | List of `{ id, question, bull_case, bear_case, resolution_evidence, current_lean, sources[] }` |
| `sentiment_signals` | no | `{ sell_side_summary, social_sentiment, notable_shifts[], contrarian_positions[] }` |
| `competitive_positioning` | no | `{ key_peers[], where_company_wins[], where_gap_closing[], where_company_loses[], switching_costs, order_changers[] }` |
| `information_asymmetries` | no | List of `{ id, title, market_believes, evidence_suggests, gap_reason, closing_catalyst, confidence, sources[] }` |
| `forward_signals` | no | List of `{ id, signal, source_tier, date_observed, implication, sources[] }` |
| `sources` | yes | Top-level bibliography of all major sources consulted |

### Provenance in `sources[].description`

Use clear lead-ins:

- `Earnings transcript:` — for call transcripts
- `Specialist analysis:` — for Tier 1 analytical (SemiAnalysis, domain experts)
- `Curated platform:` — for Tier 2 (Seeking Alpha, tech press)
- `Community signal:` — for Tier 3 (X, Reddit, HN)
- `Sell-side summary:` — for broker research (summary statistics only)

### `kind` values for sources

In addition to shared `kind` values, market perception sources may use:

- `earnings_transcript` — official earnings call transcript
- `specialist_analysis` — SemiAnalysis, domain-expert blog, etc.
- `curated_platform` — Seeking Alpha, Motley Fool, etc.
- `sell_side_summary` — broker research summary (not full text)
- `social_signal` — X, Reddit, HN thread or account
- `conference_qa` — Q&A from investor/industry conference

---

## Workflow (agents)

1. Read `entity.yaml`, latest `financials/*.yaml`, `business/business.yaml`, `narrative/narrative.yaml`
2. Gather and read Tier 1 analytical sources for the company
3. Read the most recent earnings transcript
4. Survey Tier 2 and Tier 3 sources for narrative, sentiment, and debate
5. Draft `market_perception.yaml` with attributed evidence in every section
6. Cross-check: does any "perception" claim actually belong in `narrative/narrative.yaml` or `business/business.yaml`? Move it if so.
7. Default to proposing under `inbox/` until approved for `content/`
