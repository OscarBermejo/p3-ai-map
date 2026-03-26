#!/usr/bin/env python3
"""
Validate YAML in three shapes (auto-detected per file):

  **Quarter financials** (`period` + `metrics`):
  Tier A — offline: structure, metric key set, covers / documentation for nulls,
           provenance lead-ins, and arithmetic replay for common derived patterns
           when amounts and dates can be parsed from descriptions.

  **Financial narrative** (`kind: financial_narrative` + `schema_version`):
  Tier A — structure, non-empty sections, top-level `sources` with allowed
  description lead-ins (interpretation track; not metrics).

  **Business profile** (`layer` + `profile_version`, e.g. business/business.yaml):
  Tier A — same ideas per *leaf*: each template leaf `{ value, notes, sources }`
           (plus `guidance.targets[]` / `deals_and_contracts.highlights[]` entries)
           must cite sources; optional `covers` / `kind: documentation` use the
           same rules as quarter files. File-level `sources[]` must omit covers.

  Tier B — optional (--verify-sec): fetch SEC company facts JSON (per CIK) and
           compare values for rows that cite the API with parseable US-GAAP tags.
           For business files, `period.end` for fallbacks is taken from top-level
           `as_of` when present.

Usage:
  pip install -r scripts/requirements.txt
  export SEC_EDGAR_USER_AGENT='p3-ai-map-validator/1.0 (obermejo@live.com)'   # required for --verify-sec
  python scripts/validate_values_file.py path/to/financials/*.yaml
  python scripts/validate_values_file.py path/to/companies/foo/business/business.yaml
  python scripts/validate_values_file.py path/to/companies/foo/narrative/narrative.yaml
  python scripts/validate_values_file.py path/to/financials/ --verify-sec

SEC fair access: https://www.sec.gov/os/accessing-edgar-data
"""

from __future__ import annotations

import argparse
import glob as glob_module
import json
import os
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

import yaml

# Metric keys expected in quarter files (must match _template.quarter.yaml).
EXPECTED_METRIC_KEYS: tuple[str, ...] = (
    "revenue",
    "cost_of_revenue",
    "gross_profit",
    "research_and_development",
    "selling_general_administrative",
    "depreciation_and_amortization",
    "operating_income",
    "interest_expense",
    "interest_income",
    "other_income_expense_net",
    "income_tax_expense_benefit",
    "net_income",
    "operating_cash_flow",
    "stock_based_compensation",
    "capital_expenditures_cash",
    "investing_cash_flow_net",
    "financing_cash_flow_net",
    "cash_and_equivalents",
    "current_assets",
    "current_liabilities",
    "property_plant_equipment_net",
    "total_assets",
    "total_liabilities",
    "long_term_debt",
    "current_portion_of_long_term_debt",
    "total_debt",
    "stockholders_equity",
    "shares_outstanding_basic",
    "shares_outstanding_diluted",
    "market_cap",
)

XBRL_PREFIX = "From SEC company facts API (XBRL):"
DERIVED_PREFIX = "Derived:"
DOC_NULL_PREFIXES = (
    "null:",
    " null:",  # after metric name
)


def _parse_usd_amount(chunk: str) -> int | None:
    """Parse first USD amount in chunk; parentheses imply negative (accounting style)."""
    m = re.search(
        r"USD\s*(\(([\d,]+)\)|(-?[\d,]+))",
        chunk,
    )
    if not m:
        return None
    if m.group(2):
        return -int(m.group(2).replace(",", ""))
    return int(m.group(3).replace(",", ""))


def _parse_tag_and_usd(desc: str) -> list[tuple[str, int]]:
    """Extract (US-GAAP tag, value) pairs: `TagName USD ...` (PascalCase tag)."""
    pairs: list[tuple[str, int]] = []
    for m in re.finditer(
        r"\b([A-Z][a-zA-Z0-9]+)\s+USD\s*(\(([\d,]+)\)|(-?[\d,]+))",
        desc,
    ):
        tag = m.group(1)
        if m.group(3):
            val = -int(m.group(3).replace(",", ""))
        else:
            val = int(m.group(4).replace(",", ""))
        pairs.append((tag, val))
    return pairs


def _parse_duration(desc: str) -> tuple[str, str] | None:
    m = re.search(
        r"start\s+(\d{4}-\d{2}-\d{2})\s+end\s+(\d{4}-\d{2}-\d{2})",
        desc,
    )
    if not m:
        return None
    return m.group(1), m.group(2)


def _parse_instant_end(desc: str) -> str | None:
    m = re.search(r"instant\s+end\s+(\d{4}-\d{2}-\d{2})", desc, re.I)
    if m:
        return m.group(1)
    m2 = re.search(r";\s*instant\s+(\d{4}-\d{2}-\d{2})", desc, re.I)
    return m2.group(1) if m2 else None


def _parse_accession(desc: str) -> str | None:
    m = re.search(r"accession\s+([0-9]{10}-\d{2}-\d{6})", desc, re.I)
    return m.group(1) if m else None


def _covers_set(src: dict[str, Any]) -> set[str]:
    c = src.get("covers")
    if c is None:
        return set()
    if not isinstance(c, list):
        return set()
    return {str(x) for x in c}


def _supports_set(src: dict[str, Any]) -> set[str]:
    s = src.get("supports_derivation_of")
    if s is None:
        return set()
    if not isinstance(s, list):
        return set()
    return {str(x) for x in s}


@dataclass
class Issue:
    path: Path
    message: str
    severity: str = "error"  # error | warn


