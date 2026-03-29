# Agent instructions

**Start every session with [AGENT.md](./AGENT.md)** — goal, repo layout, workflow, tools, and pointers to the rest.

| File | When |
|------|------|
| [AGENT.md](./AGENT.md) | **Always first** — entry point |
| [company_deep_dive.md](./company_deep_dive.md) | Full company deep dive — sequences all seven phases (scaffold → financials → business → announcements → market perception → structural analysis → narrative) into one end-to-end workflow |
| [sources.md](./sources.md) | Evidence and citations |
| [company_add_company.md](./company_add_company.md) | Create a new company scaffold and fill `entity.yaml` first |
| [financials.md](./financials.md) | Quarterly / `financials/*.yaml` — includes **source priority order** and **incremental writes** after each exhibit |
| [financials_workflows.md](./financials_workflows.md) | Financial workflows — new company quarter files and existing quarter validation / updates |
| [business.md](./business.md) | Core business-profile rules — template, layer resolution, metric semantics, `guidance`, and staleness |
| [business_workflows.md](./business_workflows.md) | Business workflows — create `business/business.yaml` or update / validate an existing profile |
| [announcements.md](./announcements.md) | **`announcements/announcements.yaml`** — latest material company announcements from official channels; newest first |
| [structural_analysis.md](./structural_analysis.md) | Adversarial derived analysis — cost structure ratios, cash flow decomposition, capital stress tests, unit economics, disclosure quality vs peers, thesis destruction test. Run before writing narrative. |
| [narrative.md](./narrative.md) | **`narrative/narrative.yaml`** — thesis-driven company judgment connecting filings, business, announcements, structural analysis, and context; must include original derived math |
| [market_perception.md](./market_perception.md) | **`market_perception/market_perception.yaml`** — external market signal: consensus narrative, key debates, sentiment, information asymmetries (with original analysis), disclosure quality comparison, and forward signals |