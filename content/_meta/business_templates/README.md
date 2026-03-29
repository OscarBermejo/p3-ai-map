# Layer business-profile templates

Starter YAML shapes for **non-financial**, **layer-specific** business facts (capacity, contracts, platform, etc.). **Quarterly numbers** stay in `financials/*.yaml`.

| Layer            | Template file        |
|------------------|----------------------|
| `infrastructure` | [`infrastructure.yaml`](./infrastructure.yaml) |
| `chips`          | [`chips.yaml`](./chips.yaml) |
| `models`         | [`models.yaml`](./models.yaml) |

**Usage:** Copy the template for your layer to **`content/companies/<slug>/business/business.yaml`** (or **`inbox/proposals/<date>/companies/<slug>/business/business.yaml`**). See [business.md](../../agent/instructions/business.md) and [business_workflows.md](../../agent/instructions/business_workflows.md).

**Shared rules:** **issuer-agnostic** keys; **`{ value, notes, sources }`** on metric leaves; optional top-level **`sources[]`**. Use the **newest Tier 1** that **updates each fact** (not only the annual report); set **`as_of`** to issuer snapshot dates where possible — see [sources.md](../../agent/instructions/sources.md) (**Filing age, `as_of`, and staleness** — business profiles).

**[`infrastructure.yaml`](./infrastructure.yaml) (`profile_version: 4`):** **`capacity`**, **`gpus`**, and **`contracts_usd`** each have **`online`**, **`contracted`**, and **`secured`** for cross-company comparison (definitions in template header). **`contracts_usd`** is **annual customer rental / ARR** (hyperscalers and similar tenants), not hardware purchase or raw TCV unless annualized in **`notes`**. **`guidance`** holds **issuer forward targets** (often **ARR** outlook, MW/GW goals) — not realized metrics. Plus **`deals_and_contracts`**, **`platform`**, **`datacenters`**, **`integration`**.

**[`chips.yaml`](./chips.yaml) (`profile_version: 1`):** **Product-centric** model — the unit of comparison is the **chip / accelerator**, not the company. Core is **`products[]`**: each entry is one accelerator with **`architecture`** (process node, memory, interconnect), **`performance`** (peak FLOPS by precision, TDP), **`efficiency`** (FLOPS/W derived), **`system_context`** (reference system, rack density, scale-out), **`workload_fit`** (training / inference / fine-tuning ratings), **`benchmarks`** (MLPerf, vendor-published), **`pricing`** (list price, cloud $/hr proxy), and **`availability`** (OEM systems, lead time). Company-level context wraps around: **`software_ecosystem`**, **`manufacturing_and_supply`**, **`commercial_traction`**, **`roadmap`**. Spec data uses a three-tier source model (datasheet → benchmark → estimate) documented in the template header.

**[`models.yaml`](./models.yaml) (`profile_version: 1`):** **Model-centric** — the unit of comparison is the individual model variant (e.g. "GPT-4o" and "GPT-4o-mini" are separate entries). Core is **`products[]`**: each entry has **`capabilities`** (context window, modalities, tool use, fine-tuning), **`benchmarks`** (quality_index from Artificial Analysis, chatbot_arena_elo, gpqa_diamond, swe_bench_verified, math_500, mmlu_pro, mmmu), **`pricing`** (input/output per million tokens with snapshot_date; hosted_reference_price for open-weight models), **`latency`** (median TTFT, tokens/sec from independent sources), and **`derived_efficiency`** (quality_per_output_dollar and arena_elo_per_output_dollar — the primary price-performance ratios). Company-level context wraps around: **`api_platform`**, **`compute_dependency`**, **`research_profile`**, **`commercial_traction`**, **`roadmap`**. Source tiers: vendor official (Tier 1) → Artificial Analysis / LMSYS Arena (Tier 2) → community/leaked estimates (Tier 3).
