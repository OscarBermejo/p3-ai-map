# Agent instructions: business workflows

Use this file for the **workflow** side of `business/business.yaml`:

- creating the first business profile for a company
- updating or validating an existing business profile

The **core rules** live in:

- [business.md](./business.md)
- [sources.md](./sources.md)

If the company folder and `entity.yaml` do not exist yet, start with [company_add_company.md](./company_add_company.md).

## When to use

Use this file when the user wants to:

- scaffold `business/business.yaml`
- fill business profile fields from primaries
- refresh existing business metrics
- validate non-null values
- fill `null`s
- update guidance
- correct stale or wrong values

## Where to read first

1. [business.md](./business.md)
2. [sources.md](./sources.md)
3. `content/_meta/business_templates/<layer>.yaml`

---

## Workflow A — Create or scaffold `business/business.yaml`

Use this workflow when a company exists and you want to create the first `business/business.yaml`.

### Preconditions

The target company path should already exist with `entity.yaml`.

Typical order:

1. [company_add_company.md](./company_add_company.md)
2. this workflow

If `entity.yaml` is missing, scaffold the company first.

### Output path

```text
<root>/companies/<slug>/business/business.yaml
```

Where `<root>` is:

- `inbox/proposals/<YYYY-MM-DD>/` by default
- `content/` only if the user explicitly authorizes canonical writes

### Step 1 — Resolve layer and template

Resolve `layer` exactly as defined in [business.md](./business.md):

- use `content/_meta/company_index.yaml` if the slug is listed
- otherwise ask the user for the layer
- do not guess

Then use:

```text
content/_meta/business_templates/<layer>.yaml
```

If the template does not exist, stop and tell the user.

### Step 2 — Create the file from the template

1. Ensure the `business/` directory exists
2. Copy the selected template to `business/business.yaml`
3. Keep `layer`, `profile_version`, and empty / `null` fields unless the user also asked you to fill them
4. If `business/business.yaml` already exists, do **not** overwrite silently; ask the user or use a clearly separated alternative only if requested

### Step 3 — Fill fields when requested

When the user wants the initial profile filled:

- use Tier 1 then Tier 2 only as allowed in [sources.md](./sources.md)
- work newest-first
- use `press_releases_index` as discovery only; cite the specific document used
- if `press_releases_index` is missing and you confirm the official URL, add it to `entity.yaml` in the same root you are editing
- every material claim should be supportable through per-metric `sources`
- leave `null` or empty lists where the issuer does not disclose an honest value

### Handoff

Tell the user:

1. template used
2. output path
3. whether `company_index.yaml` already had the slug or the layer came from the user
4. whether `entity.yaml` was also updated

### Checklist

- [ ] `layer` came from `company_index.yaml` or explicit user input
- [ ] template exists
- [ ] output is under `inbox/` unless canonical writes were explicitly authorized
- [ ] `business/business.yaml` path and `slug` align with `entity.yaml`
- [ ] no silent overwrite of an existing `business/business.yaml`
- [ ] filled values follow [business.md](./business.md) and [sources.md](./sources.md)

---

## Workflow B — Update or validate existing `business/business.yaml`

Use this workflow when the business profile already exists and the task is to refresh or audit it.

### Scope and write permissions

- default: edit only under `inbox/`
- `content/companies/<slug>/business/` is off limits unless the user explicitly authorizes canonical updates
- do not replace the whole file to “start fresh” unless the user explicitly asks for a template migration

### Inputs

Confirm if missing:

- target file path
- `entity.yaml` in the same company folder
- existing `layer` and `profile_version`

Cross-check `company_index.yaml` if the slug is listed. If the layer disagrees with the existing `business.yaml`, stop and ask the user.

### Pass A — Validate existing non-null values

For each factual metric leaf `{ value, notes, sources }` or analogous structured section where `value` is not `null`:

1. Re-obtain the same fact from newest → oldest primaries
2. Prefer a newer document than the newest existing source when available
3. Match the issuer wording to the template definition
4. Check units, as-of dates, and semantics
5. Mark the result as:
   - ok
   - superseded
   - corrected
   - discrepancy (needs human)
   - could not verify
6. If `value` or `notes` change materially, reorder or update `sources` so the most recent supporting primary is first
7. For high-churn leaves, apply the staleness rules from [business.md](./business.md) and [sources.md](./sources.md)

Skip long narrative-style values if the user only asked for scalar validation, unless you find a direct factual error.

### Pass B — Fill null values

For each leaf with `value: null` or empty lists where the template expects data:

1. Search newest primaries first
2. Use `press_releases_index` only as a hub; cite the specific document
3. If an honest scalar or list fits the template, set `value` and explain mapping in `notes`
4. If the issuer does not disclose it, leave `null` and improve `notes` if helpful
5. For `contracts_usd`, only fill ARR-style values; if the source only gives TCV, supply spend, or another non-ARR number, keep `null`
6. Update top-level `sources[]` if you rely on new primaries file-wide

### Pass B2 — Guidance

For infrastructure `profile_version: 4+`, and for older profiles after migration:

1. Search newest Tier 1 documents for forward-looking targets such as ARR, MW / GW, GPU fleet, or capex
2. Add, update, or retire `guidance.targets[]` rows so they match the issuer’s current language
3. Each target row must have specific supporting `sources`
4. If guidance was withdrawn or clearly missed, reflect that in `notes` or remove the row
5. Do not duplicate forward targets into realized fields unless the issuer says they are achieved

### Pass C — Corrections and provenance sweep

- fix clearly wrong values after double-checking units and period
- align `notes` with `value`
- ensure no index-only citations remain when a specific release or filing exists
- duplicate URLs across metrics are allowed if helpful
- if file-level `as_of` exists, set or bump it when material facts changed; say in the handoff whether that date reflects issuer snapshot timing or verification date

### Schema / template drift

If `business.yaml` uses an older `profile_version` or outdated keys:

- stop and either migrate intentionally or follow the target template carefully
- do not silently drop fields

For infrastructure `profile_version: 3 → 4`:

1. add `guidance.summary` and `guidance.targets[]` from the template
2. bump `profile_version`
3. then run Pass B2

### Output — Handoff summary

Reply with:

1. path touched
2. validation summary
3. newly filled leaves
4. remaining `null`s
5. open issues
6. staleness notes for any high-churn fields still relying on older support

### Checklist

- [ ] read [business.md](./business.md) and [sources.md](./sources.md)
- [ ] Pass A done for non-null factual scalars
- [ ] Pass B done for fillable `null`s
- [ ] Pass B2 done for guidance where applicable
- [ ] Pass C done for provenance, notes, and corrections
- [ ] staleness addressed for high-churn fields
- [ ] writes stayed under `inbox/` unless canonical edits were explicitly authorized

---

## Tools

Use terminal, browser, and MCP tools as needed to open filing HTML, IR PDFs, and official company releases. Respect [SEC fair access](https://www.sec.gov/os/accessing-edgar-data) when using EDGAR or `data.sec.gov`.

`scripts/validate_values_file.py` accepts `business/business.yaml` paths and auto-detects the profile shape. There is no separate business-only validator beyond that; rely on careful comparison to primaries.
