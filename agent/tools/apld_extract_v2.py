#!/usr/bin/env python3
"""Extract Applied Digital FY2025 10-K financial data - V2 with broader concept search."""

import json
import urllib.request

HEADERS = {"User-Agent": "Research research@example.com", "Accept": "application/json"}
CIK = "0001144879"
TEN_K_ACCN = "0001144879-25-000021"
TEN_Q3_ACCN = "0001628280-25-017684"
FY25_START = "2024-06-01"
FY25_END = "2025-05-31"
FY24_START = "2023-06-01"
FY24_END = "2024-05-31"
Q3_9MO_END = "2025-02-28"

def fetch_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def main():
    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{CIK}.json"
    data = fetch_json(url)
    facts = data.get("facts", {})

    keywords = [
        "interest", "debt", "borrow", "note", "gross", "capex", "capital",
        "purchase", "property", "payment", "income", "loss", "operating",
        "nonoperating", "other", "gain", "impair", "writeoff", "write",
        "discontinu", "tax", "revenue", "cost", "depreci", "amortiz",
        "stock", "compen", "warrant", "fair", "derivative"
    ]

    print("=" * 120)
    print("ALL FACTS FROM 10-K FILING (accn = " + TEN_K_ACCN + ")")
    print("=" * 120)

    results = []
    for namespace in facts:
        ns_facts = facts[namespace]
        for concept_name, concept_data in ns_facts.items():
            units = concept_data.get("units", {})
            for unit_key, entries in units.items():
                for entry in entries:
                    if entry.get("accn") == TEN_K_ACCN:
                        results.append({
                            "ns": namespace,
                            "concept": concept_name,
                            "val": entry.get("val"),
                            "unit": unit_key,
                            "start": entry.get("start", ""),
                            "end": entry.get("end", ""),
                        })

    # Sort: instant items first (no start), then duration items
    results.sort(key=lambda x: (x["start"] != "", x["concept"]))

    # Print balance sheet items (instant - no start)
    print("\n--- BALANCE SHEET ITEMS (May 31, 2025) ---")
    for r in results:
        if not r["start"] and r["end"] == "2025-05-31":
            print(f"  {r['ns']}:{r['concept']:<65} = {r['val']:>15,} {r['unit']}")

    print("\n--- BALANCE SHEET ITEMS (May 31, 2024 comparatives) ---")
    for r in results:
        if not r["start"] and r["end"] == "2024-05-31":
            print(f"  {r['ns']}:{r['concept']:<65} = {r['val']:>15,} {r['unit']}")

    print("\n--- INCOME STATEMENT / DURATION ITEMS (FY2025: Jun 1 2024 - May 31 2025) ---")
    for r in results:
        if r["start"] == FY25_START and r["end"] == FY25_END:
            print(f"  {r['ns']}:{r['concept']:<65} = {r['val']:>15,} {r['unit']}")

    print("\n--- INCOME STATEMENT / DURATION ITEMS (FY2024: Jun 1 2023 - May 31 2024) ---")
    for r in results:
        if r["start"] == FY24_START and r["end"] == FY24_END:
            print(f"  {r['ns']}:{r['concept']:<65} = {r['val']:>15,} {r['unit']}")

    # Now check Q3 10-Q for 9-month data
    print("\n\n" + "=" * 120)
    print("ALL FACTS FROM Q3 10-Q (accn = " + TEN_Q3_ACCN + ")")
    print("=" * 120)

    q3_results = []
    for namespace in facts:
        ns_facts = facts[namespace]
        for concept_name, concept_data in ns_facts.items():
            units = concept_data.get("units", {})
            for unit_key, entries in units.items():
                for entry in entries:
                    if entry.get("accn") == TEN_Q3_ACCN:
                        q3_results.append({
                            "ns": namespace,
                            "concept": concept_name,
                            "val": entry.get("val"),
                            "unit": unit_key,
                            "start": entry.get("start", ""),
                            "end": entry.get("end", ""),
                        })

    print("\n--- 9-MONTH ITEMS (Jun 1 2024 - Feb 28 2025) ---")
    for r in sorted(q3_results, key=lambda x: x["concept"]):
        if r["start"] == FY25_START and r["end"] == Q3_9MO_END:
            print(f"  {r['ns']}:{r['concept']:<65} = {r['val']:>15,} {r['unit']}")

    print("\n--- Q3 BALANCE SHEET (Feb 28, 2025) ---")
    for r in sorted(q3_results, key=lambda x: x["concept"]):
        if not r["start"] and r["end"] == Q3_9MO_END:
            print(f"  {r['ns']}:{r['concept']:<65} = {r['val']:>15,} {r['unit']}")


if __name__ == "__main__":
    main()
