# p3-ai-map

**Pass this file (`README.md`) at the start of a new chat** so the agent shares full project context. For rule depth, also attach `agent/instructions/AGENT.md` (and `sources.md` / `financials.md` when the task touches facts or quarterly data).

---

## What we are building

- A **local-first map of the AI value chain**: energy → infrastructure → chips → models → applications (order lives in `content/_meta/layers.yaml`).
- **Companies** under **`content/companies/<slug>/`**, each with an **`entity.yaml`**, optional **`business/business.yaml`** (layer template from `content/_meta/business_templates/`), and optional **`financials/`** (one YAML per quarter, fully sourced). **Which layer** a company belongs to is **`content/_meta/company_index.yaml`** (human-maintained), not part of the folder path.
- **Human-in-the-loop accuracy**: **`content/`** is **approved** canonical data. The agent should **default to proposing** changes under **`inbox/`** (or clear diffs in chat) until the user says to apply them to `content/`.
- **Primary sources only** for numbers and material claims (SEC, official IR, etc.) — see `agent/instructions/sources.md`.
- **Future**: scripted runner (OpenAI API already wired via `agent/tools/ping_openai.py`), richer `agent/tools/`, optional UI in `app/`, deploy on EC2 via `deploy/`.

---

## First-time setup (human / new machine)

From the **repository root**:

```bash
python3 -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r agent/requirements.txt
cp config/.env.example config/.env
# Edit config/.env — set OPENAI_API_KEY=… (never commit config/.env)
python agent/tools/ping_openai.py   # expect a short OK-style reply
```

- **Secrets**: `config/.env` is **gitignored**; only `config/.env.example` is tracked.
- **Python deps**: `agent/requirements.txt` (`openai`, `python-dotenv`).

---

## Repository layout

```text
p3-ai-map/
├── README.md                 # this file — project overview + onboarding
├── content/                  # canonical map data
│   ├── _meta/
│   │   ├── layers.yaml       # ordered layer ids + titles (value chain)
│   │   ├── company_index.yaml  # slug → layer (human-maintained)
│   │   ├── companies/
│   │   │   ├── README.md     # how company folders work
│   │   │   └── _example/     # copy to add a company; NOT a real issuer
│   │   └── schema/           # optional JSON Schema later
│   └── companies/
│       ├── README.md         # pointer to _meta/companies/README.md
│       └── <slug>/           # e.g. iren — entity.yaml + financials/
├── inbox/                    # proposed updates (not canonical until merged)
│   └── proposals/<date>/companies/<slug>/   # same shape as content/companies/<slug>/
├── agent/
│   ├── instructions/
│   │   ├── AGENT.md          # session entry: goal, layout, workflow, tools
│   │   ├── sources.md        # what counts as evidence + how to cite
│   │   ├── financials.md     # quarterly YAML rules
│   │   ├── business_add_company.md  # business/business.yaml scaffold
│   │   └── README.md         # index of instruction files
│   ├── tools/                # Python helpers (e.g. ping_openai.py)
│   └── requirements.txt
├── config/                   # .env (local), .env.example (template)
├── scripts/                  # validate_values_file.py, migrate_inbox_to_content.py (+ requirements.txt)
├── app/                      # future UI / API
└── deploy/                   # future Docker / EC2 / systemd
```

---

## Layers (current)

Defined in `content/_meta/layers.yaml` (reorder there). These ids are the valid **`layer`** values in `content/_meta/company_index.yaml`.

| `id`             | `title`        |
|------------------|----------------|
| `energy`         | Energy         |
| `infrastructure` | Infrastructure |
| `chips`          | Chips          |
| `models`         | Models         |
| `applications`   | Applications   |

---

## Company folders

