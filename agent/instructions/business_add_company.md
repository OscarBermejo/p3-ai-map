# Agent instructions: add or scaffold a business profile

Use when the user wants a **`business/business.yaml`** for an existing company (proposal or canonical): **layer-specific template**, then optional filling from primaries. Same **evidence** rules as [sources.md](./sources.md) (**Business profiles** track).

Also read: [sources.md](./sources.md). For **refreshing** an existing profile (validate numbers, fill `null`s, fix errors), use [business_update.md](./business_update.md). Templates: [`content/_meta/business_templates/`](../../content/_meta/business_templates/). Company layout: [`content/_meta/companies/README.md`](../../content/_meta/companies/README.md).

## Output path

```text
<root>/companies/<slug>/business/business.yaml
```

Where **`<root>`** is either:

- **`inbox/proposals/<YYYY-MM-DD>/`** (default for new work), or  
- **`content/`** only if the user **explicitly** authorizes canonical writes.

The **`business/`** directory exists to hold this file (and optional future files).

## Resolve `layer` → template file

1. Read **`content/_meta/company_index.yaml`** and find **`companies[]`** entry where **`slug`** equals the company slug (must match **`entity.yaml`** and folder name).
2. **If the slug is listed:** use that row’s **`layer`** (must be a valid `id` in `content/_meta/layers.yaml`).
3. **If the slug is not listed:** do **not** guess. The user must **state the layer explicitly** in the request (e.g. `infrastructure`). If they did not, **stop** and ask once for the layer id.
4. **Template path:** `content/_meta/business_templates/<layer>.yaml`  
   - Example: `layer: infrastructure` → **`content/_meta/business_templates/infrastructure.yaml`**
5. **If that file does not exist:** **stop** and tell the user there is no business template for that layer yet (they need to add `content/_meta/business_templates/<layer>.yaml`).

## Do not write canonical `content/` without approval

- Default: create or update **`inbox/proposals/<date>/companies/<slug>/business/business.yaml`** only.
- **Do not** write **`content/companies/<slug>/business/`** unless the user clearly asks to merge or apply to canonical data.

## Step 1 — Create `business/business.yaml` from the template

- **Company folder:** This flow assumes **`…/companies/<slug>/`** already exists (with **`entity.yaml`**) — typical if the user followed [financials_add_company.md](./financials_add_company.md) first. If **`entity.yaml` is missing**, scaffold the company tree under **`inbox/proposals/<date>/companies/<slug>/`** per that doc (copy from **`content/_meta/companies/_example/`**), then continue here.
- Ensure the directory **`…/companies/<slug>/business/`** exists (creating it is normal when adding the first **`business.yaml`**; parent dirs are created as needed when writing the file).
- Copy the contents of **`content/_meta/business_templates/<layer>.yaml`** to **`business/business.yaml`** (verbatim structure; keep `layer`, `profile_version`, and empty/`null` fields unless you are also filling in Step 2).
- **If `business/business.yaml` already exists:** do **not** overwrite silently — ask the user or use a clearly named alternative only if they ask (same spirit as [financials_add_company.md](./financials_add_company.md) collisions).

### Metric block shape (all layers)

Templates use **`profile_version`** on the file; follow the **`content/_meta/business_templates/<layer>.yaml`** you copy.

- **Issuer-agnostic keys:** **no** field names for a specific issuer, site, product, or customer. Detail goes in **`notes`**.
- **Leaves:** **`{ value, notes, sources }`** where **`value`** is a number or short token (`~99900`, `">50000"`); **`sources`** is **`[ { url, kind, description, retrieved_at } ]`** (repeat URLs if helpful).
- **Bibliography:** optional top-level **`sources[]`**; **newest first** when multiple rows.

### Infrastructure (`profile_version: 4`)

**[`infrastructure.yaml`](../../content/_meta/business_templates/infrastructure.yaml)** uses three parallel triples so you can compare **online vs. contracted vs. secured** across companies even when filings differ:

| Block | `online` | `contracted` | `secured` |
|-------|----------|--------------|-----------|
| **`capacity`** | MW in service | MW committed, not yet in service (if broken out) | MW under LOAs / connection rights / secured pipeline |
| **`gpus`** | GPUs live | GPUs on order / under purchase agreements | Broader secured position (targets, financing-backed supply — define in **`notes`**) |
| **`contracts_usd`** | **Rental ARR** in service (hyperscalers / tenants renting compute) | **Rental ARR** signed, capacity not fully live | Broader **secured rental ARR** (only if at annual run-rate; raw TCV / financing → **`notes`** or **`deals_and_contracts`**, often **`null`** here) |

