# Market perception templates

Starter YAML shape for **market perception** files: how the market sees a company beyond what SEC filings and official IR disclose. Captures **consensus narrative**, **key debates**, **sentiment signals**, **information asymmetries**, and **forward signals** from analytical, curated, and community sources.

| Template file | Schema version | Notes |
|---------------|----------------|-------|
| [`market_perception.yaml`](./market_perception.yaml) | `1` | General — works for any company in any layer |

**Usage:** Copy the template to **`content/companies/<slug>/market_perception/market_perception.yaml`** (or **`inbox/proposals/<date>/companies/<slug>/market_perception/market_perception.yaml`**). See [market_perception.md](../../agent/instructions/market_perception.md) for full research methodology, source tiers, quality filters, and workflow.

**Source tiers:**

| Tier | Trust level | Examples | Handling |
|------|-------------|----------|----------|
| **1 — Deep technical / analytical** | Highest | SemiAnalysis, earnings transcripts, Hot Chips, domain-expert blogs | Direct citation; highest weight |
| **2 — Curated analytical** | Moderate | Seeking Alpha (quality-filtered), tech press, sell-side summaries | Requires labeling; individual quality check |
| **3 — Social / community** | Lowest | X, Reddit, HackerNews | Corroboration required; never sole evidence for factual claims |

**Key rules:**

- **Always attribute** — every claim traces to a source with tier, author, date, and URL
- **Label interpretation** — separate "Source X argues …" from your own assessment
- **Sell-side research** — record summary statistics only (rating distribution, target range); do **not** reproduce proprietary text
- **Seeking Alpha** — filter aggressively by author quality; cite author name, not just platform
- **Social sources** — thread-level sentiment direction, not individual anonymous comments
