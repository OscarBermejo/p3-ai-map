# Agent instructions: financial data

For **which URLs count as proof**, use [sources.md](./sources.md) first.

## Scope

- **In scope:** Metrics in `financials/<period>.yaml` — the **full key set** in `_template.quarter.yaml` (P&L, cash flows, balance sheet, capital/market). Validator and new quarter files expect **every** template key present; use **`null`** + **`documentation`** when a line is not disclosed.
- **Elsewhere unless asked:** narrative and ops mostly in `entity.yaml` — still cite per [sources.md](./sources.md) if you add numbers there.

## Where files live

| What | Path |
|------|------|
| Layer ids (value chain) | `content/_meta/layers.yaml` |
| Slug → layer (canonical) | `content/_meta/company_index.yaml` (human-maintained; agent does not need to edit) |
| Scaffold | `content/_meta/companies/_example/` |
| Company (canonical) | `content/companies/<slug>/` |
| Company (proposal) | `inbox/proposals/<date>/companies/<slug>/` |
| Profile | `entity.yaml` |
| Quarters | `financials/<period>.yaml` |
| Quarter template | `content/_meta/companies/_example/financials/_template.quarter.yaml` |
| Issuer hints (CIK, FY) | `…/companies/<slug>/financials/README.md` (same relative path under content or inbox) |

Resolve **`<slug>`** from the user or by search; ask if ambiguous.

## Quarter YAML

- Every **material number** needs **`sources`** entries as in [sources.md](./sources.md).
- Unknowns → **`null`**, not guesses.
- Filenames: default **`YYYY-Qn.yaml`**; fiscal pattern (e.g. `FY2026-Q1.yaml`) only if `financials/README.md` defines it.
- Copy shape from `_template.quarter.yaml`; set **`currency_reporting`**.

### Standard `metrics:` keys (must match the template)

Use **exactly** these keys (order in YAML is flexible; the validator checks the set):

| Group | Keys |
|-------|------|
| **Income statement (flow)** | `revenue`, `cost_of_revenue`, `gross_profit`, `research_and_development`, `selling_general_administrative`, `depreciation_and_amortization`, `operating_income`, `interest_expense`, `interest_income`, `other_income_expense_net`, `income_tax_expense_benefit`, `net_income` |
| **Cash flows (flow)** | `operating_cash_flow`, `stock_based_compensation`, `capital_expenditures_cash`, `investing_cash_flow_net`, `financing_cash_flow_net` |
| **Balance sheet (instant at `period.end`)** | `cash_and_equivalents`, `current_assets`, `current_liabilities`, `property_plant_equipment_net`, `total_assets`, `total_liabilities`, `long_term_debt`, `current_portion_of_long_term_debt`, `total_debt`, `stockholders_equity` |
| **Capital / market** | `shares_outstanding_basic`, `shares_outstanding_diluted`, `market_cap` |

**Notes**

- **`depreciation_and_amortization`**: use the **income statement** line when the filing breaks it out there; if it appears **only** in the cash-flow reconciliation, you may still cite that reconciliation for the **same quarter duration** with a clear **`Direct from SEC filing:`** description, or use **`null`** + documentation if you cannot match period safely.
- **`income_tax_expense_benefit`**: store **as reported** (benefit often negative in filing convention).
- **`stock_based_compensation`**: typically from the **operating** section of the cash flow statement or the reconciliation block (same flow period as the quarter).
- **Debt split**: `long_term_debt` and `current_portion_of_long_term_debt` should align with filing labels; `total_debt` may still be a separate **Derived:** sum when the filing defines it that way — cite inputs per [sources.md](./sources.md).

### Provenance in `sources` (must be obvious in the quarter file)

Readers should see **immediately** whether a figure came **straight from the filing document** vs **only from structured SEC data** vs **derived**.

In each relevant **`sources[].description`** (or a dedicated entry for that metric), use a clear **lead-in**:

| How the number was obtained | Use a description that starts like… | Include… |
|-----------------------------|-------------------------------------|----------|
| **Read from the SEC filing** (HTML/iXBRL/PDF table—the primary document humans open) | `Direct from SEC filing:` | Form (10-Q/10-K), accession or primary doc URL already in `url`, **statement name** (e.g. condensed consolidated statements of cash flows), **line item** as labeled in the filing, **column** (e.g. three months ended YYYY-MM-DD), and **units** if not obvious (e.g. $ thousands → note conversion to YAML). |
| **Taken from `data.sec.gov` company facts** (XBRL JSON, no table read) | `From SEC company facts API (XBRL):` | US-GAAP (or other) **tag**, **amount**, **start/end** or **instant** date, **accession**. |
| **Arithmetic on primaries** | `Derived:` | Formula, periods, and point to **both** inputs (see [sources.md](./sources.md)). |

You may reuse one `url` for several `sources` rows if needed; **split descriptions** so each material metric’s origin is still clear. Do not imply “from the filing table” if the value was **only** pulled from the company-facts API.

