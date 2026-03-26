# Agent instructions (general)

**Read this file at the start of every working session** (or when the user @-mentions it). It is the entry point for repo purpose, paths, workflow, tools, and which instruction file to read next.

## What we are building

**p3-ai-map** is a local-first map of the AI value chain.

- **Canonical, human-approved data** lives under **`content/`**
- **Proposed changes** go under **`inbox/`** until merged
- Value-chain **order** and layer **metadata** live in **`content/_meta/layers.yaml`**
- Company **slug → layer** mapping lives in **`content/_meta/company_index.yaml`** and is human-maintained; do not edit it unless the user asks

## Your job

- **Find, structure, and propose** sourced updates about companies, filings, deals, capacity, models, apps, energy, and related topics
- Use **primary sources** and **explicit citations**; see [sources.md](./sources.md)
- Treat **`content/`** as approved data unless the user explicitly authorizes direct edits; otherwise propose under **`inbox/`** or as clear diffs

## Where to look

| Path | Role |
|------|------|
| `content/` | Canonical data |
| `inbox/` | Drafts / proposals awaiting approval |
| `content/_meta/layers.yaml` | Value-chain layer order and ids |
| `content/_meta/company_index.yaml` | Human-maintained `slug` → `layer` map for canonical companies |
| `content/companies/<slug>/` | One company: `entity.yaml` + optional `business/business.yaml` + optional `financials/` + optional `announcements/announcements.yaml` + optional `narrative/narrative.yaml` |
| `content/_meta/companies/README.md` | Canonical doc for company folder layout and scaffold |
| `content/_meta/companies/_example/` | Structural template for new companies; **not** a real issuer |
| `inbox/proposals/<date>/companies/<slug>/` | Proposal tree with the same shape as `content/companies/<slug>/` |
| `agent/instructions/` | Instruction files |
| `agent/tools/` | Agent-side helper scripts |
| `scripts/` | Repo scripts such as validation and inbox promotion |
| `app/` | Future UI / API; not required for content work yet |
| `deploy/` | Deployment config only |

## Tools at your disposal

| Kind | Location / note |
|------|-----------------|
| **Repo scripts** | **`scripts/validate_values_file.py`** validates sourced value YAML and auto-detects quarter financials, `business/business.yaml`, and `narrative/narrative.yaml`; optional `--verify-sec` needs `SEC_EDGAR_USER_AGENT` (see [SEC fair access](https://www.sec.gov/os/accessing-edgar-data)). **`scripts/migrate_inbox_to_content.py`** interactively promotes proposal company trees into `content/companies/<slug>/`: it runs `validate_values_file.py` on proposal companies, prompts on validation errors, copies the tree, can optionally delete migrated inbox folders, supports `--dry-run`, and does **not** edit `company_index.yaml`. **`agent/tools/`** contains helper scripts such as `ping_openai.py`; add new fetchers / parsers there as needed. |
| **Environment** | In Cursor: read, search, edit, run terminal commands, and use enabled browser / MCP tools when they reduce errors (for example, opening a filing URL to verify a number). |
| **API keys (scripts)** | Store script secrets in `config/.env` (from `config/.env.example`); never commit them. Load from `config/` in any new `agent/tools/` runners. |

When you add a script under `agent/tools/`, append a one-line description to the tools table above.

## Default workflow

1. **Scope** — The user message defines the company **slug** or theme. If the slug is ambiguous, ask once before editing. You do **not** need to resolve value-chain **layer** for file paths.
2. **Locate** — Work in `content/companies/<slug>/` for canonical data or `inbox/proposals/<date>/companies/<slug>/` for proposals. When adding a company, start from `content/_meta/companies/_example/` with approval.
3. **Read the right rules** — Use [sources.md](./sources.md) for evidence, then the task-specific instruction file for the content type you are touching.
4. **Propose safely** — Default to **`inbox/`** or explicit diffs unless the user explicitly authorizes canonical `content/` edits.
5. **Cite clearly** — Every material fact should be backed by primary-source citations per [sources.md](./sources.md).

## Naming

- Company folders use **kebab-case** `slug`
- Folder name should match `entity.yaml`’s `slug` when present
- Never treat **`content/_meta/companies/_example/`** as a listed company

## Read next (by task)

| File | When |
|------|------|
| [sources.md](./sources.md) | Always when stating or updating facts |
| [company_add_company.md](./company_add_company.md) | New company scaffold → create company folder and `entity.yaml` first |
| [financials.md](./financials.md) | Quarterly metrics / `financials/*.yaml` |
| [financials_sec_xbrl_concepts.md](./financials_sec_xbrl_concepts.md) | Optional SEC company-concept tag ladder + YTD-diff recipe, used with `financials.md` |
| [financials_workflows.md](./financials_workflows.md) | Financial workflows → add quarter files for a newly scaffolded company, or validate / update existing quarters |
| [business.md](./business.md) | Business profile rules → layer resolution, template shape, metric semantics, guidance, and staleness |
| [business_workflows.md](./business_workflows.md) | Business workflows → create `business/business.yaml`, or validate / update an existing profile |
| [announcements.md](./announcements.md) | `announcements/announcements.yaml` → latest material company announcements from official channels; newest first |
| [narrative.md](./narrative.md) | `narrative/narrative.yaml` → company-specific interpretation grounded in primaries; not new metrics |