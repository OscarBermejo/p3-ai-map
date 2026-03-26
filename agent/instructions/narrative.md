# Financial narrative (`narrative/narrative.yaml`)

**Purpose:** Produce the **deepest, most useful judgment layer** on the company in this repo: the part that connects **financials**, **business profile**, **announcements**, management framing, products, market position, and competition into a single view of **what is really going on underneath**.

This file should help answer questions like:

- Is management likely to deliver its guidance?
- What is the market probably missing on first read?
- What is the company emphasizing, and what is it de-emphasizing?
- Is the company operating better or worse than peers in ways the headline numbers do not show?
- What is most likely to matter next?

This is **not** just a filing recap. It is a **thesis-driven synthesis** that should feel like the result of serious study of the company, its history, and its context.

## What this narrative should do

The narrative should:

- connect `financials/*.yaml`, `business/business.yaml`, `announcements/announcements.yaml`, and current-period primary documents
- connect the current period to prior periods, strategic direction, and disclosed company history where relevant
- surface what is **non-obvious**, **easy to miss**, or **strategically important**
- bring **judgment**, not just description
- make **bounded predictions** when useful
- remain **evidence-linked**, not speculative fiction

This file is used across companies and value-chain layers. It is **not** tied to a single mental model or a fixed outline.

## Voice and standard

Write as if the reader wants the output of **hundreds of hours of company study** condensed into one sharp memo.

The tone should be:

- confident but not theatrical
- analytical, not promotional
- willing to judge management, strategy, and execution
- willing to make predictions, but explicit about what is fact vs interpretation vs forecast

The best narratives should read like:

- “here is what actually matters”
- “here is what management is signaling”
- “here is what the numbers do not tell you on first glance”
- “here is why the company is better / worse / riskier / stronger than it looks”

Avoid writing like a worksheet, a filing summary, or repo documentation.

## Judgment is required

The narrative must **reach a real view**. It should not stop at “these are the numbers” or “these are some risks.”

It is good to judge things like:

- whether guidance looks believable, stretched, or unlikely
- whether growth quality is improving or deteriorating
- whether profitability, cash generation, or capital intensity is better or worse than it first appears
- whether management framing is clarifying reality or obscuring it
- whether competitive position looks stronger or weaker than the company is implying
- what the company is genuinely **good at** and can leverage repeatedly
- whether the company has a real **advantage** or **moat**, and how durable it looks
- what the company does **worse** than competitors, and what could become a recurring weakness
- whether recent announcements support the strategy or mostly support the narrative around the strategy

It is also acceptable to make **predictions**, but only when they are:

- clearly framed as judgment, not disclosed fact
- tied to real evidence
- stated with appropriate uncertainty

Bad prediction:

- “the company will definitely beat guidance next quarter”

Better prediction:

- “based on contracted capacity, recent procurement, and management’s latest language, guidance looks achievable but still dependent on financing and deployment timing”

## Guardrails on management judgment

It is valid to ask whether management is **hiding**, **de-emphasizing**, or **strategically framing** something, but do **not** accuse deception without strong evidence.

Prefer formulations like:

- management is emphasizing X, but the more important constraint appears to be Y
- the release foregrounds A while B is doing more of the explanatory work
- the quarter looks better or worse after adjusting for C
- disclosures are thin on D, which limits confidence in E

Do not write unsupported psychoanalysis.

## Evidence standard

This is a judgment-heavy file, but it is still grounded in evidence.

Read with:

- [sources.md](./sources.md) (Financial narratives track)
- [financials.md](./financials.md)
- [business.md](./business.md)
- [announcements.md](./announcements.md) when recent company events are important to the thesis
- the layer’s `content/_meta/layer_frameworks/<layer>.yaml` when it helps frame what usually matters in that slice

### Open the documents and read deeply (required)

A real narrative is **not** done from YAML fields and URL strings alone.

Open the primaries you rely on and read:

- face statements
- footnotes / notes
- accounting policies
- MD&A
- earnings materials / shareholder letters
- official announcement releases

