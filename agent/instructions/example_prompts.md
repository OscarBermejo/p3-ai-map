# Example prompts

Copy-paste these into a new agent session. Replace `<COMPANY>`, `<slug>`, and `<LAYER>` with your target before running.

---

## Full deep dive (new company)

```
Read agent/instructions/company_deep_dive.md and run the full pipeline for <COMPANY>.
Scaffold the company, pull financials for the last 4 quarters, build the <LAYER>
business profile, scan for recent announcements, build market perception, and
write the narrative. Work through all six phases in order.
```

## Full deep dive (existing company refresh)

```
Read agent/instructions/company_deep_dive.md and run a full refresh on <COMPANY>.
Start by reading all existing files under content/companies/<slug>/, then update
financials with the latest quarter, refresh market perception with current signal,
and rewrite the narrative as the capstone.
```

## Post-earnings refresh

```
<COMPANY> just reported <QUARTER>. Read agent/instructions/company_deep_dive.md and
do a post-earnings refresh: add the new quarter to financials, update announcements
with anything material from the call, refresh market perception (especially consensus
shifts, new debates, and sentiment direction), then rewrite the narrative.
```

## Market perception only

```
Read agent/instructions/market_perception.md and populate
content/companies/<slug>/market_perception/market_perception.yaml. Gather the latest
from SemiAnalysis, the most recent earnings transcript, Seeking Alpha (quality-filtered),
and X/Reddit sentiment. Focus especially on information asymmetries and competitive
positioning vs <PEER_1> and <PEER_2>.
```

## Competitive deep-dive

```
Read agent/instructions/market_perception.md and focus specifically on the competitive
positioning section for <COMPANY>. I want a thorough comparison against <PEER_1>,
<PEER_2>, and <PEER_3>. Where does <COMPANY> genuinely win, where is the gap closing,
and what are the real switching costs?
```

## Narrative only (after other files are populated)

```
Read agent/instructions/narrative.md and write
content/companies/<slug>/narrative/narrative.yaml. Read all existing files first —
financials, business, announcements, and market perception. The narrative should be
the capstone: connect the numbers to the business to what the market thinks, surface
what's non-obvious, and tell me where the market appears to be wrong and why.
```

## Add a new company (scaffold only)

```
Read agent/instructions/company_add_company.md and scaffold <COMPANY> under
content/companies/<slug>/. Fill entity.yaml with CIK, ticker, fiscal calendar, IR
links. Add it to company_index.yaml under the <LAYER> layer.
```

---

## Tips

- **Always point to the instruction file** — that's where all the rules, source tiers, and quality standards live.
- **For the full pipeline**, say "work through all six phases in order" so the agent doesn't skip to the narrative.
- **For market perception**, name the sources you care about (SemiAnalysis, earnings transcript, etc.) to anchor on quality over quantity.
- **For the narrative**, emphasize "capstone" and "connect the files" — otherwise agents tend to treat it as a filing summary.
