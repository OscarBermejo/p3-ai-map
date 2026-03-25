# Agent instructions

**Start every session with [AGENT.md](./AGENT.md)** — goal, repo layout, workflow, tools, and pointers to the rest.

| File | When |
|------|------|
| [AGENT.md](./AGENT.md) | **Always first** — entry point |
| [sources.md](./sources.md) | Evidence and citations |
| [financials.md](./financials.md) | Quarterly / `financials/*.yaml` — includes **source priority order** and **incremental writes** after each exhibit |
| [financials_add_company.md](./financials_add_company.md) | Add a company → `inbox/proposals/<date>/companies/<slug>/` |
| [business_add_company.md](./business_add_company.md) | Scaffold / fill `business/business.yaml` (layer from `company_index.yaml` or user) |
| [business_update.md](./business_update.md) | Refresh / validate `business/business.yaml` — includes **`guidance`** (issuer forward targets) |
| [financials_update.md](./financials_update.md) | Validate & fill quarter YAML under **`inbox/`** — **save after each exhibit** per [financials.md](./financials.md) (not **`content/`** unless user explicitly allows) |
