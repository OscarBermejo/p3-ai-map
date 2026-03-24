# Financials (quarterly audit trail) — template

This README belongs **inside each company’s** `financials/` folder. Define **fiscal calendar once** here (from official IR / SEC), then add one YAML file per quarter.

## Filename convention

- **Calendar quarters:** `YYYY-Qn.yaml` (e.g. `2025-Q4.yaml`).
- **Fiscal quarters (if not calendar-aligned):** e.g. `FY2026-Q1.yaml` and explain the mapping to calendar dates in this file.

Copy `_template.quarter.yaml` when opening a new period.

## Sources

Every material number should be backed by `sources` (URL, document kind, optional excerpt) in the quarter YAML so proposed agent updates are reviewable against primaries.