@dataclass
class SecVerifyStats:
    """Populated when --verify-sec runs (stderr summary for the user)."""

    http_gets: int = 0
    sec_json_source_rows: int = 0
    skipped_wrong_lead_in: int = 0
    skipped_input_to: int = 0
    skipped_unparseable: int = 0
    skipped_unknown_cik_url: int = 0
    compared_ok: int = 0
    compared_no_matching_fact: int = 0
    compared_tag_not_in_facts: int = 0
    compared_val_mismatch: int = 0
    compared_no_val_in_row: int = 0

    def log_summary(self) -> None:
        parts = [
            f"{self.sec_json_source_rows} `sec_companyfacts_json` row(s) in YAML",
            f"{self.http_gets} HTTP GET to data.sec.gov (company facts JSON)",
        ]
        skipped = (
            self.skipped_wrong_lead_in
            + self.skipped_input_to
            + self.skipped_unparseable
            + self.skipped_unknown_cik_url
        )
        parts.append(f"{skipped} skipped (not API lead-in / input-to / no Tag+USD / no CIK in URL)")
        compared = (
            self.compared_ok
            + self.compared_no_matching_fact
            + self.compared_tag_not_in_facts
            + self.compared_val_mismatch
            + self.compared_no_val_in_row
        )
        parts.append(f"{compared} row(s) checked against live API")
        print("SEC verify summary: " + "; ".join(parts) + ".", file=sys.stderr)
        detail = (
            f"  matched OK: {self.compared_ok}; "
            f"no matching fact: {self.compared_no_matching_fact}; "
            f"tag missing in API: {self.compared_tag_not_in_facts}; "
            f"value mismatch: {self.compared_val_mismatch}; "
            f"API row without val: {self.compared_no_val_in_row}"
        )
        print(detail, file=sys.stderr)


