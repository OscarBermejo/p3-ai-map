# Agent instructions: financial workflows

Use this file for the **workflow** side of company financials:

- adding quarter files for a **newly scaffolded company**
- updating or validating **existing** `financials/*.yaml`

This file is the **runbook**. The **normative rules** stay in:

- [financials.md](./financials.md) — quarter schema, period discipline, provenance wording, `covers` / `supports_derivation_of`, filing-first order
- [sources.md](./sources.md) — evidence rules
- [financials_sec_xbrl_concepts.md](./financials_sec_xbrl_concepts.md) — optional SEC `companyconcept` API appendix for narrow gap-fill runs

If the company folder and `entity.yaml` do **not** exist yet, start with [company_add_company.md](./company_add_company.md) first.

## When to use

Use this file when the user wants to do either of these:

1. **New company financials** — create the first quarter files for a company whose scaffold and `entity.yaml` already exist
2. **Existing financials update** — validate, fill `null`s, or tighten citations in existing quarter files

Typical requests:

- “add financials for this new company”
- “create the first quarter YAMLs”
- “update financials”
- “fill nulls”
- “validate IREN quarters”
- “audit `financials/*.yaml`”

## Where to read first

1. [financials.md](./financials.md)
2. [sources.md](./sources.md)
3. [financials_sec_xbrl_concepts.md](./financials_sec_xbrl_concepts.md) when using targeted SEC XBRL concept pulls
4. Company `financials/README.md` for issuer-specific fiscal calendar and naming

## Shared workflow rules

### Source-by-source persistence

Do **not** accumulate every number in chat and only write YAML at the end.

For each quarter file in scope:

1. Walk primaries in the filing-first order defined in [financials.md](./financials.md) under **Source processing order and incremental writes (agents)**
2. Treat each exhibit URL or discrete API batch as its own source step
3. After each step, write any newly resolved `metrics` and matching `sources[]` rows to disk
4. Run `scripts/validate_values_file.py` after steps that changed the file, or at minimum before declaring the quarter done

If a run stops early, the repo should still contain **partial but cited** progress.

### Shared accuracy rules

- Follow [financials.md](./financials.md) for all quarter-shape, period, and provenance rules
- Every quarter file must include **all** `metrics:` keys from `content/_meta/companies/_example/financials/_template.quarter.yaml`
- Unknown values are `null`, not guesses
- Every non-null metric must have supporting `sources[]` rows and proper `covers`
- Every remaining `null` metric must have a `documentation` row with `covers` and a reason
- For flow metrics, prefer:
  1. direct quarter column in the filing
  2. safe contiguous derivation from primaries
  3. `null` plus explanation

### Write permissions

- Default: write under **`inbox/`**
- `content/` is off limits unless the user explicitly authorizes canonical edits
- Do not edit `content/_meta/companies/_example/` as if it were issuer data
- Skip `_template.quarter.yaml` unless the user explicitly wants to change the template

---

## Workflow A — New company financials

Use this mode when the company scaffold already exists and you are adding the first quarter files.

### Prerequisite

The target company path should already exist with:

- the company folder
- `entity.yaml`
- the base structure copied from `content/_meta/companies/_example/`

If those are missing, start with [company_add_company.md](./company_add_company.md).

### Where new-company financials live

Default proposal path:

```text
inbox/proposals/<YYYY-MM-DD>/companies/<slug>/
├── entity.yaml
└── financials/
    ├── README.md
    ├── _template.quarter.yaml
    └── YYYY-Qn.yaml
```

Notes:

- `<slug>` is kebab-case and must match `entity.yaml`
- `<YYYY-MM-DD>` is the proposal run date unless the user specifies another date
- layer is **not** part of the path; `company_index.yaml` is updated only if the user explicitly asks

If the same slug + date path already exists, do **not** overwrite silently. Ask the user or use a clearly separated suffix.

### What to do

