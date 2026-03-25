# Agent instructions: sources

**Use this file** whenever you need to decide **what counts as evidence** for facts in `content/` — including **`financials/*.yaml`** and **`business/business.yaml`**.

There are **two tracks** — same **primary** documents first, **different** rules for what else is allowed:

| Track | Files | What it covers |
|-------|--------|----------------|
| **Financial quarters** | `financials/*.yaml` | Period-bound **metrics** (revenue, cash flow, balance sheet, etc.) |
| **Business profiles** | `business/business.yaml` (shape from `content/_meta/business_templates/`) | **Operating / strategic** facts (capacity, contracts, platform, GPU mix, etc.) |

**Rule of thumb:** If it belongs in **`metrics:`** with a **quarter end date**, follow the **financial** track (stricter). If it belongs in **`business/business.yaml`** fields, follow the **business** track (allows **Tier 2** press only as described below).

---

## Primary sources (use first — both tracks)

1. **SEC EDGAR** (U.S. issuers): 10-Q, 10-K, 8-K; materials linked from filings.
2. **Official investor relations** and **press releases** on the **company’s own domain**.
3. **Other primary documents**: regulatory filings, exchange notices, official government/utility filings when they are the original record.

### Official IR news / hub index (discovery — all companies)

Many issuers publish a **chronological index** of press releases, news, or an **investor hub** on their own domain (e.g. `/investors/news`, `/investor-hub`). That page is **Tier 1 as a discovery tool**: use it to **find** the newest official PDFs, HTML releases, and links to **SEC (or home-country) filings** — same **newest-first** order as EDGAR when refreshing `business/business.yaml` or locating primaries for financial work.

**Do not** treat the index URL alone as proof of a specific fact in `business/business.yaml` or `financials/*.yaml`. Each material claim should still cite the **specific** document (release URL, PDF, or filing exhibit) you used.

**Where the URL lives:** optional per company in **`entity.yaml`** → **`links.press_releases_index`** (see [companies README](../../content/_meta/companies/README.md)). If absent, infer the official news/hub URL from **`links.investor_relations`** or the company site.

### Non-U.S. issuers

Use the **issuer’s home regulatory / official filings** and **official IR** the same way as SEC + company domain releases.

---

## Not sufficient alone (especially for financial metrics)

- **News, blogs, forums** — use only to **find** a primary; **do not** cite as proof of a **financial metric** or precise deal term.
- **Social posts (e.g. X)** — **pointers only** unless they are clearly the company’s official account **and** the post links to a primary document; still prefer that linked primary.

---

## Financial quarters (`financials/*.yaml`)

**Stricter track.** Every **number** in **`metrics:`** must be traceable to:

- a **filing table** (or iXBRL) with the right **period** / **instant**, and/or  
- **`data.sec.gov` company facts** where appropriate, and/or  
- a **Derived:** line with **both** inputs from primaries (see below).

**Established newspapers / wires must not** be the sole or primary proof for **quarterly financial numbers.** If a story quotes a figure, still open the **filing** (or facts JSON) and cite that.

Normative detail: [financials.md](./financials.md) (periods, cash flow vs P&amp;L, `covers` / `documentation`).

### Default order of sources (financial quarters)

Financial metrics must still trace to **primaries** as above. When an agent (or human) fills or audits a quarter file, **process evidence in priority order** and **write `metrics` + `sources` after each primary document** (exhibit), not only at the end of the session. The **numbered default order**, **definition of one “source step”**, overwrite rules, and validation habit are spelled out in [financials.md](./financials.md) — **“Source processing order and incremental writes (agents)”**. Adapt the list if the issuer uses a different exhibit pattern; keep **filing tables before API** unless the table truly lacks the line.

### Provenance lead-ins in `sources[].description`

State explicitly: **`Direct from SEC filing:`**, **`From SEC company facts API (XBRL):`**, or **`Derived:`** — see [financials.md](./financials.md) (“Provenance in `sources`”).

Use **`covers`** and **`supports_derivation_of`** per [financials.md](./financials.md) (“Source ↔ metric mapping”). For **`null`** metrics, use **`kind: documentation`** and **`covers: [metric_key]`**.

### Derived figures (e.g. quarter from YTD minus prior quarter)

Allowed only when **both** inputs are from **primary** documents, periods are **contiguous** and **comparable**, and you document **`Derived:`** plus each input. If unsure, **`null`**. See [financials.md](./financials.md) (flow metrics).

---

## Business profiles (`business/business.yaml`)

**Broader track for non-quarterly business facts** — still **Tier 1 = primaries first** (same list as above), plus filing **exhibits** that matter for ops (6-K / 8-K decks, MD&A, business sections of 20-F / 10-K).

### Tier 1 — Prefer first

1. **Regulatory filings**: 10-K / 20-F, 10-Q, 8-K / 6-K, **exhibits** (earnings materials, investor decks filed with the SEC), MD&A, risk factors, business description.
2. **Official IR** on the **company domain**: annual reports, official PDFs, press releases. If the same deck is **filed** and on IR, prefer the **filing-linked** URL when practical.

### Newest first (discovery and citations)

When pulling operating facts (capacity, GPUs, projects, etc.):