- **Canonical doc**: `content/_meta/companies/README.md` (layout, scaffold, merge).
- **Entry**: `content/companies/README.md`.
- **New company (canonical)**: copy `content/_meta/companies/_example/` → `content/companies/<slug>/`, fill `entity.yaml`, add `{ slug, layer }` to `content/_meta/company_index.yaml`.
- **Proposal**: same tree under `inbox/proposals/<date>/companies/<slug>/` until merged.
- **Typical tree**:

  ```text
  content/companies/<slug>/
  ├── entity.yaml              # narrative / identity / links (e.g. IR, SEC CIK)
  └── financials/
      ├── README.md            # fiscal calendar + naming for this issuer
      ├── _template.quarter.yaml
      └── YYYY-Qn.yaml         # one file per tracked quarter, with sources[]
  ```

- **Examples in repo (proposals)**: `inbox/proposals/20260322/companies/iren/`, `…/nebius/`.

---

## Agent workflow (summary)

1. **Scope** — User message defines company slug or theme; if ambiguous, **ask once**.
2. **Rules** — Read `agent/instructions/AGENT.md` for full procedure; use `sources.md` for evidence; use `financials.md` for quarter files.
3. **Evidence** — Prefer SEC → official IR/press on company domain → other primaries. News/social = pointers only until a primary backs the fact.
4. **Output** — Propose under **`inbox/`** unless the user explicitly authorizes writes to **`content/`**.
5. **Do not** treat `content/_meta/companies/_example/` as a real company.

---

## Tools & automation (current state)

| Item | Role |
|------|------|
| `agent/tools/ping_openai.py` | Loads `config/.env`, one OpenAI chat completion (smoke test). Optional env: `OPENAI_MODEL` (default `gpt-4o-mini`). |
| `scripts/validate_values_file.py` | Read-only validation of value YAML (quarter financials and `business/business.yaml`; shape auto-detected). `pip install -r scripts/requirements.txt`. Optional `--verify-sec` hits `data.sec.gov`; set `SEC_EDGAR_USER_AGENT`, e.g. `export SEC_EDGAR_USER_AGENT='p3-ai-map-validator/1.0 (obermejo@live.com)'` (see [SEC fair access](https://www.sec.gov/os/accessing-edgar-data)). |
| `scripts/migrate_inbox_to_content.py` | Interactive inbox → `content/companies/<slug>/`: validates with `validate_values_file.py`, prompts if errors, copies tree, optional delete of migrated inbox folders. `--dry-run` to preview. |
| Cursor / IDE | File read/write, search, terminal, browser/MCP if enabled — use for filings and verification. |
| `agent/tools/` | Extend here with SEC fetchers, parsers, etc.; document new scripts in `AGENT.md` tools table. |

There is **no** full `runner.py` yet; interactive agent work is primarily **Cursor + instruction files**.

---

## Suggested attachments per new chat

| Task type | Attach |
|-----------|--------|
| General | `README.md` + `agent/instructions/AGENT.md` |
| Facts / news / deals | add `agent/instructions/sources.md` |
| Quarterly / financial YAML | add `agent/instructions/financials.md` + the company folder under `content/` or `inbox/` |
| **New company** | add `agent/instructions/financials_add_company.md` (proposals under `inbox/proposals/<date>/companies/<slug>/`) |
| **Business profile** | add `agent/instructions/business_add_company.md` |
| **Validate / fill quarter YAML** | add `agent/instructions/financials_update.md` (+ `financials.md`, optional `financials_sec_xbrl_concepts.md`, target `financials/` path) |

---

## Git & safety

- **Tracked**: content (except secrets), instructions, examples, `.env.example`, `.gitignore`.
- **Never commit**: `config/.env`, root `.env` variants (see `.gitignore`).

---

## What to build next (smooth continuation)

- **`inbox/`** convention: stable filenames (e.g. date + slug + topic).
- **`agent/runner.py`** (optional): load instructions + company paths → OpenAI → write proposal to `inbox/`.
- **Topical instruction files** for non-financial pipelines (e.g. deals, operational capacity) mirroring `financials.md`.
- **`app/`** for navigation UI; **`deploy/`** when moving to EC2.

When continuing implementation, **keep `content/` vs `inbox/` separation** and **source rules** in `sources.md` aligned with any new automation.