1. Read `financials/README.md` for fiscal naming and period conventions
2. Create one quarter YAML per period requested
3. Ensure every quarter file includes every template `metrics:` key
4. Populate metrics from SEC primaries, filing tables, and structured facts as allowed by [financials.md](./financials.md) and [sources.md](./sources.md)
5. For duration metrics such as cash flows, prefer the three-month filing column, then safe contiguous derivation, then `null`
6. Add `sources[]` with the correct provenance lead-ins:
   - `Direct from SEC filing:`
   - `From SEC company facts API (XBRL):`
   - `Derived:`
7. Use `covers` / `supports_derivation_of` / `documentation` per [financials.md](./financials.md)
8. For extended metrics such as liquidity, leverage, and extra P&L lines, use [financials_sec_xbrl_concepts.md](./financials_sec_xbrl_concepts.md) in small targeted passes when helpful; prefer filing tables when the API is sparse or missing
9. Keep or remove `_template.quarter.yaml` per user preference, but never treat it as reported data

### Handoff for new-company financials

Tell the user:

1. the exact proposal path
2. which quarter files were added
3. what still needs review
4. that they should validate URLs, values, and YAML shape before merging into `content/`
5. that `{ slug, layer }` should be added to `content/_meta/company_index.yaml` if not already present and if they want the company indexed

### Checklist

- [ ] Target company path already exists and `slug` matches `entity.yaml`
- [ ] No unauthorized writes under `content/`
- [ ] All template `metrics:` keys are present
- [ ] Non-null metrics are cited correctly
- [ ] Remaining `null`s are documented
- [ ] If the company scaffold was missing, [company_add_company.md](./company_add_company.md) was used first

---

## Workflow B — Update or validate existing financials

Use this mode when quarter files already exist and the task is to refresh, verify, or tighten them.

### Inputs

Confirm if missing:

- target directory
- which files are in scope
- whether edits should stay under `inbox/` or were explicitly authorized under `content/`
- `entity.yaml` for `links.sec_cik` and related filing discovery

### Pass A — Validate existing non-null metrics

For each existing quarter file:

1. Confirm the `metrics:` key set matches the quarter template
2. For each non-null metric:
   - verify period fit
   - re-check the primary source
   - confirm the provenance lead-in is accurate
   - confirm `covers` / `supports_derivation_of` are correct
3. Record each metric as:
   - ok
   - corrected
   - discrepancy (needs human)
   - could not verify

### Pass B — Fill null metrics

For each `null` metric:

1. Continue working source-by-source in filing-first order
2. Apply the accuracy order from [financials.md](./financials.md):
   - direct quarter column
   - safe contiguous derivation
   - `null` + explanation
3. For balance-sheet gaps, check both filing and company facts before leaving `null`
4. Every newly filled metric gets matching `sources[]` and mapping fields
5. Every remaining `null` gets a `documentation` row with `covers: [metric]`

### Pass C — Provenance sweep

- Align all `sources[].description` strings with [financials.md](./financials.md)
- Verify `covers` / `supports_derivation_of` completeness
- Remove duplicate URLs only if doing so does not hide whether the value came from a filing table, API fact, or derivation

### Output — Handoff summary

Reply with:

1. files touched
2. validation results
3. newly filled metrics
4. metrics still `null`
5. open issues such as blocked filing access, ambiguous line items, or restatements

### Checklist

- [ ] [financials.md](./financials.md) period and cash-flow rules respected
- [ ] Source-by-source persistence used where applicable
- [ ] Non-null metrics validated
- [ ] Fillable `null`s filled
- [ ] Remaining `null`s documented
- [ ] Provenance lead-ins and mapping fields corrected
- [ ] Writes stayed under `inbox/` unless canonical edits were explicitly authorized

---

## Tools

Use terminal, browser, filing HTML, and `data.sec.gov` APIs as needed. Prefer opening the primary document linked from the filing index when cash-flow columns or quarter durations are unclear.

Automated checks:

- `scripts/validate_values_file.py`
- `financials_sec_xbrl_concepts.md` for narrow SEC concept pulls when useful
