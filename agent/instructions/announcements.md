# Company announcements (`announcements/announcements.yaml`)

**Purpose:** Keep a compact, source-backed log of the **latest material company announcements** in one place: deals, partnerships, raises, ATMs, debt/equity financing, customer wins, major hiring / executive changes, capacity or site announcements, product launches, regulatory milestones, and similar company-announced events.

This file is for **discrete announcements**, not quarter financial statement metrics and not long-form interpretation. Use it when the reader wants to answer: **what has this company officially announced lately?**

Read with: [sources.md](./sources.md) (**Announcements** track), plus `entity.yaml` for `links.investor_relations` and optional `links.press_releases_index`.

---

## Path and scope

- Canonical path: **`content/companies/<slug>/announcements/announcements.yaml`**
- Proposal path: **`inbox/proposals/<YYYY-MM-DD>/companies/<slug>/announcements/announcements.yaml`**
- Default behavior: write under **`inbox/`** unless the user explicitly authorizes canonical **`content/`** edits.

One file contains **multiple announcement rows** for that company.

---

## What belongs here

Include **material company announcements** such as:

- New deals, partnerships, customer wins, supply agreements
- Equity or debt raises, convertibles, ATM programs, repurchases
- Major hiring, CEO/CFO changes, board appointments, named executive departures
- New sites, expansions, capacity / GPU / infrastructure milestones
- Product launches or major platform rollouts
- Regulatory approvals, investigations, delistings, restructurings, bankruptcies
- Other company-announced events a careful reader would reasonably want in a recent-events timeline

Do **not** use this file for:

- Routine quarter metrics that belong in **`financials/*.yaml`**
- Long-form judgment or “what it means” analysis that belongs in **`narrative/narrative.yaml`**
- Minor social media chatter, marketing snippets, or unsourced rumor

If one real-world event appears in several places (e.g. **8-K + press release + official X post**), keep **one** announcement row and attach **multiple sources**.

---

## Ordering

Store rows in **reverse chronological order**: **newest first**.

Why:

- The file is meant to answer **what was announced lately**
- Refresh work becomes append / insert at the top
- The newest material item stays visible in diffs and reviews

Within the same date, keep the more material or more formally documented item first.

---

## Source policy

Follow [sources.md](./sources.md), **Announcements** track.

Short version:

1. **Prefer official, company-controlled sources**: SEC filings, official IR releases, company-domain pages, official investor presentations, official social posts.
2. If a social post links to a company-domain release or filing, cite the **linked primary first** and the social post **optionally second**.
3. Use **multiple sources together** when helpful: for example, **8-K + IR release + official X post**.
4. Avoid relying on third-party news as the only proof if an official source exists or should exist.

---

## YAML shape (`schema_version: 1`)

```yaml
kind: company_announcements
schema_version: 1
as_of: "2026-03-26"
items:
  - date: "2026-03-20"
    title: "Example company announces expanded GPU cluster partnership"
    category: partnership
    summary: >
      Example Company said it expanded a GPU infrastructure partnership with
      Partner Name and expects the deployment to support new customer demand.
    sources:
      - url: https://example.com/investors/news/example-release
        kind: ir_html
        description: "Primary source: official company press release announcing the partnership expansion."
        retrieved_at: "2026-03-26"
      - url: https://x.com/example/status/123
        kind: official_social
        description: "Primary source: official company X account post linking to the same announcement."
        retrieved_at: "2026-03-26"
```

### Top-level fields

| Field | Required | Notes |
|-------|----------|-------|
| `kind` | yes | `company_announcements` |
| `schema_version` | yes | `1` |
| `as_of` | yes | ISO date when this file was last reviewed / refreshed |
| `items` | yes | Non-empty list of announcement rows, newest first |

### `items[]` row fields

| Field | Required | Notes |
|-------|----------|-------|
| `date` | yes | ISO date of the announcement or filing / release date if that is the best disclosed date |
| `title` | yes | Short factual headline for the event |
| `category` | yes | Suggested values: `deal`, `partnership`, `customer`, `funding`, `atm`, `debt`, `equity`, `leadership`, `board`, `capacity`, `product`, `regulatory`, `restructuring`, `other` |
| `summary` | yes | 1–3 sentences, factual and concise; what happened, with enough context to be useful |
| `sources` | yes | Non-empty list of official or primary source rows supporting this item |

### `sources[]` fields

Use the shared provenance shape already common in this repo:

- `url`
- `kind`
- `description`
- `retrieved_at`

Typical `kind` values:

- `sec_8k`, `sec_10q`, `sec_10k`, `sec_6k`, `sec_20f`
- `ir_html`, `ir_pdf`
- `company_web`
- `official_social`
- `regulatory_filing`

If several official documents cover the same event, put the **most authoritative / direct** one first.

---

## Writing rules

- Be **factual**, not promotional.
- Summaries should say **what happened**, not spin why it is “great” or “transformational.”
- If the exact economic terms are **not disclosed**, say so plainly.
- Do not invent dates, amounts, counterparties, or motives.
- If a post is official but thin on detail, use it only for what it actually says.
- If an item is later superseded or revised, update the older row rather than creating contradictory duplicates unless the later announcement is itself a distinct event.

---

## How to build or refresh the file

1. Read `entity.yaml` and identify **official discovery paths**: `investor_relations`, `press_releases_index`, SEC / home-market filings, official company social accounts.
2. Search **newest first** across official channels for **material announcements**.
3. Add or refresh rows in **newest-first** order.
4. For each event, prefer the **specific** release / filing / post URL, not just an index page.
5. If one event appears in several official places, use **one item** with multiple `sources`.
6. Update top-level **`as_of`** to the date of the refresh.

---

## Update behavior

When updating an existing `announcements/announcements.yaml`:

- Keep existing rows that are still valid
- Insert newly discovered items in the right **newest-first** position
- Tighten summaries if a newer official filing adds missing detail
- Remove duplicates when the same event was captured twice under different headlines

This file is a **curated recent-announcements log**, not an exhaustive archive of every press mention ever made.

---

## Output — Handoff summary

Reply with:

1. **Path touched**
2. **New items added**
3. **Existing items updated or deduplicated**
4. **Sources used** — especially which official channels were checked
5. **Open gaps** — e.g. official post exists but no filing / release with detail

---

## Tools

Use browser / terminal / MCP as needed to open the official release, filing, PDF, or official social post you cite. Respect [SEC fair access](https://www.sec.gov/os/accessing-edgar-data) when using EDGAR or `data.sec.gov`.

There is **no dedicated validator yet** for `announcements/announcements.yaml`; rely on careful structure and source review.
