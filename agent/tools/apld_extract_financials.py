#!/usr/bin/env python3
"""Extract Applied Digital FY2025 10-K financial data from SEC EDGAR XBRL API."""

import json
import urllib.request

HEADERS = {"User-Agent": "Research research@example.com", "Accept": "application/json"}

CIK = "0001144879"
TEN_K_ACCN = "0001144879-25-000021"   # FY2025 10-K
TEN_Q3_ACCN = "0001628280-25-017684"  # Q3 FY2025 10-Q (9-month)

FY25_START = "2024-06-01"
FY25_END = "2025-05-31"
FY24_START = "2023-06-01"
FY24_END = "2024-05-31"
FY23_START = "2022-06-01"
FY23_END = "2023-05-31"
Q3_9MO_END = "2025-02-28"
BS_DATE_FY25 = "2025-05-31"
BS_DATE_FY24 = "2024-05-31"


def fetch_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def get_val(facts, concept, start=None, end=None, instant=None, accn_filter=None, form_filter=None):
    """Search for a value in XBRL facts.
    For duration items: provide start & end.
    For instant items: provide end (= instant date).
    """
    for namespace in ["us-gaap", "dei"]:
        ns_facts = facts.get(namespace, {})
        concept_data = ns_facts.get(concept, {})
        units = concept_data.get("units", {})
        for unit_key, entries in units.items():
            for entry in entries:
                if accn_filter and entry.get("accn") != accn_filter:
                    continue
                if form_filter and entry.get("form") != form_filter:
                    continue
                if start and end:
                    if entry.get("start") == start and entry.get("end") == end:
                        return entry.get("val"), unit_key
                elif end:
                    if entry.get("end") == end and "start" not in entry:
                        return entry.get("val"), unit_key
                    if entry.get("end") == end:
                        if not start:
                            return entry.get("val"), unit_key
    return None, None


def get_val_10k(facts, concept, start, end):
    """Get value specifically from the 10-K filing."""
    val, unit = get_val(facts, concept, start=start, end=end, accn_filter=TEN_K_ACCN)
    if val is None:
        val, unit = get_val(facts, concept, start=start, end=end)
    return val, unit


def get_bs_val_10k(facts, concept, date):
    """Get balance sheet value from the 10-K."""
    val, unit = get_val(facts, concept, end=date, accn_filter=TEN_K_ACCN)
    if val is None:
        val, unit = get_val(facts, concept, end=date)
    return val, unit


def get_val_10q3(facts, concept, start, end):
    """Get value from Q3 10-Q filing (9 months)."""
    val, unit = get_val(facts, concept, start=start, end=end, accn_filter=TEN_Q3_ACCN)
    if val is None:
        val, unit = get_val(facts, concept, start=start, end=end, form_filter="10-Q")
    return val, unit


