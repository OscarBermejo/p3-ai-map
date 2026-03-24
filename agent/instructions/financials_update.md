# Agent instructions: update & validate company financials

Use this flow when the user wants to **refresh quarter YAMLs**: **validate numbers already present**, **fill `null` metrics where primaries allow**, and **tighten citations**. Good as a **second pass** with a capable model (e.g. re-read SEC filings, cross-check units and periods).

**Normative rules** (periods, cash flow vs P&L, direct vs API vs derived, provenance lead-ins) live in [financials.md](./financials.md) and [sources.md](./sources.md). This file is the **runbook**; do not duplicate those rules—**follow them**.

## When to use

- User says e.g. “update financials”, “fill nulls”, “validate IREN quarters”, “audit `financials/*.yaml`”.
- After an initial scrape from `data.sec.gov` company facts, to **align with filing tables** and **add missing quarter columns**.

## Where to read first

1. [financials.md](./financials.md) — quarter shape, flow metrics, filling order, **`Direct from SEC filing:`** / **`From SEC company facts API (XBRL):`** / **`Derived:`**.
2. [sources.md](./sources.md) — allowed evidence, derived figures, quarter YAML provenance.
3. [financials_sec_xbrl_concepts.md](./financials_sec_xbrl_concepts.md) — optional **company-concept** API tag ladder and YTD-diff recipe for focused fills.
4. Company **`financials/README.md`** — fiscal calendar and filename pattern for that issuer.

## Scope & write permissions

- **Standard run (default):** **only edit files under `inbox/`** — e.g. `inbox/proposals/<date>/companies/<slug>/financials/*.yaml`. This playbook is meant for **proposals and drafts**, not canonical map data.
- **`content/` is off limits** unless the user **explicitly** says to update **approved / canonical** data (e.g. “apply to `content/companies/iren/financials/`” or “merge proposal to content”). If the user does not clearly authorize **`content/`** edits, **do not** write there; report findings in chat or only change `inbox/`.
- Do **not** edit **`content/_meta/companies/_example/`** as if it were issuer data.
- Skip **`_template.quarter.yaml`** unless the user asks to change the template.

## Inputs (confirm if missing)

- **Target directory** — must be under **`inbox/`** unless the user has explicitly allowed **`content/`**; e.g. `inbox/proposals/20260322/companies/iren/financials/`.
- **CIK / links** — use `entity.yaml` in the same company folder (`links.sec_cik`, `links.investor_relations`) to find filings.
- **Which files** — all `FY*.yaml` / `YYYY-Qn.yaml` in that folder, excluding `_template.quarter.yaml`, unless the user limits scope.

## Pass A — Validate existing non-`null` metrics

Confirm the file’s **`metrics:`** key set matches **`content/_meta/companies/_example/financials/_template.quarter.yaml`** (same keys as [financials.md](./financials.md) “Standard `metrics:` keys”). If keys are missing or extra, align the YAML before deeper validation.

For each quarter file and each **non-`null`** entry under `metrics:`:

1. **Period fit** — Confirm the metric matches **`period.start` / `period.end`** (flow) or **`period.end`** (instant), per [financials.md](./financials.md). Flag if a value looks like YTD or six months in a single-quarter file.
2. **Re-verify primary** — Using SEC EDGAR (filing HTML/iXBRL and/or `data.sec.gov` company facts), re-obtain the same line item for the **same dates**. Compare to YAML (watch **$ thousands** vs whole dollars, share units).
3. **Sources** — Check that at least one `sources[]` entry **clearly supports** that metric and uses the correct provenance lead-in (**`Direct from SEC filing:`** vs **`From SEC company facts API (XBRL):`** vs **`Derived:`**). Fix misleading wording (e.g. claiming “direct from filing” when only the API was used).
4. **Mapping** — Per [financials.md](./financials.md), each **non-null** metric must appear in **`covers`** on ≥1 row; **derived** inputs use **`supports_derivation_of`**; each **`null`** metric must have a **`documentation`** row with **`covers`** and why.
5. **Record** — Note each metric as **ok**, **corrected**, **discrepancy (needs human)**, or **could not verify** (with reason).

## Pass B — Fill `null` metrics

For each **`null`** under `metrics:` (respecting template keys):

1. Apply the **order** in [financials.md](./financials.md) (“Filling flow metrics when data is incomplete”): **direct quarter column in the filing** → **safe contiguous derivation** → **`null` + explanation** in `sources`.
2. For **balance sheet** gaps, check whether the instant exists in company facts or the filing; use **`null`** only when still not available.
3. Every new number gets **`sources`** with correct lead-in, **`covers`** / **`supports_derivation_of`** as needed, and **`retrieved_at`** (ISO date of this run).
4. Every remaining **`null`** gets a **`documentation`** row with **`covers: [metric]`** and the reason.

## Pass C — Provenance sweep

- Scan all `sources[].description` strings in touched files; align with [financials.md](./financials.md) (“Provenance in `sources`”).
- Verify **`covers` / `supports_derivation_of`** completeness for every metric key.
- Remove duplicate URLs if helpful, but **do not** merge descriptions in a way that hides whether a figure came from the **filing table** vs **API** vs **derivation**.

## Output — Handoff summary

Reply (or append a short `README` snippet in the proposal folder **only if the user asks**) with:

1. **Files touched** — list paths.
2. **Validation** — table or bullets: metric → status (ok / fixed / human review).
3. **Newly filled** — metric, value, one-line provenance.
4. **Still `null`** — metric, one-line reason.
5. **Open issues** — e.g. filing access blocked, ambiguous line items, restatements.

## Checklist before you finish

- [ ] Read [financials.md](./financials.md) and respected period + cash flow rules.
- [ ] Pass A done for non-`null` metrics; mismatches flagged or fixed.
- [ ] Pass B done for `null`s where primaries support a value (including extended P&L, cash-flow, and balance-sheet keys); remaining `null`s explained in `sources`.
- [ ] Provenance lead-ins correct; no false “direct from filing” for API-only data.
- [ ] **`covers` / `supports_derivation_of`** and **`documentation`** rows for **`null`**s per [financials.md](./financials.md).
- [ ] **Writes only under `inbox/`** unless the user **explicitly** authorized **`content/`** edits.
- [ ] Summary delivered to the user.

## Tools

Use terminal / `curl` (with an acceptable SEC User-Agent), `data.sec.gov` APIs, and **browser or filing HTML** when company facts omit a quarter. Prefer opening the **primary document** linked from the filing index when validating cash flow columns.

**Automated checks:** `scripts/validate_values_file.py` (read-only; `pip install -r scripts/requirements.txt`) — quarter YAML **or** `business/business.yaml`, auto-detected by root keys. For `--verify-sec`, set e.g. `export SEC_EDGAR_USER_AGENT='p3-ai-map-validator/1.0 (obermejo@live.com)'` per [SEC fair access](https://www.sec.gov/os/accessing-edgar-data).

**Extended / health metrics from structured SEC data:** use **[financials_sec_xbrl_concepts.md](./financials_sec_xbrl_concepts.md)** in **narrow agent runs** (fetch `companyconcept` JSON with a proper **`User-Agent`**, apply tag ladder and fiscal YTD rules, emit `sources` per [financials.md](./financials.md)). Reconcile against filing tables when the API is sparse or wrong.
