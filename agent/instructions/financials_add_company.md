# Agent instructions: add a new company

Use this flow when the user asks to **add a company to the map**. Goal: **accurate, sourced data** in the **correct file shape**, without writing new canonical data to **`content/`** until the user approves.

Also read: [sources.md](./sources.md) (evidence), [financials.md](./financials.md) (quarter files). For SEC **company-concept** tag mapping in focused runs, see [financials_sec_xbrl_concepts.md](./financials_sec_xbrl_concepts.md). Company tree shape: [`content/_meta/companies/README.md`](../../content/_meta/companies/README.md). For **`business/business.yaml`**, see [business_add_company.md](./business_add_company.md).

## Where proposals live

All new-company work goes under **`inbox/`**, mirroring the final `content/` layout:

```text
inbox/proposals/<YYYY-MM-DD>/companies/<slug>/
├── entity.yaml
└── financials/
    ├── README.md
    ├── _template.quarter.yaml   # keep until replaced by real quarter files
    └── YYYY-Qn.yaml             # as needed; each with sources[]
```

- **`<slug>`** — kebab-case (e.g. `iren`); folder name must match `slug` in `entity.yaml`.
- **`<YYYY-MM-DD>`** — proposal **run date** (use the date the user specifies, or **today** in a clear timezone if unspecified; state which you used in a short `README.md` or top comment in the proposal folder if helpful).

**Layer** on the value chain is **not** part of this path. The user records `slug` → `layer` in `content/_meta/company_index.yaml` when they merge a company into **`content/companies/<slug>/`** — you do not need to edit that file unless the user explicitly asks.

### Same slug + day again

If that path already exists, **do not overwrite silently**. Use a suffix, e.g. `2025-03-21-2` or `2025-03-21b`, or ask the user which draft to keep.

## Do not write canonical `content/` yet

- **Do not** create or fill `content/companies/<slug>/` for a **new** company unless the user explicitly says to **apply an approved proposal** or merge to `content/`.
- **`content/_meta/companies/_example/`** is only a template source — **never** edit it as if it were a real company.

## Step 1 — Scaffold the proposal tree

Create **`inbox/proposals/<date>/companies/<slug>/`** with the **same structure** as `content/_meta/companies/_example/`:

- Copy all files from `_example/` into the proposal path (including `financials/README.md` and `_template.quarter.yaml`).
- Set **`slug`** in `entity.yaml` to match the folder name.

If a **scaffold script** exists under `agent/tools/`, prefer running it when the user asks; otherwise perform the copy via the same layout as `_example/`.

## Step 2 — Fill `entity.yaml` (in the proposal folder)

- Populate identity fields (**`legal_name`**, **tickers**, **`summary`**, **`links`** such as IR and SEC CIK) using **primary sources** only — see [sources.md](./sources.md).
- Under **`links`**, set **`press_releases_index`** when you can identify the issuer’s official **press/news listing** or **investor hub** URL on the company domain; if unknown, leave **`""`** or omit the key — do not invent URLs. Same rules as **`investor_relations`** (primaries / official site only).
- Any **material fact** must be backed by citeable evidence; prefer putting **hard numbers** in `financials/*.yaml` rather than prose in `entity.yaml` unless the user asks otherwise.
- Unknown fields: leave empty or **`null`**; do not guess.

## Step 3 — Financials (in the proposal folder)

- Follow [financials.md](./financials.md): **`financials/README.md`** for fiscal calendar and naming; one **`YYYY-Qn.yaml`** (or fiscal equivalent) per period you add.
- **Template completeness:** Each quarter file must include **every** `metrics:` key from **`content/_meta/companies/_example/financials/_template.quarter.yaml`** (see [financials.md](./financials.md) “Standard `metrics:` keys”). For each key, either populate from **SEC primaries** (filing table and/or `data.sec.gov` company facts) with correct provenance, or set **`null`** and add **`kind: documentation`** + **`covers: [that_key]`** explaining why (not disclosed, wrong period, etc.). Do not omit keys.
- For **cash flow** and other **duration** metrics, follow **financials.md** (“Filling flow metrics when data is incomplete”): prefer the **three-month column** in the **cash flow statement**, then **contiguous YTD minus prior quarter** with dual citations if company facts omit the quarter, then **`null`** with an explanation.
- Every material metric needs **`sources`** (URL, kind, description, `retrieved_at`, optional excerpt). In **`description`**, state whether the figure is **`Direct from SEC filing:`** vs **`From SEC company facts API (XBRL):`** vs **`Derived:`** — see [financials.md](./financials.md) (“Provenance in `sources`”). Set **`covers`** / **`supports_derivation_of`** per [financials.md](./financials.md) (“Source ↔ metric mapping”); for **`null`** metrics, add **`kind: documentation`** with **`covers`** and why.
- **Extended / health metrics (liquidity, leverage, extra P&L lines):** The quarter template already includes keys such as **`current_assets`**, **`current_liabilities`**, **`investing_cash_flow_net`**, **`financing_cash_flow_net`**, **`long_term_debt`**, **`current_portion_of_long_term_debt`**, **`interest_expense`**, **`research_and_development`**, **`selling_general_administrative`**, **`stock_based_compensation`**, **`income_tax_expense_benefit`**, **`depreciation_and_amortization`**. After each quarter file has a **`sec_companyfacts_json`** row whose URL embeds the issuer **CIK**, use **[financials_sec_xbrl_concepts.md](./financials_sec_xbrl_concepts.md)** in **small, targeted agent passes** (per quarter or per metric group) to pull **`data.sec.gov` company-concept** JSON where it matches **`period`**; then run **`scripts/validate_values_file.py`**. Prefer **filing tables** when concepts are missing (e.g. comparative **`period.end`** in calendar-prior year, or weak USD facts for some FPIs). Leave remaining **`null`**s documented per [financials.md](./financials.md).
- Remove or keep **`_template.quarter.yaml`** per user preference; if kept, do not treat it as reported data.

## Step 4 — Handoff for human review

- Tell the user the **exact proposal path** and a short **checklist** of what you added.
- Remind them: **validate** (URLs load, numbers match source, YAML shape matches `_example`) then **merge** into `content/companies/<slug>/` when satisfied, and **add** `{ slug, layer }` to `content/_meta/company_index.yaml` if not already present.

## Checklist before you finish the task

- [ ] Proposal path follows `inbox/proposals/<date>/companies/<slug>/` and mirrors `_example/`.
- [ ] `slug` in `entity.yaml` matches the folder name.
- [ ] No unauthorized writes under `content/` for this new company.
- [ ] Facts cited per [sources.md](./sources.md); financials per [financials.md](./financials.md) (all template `metrics:` keys present; `null`s documented); for US SEC filers, extended metrics addressed per Step 3 and [financials_sec_xbrl_concepts.md](./financials_sec_xbrl_concepts.md) where applicable.
- [ ] Collisions on same date handled (suffix or user asked).
- [ ] **`links.press_releases_index`** set when the official news/hub URL is known, or left empty if not.