def main():
    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{CIK}.json"
    print(f"Fetching {url} ...")
    data = fetch_json(url)
    facts = data.get("facts", {})

    income_concepts = [
        ("Revenues / Total Revenue", ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax", "RevenueFromContractWithCustomerIncludingAssessedTax"]),
        ("Cost of Revenue", ["CostOfRevenue", "CostOfGoodsAndServicesSold"]),
        ("Gross Profit", ["GrossProfit"]),
        ("SGA", ["SellingGeneralAndAdministrativeExpense"]),
        ("Depreciation & Amortization", ["DepreciationDepletionAndAmortization", "DepreciationAndAmortization", "DepreciationAmortizationAndAccretionNet"]),
        ("Operating Income (Loss)", ["OperatingIncomeLoss"]),
        ("Interest Expense", ["InterestExpense", "InterestExpenseDebt"]),
        ("Interest Income", ["InvestmentIncomeInterest", "InterestIncomeOther", "InterestAndOtherIncome"]),
        ("Other Income/Expense", ["OtherNonoperatingIncomeExpense", "NonoperatingIncomeExpense"]),
        ("Income Tax Expense", ["IncomeTaxExpenseBenefit"]),
        ("Net Income (Loss)", ["NetIncomeLoss"]),
        ("Net Income Attr to Common", ["NetIncomeLossAvailableToCommonStockholdersBasic"]),
        ("Net Income from Continuing Ops", ["IncomeLossFromContinuingOperations"]),
        ("Net Income from Discontinued Ops", ["IncomeLossFromDiscontinuedOperationsNetOfTax", "DiscontinuedOperationIncomeLossFromDiscontinuedOperationDuringPhaseOutPeriodNetOfTax"]),
    ]

    eps_concepts = [
        ("EPS Basic - Continuing", ["IncomeLossFromContinuingOperationsPerBasicShare"]),
        ("EPS Diluted - Continuing", ["IncomeLossFromContinuingOperationsPerDilutedShare"]),
        ("EPS Basic", ["EarningsPerShareBasic"]),
        ("EPS Diluted", ["EarningsPerShareDiluted"]),
        ("Weighted Avg Shares Basic", ["WeightedAverageNumberOfShareOutstandingBasicAndDiluted", "WeightedAverageNumberOfSharesOutstandingBasic"]),
        ("Weighted Avg Shares Diluted", ["WeightedAverageNumberOfDilutedSharesOutstanding"]),
    ]

    cf_concepts = [
        ("Operating Cash Flow", ["NetCashProvidedByUsedInOperatingActivities", "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations"]),
        ("D&A (CF)", ["DepreciationDepletionAndAmortization", "DepreciationAndAmortization"]),
        ("Stock-Based Compensation (CF)", ["ShareBasedCompensation", "ShareBasedCompensationNonforfeitable"]),
        ("CapEx", ["PaymentsToAcquirePropertyPlantAndEquipment"]),
        ("Investing Cash Flow", ["NetCashProvidedByUsedInInvestingActivities", "NetCashProvidedByUsedInInvestingActivitiesContinuingOperations"]),
        ("Financing Cash Flow", ["NetCashProvidedByUsedInFinancingActivities", "NetCashProvidedByUsedInFinancingActivitiesContinuingOperations"]),
    ]

    bs_concepts = [
        ("Cash & Equivalents", ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsAndShortTermInvestments"]),
        ("Restricted Cash", ["RestrictedCash", "RestrictedCashCurrent"]),
        ("Total Current Assets", ["AssetsCurrent"]),
        ("PP&E Net", ["PropertyPlantAndEquipmentNet"]),
        ("Total Assets", ["Assets"]),
        ("Total Current Liabilities", ["LiabilitiesCurrent"]),
        ("Long-term Debt (non-current)", ["LongTermDebtNoncurrent", "LongTermDebt"]),
        ("Current Portion of LT Debt", ["LongTermDebtCurrent"]),
        ("Total Liabilities", ["Liabilities"]),
        ("Stockholders' Equity", ["StockholdersEquity"]),
        ("Total Debt", ["DebtAndCapitalLeaseObligations", "LongTermDebtAndCapitalLeaseObligations"]),
    ]

    print("\n" + "=" * 90)
    print("INCOME STATEMENT (in thousands as reported; raw USD shown)")
    print("=" * 90)
    print(f"{'Metric':<45} {'FY2025 (12mo)':<20} {'FY2024 (12mo)':<20} {'9mo Q3 FY25':<20}")
    print("-" * 105)

    for label, concepts in income_concepts:
        fy25_val = None
        fy24_val = None
        q3_val = None
        for c in concepts:
            if fy25_val is None:
                v, _ = get_val_10k(facts, c, FY25_START, FY25_END)
                if v is not None:
                    fy25_val = v
            if fy24_val is None:
                v, _ = get_val_10k(facts, c, FY24_START, FY24_END)
                if v is None:
                    v, _ = get_val(facts, c, start=FY24_START, end=FY24_END)
                if v is not None:
                    fy24_val = v
            if q3_val is None:
                v, _ = get_val_10q3(facts, c, FY25_START, Q3_9MO_END)
                if v is not None:
                    q3_val = v

        fy25_str = f"${fy25_val:,.0f}" if fy25_val is not None else "N/A"
        fy24_str = f"${fy24_val:,.0f}" if fy24_val is not None else "N/A"
        q3_str = f"${q3_val:,.0f}" if q3_val is not None else "N/A"
        print(f"{label:<45} {fy25_str:<20} {fy24_str:<20} {q3_str:<20}")

    print("\n" + "=" * 90)
    print("EPS / SHARES")
    print("=" * 90)
    print(f"{'Metric':<45} {'FY2025 (12mo)':<20} {'FY2024 (12mo)':<20} {'9mo Q3 FY25':<20}")
    print("-" * 105)

    for label, concepts in eps_concepts:
        fy25_val = None
        fy24_val = None
        q3_val = None
        for c in concepts:
            if fy25_val is None:
                v, _ = get_val_10k(facts, c, FY25_START, FY25_END)
                if v is not None:
                    fy25_val = v
            if fy24_val is None:
                v, _ = get_val(facts, c, start=FY24_START, end=FY24_END)
                if v is not None:
                    fy24_val = v
            if q3_val is None:
                v, _ = get_val_10q3(facts, c, FY25_START, Q3_9MO_END)
                if v is not None:
                    q3_val = v

        if "Shares" in label:
            fy25_str = f"{fy25_val:,.0f}" if fy25_val is not None else "N/A"
            fy24_str = f"{fy24_val:,.0f}" if fy24_val is not None else "N/A"
            q3_str = f"{q3_val:,.0f}" if q3_val is not None else "N/A"
        else:
            fy25_str = f"${fy25_val}" if fy25_val is not None else "N/A"
            fy24_str = f"${fy24_val}" if fy24_val is not None else "N/A"
            q3_str = f"${q3_val}" if q3_val is not None else "N/A"
        print(f"{label:<45} {fy25_str:<20} {fy24_str:<20} {q3_str:<20}")

    print("\n" + "=" * 90)
    print("CASH FLOW STATEMENT (in thousands as reported)")
    print("=" * 90)
    print(f"{'Metric':<45} {'FY2025 (12mo)':<20} {'FY2024 (12mo)':<20} {'9mo Q3 FY25':<20}")
    print("-" * 105)

    for label, concepts in cf_concepts:
        fy25_val = None
        fy24_val = None
        q3_val = None
        for c in concepts:
            if fy25_val is None:
                v, _ = get_val_10k(facts, c, FY25_START, FY25_END)
                if v is not None:
                    fy25_val = v
            if fy24_val is None:
                v, _ = get_val(facts, c, start=FY24_START, end=FY24_END)
                if v is not None:
                    fy24_val = v
            if q3_val is None:
                v, _ = get_val_10q3(facts, c, FY25_START, Q3_9MO_END)
                if v is not None:
                    q3_val = v

        fy25_str = f"${fy25_val:,.0f}" if fy25_val is not None else "N/A"
        fy24_str = f"${fy24_val:,.0f}" if fy24_val is not None else "N/A"
        q3_str = f"${q3_val:,.0f}" if q3_val is not None else "N/A"
        print(f"{label:<45} {fy25_str:<20} {fy24_str:<20} {q3_str:<20}")

    print("\n" + "=" * 90)
    print("BALANCE SHEET (instant values)")
    print("=" * 90)
    print(f"{'Metric':<45} {'May 31, 2025':<20} {'May 31, 2024':<20}")
    print("-" * 85)

    for label, concepts in bs_concepts:
        fy25_val = None
        fy24_val = None
        for c in concepts:
            if fy25_val is None:
                v, _ = get_bs_val_10k(facts, c, BS_DATE_FY25)
                if v is not None:
                    fy25_val = v
            if fy24_val is None:
                v, _ = get_bs_val_10k(facts, c, BS_DATE_FY24)
                if v is not None:
                    fy24_val = v

        fy25_str = f"${fy25_val:,.0f}" if fy25_val is not None else "N/A"
        fy24_str = f"${fy24_val:,.0f}" if fy24_val is not None else "N/A"
        print(f"{label:<45} {fy25_str:<20} {fy24_str:<20}")

    # Also try to find segment data
    print("\n" + "=" * 90)
    print("SEARCHING FOR SEGMENT / DISAGGREGATED REVENUE DATA...")
    print("=" * 90)

    segment_concepts = [
        "RevenueFromContractWithCustomerExcludingAssessedTax",
        "Revenues",
        "RevenueFromContractWithCustomerIncludingAssessedTax",
    ]

    for namespace in ["us-gaap", "dei", "apld"]:
        ns_facts = facts.get(namespace, {})
        for concept_name, concept_data in ns_facts.items():
            if "revenue" in concept_name.lower() or "Revenue" in concept_name:
                units = concept_data.get("units", {})
                for unit_key, entries in units.items():
                    for entry in entries:
                        if entry.get("start") == FY25_START and entry.get("end") == FY25_END:
                            print(f"  {namespace}:{concept_name} = {entry.get('val')} ({unit_key}) [accn: {entry.get('accn')}]")

    # Try broader search for segment info
    print("\n--- All concepts with 'segment' or 'hosting' in name ---")
    for namespace in facts:
        ns_facts = facts[namespace]
        for concept_name in ns_facts:
            if any(kw in concept_name.lower() for kw in ["segment", "hosting", "datacenter", "hpc", "cloud"]):
                concept_data = ns_facts[concept_name]
                units = concept_data.get("units", {})
                for unit_key, entries in units.items():
                    for entry in entries:
                        if entry.get("accn") == TEN_K_ACCN:
                            print(f"  {namespace}:{concept_name} = {entry.get('val')} ({unit_key}) start={entry.get('start')} end={entry.get('end')}")


if __name__ == "__main__":
    main()