If useful, also read:

- official product pages
- competitor filings / investor materials
- official market or regulatory documents

When using peer or market context, prefer **primary or official** sources there too.

If you cannot open an important primary, say so in `disclosure_gaps` or `conclusion` and avoid pretending to know what that document would have shown.

## What readers are trying to understand

The narrative should help answer the real questions an allocator or serious researcher would ask, such as:

- Is the company’s story internally consistent?
- Are financial results, business metrics, and announcements pointing in the same direction?
- Is the company building a durable advantage, or just telling a good story?
- What is the company best at operationally, commercially, or strategically?
- What is the company structurally weak at?
- Does the company have a moat, and if so, where does it really come from?
- Where does the company look better or worse than peers?
- Are there balance-sheet, execution, concentration, product, or demand risks that the market is underestimating?
- Is the company operating materially better or worse than peers?
- What would have to happen for the current strategy to work?

These are examples, not a mandatory list.

## When to create or update

- after a meaningful change to `financials/*.yaml`
- after a meaningful change to `business/business.yaml`
- after material additions to `announcements/announcements.yaml`
- when a new filing, earnings call, investor deck, or official announcement changes the company thesis

Set `as_of` to the date the narrative was written or last reviewed, not the quarter end.

Prefer one canonical narrative file per company:

```text
content/companies/<slug>/narrative/narrative.yaml
```

If the thesis changes materially by period, anchor it via `based_on_financials` and make the period explicit inside the narrative bodies.

## How to build the narrative (agent)

1. Read the target period’s `financials/*.yaml`, `business/business.yaml`, and `announcements/announcements.yaml` if present
2. Open the primary documents behind the core claims you expect to make
3. Study prior periods and recent changes so you can tell what is changing versus what is just being repeated
4. Ask:
   - what is the real story here?
   - what is non-obvious?
   - what matters most for the next 1–4 quarters?
   - what is management saying, and what do the underlying facts say?
   - where is this company stronger or weaker than peers?
5. Identify **2–5 issuer-specific angles** that are worth writing about
6. Draft custom `sections` that reflect those angles
7. Use `central_questions` only if a short thematic hook helps the UI; otherwise omit it
8. End with a real `conclusion` that synthesizes the company view, not just the section headings

## What a strong narrative usually contains

Depending on the company, useful angles may include:

- whether reported growth is high quality or low quality
- whether guidance is realistic
- whether the company’s capital structure supports the strategy
- what the company appears to be unusually good at
- whether the company has a defensible moat or only temporary positioning
- what part of the business is strongest, and what part is most fragile
- whether announcements actually move the business forward or mainly support investor messaging
- whether new products or infrastructure matter economically yet
- whether peer comparisons make the company look stronger or weaker than management implies
- whether disclosed risks are manageable or likely to become central

Do **not** force every issuer through the same categories.

## Use numbers, but do not become a spreadsheet

When numbers answer the question, put them in the prose.

Good:

- explain how large the gap is
- state the ratio, scale, timing, or burden when it is material
- connect the number to the judgment

Bad:

- vague references like “the answer is in the notes”
- long numeric dumps without interpretation
- repeating quarter-file metrics without saying why they matter

## What this file must not do

- **No new authoritative financial metrics** — those belong in `financials/*.yaml`
- **No unsourced quantitative claims**
- **No fake precision**
- **No conclusion-free narrative** — one section with `id: conclusion` is required
- **No template-thinking** where every company gets the same worries and section titles

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

Optional. Use them only when a short hook improves the UI and sharpens the theme. Do **not** turn them into a repetitive checkbox list that every company uses.

### The `conclusion` section

Required.

The `conclusion` should be the **best short expression of the thesis**. It should answer:

- how to read this company right now
- what the company's strongest advantage appears to be
- what its most important weakness appears to be
- what the most important risk / strength / contradiction is
- what looks likely next
- what remains unknown

It can be titled:

- `Conclusion`
- `Takeaway`
- `How to read this company`
- or another issuer-specific label

