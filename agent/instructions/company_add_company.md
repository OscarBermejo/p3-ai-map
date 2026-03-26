# Agent instructions: add a new company scaffold

Use this flow when the user wants to **add a new company to the map** and the first task is to create the **company folder** plus **`entity.yaml`**. This file is only for the **initial company scaffold**.

After this step, use the other task-specific instruction files to add:

- `financials/` via [financials_workflows.md](./financials_workflows.md) and [financials.md](./financials.md)
- `business/business.yaml` via [business_workflows.md](./business_workflows.md) and [business.md](./business.md)
- `announcements/announcements.yaml` via [announcements.md](./announcements.md)
- `narrative/narrative.yaml` via [narrative.md](./narrative.md)

Also read: [sources.md](./sources.md) for evidence and [`content/_meta/companies/README.md`](../../content/_meta/companies/README.md) for the canonical company tree shape.

## Scope

This instruction is responsible for:

1. Creating the company folder
2. Copying the base scaffold from `content/_meta/companies/_example/`
3. Creating / filling `entity.yaml`

This instruction is **not** responsible for:

- adding quarter files under `financials/`
- adding `business/business.yaml`
- adding `announcements/announcements.yaml`
- adding `narrative/narrative.yaml`

Those come **after** the company scaffold exists.

## Output path

Standard proposal path:

```text
inbox/proposals/<YYYY-MM-DD>/companies/<slug>/
```

Canonical path only if the user explicitly authorizes it:

```text
content/companies/<slug>/
```

Where:

- `<slug>` is **kebab-case**
- folder name must match `slug` in `entity.yaml`
- `<YYYY-MM-DD>` is the proposal run date unless the user gives another date

## Write safety

- Default: create the scaffold under **`inbox/proposals/<date>/companies/<slug>/`**
- Do **not** create or update canonical `content/companies/<slug>/` unless the user explicitly authorizes canonical writes
- Do **not** edit `content/_meta/company_index.yaml` unless the user explicitly asks
- Do **not** treat `content/_meta/companies/_example/` as a real issuer

## Step 1 — Resolve target path

1. Determine the target `slug`
2. Determine whether the root is `inbox/proposals/<date>/` or `content/`
3. If the destination already exists, do **not** overwrite silently; ask the user or use a clearly separated new proposal date / suffix

## Step 2 — Copy the structural scaffold

Copy the company tree from:

```text
content/_meta/companies/_example/
```

into the target company path.

This creates the base structure for the company and ensures the repo shape stays consistent. Keep optional subdirectories even if they are not filled yet, unless the user asks for a more minimal scaffold.

## Step 3 — Fill `entity.yaml`

Populate `entity.yaml` using **primary / official sources only**:

- `slug`
- `legal_name`
- `tickers`
- `summary`
- `links.investor_relations`
- `links.press_releases_index` when known
- `links.sec_cik` or equivalent official regulatory entry when applicable
- `reporting` fields when known

Rules:

- Use official company and regulatory sources only
- Do **not** guess unknown values
- Leave unknown fields empty or `null` if the schema allows
- Keep `summary` concise and descriptive; do not stuff financial metrics into it
- Hard numbers should usually live in `financials/*.yaml` or `business/business.yaml`, not in `entity.yaml`

### `press_releases_index`

If the company has an official investor news, press releases, or investor-hub page on its own domain, set `links.press_releases_index` to that URL. If you cannot confirm the official page, leave it blank or omit it; do not invent it.

## Step 4 — Handoff to follow-on instructions

Once the scaffold exists and `entity.yaml` is filled, continue with the relevant next instruction:

- new quarter files → [financials_workflows.md](./financials_workflows.md)
- business profile → [business_workflows.md](./business_workflows.md)
- announcements log → [announcements.md](./announcements.md)
- interpretive narrative → [narrative.md](./narrative.md)

## Handoff summary

Reply with:

1. **Path created**
2. **Whether the work was written to `inbox/` or `content/`**
3. **What was filled in `entity.yaml`**
4. **What remains to do** — financials, business, announcements, narrative, and `company_index.yaml` if applicable

## Checklist

- [ ] Target path is correct and matches user authorization (`inbox/` by default; `content/` only if explicitly approved)
- [ ] Company folder copied from `content/_meta/companies/_example/`
- [ ] `slug` in `entity.yaml` matches folder name
- [ ] `entity.yaml` uses official / primary sources only
- [ ] `links.press_releases_index` added only when the official URL is known
- [ ] No silent overwrite of an existing company path
- [ ] `content/_meta/company_index.yaml` left untouched unless the user explicitly asked
