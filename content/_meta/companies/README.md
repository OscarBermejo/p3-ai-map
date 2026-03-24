# Companies (folder layout)

Canonical path: **`content/companies/<slug>/`**. Proposals use the same shape under **`inbox/proposals/<date>/companies/<slug>/`**.

**Which layer** a company belongs to is recorded in [`../company_index.yaml`](../company_index.yaml) (human-maintained), not in the folder path. Valid layer ids are in [`../layers.yaml`](../layers.yaml).

## Scaffold

**`./_example/`** is the **only** structural template. It is **not** a real company.

To add a company (canonical):

1. Copy `_example/` → `content/companies/<slug>/` (kebab-case `slug`; folder name must match `slug` in `entity.yaml`).
2. Fill `entity.yaml` and `financials/` per below.
3. Add `{ slug, layer }` to `content/_meta/company_index.yaml`.

To propose a company (before merge):

1. Copy `_example/` → `inbox/proposals/<YYYY-MM-DD>/companies/<slug>/`.
2. Fill files there; **do not** write canonical `content/companies/<slug>/` until the user approves a merge.

## Expected shape per company

```text
content/companies/<slug>/
├── entity.yaml
├── business/
│   └── business.yaml             # optional; layer-specific profile (see ../business_templates/)
└── financials/
    ├── README.md                 # fiscal calendar + naming rules for this issuer
    ├── _template.quarter.yaml    # optional stencil; remove when unused
    └── YYYY-Qn.yaml              # one file per tracked quarter
```

Layer-specific **business** templates (capacity, contracts, platform, etc.) live in [`../business_templates/`](../business_templates/).

## `entity.yaml` — `links`

- **`investor_relations`**: main IR landing page.
- **`press_releases_index`** (optional): official **news / press releases** listing or **investor hub** URL on the company domain. Agents use it to **discover** primaries in **newest-first** order; each fact in `business/business.yaml` or `financials/*.yaml` should still cite the **specific** release, PDF, or filing. See [`../../agent/instructions/sources.md`](../../agent/instructions/sources.md) (“Official IR news / hub index”).

Other keys (e.g. **`sec_cik`**) stay as you maintain them today.

## Entry point

See also [`../../companies/README.md`](../../companies/README.md) under `content/companies/`.