def _load_yaml_doc(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if not isinstance(data, dict):
        raise ValueError(f"{path}: root must be a mapping")
    return data


def detect_yaml_profile(data: dict[str, Any]) -> str:
    """Return `financial_quarter`, `financial_narrative`, `business_profile`, or `unknown`."""
    if data.get("kind") == "financial_narrative" and "schema_version" in data:
        return "financial_narrative"
    if "metrics" in data and "period" in data:
        return "financial_quarter"
    if "layer" in data and "profile_version" in data:
        return "business_profile"
    return "unknown"


NARRATIVE_DESC_PREFIXES: tuple[str, ...] = (
    "Direct from SEC filing:",
    "From SEC company facts API (XBRL):",
    "Derived:",
    "Filing index:",
    "Primary source:",
)


def validate_financial_narrative(path: Path, data: dict[str, Any]) -> list[Issue]:
    """Interpretation file — not metrics; requires sections + bibliography."""
    issues: list[Issue] = []

    if data.get("kind") != "financial_narrative":
        issues.append(Issue(path, "`kind` must be `financial_narrative`"))
    sv = data.get("schema_version")
    if sv != 1:
        issues.append(
            Issue(path, f"`schema_version` must be 1 (got {sv!r})"),
        )

    as_of = str(data.get("as_of") or "").strip()
    if not as_of:
        issues.append(Issue(path, "`as_of` must be non-empty (ISO date: narrative review date)"))

    bof = data.get("based_on_financials")
    if not isinstance(bof, dict):
        issues.append(Issue(path, "`based_on_financials` must be a mapping"))
    else:
        if not str(bof.get("file") or "").strip():
            issues.append(Issue(path, "`based_on_financials.file` must point to a quarter file (e.g. financials/2025-Q4.yaml)"))
        if not str(bof.get("period_end") or "").strip():
            issues.append(Issue(path, "`based_on_financials.period_end` must be non-empty (ISO)"))

    sections = data.get("sections")
    if not isinstance(sections, list) or len(sections) == 0:
        issues.append(Issue(path, "`sections` must be a non-empty list"))
    elif isinstance(sections, list):
        section_ids: list[str] = []
        for i, sec in enumerate(sections):
            if not isinstance(sec, dict):
                issues.append(Issue(path, f"sections[{i}] must be a mapping"))
                continue
            for key in ("id", "title", "body"):
                if not str(sec.get(key) or "").strip():
                    issues.append(
                        Issue(path, f"sections[{i}].{key} must be non-empty"),
                    )
            sid = str(sec.get("id") or "").strip()
            if sid:
                section_ids.append(sid)
        if "conclusion" not in section_ids:
            issues.append(
                Issue(
                    path,
                    "sections must include one block with `id: conclusion` (answers central questions; see narrative.md)",
                ),
            )

    cq = data.get("central_questions")
    if cq is not None:
        if not isinstance(cq, list):
            issues.append(Issue(path, "`central_questions` must be a list of strings or be omitted"))
        else:
            for i, q in enumerate(cq):
                if not isinstance(q, str) or not str(q).strip():
                    issues.append(
                        Issue(path, f"central_questions[{i}] must be a non-empty string"),
                    )

    sources = data.get("sources")
    if not isinstance(sources, list) or len(sources) == 0:
        issues.append(Issue(path, "`sources` must be a non-empty list (narrative bibliography)"))
    elif isinstance(sources, list):
        for i, src in enumerate(sources):
            if not isinstance(src, dict):
                issues.append(Issue(path, f"sources[{i}] must be a mapping"))
                continue
            url = str(src.get("url") or "").strip()
            desc = str(src.get("description") or "").strip()
            if not url:
                issues.append(Issue(path, f"sources[{i}] must include `url`"))
            if not desc:
                issues.append(Issue(path, f"sources[{i}] must include non-empty `description`"))
                continue
            if not any(desc.startswith(p) for p in NARRATIVE_DESC_PREFIXES):
                issues.append(
                    Issue(
                        path,
                        f"sources[{i}] description should start with one of: "
                        + ", ".join(repr(p) for p in NARRATIVE_DESC_PREFIXES),
                    ),
                )

    dg = data.get("disclosure_gaps")
    if dg is not None and not isinstance(dg, str):
        issues.append(Issue(path, "`disclosure_gaps` must be a string or null/omitted"))

    return issues


def period_window_for_sec(data: dict[str, Any]) -> tuple[str, str]:
    """(start, end) for SEC verify fallbacks: quarter `period` or business `as_of` as end-only."""
    period = data.get("period")
    if isinstance(period, dict) and period.get("end"):
        return str(period.get("start", "")), str(period.get("end", ""))
    as_of = data.get("as_of")
    if as_of is not None and str(as_of).strip() and str(as_of).strip().lower() != "null":
        return "", str(as_of).strip().strip('"').strip("'")
    return "", ""


def validate_structure(path: Path, data: dict[str, Any]) -> list[Issue]:
    issues: list[Issue] = []
    for key in ("period", "currency_reporting", "metrics", "sources"):
        if key not in data:
            issues.append(Issue(path, f"missing top-level key `{key}`"))
    period = data.get("period")
    if isinstance(period, dict):
        for k in ("start", "end"):
            if not period.get(k):
                issues.append(Issue(path, f"period.{k} must be non-empty"))
    metrics = data.get("metrics")
    if not isinstance(metrics, dict):
        issues.append(Issue(path, "`metrics` must be a mapping"))
        return issues
    keys = set(metrics)
    exp = set(EXPECTED_METRIC_KEYS)
    if keys != exp:
        missing = sorted(exp - keys)
        extra = sorted(keys - exp)
        if missing:
            issues.append(Issue(path, f"metrics missing keys: {missing}"))
        if extra:
            issues.append(Issue(path, f"metrics unexpected keys: {extra}"))
    sources = data.get("sources")
    if not isinstance(sources, list):
        issues.append(Issue(path, "`sources` must be a list"))
    return issues


def validate_mapping(path: Path, data: dict[str, Any]) -> list[Issue]:
    issues: list[Issue] = []
    metrics: dict[str, Any] = data["metrics"]
    sources: list[Any] = data["sources"]
    if not isinstance(sources, list):
        return issues

    covers_union: set[str] = set()
    doc_covers: set[str] = set()

    for i, src in enumerate(sources):
        if not isinstance(src, dict):
            issues.append(Issue(path, f"sources[{i}] must be a mapping"))
            continue
        kind = src.get("kind", "")
        desc = str(src.get("description", "") or "")
        cov = _covers_set(src)
        sup = _supports_set(src)

        if kind == "documentation":
            if not cov:
                issues.append(
                    Issue(
                        path,
                        f"sources[{i}] kind=documentation should include `covers` for the null metric",
                    )
                )
            else:
                doc_covers |= cov
            if not desc.strip():
                issues.append(Issue(path, f"sources[{i}] documentation row has empty description"))
            continue

        covers_union |= cov
        # Revenue or cost_of_revenue may cover that metric and also support gross_profit derivation.
        allowed_dual = (
            cov == {"revenue"} and sup <= {"gross_profit"}
        ) or (cov == {"cost_of_revenue"} and sup <= {"gross_profit"})
        if cov and sup and not allowed_dual:
            issues.append(
                Issue(
                    path,
                    f"sources[{i}] has both `covers` and `supports_derivation_of` — allowed only for revenue/cost_of_revenue + gross_profit (see financials.md)",
                )
            )

    for key, val in metrics.items():
        if val is None:
            if key not in doc_covers:
                issues.append(
                    Issue(
                        path,
                        f"metric `{key}` is null but no `kind: documentation` row covers it",
                    )
                )
        else:
            if key not in covers_union:
                issues.append(
                    Issue(
                        path,
                        f"non-null metric `{key}` is not listed in any `sources[].covers`",
                    )
                )

    # documentation rows should only explain nulls (warn if extra)
    null_keys = {k for k, v in metrics.items() if v is None}
    stray_doc = doc_covers - null_keys
    if stray_doc:
        issues.append(
            Issue(
                path,
                f"documentation `covers` reference non-null metrics: {sorted(stray_doc)}",
                severity="warn",
            )
        )

    return issues


def validate_provenance(path: Path, data: dict[str, Any]) -> list[Issue]:
    issues: list[Issue] = []
    sources: list[Any] = data["sources"]
    if not isinstance(sources, list):
        return issues

    for i, src in enumerate(sources):
        if not isinstance(src, dict):
            continue
        kind = src.get("kind", "")
        desc = str(src.get("description", "") or "")
        cov = _covers_set(src)
        if kind == "documentation":
            if not any(p in desc for p in DOC_NULL_PREFIXES) and " null" not in desc.lower():
                issues.append(
                    Issue(
                        path,
                        f"sources[{i}] documentation description should state why the metric is null (e.g. `metric null: ...`)",
                        severity="warn",
                    )
                )
            continue

        if cov:
            ok = (
                desc.startswith("Direct from SEC filing:")
                or desc.startswith(XBRL_PREFIX)
                or desc.startswith(DERIVED_PREFIX)
            )
            if not ok:
                issues.append(
                    Issue(
                        path,
                        f"sources[{i}] row with `covers` should start with Direct from SEC filing: / From SEC company facts API (XBRL): / Derived:",
                    )
                )

        if kind in ("sec_10q", "sec_10k", "ir_portal"):
            if cov or _supports_set(src):
                issues.append(
                    Issue(
                        path,
                        f"sources[{i}] context kind `{kind}` should omit covers and supports_derivation_of",
                    )
                )
    return issues


def validate_arithmetic(path: Path, data: dict[str, Any]) -> list[Issue]:
    issues: list[Issue] = []
    metrics: dict[str, Any] = data["metrics"]
    sources: list[Any] = data["sources"]
    period = data.get("period") or {}
    pend = period.get("end") if isinstance(period, dict) else None
    if not isinstance(sources, list):
        return issues

    # gross_profit = revenue - cost_of_revenue, or revenue - CostOfRevenue from XBRL description
    gp = metrics.get("gross_profit")
    rev = metrics.get("revenue")
    cor_metric = metrics.get("cost_of_revenue")
    if gp is not None and rev is not None:
        if cor_metric is not None:
            expected = rev - cor_metric
            if expected != gp:
                issues.append(
                    Issue(
                        path,
                        "[arithmetic — gross_profit] `metrics.gross_profit` must equal "
                        "`metrics.revenue` minus `metrics.cost_of_revenue` when both revenue and "
                        f"cost_of_revenue are present. Computed: {rev} − {cor_metric} = **{expected}**; "
                        f"YAML has `metrics.gross_profit` = **{gp}**.",
                    )
                )
        else:
            cost_val: int | None = None
            for src in sources:
                if not isinstance(src, dict):
                    continue
                if "gross_profit" not in _supports_set(src):
                    continue
                desc = str(src.get("description", ""))
                if "CostOfRevenue" not in desc:
                    continue
                pairs = _parse_tag_and_usd(desc)
                for tag, val in pairs:
                    if tag == "CostOfRevenue":
                        cost_val = val
                        break
                if cost_val is not None:
                    break
            if cost_val is not None:
                expected = rev - cost_val
                if expected != gp:
                    issues.append(
                        Issue(
                            path,
                            "[arithmetic — gross_profit] `metrics.gross_profit` must equal "
                            "`metrics.revenue` minus **CostOfRevenue** (USD amount parsed from the "
                            "`sources[]` row that has `supports_derivation_of: [gross_profit]` and "
                            "mentions CostOfRevenue). "
                            f"Computed: {rev} − {cost_val} = **{expected}**; "
                            f"YAML has `metrics.gross_profit` = **{gp}**. "
                            "Fix the wrong field(s) or the CostOfRevenue source description if the parse is off.",
                        )
                    )

    def validate_ytd_minus_prior(
        metric_key: str,
        tag: str,
    ) -> None:
        mval = metrics.get(metric_key)
        if mval is None or not pend:
            return
        rows: list[tuple[tuple[str, str], int]] = []
        for src in sources:
            if not isinstance(src, dict):
                continue
            if metric_key not in _supports_set(src):
                continue
            desc = str(src.get("description", ""))
            if tag not in desc:
                continue
            dur = _parse_duration(desc)
            if not dur:
                continue
            amt = _parse_usd_amount(desc)
            if amt is None:
                pairs = _parse_tag_and_usd(desc)
                for t, v in pairs:
                    if t == tag:
                        amt = v
                        break
            if amt is not None:
                rows.append((dur, amt))
        ending = [r for r in rows if r[0][1] == pend]
        prior = [r for r in rows if r[0][1] != pend]
        if len(ending) != 1 or len(prior) != 1:
            return
        long_dur, v_long = ending[0]
        short_dur, v_short = prior[0]
        span_long = (long_dur[0], long_dur[1])
        span_short = (short_dur[0], short_dur[1])
        if span_long[0] != span_short[0]:
            return
        expected = v_long - v_short
        if expected != mval:
            issues.append(
                Issue(
                    path,
                    f"[arithmetic — {metric_key}] Quarterly flow derived as **{tag}** (longer `start`/`end`) "
                    f"minus **{tag}** (shorter period), same accession/cash-flow line concept. "
                    f"Longer span {span_long[0]}→{span_long[1]}: **{v_long}**; "
                    f"shorter span {span_short[0]}→{span_short[1]}: **{v_short}**; "
                    f"implied `metrics.{metric_key}` = **{expected}**; YAML has **{mval}**.",
                )
            )

    validate_ytd_minus_prior("operating_cash_flow", "NetCashProvidedByUsedInOperatingActivities")
    validate_ytd_minus_prior("capital_expenditures_cash", "PaymentsToAcquirePropertyPlantAndEquipment")

    # total_debt sum of convertible + finance lease (when derived)
    td = metrics.get("total_debt")
    if td is not None:
        derived_row = None
        for src in sources:
            if not isinstance(src, dict):
                continue
            if "total_debt" not in _covers_set(src):
                continue
            desc = str(src.get("description", ""))
            if desc.startswith(DERIVED_PREFIX) and "ConvertibleLongTermNotesPayable" in desc:
                derived_row = desc
                break
        if derived_row:
            parts = _parse_tag_and_usd(derived_row)
            vals = [v for t, v in parts if t in ("ConvertibleLongTermNotesPayable", "FinanceLeaseLiability")]
            if len(vals) >= 2:
                expected = sum(vals[:2])
                if expected != td:
                    issues.append(
                        Issue(
                            path,
                            "[arithmetic — total_debt] The `Derived:` row covering `total_debt` sums "
                            "**ConvertibleLongTermNotesPayable** and **FinanceLeaseLiability** (USD parsed from that description). "
                            f"Parsed component sum = **{expected}**; YAML `metrics.total_debt` = **{td}**.",
                        )
                    )

    return issues


# --- Business profile (business/business.yaml) ---------------------------------

BUSINESS_ALLOWED_KINDS = frozenset(
    {
        "sec_10q",
        "sec_10k",
        "sec_8k",
        "sec_6k",
        "sec_20f",
        "ir_portal",
        "documentation",
        "sec_companyfacts_json",
    }
)


def _is_business_leaf(obj: Any) -> bool:
    if not isinstance(obj, dict):
        return False
    if "sources" not in obj or not isinstance(obj["sources"], list):
        return False
    return (
        "value" in obj
        or "value_text" in obj
        or "value_low" in obj
        or "value_high" in obj
    )


def iter_business_leaves(
    prefix: str,
    obj: Any,
    *,
    at_file_root: bool = False,
) -> Iterable[tuple[str, dict[str, Any]]]:
    if isinstance(obj, dict):
        if _is_business_leaf(obj):
            yield prefix, obj
            return
        for k, v in obj.items():
            if at_file_root and k == "sources":
                continue
            np = f"{prefix}.{k}" if prefix else k
            yield from iter_business_leaves(np, v, at_file_root=False)
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            np = f"{prefix}[{i}]"
            if isinstance(item, dict) and _is_business_leaf(item):
                yield np, item
            elif isinstance(item, dict):
                yield from iter_business_leaves(np, item, at_file_root=False)


def _leaf_value_nullish(leaf: dict[str, Any]) -> bool:
    v = leaf.get("value")
    if v is not None and not (isinstance(v, list) and len(v) == 0):
        return False
    for k in ("value_text", "value_low", "value_high"):
        x = leaf.get(k)
        if x is not None and str(x).strip():
            return False
    return True


def _leaf_needs_citation(leaf: dict[str, Any]) -> bool:
    if not _leaf_value_nullish(leaf):
        return True
    notes = leaf.get("notes")
    return isinstance(notes, str) and bool(notes.strip())


def validate_business_structure(path: Path, data: dict[str, Any]) -> list[Issue]:
    issues: list[Issue] = []
    for key in ("layer", "profile_version"):
        if key not in data:
            issues.append(Issue(path, f"missing top-level key `{key}`"))
    layer = data.get("layer")
    if layer is not None and not isinstance(layer, str):
        issues.append(Issue(path, "`layer` should be a string"))
    pv = data.get("profile_version")
    if pv is not None and not isinstance(pv, int):
        issues.append(Issue(path, "`profile_version` should be an integer", severity="warn"))
    raw_top_sources = data.get("sources")
    if raw_top_sources is not None and not isinstance(raw_top_sources, list):
        issues.append(Issue(path, "top-level `sources` must be a list"))
    leaves = list(iter_business_leaves("", data, at_file_root=True))
    if not leaves:
        issues.append(Issue(path, "no business leaves found (expected `{ value, sources, … }` blocks)"))
    return issues


def validate_business_root_sources(path: Path, data: dict[str, Any]) -> list[Issue]:
    issues: list[Issue] = []
    raw = data.get("sources")
    if not isinstance(raw, list):
        return issues
    for i, src in enumerate(raw):
        if not isinstance(src, dict):
            issues.append(Issue(path, f"top-level sources[{i}] must be a mapping"))
            continue
        if _covers_set(src) or _supports_set(src):
            issues.append(
                Issue(
                    path,
                    f"top-level sources[{i}] should omit `covers` and `supports_derivation_of` (context rows only)",
                    severity="warn",
                )
            )
    return issues


def validate_business_leaf_sources_nonempty(path: Path, leaf_id: str, leaf: dict[str, Any]) -> list[Issue]:
    issues: list[Issue] = []
    sources = leaf.get("sources")
    if not isinstance(sources, list):
        issues.append(Issue(path, f"`{leaf_id}`: `sources` must be a list"))
        return issues
    if _leaf_needs_citation(leaf) and len(sources) == 0:
        issues.append(
            Issue(
                path,
                f"`{leaf_id}`: has value and/or notes but `sources` is empty — add citations (see sources.md)",
            )
        )
    elif not _leaf_needs_citation(leaf) and len(sources) == 0:
        issues.append(
            Issue(
                path,
                f"`{leaf_id}`: inert leaf (null value fields, empty notes, empty sources) — add notes/sources or remove stub",
                severity="warn",
            )
        )
    return issues


def validate_business_leaf_mapping(path: Path, leaf_id: str, leaf: dict[str, Any]) -> list[Issue]:
    """Same covers/documentation contract as quarter files, per leaf, when any row uses `covers`."""
    issues: list[Issue] = []
    sources_list = leaf.get("sources")
    if not isinstance(sources_list, list):
        return issues
    if not any(_covers_set(s) for s in sources_list if isinstance(s, dict)):
        return issues

    covers_union: set[str] = set()
    doc_covers: set[str] = set()

    for i, src in enumerate(sources_list):
        if not isinstance(src, dict):
            continue
        kind = str(src.get("kind", "") or "")
        cov = _covers_set(src)
        sup = _supports_set(src)
        if kind == "documentation":
            if not cov:
                issues.append(
                    Issue(
                        path,
                        f"`{leaf_id}` sources[{i}] kind=documentation should include `covers`",
                    )
                )
            else:
                doc_covers |= cov
            continue
        covers_union |= cov
        if cov and sup:
            issues.append(
                Issue(
                    path,
                    f"`{leaf_id}` sources[{i}] has both `covers` and `supports_derivation_of` (unexpected for business.yaml)",
                )
            )

    if not _leaf_needs_citation(leaf):
        return issues

    nullish = _leaf_value_nullish(leaf)
    if nullish:
        if leaf_id not in doc_covers:
            issues.append(
                Issue(
                    path,
                    f"`{leaf_id}` is nullish with `covers` used in this leaf — add `kind: documentation` "
                    f"with `covers: [{leaf_id!r}]` or remove `covers` from rows (legacy citation mode)",
                )
            )
    else:
        if leaf_id not in covers_union:
            issues.append(
                Issue(
                    path,
                    f"`{leaf_id}`: non-nullish leaf uses `covers` on some rows but none cover `{leaf_id}`",
                )
            )

    extra_doc = doc_covers - {leaf_id}
    if extra_doc:
        issues.append(
            Issue(
                path,
                f"`{leaf_id}`: documentation `covers` should reference only this leaf; extra: {sorted(extra_doc)}",
                severity="warn",
            )
        )
    if not nullish and leaf_id in doc_covers:
        issues.append(
            Issue(
                path,
                f"`{leaf_id}`: documentation `covers` present but leaf is not nullish",
                severity="warn",
            )
        )
    return issues


def _business_row_description_ok(desc: str, kind: str) -> bool:
    d = desc.strip()
    if not d:
        return False
    if kind == "ir_portal":
        return True
    if kind == "documentation":
        return any(p in d for p in DOC_NULL_PREFIXES) or " null" in d.lower()
    return (
        d.startswith("Direct from SEC filing:")
        or d.startswith(XBRL_PREFIX)
        or d.startswith(DERIVED_PREFIX)
        or d.startswith("Form ")
    )


def validate_business_leaf_provenance(path: Path, leaf_id: str, leaf: dict[str, Any]) -> list[Issue]:
    issues: list[Issue] = []
    sources_list = leaf.get("sources")
    if not isinstance(sources_list, list):
        return issues

    for i, src in enumerate(sources_list):
        if not isinstance(src, dict):
            continue
        kind = str(src.get("kind", "") or "")
        desc = str(src.get("description", "") or "")
        cov = _covers_set(src)

        if kind and kind not in BUSINESS_ALLOWED_KINDS:
            issues.append(
                Issue(
                    path,
                    f"`{leaf_id}` sources[{i}] unknown kind `{kind}`",
                    severity="warn",
                )
            )

        if not desc.strip():
            issues.append(Issue(path, f"`{leaf_id}` sources[{i}] has empty description"))

        if cov:
            ok = (
                desc.startswith("Direct from SEC filing:")
                or desc.startswith(XBRL_PREFIX)
                or desc.startswith(DERIVED_PREFIX)
            )
            if not ok:
                issues.append(
                    Issue(
                        path,
                        f"`{leaf_id}` sources[{i}] row with `covers` should start with "
                        "`Direct from SEC filing:` / `From SEC company facts API (XBRL):` / `Derived:`",
                    )
                )
        else:
            if kind not in ("ir_portal",) and not _business_row_description_ok(desc, kind):
                issues.append(
                    Issue(
                        path,
                        f"`{leaf_id}` sources[{i}] (legacy mode, no `covers`) description should start with "
                        "`Direct from SEC filing:` / XBRL / `Derived:` / `Form `, or use kind `ir_portal`",
                        severity="warn",
                    )
                )

        if kind in ("sec_10q", "sec_10k", "sec_8k", "sec_6k", "sec_20f", "ir_portal"):
            if cov or _supports_set(src):
                issues.append(
                    Issue(
                        path,
                        f"`{leaf_id}` sources[{i}] context kind `{kind}` should omit covers and supports_derivation_of",
                        severity="warn",
                    )
                )
    return issues


def validate_business_profile(path: Path, data: dict[str, Any]) -> list[Issue]:
    issues: list[Issue] = []
    issues.extend(validate_business_structure(path, data))
    issues.extend(validate_business_root_sources(path, data))
    for leaf_id, leaf in iter_business_leaves("", data, at_file_root=True):
        issues.extend(validate_business_leaf_sources_nonempty(path, leaf_id, leaf))
        issues.extend(validate_business_leaf_mapping(path, leaf_id, leaf))
        issues.extend(validate_business_leaf_provenance(path, leaf_id, leaf))
    return issues


def indexed_sources_for_sec(data: dict[str, Any]) -> list[tuple[str, dict[str, Any]]]:
    """Flat list of (reference_label, source_row) for SEC JSON verification."""
    profile = detect_yaml_profile(data)
    out: list[tuple[str, dict[str, Any]]] = []
    if profile == "financial_quarter":
        srcs = data.get("sources") or []
        if isinstance(srcs, list):
            for i, s in enumerate(srcs):
                if isinstance(s, dict):
                    out.append((f"sources[{i}]", s))
    elif profile == "business_profile":
        top = data.get("sources")
        if isinstance(top, list):
            for i, s in enumerate(top):
                if isinstance(s, dict):
                    out.append((f"top-level sources[{i}]", s))
        for leaf_id, leaf in iter_business_leaves("", data, at_file_root=True):
            srcs = leaf.get("sources") or []
            if isinstance(srcs, list):
                for i, s in enumerate(srcs):
                    if isinstance(s, dict):
                        out.append((f"leaf `{leaf_id}` sources[{i}]", s))
    return out


# --- Tier B: SEC company facts ------------------------------------------------

CIK_RE = re.compile(r"/CIK(\d+)\.json", re.I)


def extract_cik_from_url(url: str) -> str | None:
    m = CIK_RE.search(url)
    if not m:
        return None
    return m.group(1).zfill(10)


def fetch_company_facts(cik10: str, user_agent: str) -> dict[str, Any]:
    cik_nolead = str(int(cik10, 10))
    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik_nolead.zfill(10)}.json"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": user_agent,
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _row_matches_instant(row: dict[str, Any], instant: str) -> bool:
    """Company facts often use `end` only (no `start`) for point-in-time balance-sheet tags."""
    if row.get("instant") == instant:
        return True
    if row.get("end") == instant and not row.get("start"):
        return True
    if row.get("end") == instant and row.get("start") == row.get("end"):
        return True
    return False