### Source ↔ metric mapping (`covers`, `supports_derivation_of`)

Each object in **`sources[]`** may include:

| Field | Type | Meaning |
|-------|------|--------|
| **`covers`** | list of strings | **Metric keys** from `metrics:` for which this row is the **primary** citation (the reported value is this fact, or the **single `Derived:`** row that states the formula for that metric). |
| **`supports_derivation_of`** | list of strings | This row is an **input** to a **derived** metric (e.g. six-month cash flow used to compute quarterly cash flow). Do **not** use `covers` on pure inputs—use **`supports_derivation_of`** only. |

**Rules**

- Every **non-null** metric key in `metrics:` must appear in **`covers`** on **at least one** `sources[]` row (either a direct/API fact or the one **`Derived:`** row for that metric).
- For **derived** metrics (`gross_profit` from revenue − cost, cash flow from YTD − prior quarter, `total_debt` from sum of tags): **one** row with **`covers: [that_metric]`** and a **`Derived:`** description; **each input** row lists **`supports_derivation_of: [that_metric]`**.
- **`revenue`**: the revenue fact row uses **`covers: [revenue]`** and may also use **`supports_derivation_of: [gross_profit]`** when `gross_profit` is derived from revenue and cost.
- **`cost_of_revenue`**: prefer **`covers: [cost_of_revenue]`** on the primary **CostOfRevenue** (or equivalent) fact row. That same row **may** also use **`supports_derivation_of: [gross_profit]`** when `gross_profit` is **Derived:** as revenue − cost. If `cost_of_revenue` stays **`null`** but you still derive `gross_profit`, a **CostOfRevenue** input row may use **`supports_derivation_of: [gross_profit]`** only (no `covers`), same as before.
- **Context-only** rows (filing index, IR hub): **omit** `covers` and `supports_derivation_of` (they do not attest a metric value).
- **`null` metrics**: add **at least one** row with **`covers: [that_metric]`**, **`kind: documentation`**, a **short reason** in **`description`** (why not populated / not applicable), **`retrieved_at`**, and **`url`** pointing to a **relevant primary** (filing index or company facts JSON is fine as an anchor).

### Period discipline

- **`period.start` / `period.end`** define the quarter. Every **flow** metric (all income-statement lines above, **operating_cash_flow**, **stock_based_compensation**, **capital_expenditures_cash**, **investing_cash_flow_net**, **financing_cash_flow_net**) must match that **exact** duration unless the template explicitly allows something else.
- **Instant** metrics (balance sheet, quarter-end cash) use **`period.end`** as the balance-sheet date.
- Do **not** put a **six-month** or **year-to-date** total into a **single-quarter** field. If only YTD exists in structured data, use **`null`** or obtain the true quarter via the options below.

### Income statement vs. cash flows

- **`operating_income`** comes from the **statement of operations** (accrual): operating income / loss.
- **`operating_cash_flow`**, **`investing_cash_flow_net`**, and **`financing_cash_flow_net`** come from the **statement of cash flows** (and filing subtotals as labeled) — **sign as filed** for those net lines.
- **`capital_expenditures_cash`** — cash **paid** for property, plant, and equipment (or the filing’s labeled equivalent line for the **same** flow period). Store as a **non-negative** number (magnitude of outflow). If the filing or XBRL shows the payment as **negative**, **flip the sign** in YAML so every issuer uses the same convention (see `_template.quarter.yaml`).
- **`stock_based_compensation`** is usually a reconciliation line under operating cash flows — same **flow** period as the quarter.
- Do not infer cash flow from the income statement alone.

### Filling flow metrics when data is incomplete (accuracy-first)

Goal: **as complete as possible** without mislabeling periods. Apply in **order**; stop when you have a defensible value.

1. **Direct quarter column (best)**  
   From the **Form 10-Q / 10-K** (HTML or iXBRL), read the line for the metric using the column **“Three months ended …”** (or the fiscal equivalent) that matches **`period.end`**.  
   Cite the filing URL (e.g. primary document on the filing index) and document kind `sec_10q` / `sec_10k`. Normalize units (e.g. **$ thousands** in the filing → full dollars in YAML if that is the repo convention).

2. **Derived from consecutive primaries (good, when explicit)**  
   If the **exact quarter** is not in `data.sec.gov` company facts but **both** of these exist from **SEC primaries** for the **same line concept**:  
   - **YTD** cash flow for a span that **ends** on `period.end`, and  
   - **YTD** or **single-quarter** cash flow for the span that **ends** on the **prior quarter** date,  
   then **quarter = later span − earlier span** (contiguous periods only).  
   Example: six months ended Dec 31 **minus** three months ended Sep 30 **=** three months ended Dec 31.  
   **Requirements:** same statement (e.g. both “net cash from operating activities”), same currency/units after conversion, contiguous dates. In **`sources`**, state clearly that the value is **derived**, and cite **both** inputs (e.g. two company-facts descriptions or filing table locations). See [sources.md](./sources.md) on derived figures.

