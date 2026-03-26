#!/usr/bin/env python3
"""
Promote company folders from inbox proposals to canonical content/companies/<slug>/.

Workflow:
  1. For each company, collect quarter + business + narrative YAML and run validate_values_file.py.
  2. If validation exits with errors, print output and ask whether to continue that company.
  3. Merge (copy) files into content/companies/<slug>/ (existing files overwritten).
  4. When done, optionally delete the migrated company dir(s) under inbox.

Usage (from repo root):
  python scripts/migrate_inbox_to_content.py inbox/proposals/2026-03-22
  python scripts/migrate_inbox_to_content.py inbox/proposals/2026-03-22/companies/iren
  python scripts/migrate_inbox_to_content.py --dry-run inbox/proposals/2026-03-22

Paths may be relative to cwd or absolute. Proposal layout must match:
  inbox/proposals/<date>/companies/<slug>/...
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def validator_script() -> Path:
    return Path(__file__).resolve().parent / "validate_values_file.py"


def collect_validatable_yaml(company_dir: Path) -> list[Path]:
    """YAML files that validate_values_file understands (quarter + business + narrative)."""
    out: list[Path] = []
    business = company_dir / "business" / "business.yaml"
    if business.is_file():
        out.append(business)
    narrative = company_dir / "narrative" / "narrative.yaml"
    if narrative.is_file():
        out.append(narrative)
    fin = company_dir / "financials"
    if fin.is_dir():
        for p in sorted(fin.iterdir()):
            if not p.is_file():
                continue
            if p.suffix.lower() not in (".yaml", ".yml"):
                continue
            if p.name.startswith("_"):
                continue
            out.append(p)
    return out


def resolve_company_dirs(proposal_arg: Path) -> list[tuple[Path, str]]:
    """
    Return [(company_dir, slug), ...] from:
      - .../proposals/<date>/companies/<slug>  -> one company
      - .../proposals/<date>/companies         -> all slugs under it
      - .../proposals/<date>                   -> all slugs under companies/
    """
    p = proposal_arg.resolve()
    if not p.exists():
        raise FileNotFoundError(f"Path does not exist: {p}")

    if p.name == "companies" and p.is_dir():
        return [(c, c.name) for c in sorted(p.iterdir()) if c.is_dir()]

    if p.parent.name == "companies" and p.is_dir():
        return [(p, p.name)]

    companies = p / "companies"
    if companies.is_dir():
        found = [(c, c.name) for c in sorted(companies.iterdir()) if c.is_dir()]
        if found:
            return found

    raise ValueError(
        f"Could not resolve company folders under {p}. Expected one of:\n"
        "  inbox/proposals/<date>\n"
        "  inbox/proposals/<date>/companies\n"
        "  inbox/proposals/<date>/companies/<slug>"
    )


def run_validation(company_dir: Path, cwd: Path) -> tuple[int, str]:
    """Run validate_values_file.py on all validatable YAML; return (exit_code, combined_output)."""
    paths = collect_validatable_yaml(company_dir)
    if not paths:
        return 0, "(no quarter/business/narrative YAML to validate — skipped)\n"

    cmd = [sys.executable, str(validator_script()), *[str(x) for x in paths]]
    proc = subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=True,
        text=True,
    )
    out = ""
    if proc.stdout:
        out += proc.stdout
    if proc.stderr:
        out += proc.stderr
    return proc.returncode, out


def prompt_yes_no(message: str, default_no: bool = True) -> bool:
    suffix = " [y/N]: " if default_no else " [Y/n]: "
    try:
        raw = input(message + suffix).strip().lower()
    except EOFError:
        return not default_no
    if not raw:
        return not default_no
    return raw in ("y", "yes")


def copy_tree_merge(src: Path, dst: Path, dry_run: bool) -> None:
    """Copy all files under src into dst, preserving relative paths; create parents."""
    for path in sorted(src.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(src)
        target = dst / rel
        if dry_run:
            print(f"  would copy: {path} -> {target}")
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)


def migrate_company(
    proposal_company: Path,
    slug: str,
    content_root: Path,
    *,
    dry_run: bool,
) -> bool:
    dest = content_root / slug
    print(f"\n--- Migrate `{slug}` -> {dest} ---")
    if dry_run:
        print("  (dry-run: no files written)")
    copy_tree_merge(proposal_company, dest, dry_run=dry_run)
    return True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate inbox proposal companies, copy to content/companies/, optional inbox cleanup.",
    )
    parser.add_argument(
        "proposal_path",
        type=Path,
        help="Proposal date folder, companies folder, or single company folder under inbox/proposals/",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print actions only; do not copy or delete.",
    )
    args = parser.parse_args()

    root = repo_root()
    val_script = validator_script()
    if not val_script.is_file():
        print(f"Missing {val_script}", file=sys.stderr)
        return 2

    content_companies = root / "content" / "companies"
    if not content_companies.is_dir():
        print(f"Expected directory: {content_companies}", file=sys.stderr)
        return 2

    try:
        pairs = resolve_company_dirs(args.proposal_path)
    except (FileNotFoundError, ValueError) as e:
        print(str(e), file=sys.stderr)
        return 2

    migrated: list[Path] = []

    for company_dir, slug in pairs:
        print(f"\n{'=' * 60}")
        print(f"Company: {slug} ({company_dir})")
        print("=" * 60)

        code, vout = run_validation(company_dir, cwd=root)
        if vout.strip():
            print(vout.rstrip())

        if code != 0:
            print(f"\nvalidate_values_file.py exited with code {code} (errors reported).")
            if not prompt_yes_no(
                f"Continue migrating `{slug}` to content/companies/{slug}/ anyway?",
                default_no=True,
            ):
                print(f"Skipped `{slug}`.")
                continue
        elif "WARN" in vout or "warning" in vout.lower():
            # optional: could prompt on warnings only; for now continue
            pass

        migrate_company(company_dir, slug, content_companies, dry_run=args.dry_run)
        migrated.append(company_dir)

    if not migrated:
        print("\nNothing was migrated.")
        return 1

    print(
        "\nReminder: ensure each slug is listed in content/_meta/company_index.yaml "
        "(layer) if not already."
    )

    if args.dry_run:
        print("\nDry-run finished — no copies or deletes performed.")
        return 0

    if not prompt_yes_no(
        "\nDelete migrated company folder(s) from inbox?\n"
        + "\n".join(f"  - {p}" for p in migrated),
        default_no=True,
    ):
        print("Left inbox folders in place.")
        return 0

    for p in migrated:
        print(f"Removing {p} ...")
        shutil.rmtree(p)

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