The validator only requires `id: conclusion`.

## Workflow (agents)

1. Read `financials/README.md`, the target `financials/*.yaml`, `business/business.yaml`, `announcements/announcements.yaml`, and `entity.yaml`
2. Open every primary you rely on for the main narrative claims
3. Draft issuer-specific sections with real judgment
4. Separate clearly in your own reasoning:
   - disclosed facts
   - evidence-based interpretation
   - forward-looking judgment / prediction
5. Add `disclosure_gaps` where confidence is limited
6. Run `scripts/validate_values_file.py` on `narrative/narrative.yaml`
7. Default to proposing under `inbox/` until approved for `content/`

## Relationship to the map UI

Shown when a company is selected, below financial history. It is labeled **interpretation**. `central_questions` render when present, and `conclusion` is visually emphasized.
# Financial narrative (`narrative/narrative.yaml`)

**Purpose:** Help someone decide whether the **published numbers and filings** support a coherent story — and what **is not obvious** from headline metrics alone. This file is used across **companies and value-chain layers**; it is **not** tied to one mental model (e.g. only infra, only accrual-vs-cash).

**What readers are usually trying to get at (inform your judgment — not a fixed template):**

- Whether **growth** (revenue, scale, guidance in `business/`) looks **healthy** relative to **losses, cash, and balance sheet** in the same period — **as far as the data allows**.
- Whether **costs or cash effects** might sit **outside** the first line people read (e.g. buried in footnotes, leases, working capital, non-operating lines, or undisclosed mix) — **only where primaries support saying so**.
- Whether there is something **material and non-obvious** a capital allocator should **worry about or qualify** — again, **bounded by what is disclosed**; say clearly when something **cannot** be assessed from available sources.

The narrative must **reach a conclusion** — not merely describe. The **agent** picks **what is non-obvious for this issuer and period** (layer, business model, filing depth, what’s in `financials` + `business` + exhibits), then **surfaces it** with cited evidence. **Do not** run every company through the same outline (e.g. “Q1 / Q2 / Q3 / conclusion” or the same three worries).

**Voice — “what’s underneath,” not a worksheet**

- **Audience:** Write for someone who already sees the **spreadsheet** but wants **what the filing actually says** — operating and financial **judgment**, not documentation of how this repo stores YAML. **Do not** write as if the reader maintains the codebase: avoid phrases like “in the `metrics` block,” “per `financials/*.yaml`,” or “accession … in the body” unless you are quoting a **source line** in `sources[]`. In section **`body`**, use plain language (**revenue**, **operating income**, **Form 10-Q**, **notes to the financial statements**, **MD&A**). The **value** is connecting **face statements to notes and footnotes**, flagging what is **easy to skim past** (non-operating volatility, tax effects, embedded leverage, segment mix, energy or concentration) — **only** where primaries support it.
- **Intent:** Help the reader see **what the headline metrics hide or distort on first read** — timing, consolidation scope, non-GAAP framing, leverage and interest burden, lease/debt/revenue recognition, segment mix, etc. **Different issuers** should stress **different** fault lines: e.g. one name might be dominated by **contract timing and OCF**; another by **debt stack and interest expense**; another by **energy or asset risk**, **concentration**, or **disclosure gaps**. The **shape** of the narrative (section titles, order, number of sections) follows **that** judgment, not a single template.
- **Avoid:** A rigid **question-and-answer** scaffold where every file mirrors the same prompts, or a **conclusion** that only repeats answers to a numbered list. Prefer **discovery-style prose**: short sections that each illuminate **one** layer beneath the dashboard, then a **`conclusion`** that reads like a **synthesis** (e.g. how to read the quarter, what to watch, what remains unknown) — **not** a checklist recap unless it genuinely fits.
- **`central_questions`:** **Optional.** Use when a short **thematic hook** helps the UI (one or two lines max); otherwise **omit** and let the opening sections carry the angle. If you use it, **do not** paste the same generic “growth vs cash vs debt” trio for every company.