def _match_fact(
    rows: list[dict[str, Any]],
    *,
    start: str | None,
    end: str | None,
    instant: str | None,
    accn: str | None,
) -> dict[str, Any] | None:
    def acc_ok(row: dict[str, Any]) -> bool:
        if not accn:
            return True
        ra = row.get("accn")
        return not ra or ra == accn

    for row in rows:
        if not acc_ok(row):
            continue
        if start and end:
            if row.get("start") == start and row.get("end") == end:
                return row
        if instant and _row_matches_instant(row, instant):
            return row
        if end and not start and not instant and row.get("end") == end and not row.get("start"):
            return row
    return None


def _match_fact_relaxed(
    rows: list[dict[str, Any]],
    *,
    start: str | None,
    end: str | None,
    instant: str | None,
) -> dict[str, Any] | None:
    """Same as _match_fact but ignore accession (facts may repeat across filings)."""
    return _match_fact(rows, start=start, end=end, instant=instant, accn=None)


def verify_sec_row(
    path: Path,
    source_ref: str,
    src: dict[str, Any],
    facts_root: dict[str, Any],
    period_end: str,
    period_start: str,
    stats: SecVerifyStats | None = None,
) -> list[Issue]:
    issues: list[Issue] = []
    desc = str(src.get("description", "") or "")
    if not desc.startswith(XBRL_PREFIX):
        if stats:
            stats.skipped_wrong_lead_in += 1
        return issues
    if "input to" in desc or "input to" in desc.lower():
        if stats:
            stats.skipped_input_to += 1
        return issues

    pairs = _parse_tag_and_usd(desc)
    if not pairs:
        if stats:
            stats.skipped_unparseable += 1
        return issues
    tag, expected = pairs[0]

    usgaap = facts_root.get("facts", {}).get("us-gaap", {})
    if tag not in usgaap:
        if stats:
            stats.compared_tag_not_in_facts += 1
        issues.append(Issue(path, f"{source_ref} SEC verify: tag `{tag}` not in company facts us-gaap"))
        return issues

    accn = _parse_accession(desc)
    instant = _parse_instant_end(desc)
    dur = _parse_duration(desc)

    tag_node = usgaap[tag]
    units = tag_node.get("units") or {}
    matched_row = None
    used_unit = None

    for unit_name, rows in units.items():
        if not isinstance(rows, list):
            continue
        if dur:
            mrow = _match_fact(
                rows,
                start=dur[0],
                end=dur[1],
                instant=None,
                accn=accn,
            )
            if not mrow:
                mrow = _match_fact_relaxed(
                    rows, start=dur[0], end=dur[1], instant=None
                )
        elif instant:
            mrow = _match_fact(
                rows, start=None, end=None, instant=instant, accn=accn
            )
            if not mrow:
                mrow = _match_fact_relaxed(
                    rows, start=None, end=None, instant=instant
                )
        else:
            # Fall back: balance-sheet date = period_end
            mrow = _match_fact(
                rows,
                start=None,
                end=None,
                instant=period_end,
                accn=accn,
            )
            if not mrow:
                mrow = _match_fact_relaxed(
                    rows, start=None, end=None, instant=period_end
                )
        if mrow:
            matched_row = mrow
            used_unit = unit_name
            break

    if not matched_row:
        if stats:
            stats.compared_no_matching_fact += 1
        issues.append(
            Issue(
                path,
                f"{source_ref} SEC verify: no matching fact for `{tag}` (duration={dur!r} instant={instant!r} accn={accn!r})",
            )
        )
        return issues

    api_val = matched_row.get("val")
    if api_val is None:
        if stats:
            stats.compared_no_val_in_row += 1
        issues.append(Issue(path, f"{source_ref} SEC verify: matched row has no `val`"))
        return issues
    # JSON may use float for large ints
    api_int = int(api_val)
    if api_int != expected:
        if stats:
            stats.compared_val_mismatch += 1
        issues.append(
            Issue(
                path,
                f"{source_ref} SEC verify: `{tag}` API val {api_int} != description {expected} (unit={used_unit})",
            )
        )
    elif stats:
        stats.compared_ok += 1
    return issues


