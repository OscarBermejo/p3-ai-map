# Agent instructions: update & validate a business profile

Use when the user wants to **refresh `business/business.yaml`**: **re-check numbers already present**, **fill `null` leaves where primaries allow**, **correct wrong values**, and **tighten citations**. Same evidence rules as [sources.md](./sources.md) (**Business profiles** track).

**Normative rules** (tiers, per-metric `sources`, IR index vs document URLs, **recency / `as_of` / staleness**) live in [sources.md](./sources.md) and [business_add_company.md](./business_add_company.md). This file is the **runbook**; do not duplicate those rules—**follow them**.

## When to use

- User says e.g. “update business profile”, “refresh IREN business.yaml”, “validate business metrics”, “fill nulls in business”, “audit `business/business.yaml`”.
- After new filings or press releases, as a **second pass** to align scalars and notes with the **latest** primaries.

## Where to read first

1. [business_add_company.md](./business_add_company.md) — resolve **`layer`**, **`profile_version`**, metric block shape, infrastructure triples, **`contracts_usd`** (rental ARR), and **`guidance`** (forward targets).
2. [sources.md](./sources.md) — allowed evidence, **newest first**, per-metric **`sources`**, optional top-level **`sources[]`**.
3. **`content/_meta/business_templates/<layer>.yaml`** — canonical keys for that layer; do not invent fields.

## Scope & write permissions

- **Standard run (default):** edit **`inbox/proposals/<date>/companies/<slug>/business/business.yaml`** only unless the user points at another path under **`inbox/`**.
- **`content/companies/<slug>/business/`** is **off limits** unless the user **explicitly** authorizes canonical updates (e.g. “apply to `content/companies/iren/business/`”).
- Do **not** replace the whole file to “start fresh” unless the user asks for a **template migration** (e.g. new **`profile_version`**); prefer **surgical** edits to leaves that changed.

## Inputs (confirm if missing)

- **Target file** — path to **`business/business.yaml`** (typically under **`inbox/…/companies/<slug>/business/`**).
- **`entity.yaml`** in the same company folder — **`links.sec_cik`**, **`links.investor_relations`**, **`links.press_releases_index`** for discovery.
- **`layer`** and **`profile_version`** — read from the existing **`business.yaml`**; cross-check **`content/_meta/company_index.yaml`** if the slug is listed (layer should agree; if it does not, **stop** and ask the user).

## Pass A — Validate existing non-`null` values

For each metric leaf **`{ value, notes, sources }`** (and analogous structured sections in the layer template) where **`value`** is **not** **`null`** and is intended as a **factual scalar or token** (numbers, `~…`, short strings):

1. **Primary refresh** — Using **newest → oldest** primaries (EDGAR, IR, official releases per [sources.md](./sources.md)), re-obtain the same fact. Prefer a **more recent** document than the newest URL already in that leaf’s **`sources`**, if one exists.
2. **Compare** — Match **definition** to the template (e.g. **`contracts_usd`** = **annual rental ARR**, not TCV or GPU purchase spend). Watch **units** (MW, GPU count, USD) and **as-of** dates; update **`notes`** if the issuer’s wording shifted.
3. **Outcome** — Mark each leaf **ok**, **superseded (updated to newer primary)**, **corrected (was wrong)**, **discrepancy (needs human)**, or **could not verify** (with reason).
4. **Sources** — If you change **`value`** or materially change **`notes`**, add or reorder **`sources`** so the **most recent** supporting primary is **first** for that leaf; set **`retrieved_at`** for this run where you add rows.
5. **Staleness** — For **high-churn** leaves, compare the **issuer as-of** (or the **filing date** of the cited document if no as-of) to your verification date. If **older than about nine months** and Pass 0 found **no** newer Tier 1, add an explicit **`notes`** caveat or consider **`null`** + narrative per [sources.md](./sources.md) (“Filing age, `as_of`, and staleness”). Flag these in the handoff under **Staleness**.

Skip pure narrative fields where **`value`** is long prose if the user only asked for numeric validation—unless you find a direct factual error.

## Pass B — Fill `null` values

For each leaf with **`value: null`** (and empty lists like **`highlights`** / **`sites_or_regions.value`** where the template expects data):