1. **Discover** primaries in **reverse chronological order** — e.g. EDGAR results or the issuer’s filings list sorted by **filing / accepted date, newest first** — then work backward only when a newer document omits a detail you still need.
2. **Prefer**, for each field, the **latest Tier 1** document that still supports that fact; if an older filing is the only source for a detail, keep it but say so in **`notes`** or the **`sources[].description`** if the snapshot is **mixed as-of**.
3. **Order `sources[]`** with the **most recently filed** document **first** (then older supplements). Archive URLs stay valid; freshness comes from **which accession** you cite, not from link style.
4. **Do not** anchor on a convenient **annual report** (e.g. 20-F / 10-K) **without** checking **newer** **6-K / 8-K**, **exhibits**, and **official IR** for the same issuer — those often supersede operating metrics **months** before the next annual filing.

### Filing age, `as_of`, and staleness (`business/business.yaml`)

**Fiscal year in the filename** (e.g. `…20241231…`) is **not** the same as “this number is current today.” Distinguish:

- **Period covered** by the filing (e.g. year ended Dec 31),  
- **Filing / acceptance date** on EDGAR, and  
- **Issuer’s explicit as-of** for the **sentence or table** you cite (e.g. “as of March 31, 20XX”).

**Per fact, pick the newest primary that actually states or updates that fact.** If a **6-K exhibit** from 2025 restates GPU or MW counts and the **20-F** only has an older snapshot, **cite the 6-K** (first in `sources[]`) for that leaf.

**File-level `as_of`:** When the template has **`as_of`**, set it to the **issuer snapshot date** that best matches the **fast-moving** scalars (**`capacity`**, **`gpus`**, **`contracts_usd`**) if the issuer gives one. If leaves use **different** as-of dates, keep **`as_of`** as the **latest** of those snapshot dates **or** leave **`as_of`** loose and spell out each date in **`notes`** — do not imply a single date if the file mixes periods.

**High-churn vs. durable facts**

| Kind | Examples | Recency expectation |
|------|----------|---------------------|
| **High-churn** | MW / GPU counts, rental ARR–style USD, backlog-style contract value | Expect **frequent** updates; **search harder** for newer Tier 1 before publishing a scalar. |
| **Durable** | Regions / site names, owned vs. colo **model**, existence of a managed platform | Often stable across **many months**; an **annual** filing can remain sufficient **if** nothing newer contradicts it. |

**Soft staleness (guidance, not a hard ban):** If the **issuer as-of** for a **high-churn** scalar (or, if absent, the **filing date** of the **specific** document you cite for that number) is **more than about nine months** before your **`retrieved_at`** / verification date:

- **First:** search EDGAR and IR **newest-first** for an update; update the leaf or supersede with a newer source.  
- **If no newer Tier 1 exists:** either keep the scalar and add a **`notes`** line (e.g. no newer Tier 1 found on your verification date; figure is per issuer as-of **…**) **or**, if the stale number would mislead readers, use **`null`** and put the dated fact only in **`notes`** / **`deals_and_contracts`**.

Do **not** use a **single global “discard filings older than X months”** rule: some metrics only appear in the **latest 20-F**, and a **recent** filing can still embed an **older** snapshot — always tie staleness to the **metric’s as-of** and **high-churn vs. durable** role.

### Issuer guidance and targets (`business/business.yaml`)

**Forward-looking** statements (“on track for …”, “expect … by year-end”, ARR **outlook**, MW/GW **goals**) belong in the **`guidance`** section of the infrastructure template (**`summary`** / **`targets[]`**), **not** in **`contracts_usd.online`** or **`capacity.online`** as if they were realized.

- **Tier 1** only (filings, filed exhibits, official IR) — same as other business facts.  
- Each discrete target gets its own **`targets[]`** row with **`sources`** (or cite via **`guidance.summary`** if one doc covers many).  
- When the issuer **revises** guidance, **update** the row and prefer the **newest** primary; note **superseded** ranges in **`notes`** if helpful.

### Tier 2 — Only for `business/business.yaml` (not for `financials` metrics)

3. **Established news organizations and wires** (e.g. Reuters, AP, FT, WSJ, Bloomberg, newspapers of record) — for **timing**, **reported deal announcements**, or **company-attributed quotes**. Treat **numbers and contract terms** cautiously until **Tier 1** confirms; say **“reported; not yet in filing”** in `description` when relevant.

Tier 2 must **not** be treated as company-disclosed **precise metrics** without labeling uncertainty in **`notes`** or using **`null`**.

### Still not sufficient alone

Tabloid-style sites, blogs, forums, random aggregators — **pointers only**. Social — same as [Not sufficient alone](#not-sufficient-alone-especially-for-financial-metrics).

### Recording provenance in `business/business.yaml`

Use **`sources`**: **URL**, **kind** (e.g. `sec_6k`, `sec_20f`, `ir_pdf`, `ir_html`, `news_article`), **`description`**, **`retrieved_at`**.

For **`business/business.yaml`** templates that use metric objects (**`profile_version: 2+`**, e.g. infrastructure **`profile_version: 4`**), attach **`sources`** under **each** metric leaf and under **`guidance.targets[]`** rows (same fields). Optionally also maintain a top-level **`sources[]`** bibliography. Use the **specific** release or filing URL for each cited fact. The **`press_releases_index`** from `entity.yaml` is for **discovery**, not a substitute for those URLs (rare exceptions — prefer the underlying primary).

---

## Recording provenance (shared)

For every **material fact**: at least one citation with **URL**, **document kind**, and **short description**; add **`retrieved_at`** (ISO date). Optional **`excerpt`** for review.

Do **not** invent figures or precise terms; use **`null`** / **`notes`** where the schema allows and the record is silent.