**Read with:** [sources.md](./sources.md) (third track), [financials.md](./financials.md), and the layer’s **`content/_meta/layer_frameworks/<layer>.yaml`** when you need framing for *what usually matters* in that slice — as **hints**, not mandatory headings.

---

## Open the documents and read footnotes (required)

A narrative is **not** done from `financials/*.yaml` **metrics** and URL strings alone. **`sources` rows are pointers** — you must **actually open** each **primary** you rely on (SEC exhibit HTML, filed PDF, official IR PDF, etc.) in a browser or tool and **read** the same material a reader would: face statements **and** **footnotes / notes** to those statements, **accounting policies**, and relevant **MD&A** or **note** sections (debt, leases, revenue recognition, segments, etc., as filed for that document).

**Why:** Footnotes and notes usually **do not** appear in the quarter YAML. If you never open the filing, you **cannot** verify what is disclosed there — so you also **cannot** honestly claim or dismiss “hidden” costs, timing, or obligations that live in notes.

**If you cannot open a primary** (blocked URL, paywall, tool failure): say so in **`disclosure_gaps`** or **`conclusion`** and **avoid** asserting detail that would only appear in footnotes you did not read.

**Recency:** When you need a supplemental filing (e.g. annual footnotes for policies), prefer the **newest Tier 1** document that still applies to the period — see [sources.md](./sources.md) (“Newest first” under business profiles and **Financial narratives** below).

---

## When to create or update

- After a **meaningful** change to **`financials/*.yaml`** for a period you want to explain, or when **`business/business.yaml`** updates facts that change how you read the quarter.
- Set **`as_of`** to the date this narrative was **written or last reviewed** (not the quarter end).
- Prefer **one** canonical narrative file per company: **`content/companies/<slug>/narrative/narrative.yaml`**. If the story diverges by period, tie content to **`based_on_financials`** and name the period inside section **`body`** text where needed.

---

## How to build the narrative (agent)

1. Read **`financials`** for the period (metrics + `sources`), then **open** each cited **primary** URL and read **statements + footnotes / notes** and any MD&amp;A tables needed; read **`business/business.yaml`** and **`entity.yaml`** links as needed.
2. Ask: **What would a careful reader miss on first glance** for **this** issuer — **not** the same checklist every time? Identify **2–5** substantive angles you can **support** from those materials (or mark **not answerable from primaries** in the **conclusion**).
3. Draft **`sections`** with **custom `id`s and `title`s** that match the story (e.g. debt and interest, lease burden, revenue timing, consolidation scope — **only what applies**). Order sections for **clarity**, not a fixed recipe.
4. Optionally add **`central_questions`** (short thematic hook only) if it helps the UI; otherwise **omit**.
5. End with **`conclusion`** (often titled **Takeaway**): **integrate** (a) a **short synthesis** of how to read the period, (b) **filing-grounded financial risks** — each tied to **evidence** (numbers or note/MD&amp;A themes from primaries), and (c) where disclosures support it, **what looks relatively healthy or resilient** (e.g. liquidity, revenue scale, access to financing) — **without** stock-picking language or unsupported optimism. If the period is **mostly** risk-heavy, say so; if **balance-sheet or operating** lines also support a **countervailing** read, say that too. **Do not** mechanically mirror a Q&amp;A grid unless you deliberately chose that shape for this file.

**Bad:** Same section titles and worries for every peer (e.g. always “Growth vs cash vs leverage” in the same words). **Bad:** A **conclusion** that only restates section headings. **Bad:** A **risk list** with no numbers or filing anchors. **Good:** Issuer-specific **underneath** insights and a **single** closing read that could stand alone, including **judgment** on **financial risks** and (when fair) **what is not all bad** in the same filing.

---

## What this file must not do

- **No new financial metrics** as authoritative facts — those belong in **`financials/*.yaml`** with filing-level `sources`.
- **No unsourced quantitative claims** — tie numbers to **`financials`** keys or **cited primaries**; say **not disclosed** when silent.
- **No fake precision** — sensitivities labeled **illustrative** with stated inputs.
- **No conclusion-free narrative** — a section with **`id: conclusion`** is **required**.

