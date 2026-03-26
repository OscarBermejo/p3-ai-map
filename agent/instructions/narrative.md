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