**`contracts_usd`:** scalar = **yearly rent / ARR** from **customer** compute deals, not GPU supply spend or multi-year TCV unless annualized (term in **`notes`**). Map each issuer into the **closest** bucket and document the mapping in **`notes`**. Use **`null`** when there is no honest ARR scalar.

**`datacenters`:** **`reported_count`** + **`sites_or_regions.value`** (list of short strings).

**`guidance`:** Issuer **forward** targets and outlook — especially **ARR** bands, year-end **MW/GW** goals, **GPU fleet** targets. Use **`targets[]`** (one row per discrete goal: **`kind`**, **`horizon`**, **`value_low` / `value_high` / `value_text`**, **`notes`**, **`sources`**). Do **not** put guidance scalars in **`contracts_usd.online`** or realized capacity fields. See [sources.md](./sources.md) (“Issuer guidance and targets”). If the issuer gives **no** filed guidance, keep **`targets: []`** and optional **`summary`** null.

## Step 2 — Fill fields (when the user asks)

- Use **Tier 1** then **Tier 2** only as allowed in [sources.md](./sources.md) (**Business profiles**).
- **Newest first:** open issuer filings **newest → oldest** (EDGAR or IR sorted by date); prefer the **latest** primary for each fact. Put the **most recent** filing **first** in each metric’s **`sources`** and in the top-level **`sources[]`** when you use it. See **Newest first** under Business profiles in [sources.md](./sources.md).
- **Recency and staleness:** Before relying on a **20-F / 10-K** alone for **high-churn** scalars (**MW, GPU counts, rental ARR–style USD**), confirm no **newer** **6-K / 8-K**, exhibit, or **official IR** document updates the same line item. Set **`as_of`** to the **issuer’s snapshot date** when given; if the only source is dated, document it and follow the **soft staleness** guidance in [sources.md](./sources.md) (“Filing age, `as_of`, and staleness”).
- **IR discovery:** if **`entity.yaml`** has **`links.press_releases_index`**, use that official news/hub page as a **starting point** to find the newest releases (then cite each **specific** document in the relevant **`sources`** entries — not the index alone). See [sources.md](./sources.md) (“Official IR news / hub index”). If the key is **missing or empty** and you find the correct official URL while researching, **add** **`press_releases_index`** to **`entity.yaml`** (same proposal or canonical path you are editing); do not overwrite unrelated **`entity.yaml`** fields.
- Every **material** claim should be supportable via **per-metric `sources`** (and optionally the top-level **`sources[]`**) in `business.yaml` (URL, kind, description, `retrieved_at`).
- Leave **`null`** / empty lists where primaries do not disclose; use **`notes`** for definitions and comparability caveats.

## Handoff

- State **template used**, **output path**, and whether **`company_index.yaml`** already had the slug (or that layer came from the user).
- Remind: merge to **`content/companies/<slug>/business/business.yaml`** when approved; add **`{ slug, layer }`** to **`company_index.yaml`** if the slug is not there yet.

## Checklist

- [ ] `layer` from **`company_index.yaml`** or **explicit user** input (never invented).
- [ ] Template file **`content/_meta/business_templates/<layer>.yaml`** exists.
- [ ] Output is under **`inbox/`** unless **`content/`** was explicitly authorized.
- [ ] **`business/business.yaml`** path and **`slug`** align with **`entity.yaml`**.
- [ ] No silent overwrite of an existing **`business/business.yaml`**.
- [ ] Provenance per [sources.md](./sources.md) if fields were filled (per-metric **`sources`** where the template uses them).
- [ ] Filings reviewed **newest first**; primary URLs ordered with **most recent** accession first where multiple rows exist.
- [ ] **High-churn** scalars not left on an **outdated** annual-only citation when a **newer Tier 1** updates the same fact; **`as_of`** / **`notes`** reflect issuer snapshot or staleness per [sources.md](./sources.md).
- [ ] **`guidance`** reviewed: **`targets[]`** filled from Tier 1 where the issuer states **forward** goals (especially **ARR**), or intentionally empty with no undisclosed guidance implied.
