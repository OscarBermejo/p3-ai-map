# Layer business-profile templates

Starter YAML shapes for **non-financial**, **layer-specific** business facts (capacity, contracts, platform, etc.). **Quarterly numbers** stay in `financials/*.yaml`.

| Layer            | Template file        |
|------------------|----------------------|
| `infrastructure` | [`infrastructure.yaml`](./infrastructure.yaml) |

**Usage:** Copy the template for your layer to **`content/companies/<slug>/business/business.yaml`** (or **`inbox/proposals/<date>/companies/<slug>/business/business.yaml`**). See [business.md](../../agent/instructions/business.md) and [business_workflows.md](../../agent/instructions/business_workflows.md).

**Shared rules:** **issuer-agnostic** keys; **`{ value, notes, sources }`** on metric leaves; optional top-level **`sources[]`**. Use the **newest Tier 1** that **updates each fact** (not only the annual report); set **`as_of`** to issuer snapshot dates where possible — see [sources.md](../../agent/instructions/sources.md) (**Filing age, `as_of`, and staleness** — business profiles).

**[`infrastructure.yaml`](./infrastructure.yaml) (`profile_version: 4`):** **`capacity`**, **`gpus`**, and **`contracts_usd`** each have **`online`**, **`contracted`**, and **`secured`** for cross-company comparison (definitions in template header). **`contracts_usd`** is **annual customer rental / ARR** (hyperscalers and similar tenants), not hardware purchase or raw TCV unless annualized in **`notes`**. **`guidance`** holds **issuer forward targets** (often **ARR** outlook, MW/GW goals) — not realized metrics. Plus **`deals_and_contracts`**, **`platform`**, **`datacenters`**, **`integration`**.
