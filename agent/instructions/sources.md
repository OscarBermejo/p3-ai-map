# Agent instructions: sources

**Use this file** whenever you need to decide what counts as evidence for facts in `content/`, including `financials/*.yaml`, `business/business.yaml`, `announcements/announcements.yaml`, and `narrative/narrative.yaml`.

There are **four tracks** with the same primary-first discipline but different downstream rules:

| Track | Files | What it covers |
|-------|-------|----------------|
| **Financial quarters** | `financials/*.yaml` | Period-bound metrics such as revenue, cash flow, and balance sheet values |
| **Business profiles** | `business/business.yaml` | Operating / strategic facts such as capacity, contracts, platform, and GPU mix |
| **Announcements** | `announcements/announcements.yaml` | Latest material company announcements such as deals, raises, ATM, hiring, launches, and regulatory items |
| **Financial narratives** | `narrative/narrative.yaml` | Interpretive synthesis of what is non-obvious beneath headline metrics; not authoritative new metrics |

**Rule of thumb:** If it belongs in `metrics:` with a quarter end date, use the **financial** track. If it belongs in `business/business.yaml`, use the **business** track. If it is a discrete recent company-announced event, use the **announcements** track. If it is analysis, gaps, and cited reasoning rather than new metrics, use the **narrative** track.

---

## Shared rules

### Primary sources first

Prefer these first across all tracks:

1. **SEC EDGAR** for U.S. issuers: 10-Q, 10-K, 8-K, 6-K, 20-F, and materials linked from filings
2. **Official investor relations** and **press releases** on the company’s own domain
3. **Other primary records** such as home-market regulatory filings, exchange notices, and official government / utility filings when they are the original record

For **non-U.S. issuers**, use the issuer’s home regulatory filings and official IR the same way you would use SEC + company-domain releases.

### Official IR news / hub index

Many issuers publish a chronological news, press release, or investor-hub page on their own domain (for example `/investors/news` or `/investor-hub`). Treat that page as a **Tier 1 discovery tool**: use it to find the newest official PDFs, HTML releases, and links to SEC or home-market filings.

Do **not** treat the index URL alone as proof of a specific fact when a more specific document exists. Cite the actual release, PDF, filing exhibit, or company page you used.

The index URL can live in `entity.yaml` as `links.press_releases_index` (see [companies README](../../content/_meta/companies/README.md)). If absent, infer the official hub from `links.investor_relations` or the company site.

### Newest first

Unless a track says otherwise, work **newest first**:

1. Discover candidate primaries in reverse chronological order
2. Prefer the **latest** primary that still supports the fact you are recording
3. Order `sources[]` with the **most recent / most authoritative** supporting source first
4. Do not anchor on a convenient annual report without checking newer filings, exhibits, and official IR for the same issuer

Archive URLs remain valid; freshness comes from **which filing / accession / release** you cite, not from whether the URL itself looks old.

If an older filing is still the only source for a detail, that is allowed; make that clear in `notes` or `sources[].description` when the snapshot is mixed as-of.

### Social posts

Social posts are usually **pointers**, not the best final citation.

- Prefer the linked filing or company-domain release when the official post links to one
- If an official company-controlled account is the **only** original company statement you can find for an announcement, it may be cited for what it actually says
- Do **not** upgrade reposts, employee commentary, or unofficial accounts into company proof

### Not sufficient alone

- **News, blogs, forums, and aggregators** are useful for discovery but are generally not enough by themselves for authoritative facts
- **Third-party reporting** should not be the sole proof for financial metrics and should not be the sole proof for announcements if an official source exists
- **Rumor accounts** and low-quality aggregators are not acceptable evidence

### Shared provenance

For every material fact, include at least one citation with:

- `url`
- `kind`
- `description`
- `retrieved_at`

Optional: `excerpt` for review.

Do not invent figures or precise terms. Use `null` or `notes` where the schema allows and the record is silent.

---

## Financial quarters (`financials/*.yaml`)

This is the **strictest** track. Every number in `metrics:` must trace to:

- a filing table or iXBRL fact with the correct period / instant, and/or
- `data.sec.gov` company facts where appropriate, and/or
- a documented **`Derived:`** figure whose inputs both come from primaries

Established newspapers and wires must **not** be the sole or primary proof for quarterly financial numbers. If a story quotes a figure, open the filing or facts JSON and cite that instead.

Normative detail lives in [financials.md](./financials.md), including periods, cash flow vs P&L handling, and `covers` / `documentation`.

### Source order and write habit

When filling or auditing a quarter file, process evidence in priority order and write `metrics` + `sources` **after each primary document**, not only at the end of the session. The numbered default order, definition of one source step, overwrite rules, and validation habit are in [financials.md](./financials.md) under **Source processing order and incremental writes (agents)**.

Adapt the list if an issuer uses a different exhibit pattern, but keep **filing tables before API** unless the table truly lacks the line.

### Provenance wording

In `sources[].description`, state explicitly:

- `Direct from SEC filing:`
- `From SEC company facts API (XBRL):`
- `Derived:`

Use `covers` and `supports_derivation_of` as described in [financials.md](./financials.md). For `null` metrics, use `kind: documentation` and `covers: [metric_key]`.

### Derived figures

Derived figures such as quarter = YTD minus prior quarter are allowed only when:

- both inputs come from primary documents
- periods are contiguous and comparable
- the derivation is documented clearly

If unsure, use `null`. See [financials.md](./financials.md) for flow-metric details.

---

## Business profiles (`business/business.yaml`)

This track covers non-quarterly business facts. Tier 1 is still primary-first, but the practical source set is broader than for quarter metrics and includes exhibits that matter for operations.