---

## YAML shape (`schema_version: 1`)

| Field | Required | Notes |
|-------|----------|--------|
| `kind` | yes | `financial_narrative` |
| `schema_version` | yes | `1` |
| `as_of` | yes | ISO date: narrative authored/reviewed |
| `based_on_financials` | yes | At least `period_end` (ISO) and `file` (path under company folder, e.g. `financials/2025-Q4.yaml`). Optional `period_label`. |
| `business_profile_as_of` | no | If you used `business/business.yaml` at a specific `as_of` |
| `central_questions` | no | **Optional:** one or two short **thematic** lines (hook for the UI); **omit** if the sections already carry the angle. Not a required Q&amp;A list. |
| `sections` | yes | `{ id, title, body }` list. Must include **one** section with **`id: conclusion`** (typically last). Other sections carry evidence in any order/names you need. |
| `disclosure_gaps` | no | What blocks stronger judgment |
| `sources` | yes | Non-empty bibliography of primaries consulted |

### Provenance in `description` (on each `sources[]` row)

- Prefer **`Direct from SEC filing:`**, **`From SEC company facts API (XBRL):`**, **`Derived:`**, **`Filing index:`**, or **`Primary source:`** as appropriate — see validator and [sources.md](./sources.md).

### The `conclusion` section

Required (`id: conclusion`). **Synthesize** — how to read the period, what is **underneath** the headlines, what remains **unknown** or needs another filing. You may **title** it “Conclusion,” “Takeaway,” “How to read this quarter,” or another label that fits the issuer; the validator only requires **`id: conclusion`**.

**Takeaway body (recommended):** Combine **summary** + **financial judgment** in one place: **(1)** one tight recap of the story of the quarter; **(2)** **risks** an allocator should weigh — each tied to **disclosed data or note themes** (e.g. leverage shape, non-operating volatility, funding vs revenue, segment opacity); **(3)** when the filing supports it, **what also looks solid** (e.g. cash balance, revenue growth, financing access) — clearly framed as **facts from the filing**, not a buy/sell view. State **non-obvious** risks or qualifications **only** where evidence supports; separate **unknown** from **known**.

**Show the data, answer the question:** Prefer **sentences that include numbers** (or small derived ratios clearly labeled) over pointers like “the answer is in the notes” or “the risk is reading headlines without the reconciliation.” If the question is *how big is the GAAP vs non-GAAP gap?*, *net debt vs gross?*, *financing vs revenue?* — **pull the figures from `financials` and the primaries you opened** and **state them in the `body`**. Use **`disclosure_gaps`** for what truly is **not** in the quarter file or exhibit (e.g. full covenant schedules), not as a substitute for quantifying what **is** disclosed.

---

## Workflow (agents)

1. **`financials/README.md`**, target **`financials/*.yaml`**, **`business/business.yaml`**, layer framework if useful.
2. **Open** every **primary** URL you will use from quarter **`sources`** (and any add-on filing for footnotes). Read **cash flows, face statements, footnotes, and notes** needed for **your** angles (debt, leases, segments, revenue policies, etc.).
3. Draft **`sections`** (issuer-specific), optional **`central_questions`**, **`conclusion`**, **`disclosure_gaps`**, top-level **`sources`** (list every primary you **opened**). Where **`financials`** and opened primaries answer an implied question (GAAP vs non-GAAP, net debt, OCF bridge, scale of CapEx vs revenue), **put those numbers in the `body`** — see **Show the data, answer the question** under **The `conclusion` section** above.
4. **`scripts/validate_values_file.py`** on **`narrative/narrative.yaml`**.
5. Default: propose under **`inbox/`** until approved for **`content/`**.

---

## Relationship to the map UI

Shown when a company is selected (below financial history). Labeled **interpretation**. **`central_questions`** render when set (optional); **`conclusion`** is visually emphasized.