def validate_sec(
    path: Path,
    data: dict[str, Any],
    cache: dict[str, dict[str, Any]],
    user_agent: str,
    stats: SecVerifyStats | None = None,
) -> list[Issue]:
    issues: list[Issue] = []
    pstart, pend = period_window_for_sec(data)
    indexed = indexed_sources_for_sec(data)
    if not indexed:
        return issues

    ciks: set[str] = set()
    for _label, src in indexed:
        url = str(src.get("url", "") or "")
        cik = extract_cik_from_url(url)
        if cik:
            ciks.add(cik)

    for cik in sorted(ciks):
        if cik not in cache:
            cik_int = str(int(cik, 10))
            api_url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik_int.zfill(10)}.json"
            print(f"SEC verify: HTTP GET {api_url}", file=sys.stderr)
            try:
                cache[cik] = fetch_company_facts(cik, user_agent)
                if stats:
                    stats.http_gets += 1
            except urllib.error.HTTPError as e:
                issues.append(Issue(path, f"SEC HTTP error for CIK {cik}: {e.code} {e.reason}"))
                return issues
            except urllib.error.URLError as e:
                issues.append(Issue(path, f"SEC network error for CIK {cik}: {e.reason}"))
                return issues

    facts_by_cik = cache

    for label, src in indexed:
        if src.get("kind") != "sec_companyfacts_json":
            continue
        if stats:
            stats.sec_json_source_rows += 1
        url = str(src.get("url", "") or "")
        cik = extract_cik_from_url(url)
        if not cik or cik not in facts_by_cik:
            if stats:
                stats.skipped_unknown_cik_url += 1
            continue
        issues.extend(
            verify_sec_row(path, label, src, facts_by_cik[cik], pend, pstart, stats),
        )

    return issues