### Tier 1 for business facts

Prefer:

1. Regulatory filings such as 10-K / 20-F, 10-Q, 8-K / 6-K, and filed exhibits including earnings materials and investor decks
2. Official IR materials on the company domain such as annual reports, official PDFs, and press releases

If the same deck exists both as a filed exhibit and on IR, prefer the filing-linked URL when practical.

### Filing age, `as_of`, and staleness

Do not confuse:

- the **period covered** by a filing
- the **filing / acceptance date**
- the issuer’s explicit **as-of** date for the sentence or table you are citing

Per fact, pick the newest primary that actually states or updates that fact. If a newer 6-K exhibit updates GPU or MW counts and the 20-F only has an older snapshot, cite the 6-K first for that leaf.

When the template has file-level `as_of`, set it to the issuer snapshot date that best matches fast-moving scalars such as `capacity`, `gpus`, and `contracts_usd` if the issuer provides one. If leaves use different as-of dates, either use the latest of those dates or keep file-level `as_of` loose and explain the mixed timing in `notes`.

### High-churn vs durable facts

| Kind | Examples | Recency expectation |
|------|----------|---------------------|
| **High-churn** | MW / GPU counts, rental ARR-style USD, backlog-style contract value | Search harder for newer Tier 1 support before publishing a scalar |
| **Durable** | Regions / site names, owned vs colo model, existence of a managed platform | An annual filing can remain sufficient if nothing newer contradicts it |

### Soft staleness

If the issuer as-of for a **high-churn** scalar, or failing that the filing date of the specific cited document, is **more than about nine months** before your verification date:

1. Search EDGAR and IR newest-first for an update
2. If no newer Tier 1 exists, either keep the scalar with a `notes` caveat or use `null` and move the dated fact into `notes` / `deals_and_contracts` if publishing the stale scalar would mislead

Do **not** use one global “discard filings older than X months” rule. Some metrics only appear in the latest 20-F, and a recent filing can still embed an older snapshot. Tie staleness to the metric’s actual as-of and to whether the fact is high-churn or durable.

### Guidance and targets

Forward-looking statements such as “on track for …”, year-end goals, ARR outlook, MW / GW goals, or GPU-fleet targets belong in the `guidance` section of the business template, **not** in realized fields such as `contracts_usd.online` or `capacity.online`.

- Use **Tier 1 only**
- Give each discrete target its own `targets[]` row unless one source clearly belongs in `guidance.summary`
- When guidance is revised, update the row and prefer the newest primary; note superseded ranges in `notes` when helpful

### Tier 2 for business only

Established news organizations and wires such as Reuters, AP, FT, WSJ, Bloomberg, and newspapers of record may be used for **timing**, **reported deal announcements**, or **company-attributed quotes** in `business/business.yaml`.

But:

- treat numbers and contract terms cautiously until Tier 1 confirms them
- label uncertainty in `description` or `notes` when needed, e.g. “reported; not yet in filing”
- do not treat Tier 2 as company-disclosed precise metrics

### Recording provenance in `business/business.yaml`

For metric-object templates (`profile_version: 2+`, including infrastructure `profile_version: 4`), attach `sources` under each metric leaf and under `guidance.targets[]`. A top-level `sources[]` bibliography is optional.

Use the **specific** filing, release, or document URL for each cited fact. `press_releases_index` is for discovery, not a substitute for the underlying document except in rare cases where no deeper primary exists.

---

## Announcements (`announcements/announcements.yaml`)

This track is for the latest material company announcements: deals, partnerships, raises, ATM programs, debt or equity financing, major hiring, leadership changes, launches, capacity milestones, restructurings, regulatory items, and similar discrete events.

### Preferred sources for announcements

Prefer, in roughly this order:

1. Regulatory filings such as 8-K / 6-K / 10-Q / 10-K / 20-F or home-market equivalents when the event is disclosed there
2. Official investor relations / press releases on the company domain
3. Official company website pages such as newsroom, blog, product, or leadership announcement pages
4. Official company-controlled social posts when they are the original statement or help corroborate timing / wording

If the social post links to a filing or company-domain release, cite that linked primary first and the social post second if useful.

### One event, one row

If the same event appears in an SEC filing, an IR release, and an official social post, keep **one** announcement item with **multiple `sources`** rather than three near-duplicate rows.

### Third-party reporting

Third-party news can help you discover an event or add context, but it should not be the only citation if an official source exists.

### Recording provenance in `announcements/announcements.yaml`

Each announcement item should have non-empty `sources`, with the most authoritative / direct source first. Typical `kind` values include:

- `sec_8k`, `sec_6k`, `sec_10q`, `sec_10k`, `sec_20f`
- `ir_html`, `ir_pdf`
- `company_web`
- `official_social`
- `regulatory_filing`

---

## Financial narratives (`narrative/narrative.yaml`)

This track is for interpretation: what sits underneath first-glance numbers, based on primaries plus `financials` and `business`, ending in a required conclusion. See [narrative.md](./narrative.md).

### Open the documents

Narrative `sources` are not decorative. To write or refresh a narrative, open each primary you rely on and read the relevant statements, footnotes / notes, accounting-policy disclosures, and MD&A where applicable.

If you did not open the document, do not imply that you reviewed the notes. If access fails, record the limit in `disclosure_gaps` or `conclusion`.

### Narrative-specific limits

- Do **not** introduce new authoritative metrics; reference `financials/*.yaml` or quote primaries directly
- Tier 2 news / wires are not sufficient to anchor economic claims; use them only as context with labeling, or to find a primary
- Every narrative file must list non-empty top-level `sources` covering the primaries actually consulted, with the most relevant / latest primary first when multiple rows apply