1. Search **newest** primaries first; use **`press_releases_index`** only as a **hub** — cite each **specific** document in **`sources`**.
2. If a **honest** scalar or list fits the template bucket, set **`value`** and **`notes`** (definitions, as-of, mapping from issuer jargon). If the issuer does not disclose, leave **`null`** and optionally tighten **`notes`** with **why**.
3. **`contracts_usd`:** only fill with **rental ARR** / annual run-rate semantics; if the filing only has TCV or supply agreements, keep **`null`** and point to **`deals_and_contracts`** or **`notes`**.
4. Update top-level **`sources[]`** if you rely on new primaries file-wide (**newest first**).

## Pass B2 — Guidance (`guidance` section)

For infrastructure **`profile_version: 4+`** (or after migrating older files to include **`guidance`**):

1. In the **newest** Tier 1 documents (earnings materials, shareholder letters, MD&A, **6-K / 8-K** exhibits), search for **forward-looking** targets: **ARR** or revenue run-rate **outlook**, **MW/GW** by period, **GPU fleet** goals, **capex** targets, etc.
2. **Add, update, or retire** **`guidance.targets[]`** rows so they match **current** issuer language; each row needs **`sources`** with the **specific** filing/exhibit (**newest first** when a target appears in multiple documents).
3. If guidance was **withdrawn** or **missed**, reflect that in **`notes`** or remove the row — do not leave stale **forward** numbers without a caveat.
4. Ensure **forward** targets are **not** duplicated as **`contracts_usd.online`** / **`capacity.online`** **values** unless the issuer states they are **achieved** (realized).

## Pass C — Corrections & provenance sweep

- Fix **wrong** **`value`** entries when Pass A shows a clear mismatch with the primary (after double-checking units and period).
- Align **`notes`** with **`value`** so readers are not misled (e.g. remove stale “see 10-Q” if the number now comes from an 8-K).
- Scan **`sources`** on touched leaves: no index-only citations where a **specific** filing or release is available; duplicate URLs across metrics are allowed if helpful.
- If **`as_of`** exists at file level, set or bump it when **material** facts change (ISO date; issuer reporting date or your verification date per project convention—state which in the handoff).

## Schema / template drift

- If **`business.yaml`** **`profile_version`** or keys are **older** than **`content/_meta/business_templates/<layer>.yaml`**, **stop** and either migrate per user instruction or follow [business_add_company.md](./business_add_company.md) for the target shape—do not silently drop fields.
- Infrastructure **`profile_version: 3` → `4`:** add **`guidance`** (**`summary`**, **`targets[]`**) from the template, bump **`profile_version`**, then run **Pass B2**.

**Automated checks:** `scripts/validate_values_file.py` accepts `business/business.yaml` paths (same CLI as quarter files; auto-detects profile). See script docstring for `--verify-sec`.

## Output — Handoff summary

Reply with:

1. **Path touched** — `business/business.yaml` (and **`entity.yaml`** if you added **`press_releases_index`** or similar).
2. **Validation** — bullets or table: leaf (or section) → **ok** / **updated** / **corrected** / **needs human**.
3. **Newly filled** — leaf, new **`value`**, one-line provenance.
4. **Still `null`** — leaf, one-line reason.
5. **Open issues** — e.g. ambiguous disclosure, restatement, access blocked.
6. **Staleness** — Any **high-churn** leaves still supported only by a **~9+ month** old as-of/filing, after Pass 0 search: what you did (**caveat in `notes`**, **`null`**, or **superseded** by newer primary).

## Checklist before you finish

- [ ] Read [sources.md](./sources.md) and [business_add_company.md](./business_add_company.md) for the company’s **`layer`** / **`profile_version`**.
- [ ] **Pass 0** done: newer EDGAR / IR checked before leaf validation.
- [ ] Pass A done for non-`null` factual scalars; updates justified by newer primaries.
- [ ] Pass B done for **`null`**s where primaries support a value; remaining **`null`**s explained in **`notes`** where helpful.
- [ ] **Pass B2** done: **`guidance`** checked and updated per latest primaries (or confirmed empty).
- [ ] Pass C: wrong values fixed; **`sources`** and **`notes`** consistent; **`contracts_usd`** semantics respected; **`as_of`** updated when material snapshots change.
- [ ] **Staleness** addressed for **high-churn** fields per [sources.md](./sources.md).
- [ ] **Writes** only under **`inbox/`** unless the user **explicitly** authorized **`content/`** edits.
- [ ] Summary delivered to the user.

## Tools

Use terminal / browser / MCP as needed to open **filing HTML** and **IR PDFs**. Respect [SEC fair access](https://www.sec.gov/os/accessing-edgar-data) when using `data.sec.gov` or EDGAR (appropriate **User-Agent**).

There is no separate automated validator for **`business.yaml`** yet; rely on careful comparison to primaries.
