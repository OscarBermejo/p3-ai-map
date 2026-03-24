# Agent instructions (general)

**Read this file at the start of every working session** (or when the user @-mentions it). It is the single entry point: goal, layout, workflow, tools, and where to read next.

## What we are building

**p3-ai-map** is a local-first map of the AI value chain. Canonical, human-approved data lives under **`content/`**; proposed changes go to **`inbox/`** until merged. Stack **order** and layer **metadata** for the chain live in **`content/_meta/layers.yaml`**; **which company sits in which layer** is **`content/_meta/company_index.yaml`** (human-maintained — you do not need to edit it unless the user asks).

## Your job

- **Find, structure, and propose** updates (deals, filings, capacity, models, apps, energy, etc.) so the map stays **accurate and sourced**.
- Use **primary sources** and **explicit citations** — see [sources.md](./sources.md). Never present unsourced numbers as fact.
- **`content/`** is **approved** unless the user explicitly authorizes direct edits. Default: **propose** (under `inbox/` or as clear patches in chat) and wait for approval.

## Repository layout (top level)

```text
p3-ai-map/
├── content/           # canonical data; see below
├── inbox/             # drafts / proposals awaiting approval
├── agent/
│   ├── instructions/  # this file + sources.md, financials.md, …
│   └── tools/         # scripts/helpers you may call (see “Tools”)
├── scripts/           # validate_values_file.py, migrate_inbox_to_content.py
├── app/               # future UI / API
└── deploy/            # Docker, EC2, etc.
```

## Where to look (paths)

| Path | Role |
|------|------|
| `content/_meta/layers.yaml` | Value-chain layer **order** and **ids** (metadata for the stack) |
| `content/_meta/company_index.yaml` | **Human-maintained** map `slug` → `layer` for canonical companies under `content/companies/` |
| `content/companies/<slug>/` | One company: `entity.yaml` + optional `business/business.yaml` + optional `financials/` |
| `content/_meta/companies/README.md` | **Canonical** doc for company folder layout and scaffold |
| `content/_meta/companies/_example/` | Copy this tree to add a new company; **not** a real issuer |
| `inbox/proposals/<date>/companies/<slug>/` | Proposed company trees (same shape as `content/companies/<slug>/`) |
| `agent/instructions/` | Rules (you are here) |
| `agent/tools/` | Runnable helpers (see below) |
| `scripts/` | Repo automation outside `agent/tools/` — e.g. `validate_values_file.py`, `migrate_inbox_to_content.py` |
| `app/` | Not required for content tasks yet |
| `deploy/` | Deployment config only |

## Tools at your disposal

| Kind | Location / note |
|------|-----------------|
| **Repo scripts** | **`scripts/validate_values_file.py`** — read-only validation of sourced value YAML (quarter financials **and** `business/business.yaml`, auto-detected); optional `--verify-sec` needs `SEC_EDGAR_USER_AGENT`, e.g. `export SEC_EDGAR_USER_AGENT='p3-ai-map-validator/1.0 (obermejo@live.com)'` ([SEC fair access](https://www.sec.gov/os/accessing-edgar-data)). **`scripts/migrate_inbox_to_content.py`** — interactive promote: runs `validate_values_file.py` on each proposal company, prompts on validation errors, copies to `content/companies/<slug>/`, then optionally deletes migrated dirs under `inbox/`; `--dry-run` to preview; does **not** edit `company_index.yaml`. **`agent/tools/`** — e.g. `ping_openai.py` (smoke test: loads `config/.env`, one chat completion). Add fetchers and parsers here as you go. |
| **Environment** | In Cursor: read/search/edit files, run terminal commands, and any **MCP / browser** tools the user has enabled — use them when they reduce errors (e.g. open a filing URL to verify a number). |
| **API keys (scripts)** | `config/.env` (create from `config/.env.example`; never commit). Load explicitly from `config/` in code when you add `agent/tools/` runners. |

When you add a script under `agent/tools/`, append a one-line description to this table.

## Default workflow

1. **Scope** — The user’s message defines company **slug** or theme. If **slug** is ambiguous, **ask once** before editing. You do **not** need to resolve value-chain **layer** for file paths.
2. **Locate** — `content/companies/<slug>/` for canonical data, or `inbox/proposals/<date>/companies/<slug>/` for proposals; create from `content/_meta/companies/_example/` when adding a new company (with approval).
3. **Evidence** — [sources.md](./sources.md).
4. **Propose** — `inbox/` or explicit diffs unless told to write to `content/`.
5. **Cite** — per [sources.md](./sources.md).

## Naming

- Company folders: **kebab-case** `slug`; align with `entity.yaml`’s `slug` when present.
- Never treat **`content/_meta/companies/_example/`** as a listed company.

## Read next (by task)

| File | When |
|------|------|
| [sources.md](./sources.md) | Always when stating or updating **facts** |
| [financials.md](./financials.md) | Quarterly metrics / `financials/*.yaml` |
| [financials_sec_xbrl_concepts.md](./financials_sec_xbrl_concepts.md) | Optional **SEC company-concept** tag ladder + YTD-diff recipe (agent-driven; with `financials.md`) |
| [financials_add_company.md](./financials_add_company.md) | **New company** → scaffold under `inbox/proposals/…/companies/<slug>/`, fill from primaries, do not write `content/` until approved |
| [business_add_company.md](./business_add_company.md) | **Business profile** → `business/business.yaml` from `content/_meta/business_templates/<layer>.yaml` (`company_index.yaml` or explicit layer) |
| [business_update.md](./business_update.md) | **Existing business profile** → re-validate scalars, fill `null`s, fix errors; **Pass 0** = newer EDGAR/IR sweep; **staleness** rules in [sources.md](./sources.md) |
| [financials_update.md](./financials_update.md) | **Existing quarters** → validate / fill `financials/*.yaml`; **writes `inbox/` only** unless user explicitly authorizes **`content/`** |
