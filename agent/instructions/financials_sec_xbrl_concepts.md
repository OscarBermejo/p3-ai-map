# Agent instructions: SEC XBRL company-concept API (optional playbook)

Use this file when you are filling **US SEC filer** quarter YAML from **`data.sec.gov`** using the **per-tag** JSON API (company **concept**), in **focused agent runs** with minimal context.

**Normative rules** (period discipline, provenance lead-ins, `covers` / `supports_derivation_of`, when to prefer filing tables) stay in [financials.md](./financials.md) and [sources.md](./sources.md). This document is a **mechanical recipe** only: tag names, URLs, date logic, and citation shape. If the **filing table** disagrees with the API, **trust the filing** and fix the YAML. When you use this API as a **gap-fill step**, treat one **concept pull** (or one tight batch of tags for the same quarter) as a **source step** in [financials.md](./financials.md) — **write YAML + `sources` before** the next tag or exhibit.

## When to use

- You already have **`period.start` / `period.end`** and a **`sec_companyfacts_json`** row whose `url` contains **`CIK##########`** (ten digits).
- You want to populate **extended liquidity / leverage / P&L-line** metrics (see § Metrics) from structured facts **without** a repo script.
- **Prefer filing-first** for comparative / historical **`period.end`** dates when company facts are sparse (see [financials.md](./financials.md) — comparative columns).

## SEC fair access

Set a descriptive **`User-Agent`** on every HTTP request (contact info). Example:

`export SEC_EDGAR_USER_AGENT='p3-ai-map/1.0 (you@example.com)'`