3. **Leave `null` + explain (required when 1 and 2 are not safe)**  
   If there is no quarter column, no safe derivation, or line items are not comparable, use **`null`** and add a **`sources`** entry explaining why (e.g. “company facts only tags six-month duration for this accession; quarterly column not extracted”).

**`data.sec.gov` company facts** is convenient but **incomplete** for some durations; prefer **(1)** or **(2)** over leaving fields empty when the **human-readable** filing clearly contains the quarter.

### Source processing order and incremental writes (agents)

Use this so quarter files **gain durable progress** during a run: **process primaries in a fixed priority order**, and **write the YAML after each source** instead of only at the end.

**What counts as one source step**

One **primary document** you extract from in a single pass — typically **one exhibit URL** (one `.htm` / PDF on a filing), or **one structured API response** you treat as a batch (e.g. one `companyconcept` tag pull). If you open **99.1** and then **99.2**, that is **two** steps; **save the quarter YAML between them**.

**Default order** (adapt to the issuer; skip steps that do not exist)

1. **`financials/README.md`** and **`entity.yaml`** — fiscal pattern, CIK, how the issuer files (e.g. **6-K** vs **10-Q**). Use this to pick the **accession** whose period covers **`period.end`**.
2. **Filing index** for that accession — confirm exhibit list; optional **context-only** `sources` row (no `covers`).
3. **Primary earnings / results exhibit** when present — e.g. **Exhibit 99.1** on **Form 6-K**, or the **condensed statements / MD&A tables** in **10-Q** that show **three months ended** matching **`period.end`**. Usually best for **P&L**, summary KPIs, and sometimes partial cash-flow snippets.
4. **Full financial statements** — e.g. **Exhibit 99.2** (6-K), or the **complete** statement pages in **10-Q** / **10-K**. Prefer this for **balance sheet**, **full cash flow statement**, and anything **99.1** did not disclose.
5. **Further exhibits** on the **same** accession (e.g. **99.3**, **99.4**, …) **only if** a metric is still missing and the exhibit plausibly contains it.
6. **`data.sec.gov` company facts** or **`companyconcept`** — **after** filing tables, for **gaps only**, per “Filling flow metrics when data is incomplete” and [financials_sec_xbrl_concepts.md](./financials_sec_xbrl_concepts.md).
7. **Different accession** (prior quarter / prior YTD) — **only** for **contiguous derivations** explicitly allowed above (e.g. nine months minus six months); cite **both** inputs.

**After each source step**

- Update **`metrics:`** for every key you can populate **without breaking period rules** (flow vs instant; no YTD in a single-quarter field).
- In the **same edit**, add or adjust **`sources[]`**: correct lead-ins (**`Direct from SEC filing:`** / **`From SEC company facts API (XBRL):`** / **`Derived:`**), **`covers`** / **`supports_derivation_of`** / **`documentation`** per “Source ↔ metric mapping”.
- **Persist to disk** before opening the next URL or exhibit. Do not keep resolved numbers only in chat.
- If a metric is **already non-null** from an **earlier** step, **do not overwrite** unless you are **correcting an error** or a **later** document is clearly the **authoritative** restatement; if you replace, fix `sources` and say so in **`description`**.

**Validation**

Run **`scripts/validate_values_file.py`** on the quarter file **after** each source step that changed it, or at minimum **once** before you treat the file as finished.

### Optional: per-tag company-concept JSON (`companyconcept`)

The bulk **`companyfacts`** JSON is heavy; the SEC also exposes **one tag at a time** at  
`https://data.sec.gov/api/xbrl/companyconcept/CIK…/{taxonomy}/{Tag}.json`.  
For a **repeatable, agent-driven** way to map those responses into **`metrics`** (tag ladders, fiscal YTD difference, `covers` / `supports_derivation_of` wording), follow **[financials_sec_xbrl_concepts.md](./financials_sec_xbrl_concepts.md)**. It does **not** override filing-first rules above.

## Approval

Do **not** silently overwrite **`content/`** unless the user says to apply approved edits. Prefer **`inbox/`** or paste proposed files in chat.

## Checklist

- [ ] Company `financials/README.md` read (fiscal / bookmarks).
- [ ] Sources processed in **priority order** with **incremental YAML writes** after each exhibit/API step (“Source processing order and incremental writes (agents)”).
- [ ] Metrics from primaries per [sources.md](./sources.md).
- [ ] Flow metrics match `period.start`/`period.end` (no accidental YTD in a quarter file).
- [ ] Cash flow metrics taken from the **cash flow statement** (or valid derivation per above), not from the income statement.
- [ ] Quarter filename matches convention.
- [ ] `sources` on new/changed numbers (including derived figures, if any).
- [ ] Each description states **Direct from SEC filing** vs **SEC company facts API (XBRL)** vs **Derived**, per “Provenance in `sources`”.
- [ ] **`covers` / `supports_derivation_of`** set per “Source ↔ metric mapping”; every non-null metric has a `covers`; every `null` has a **`documentation`** row with `covers` and why.