def iter_yaml_files(targets: Iterable[str]) -> list[Path]:
    out: list[Path] = []
    for t in targets:
        p = Path(t)
        if p.is_dir():
            for child in sorted(p.glob("*.yaml")):
                if child.name == "entity.yaml":
                    continue
                out.append(child)
            for child in sorted(p.glob("*.yml")):
                if child.name == "entity.yml":
                    continue
                out.append(child)
            for child in sorted(p.rglob("*.yaml")):
                if child.name == "entity.yaml":
                    continue
                out.append(child)
            for child in sorted(p.rglob("*.yml")):
                if child.name == "entity.yml":
                    continue
                out.append(child)
        elif p.is_file():
            if p.suffix.lower() in (".yaml", ".yml") and not p.name.startswith("_"):
                out.append(p)
        else:
            for g in glob_module.glob(t):
                gp = Path(g)
                if gp.is_file() and gp.suffix.lower() in (".yaml", ".yml"):
                    out.append(gp)
    # de-dupe, drop templates
    seen: set[Path] = set()
    res: list[Path] = []
    for p in out:
        rp = p.resolve()
        if rp in seen:
            continue
        if p.name.startswith("_"):
            continue
        if "_example" in p.parts:
            continue
        seen.add(rp)
        res.append(p)
    return sorted(res)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate quarter financial YAML, narrative/narrative.yaml, and/or business/business.yaml (auto-detected).",
    )
    parser.add_argument(
        "paths",
        nargs="+",
        help="YAML files and/or directories containing quarter files",
    )
    parser.add_argument(
        "--verify-sec",
        action="store_true",
        help="Fetch SEC company facts and verify API-cited amounts (requires SEC_EDGAR_USER_AGENT).",
    )
    args = parser.parse_args()

    files = iter_yaml_files(args.paths)
    if not files:
        print("No YAML files found.", file=sys.stderr)
        return 2

    user_agent = os.environ.get("SEC_EDGAR_USER_AGENT", "").strip()
    if args.verify_sec and not user_agent:
        print(
            "Set SEC_EDGAR_USER_AGENT to a descriptive string with contact info, e.g.\n"
            "  export SEC_EDGAR_USER_AGENT='p3-ai-map-validator/1.0 (obermejo@live.com)'\n"
            "See https://www.sec.gov/os/accessing-edgar-data",
            file=sys.stderr,
        )
        return 2

    sec_cache: dict[str, dict[str, Any]] = {}
    all_issues: list[Issue] = []
    sec_stats: SecVerifyStats | None = SecVerifyStats() if args.verify_sec else None

    if args.verify_sec:
        print(
            "SEC verify: enabled — will GET data.sec.gov company facts (per CIK, cached within this run).",
            file=sys.stderr,
        )

    for path in files:
        try:
            data = _load_yaml_doc(path)
        except Exception as e:
            all_issues.append(Issue(path, f"load error: {e}"))
            continue

        profile = detect_yaml_profile(data)
        if profile == "financial_quarter":
            for fn in (
                validate_structure,
                validate_mapping,
                validate_provenance,
                validate_arithmetic,
            ):
                all_issues.extend(fn(path, data))
        elif profile == "financial_narrative":
            all_issues.extend(validate_financial_narrative(path, data))
        elif profile == "business_profile":
            all_issues.extend(validate_business_profile(path, data))
        else:
            all_issues.append(
                Issue(
                    path,
                    "unknown YAML shape: expected quarter file (`period` + `metrics`), "
                    "financial narrative (`kind: financial_narrative` + `schema_version`), or "
                    "business profile (`layer` + `profile_version`)",
                )
            )
            continue

        if args.verify_sec:
            all_issues.extend(
                validate_sec(path, data, sec_cache, user_agent, sec_stats),
            )

    errors = [i for i in all_issues if i.severity == "error"]
    warns = [i for i in all_issues if i.severity == "warn"]

    for i in all_issues:
        prefix = "WARN" if i.severity == "warn" else "ERR"
        print(f"{prefix} {i.path}: {i.message}")

    if sec_stats is not None:
        sec_stats.log_summary()

    if errors:
        print(f"\n{len(errors)} error(s), {len(warns)} warning(s).", file=sys.stderr)
        return 1
    if warns:
        print(f"\nOK with {len(warns)} warning(s).", file=sys.stderr)
        return 0
    print(f"\nOK — {len(files)} file(s).", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