Policy: [SEC fair access](https://www.sec.gov/os/accessing-edgar-data). Throttle requests (e.g. ~0.1–0.2 s between concept URLs).

## Inputs from the quarter YAML

1. **`period.start`**, **`period.end`** (ISO dates) — flow metrics use both; **instant** metrics use **`period.end`** as balance-sheet date.
2. **CIK** — parse from any `sources[]` row with `kind: sec_companyfacts_json` and `url` matching `CIK(\d{10})`. Normalize to integer (strip leading zeros for math; **URL path uses 10-digit zero-padded** `CIK`).
3. **`slug`** — folder name `…/companies/<slug>/financials/…` (for fiscal-year start rule).
4. **Preferred accession (optional)** — from the first `sec_10q` / `sec_10k` / `sec_6k` context row: extract `accession NNNNNNNNNN-NN-NNNNNN` from `description`. When choosing among duplicate facts for the same date, **prefer this accession**; if none match, use the fact with the **lexicographically greatest** `accn` (tie-break).

## Company-concept endpoint

For taxonomy `T` and tag `TagName`:

`https://data.sec.gov/api/xbrl/companyconcept/CIK{cik_padded_10}/{T}/{TagName}.json`

Use the **`units.USD`** array (ignore other units unless the quarter file’s reporting currency differs). Each item has at least **`end`**, **`val`**, **`accn`**; duration facts also have **`start`**.

- **Instant-style facts:** `start` absent or you treat point-in-time as **`end` == balance-sheet date** (prefer rows where `start` is absent for pure instants).
- **Duration facts:** both **`start`** and **`end`** present; must match the quarter or YTD span you use.

## Fiscal year start for YTD math

Used only for **fiscal YTD difference** (see below).

| Condition | Fiscal year start |
|-----------|-------------------|
| **`slug` is `iren`** and `period.end.month >= 7` | July 1 of `period.end.year` |
| **`slug` is `iren`** and `period.end.month < 7` | July 1 of `period.end.year - 1` |
| **Any other `slug`** | January 1 of `period.end.year` |

Let **`fys`** = that fiscal start date.

**Fiscal first quarter:** if `period.start == fys`, do **not** derive flow metrics via YTD difference (no prior slice in the same fiscal year). Use **exact** quarter duration only, or **`null`** + documentation.

## Choosing facts

### Instant at `period.end`

1. Collect USD facts where **`end` == `period.end`** (and prefer rows with no `start` for balance-sheet tags).
2. If **preferred accession** is set, pick a fact whose **`accn`** matches it.
3. Else pick the fact with **maximum** **`accn`** string.

If no row matches, the metric is **missing** in concepts for that date.

### Exact flow for `period.start` → `period.end`

Collect facts where **`start` == `period.start`** and **`end` == `period.end`**. Prefer preferred accession, else first candidate.

### Fiscal YTD difference (when exact quarter missing)

Requires **`period.start > fys`** (not fiscal Q1).

Let **`long`** = fact for **`start=fys`**, **`end=period.end`**.  
Let **`short`** = fact for **`start=fys`**, **`end=period.start − 1 day`**.

**Quarter value** = `long.val - short.val` (same tag, contiguous spans).

**`sources`:** one **`Derived:`** row with **`covers: [<metric>]`** naming the tag and both spans + accessions; two **`From SEC company facts API (XBRL):`** rows with **`supports_derivation_of: [<metric>]`** only (no `covers`) for **long** and **short** inputs.

### Flow resolution order (per metric / tag set)

1. Try **exact** quarter (`period.start`–`period.end`).
2. Else if **not** fiscal first quarter, try **YTD difference** as above.
3. Else **missing** → leave **`null`** and document, or use the **filing** per [financials.md](./financials.md).

## Tag ladder: `metric_key` → XBRL

Use **first tag list that returns facts** for tries marked “try in order”. Taxonomy is **`us-gaap`** unless noted.

| `metrics` key | Tags / rule |
|---------------|-------------|
| `current_assets` | `AssetsCurrent` |
| `current_liabilities` | `LiabilitiesCurrent` |
| `investing_cash_flow_net` | `NetCashProvidedByUsedInInvestingActivities` |
| `financing_cash_flow_net` | `NetCashProvidedByUsedInFinancingActivities` |
| `current_portion_of_long_term_debt` | Try instants at `period.end`, **first non-zero**: `LongTermDebtCurrent`, `DebtCurrent`, `ShortTermBorrowings`, `CommercialPaper`, `SecuredDebtCurrent`, `UnsecuredDebtCurrent`, `ConvertibleNotesPayableCurrent` |
| `long_term_debt` | Try: `LongTermDebtNoncurrent`, then `LongTermDebt` (instant at `period.end`). **If still missing and `slug` is `iren`:** derive **`ConvertibleLongTermNotesPayable` + `FinanceLeaseLiability`** at `period.end` (one **`Derived:`** `covers` row; two API input rows **`supports_derivation_of: [long_term_debt]`**). |
| `interest_expense` | Try: `InterestExpense`, `InterestExpenseDebt`; then **`ifrs-full`**: `FinanceCosts` |
| `research_and_development` | Try: `ResearchAndDevelopmentExpense`, `ResearchAndDevelopmentExpenseSoftwareExcludingAcquired` |
| `selling_general_administrative` | `SellingGeneralAndAdministrativeExpense` |
| `stock_based_compensation` | `ShareBasedCompensation` |
| `income_tax_expense_benefit` | `IncomeTaxExpenseBenefit` |
| `depreciation_and_amortization` | Try: `DepreciationDepletionAndAmortization`, `DepreciationAndAmortization` |

**`kind` / `url` for new rows:** use **`sec_companyfacts_json`** and  
`https://data.sec.gov/api/xbrl/companyfacts/CIK{cik_padded_10}.json`  
unless you are citing a different anchor URL (validator allows reuse).

**Description lead-ins:** **`From SEC company facts API (XBRL):`** for raw facts; **`Derived:`** for YTD diffs and IREN long-term debt sum. Include **tag name**, **USD amount**, **start/end** or **instant end**, **accession**.

## Issuers with weak USD concepts

Some foreign private issuers (e.g. **`nebius`**) often lack **recent USD** quarter facts in this API. Prefer **exhibit HTML / filing tables** and **`Direct from SEC filing:`**; do not assume concepts will populate.

## After filling: documentation row for remaining `null`s

If several extended metrics stay **`null`** after you applied this playbook and the filing, you may use **one** consolidated `documentation` row listing all still-null keys (see keys below) with a short reason — or **separate** `documentation` rows per [financials.md](./financials.md).

**Keys often audited together** (subset of extended template; align with your quarter file’s needs):

`research_and_development`, `selling_general_administrative`, `depreciation_and_amortization`, `interest_expense`, `interest_income`, `other_income_expense_net`, `income_tax_expense_benefit`, `stock_based_compensation`, `investing_cash_flow_net`, `financing_cash_flow_net`, `current_assets`, `current_liabilities`, `property_plant_equipment_net`, `long_term_debt`, `current_portion_of_long_term_debt`

Use wording such as: **`Extended template metrics null: not available from SEC company facts for this period using the tag ladder in financials_sec_xbrl_concepts.md — reconcile to the primary filing or expand tag mapping.`**

## Checklist

- [ ] [financials.md](./financials.md) period and provenance rules satisfied.
- [ ] CIK and dates taken from the quarter file; accession preference applied when duplicates exist.
- [ ] Each non-null metric has **`covers`** on the API or **`Derived:`** row; inputs use **`supports_derivation_of`** only.
- [ ] Run **`scripts/validate_values_file.py`** on the edited YAML.

## Related

- [financials.md](./financials.md) — quarter shape, filing-first order, `covers` / `documentation`.
- [financials_workflows.md](./financials_workflows.md) — new company quarter creation and existing-quarter validation workflows.
