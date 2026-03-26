# Agent instructions: business profiles

Use this file for the **core rules and structure** of `business/business.yaml`.

This file defines:

- how to resolve `layer` to a business template
- what `business/business.yaml` should look like
- how metric leaves are shaped
- how infrastructure profiles should be interpreted
- how to treat `contracts_usd`, `guidance`, `as_of`, and staleness

For the **workflow** side (creating a new business profile or updating an existing one), use [business_workflows.md](./business_workflows.md).

Also read: [sources.md](./sources.md), [`content/_meta/business_templates/`](../../content/_meta/business_templates/), and [`content/_meta/companies/README.md`](../../content/_meta/companies/README.md).

## Output path

```text
<root>/companies/<slug>/business/business.yaml
```

Where `<root>` is either:

- `inbox/proposals/<YYYY-MM-DD>/` by default
- `content/` only if the user explicitly authorizes canonical writes

The `business/` directory exists to hold this file and possible future related files.

## Resolve `layer` → template file

1. Read `content/_meta/company_index.yaml` and find the `companies[]` entry where `slug` matches the company folder and `entity.yaml`
2. If the slug is listed, use that row’s `layer`
3. If the slug is **not** listed, do **not** guess; the user must state the layer explicitly
4. Template path is:

```text
content/_meta/business_templates/<layer>.yaml
```

Example:

- `layer: infrastructure` → `content/_meta/business_templates/infrastructure.yaml`

5. If the template file does not exist, stop and tell the user there is no business template for that layer yet

## Write safety

- Default: create or update `inbox/proposals/<date>/companies/<slug>/business/business.yaml`
- Do **not** write `content/companies/<slug>/business/` unless the user clearly authorizes canonical edits
- Do **not** invent layer ids or template paths

## Template and metric block shape

Templates use `profile_version`; follow the exact structure in `content/_meta/business_templates/<layer>.yaml`.

General rules:

- keys should stay issuer-agnostic; issuer-specific detail belongs in `notes`
- leaves use `{ value, notes, sources }`
- `value` is typically a number or short token such as `~99900` or `">50000"`
- `sources` is a list of `{ url, kind, description, retrieved_at }`
- a top-level `sources[]` bibliography is optional

## Infrastructure profiles (`profile_version: 4`)

`infrastructure.yaml` uses three parallel buckets so different issuers can still be compared:

| Block | `online` | `contracted` | `secured` |
|-------|----------|--------------|-----------|
| `capacity` | MW in service | MW committed, not yet in service if broken out | MW under LOAs, interconnection rights, or secured pipeline |
| `gpus` | GPUs live | GPUs on order / under purchase agreements | Broader secured position such as targets or financing-backed supply, defined in `notes` |
| `contracts_usd` | rental ARR already in service | rental ARR signed but not fully live | broader secured rental ARR only if honestly annualized; raw TCV or financing belongs in `notes` / `deals_and_contracts` |

### `contracts_usd`

`contracts_usd` means **yearly rent / ARR** from customer compute deals.

It does **not** mean:

- GPU supply spend
- financing amount
- raw multi-year TCV unless honestly annualized and explained

If there is no honest ARR-style scalar, use `null` and explain in `notes`.

### `datacenters`

Use:

- `reported_count`
- `sites_or_regions.value` as a short list of sites or regions

### `guidance`

Use `guidance` for forward-looking targets such as:

- ARR outlook
- year-end MW / GW goals
- GPU fleet targets
- capex targets

Use `targets[]` with one row per discrete target:

- `kind`
- `horizon`
- `value_low`
- `value_high`
- `value_text`
- `notes`
- `sources`

Do **not** place forward-looking targets into realized fields such as `contracts_usd.online` or `capacity.online` unless the issuer says they are achieved.

If the issuer gives no filed guidance, keep `targets: []` and leave `summary` null if appropriate.

## Evidence and citation rules

Follow [sources.md](./sources.md) for the **Business profiles** track.

Important reminders:

- use Tier 1 first, then Tier 2 only as allowed
- work newest-first
- use `press_releases_index` only as a discovery hub, not as the final citation when a specific filing or release exists
- every material factual claim should be supportable through per-metric `sources`

## `as_of`, recency, and staleness

Before relying on a 20-F / 10-K alone for high-churn scalars such as:

- MW
- GPU counts
- rental ARR-style USD

confirm that no newer 6-K, 8-K, exhibit, or official IR release updates the same line item.

Rules:

- if the issuer gives an explicit snapshot date, use that for `as_of`
- if leaves use mixed as-of dates, either keep file-level `as_of` loose or explain the mixed timing in `notes`
- if a high-churn fact is only supported by an older primary and no newer Tier 1 update exists, add a clear staleness caveat or use `null` if publishing the stale scalar would mislead

Do **not** use one blanket rule like “discard anything older than X months.” Tie staleness to the actual metric and its disclosure timing.

## Guidance-specific recency

Forward targets should be kept current:

- prefer the newest primary for each target
- when guidance is revised, update the row
- when guidance is withdrawn or clearly stale, reflect that in `notes` or remove the row

## Template drift

If an existing `business.yaml` has:

- older keys
- an older `profile_version`
- or a shape that no longer matches `content/_meta/business_templates/<layer>.yaml`

stop and either:

- migrate intentionally per user instruction, or
- follow the target template carefully

Do not silently drop fields.

For infrastructure `profile_version: 3 → 4`, add the `guidance` block from the template, bump the profile version, and then fill or confirm `guidance`.

## Related

- [business_workflows.md](./business_workflows.md) — add / update workflows
- [sources.md](./sources.md) — evidence, recency, and citation rules
- [company_add_company.md](./company_add_company.md) — create the company scaffold and `entity.yaml` first
